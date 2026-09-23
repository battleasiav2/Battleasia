import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CaptionText } from '../CaptionText';
import { VerifiedBadge } from '../VerifiedBadge';
import { isApiError } from '../../lib/api';
import {
  reactStory,
  voteStoryPoll,
  pinStoryHighlight,
  viewStory,
  toggleLike,
  toggleSave,
  type FeedPost,
  type ReelItem,
  type StoryGroup,
} from '../../lib/social';
import { useI18n } from '../../lib/i18n';

type Toast = (msg: string) => void;

function isVid(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

function Carousel({ slides }: { slides: string[] }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const src = slides[i];
  return (
    <>
      {src && isVid(src) ? (
        <video src={src} controls playsInline width={720} height={405} />
      ) : (
        <img src={src} alt="" width={720} height={405} />
      )}
      {slides.length > 1 ? (
        <>
          <button
            className="feed-slide prev"
            type="button"
            aria-label={t('feed.prevPhoto')}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setI((n) => (n + slides.length - 1) % slides.length);
            }}
          >
            ‹
          </button>
          <button
            className="feed-slide next"
            type="button"
            aria-label={t('feed.nextPhoto')}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setI((n) => (n + 1) % slides.length);
            }}
          >
            ›
          </button>
          <span className="feed-dots">
            {slides.map((_, n) => (
              <i key={n} className={n === i ? 'on' : ''} />
            ))}
          </span>
        </>
      ) : null}
    </>
  );
}

export function PostCard({
  post,
  onChange,
  toast,
}: {
  post: FeedPost;
  onChange: (next: FeedPost) => void;
  toast: Toast;
}) {
  const { t } = useI18n();
  const [heart, setHeart] = useState(false);
  const lastTap = useRef(0);
  const authorName = post.author?.name || t('feed.player');
  const avatar = post.author?.avatarUrl;
  const initial = (authorName || '?').slice(0, 1).toUpperCase();
  const when = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  async function like() {
    try {
      const res = await toggleLike(post.id);
      onChange({ ...post, isLiked: res.isLiked, totalLikes: res.totalLikes });
      if (res.isLiked) {
        setHeart(true);
        window.setTimeout(() => setHeart(false), 700);
      }
    } catch (err) {
      toast(isApiError(err) ? err.message : t('feed.likeFail'));
    }
  }

  function onMediaPointer() {
    const now = Date.now();
    if (now - lastTap.current < 280) void like();
    lastTap.current = now;
  }

  return (
    <article className="feed-card ig-post">
      <header className="feed-card-head ig-post-head">
        <Link className="ig-post-user" to={post.author?.id ? `/profile/${post.author.id}` : `/user/feed/${post.id}`}>
          {avatar ? (
            <img className="ig-post-avatar" src={avatar} alt="" width={36} height={36} />
          ) : (
            <span className="ig-post-avatar ph" aria-hidden>
              {initial}
            </span>
          )}
          <span className="ig-post-meta">
            <strong>
              {authorName}
              <VerifiedBadge on={post.author?.isVerified} />
            </strong>
            <small>
              {post.postType === 'match_result' ? t('feed.victory') : post.gameTag || t('feed.arenaTag')}
              {post.pinnedAt ? ` · ${t('feed.pinned')}` : ''}
              {when ? ` · ${when}` : ''}
            </small>
          </span>
        </Link>
        <Link className="ig-post-open" to={`/user/feed/${post.id}`} aria-label={t('feed.open')}>
          ···
        </Link>
      </header>
      <div className="feed-media ig-post-media" onPointerUp={onMediaPointer}>
        {(() => {
          const slides = post.mediaUrls?.length ? post.mediaUrls : post.coverUrl ? [post.coverUrl] : [];
          if (!slides.length) {
            return (
              <div className="ig-post-text-only">
                <CaptionText text={post.description || ''} />
              </div>
            );
          }
          return <Carousel slides={slides} />;
        })()}
        {heart ? (
          <span className="feed-heart" aria-hidden>
            ♥
          </span>
        ) : null}
      </div>
      <div className="feed-actions ig-post-actions">
        <button className={`ig-act ${post.isLiked ? 'is-on' : ''}`} type="button" onClick={() => void like()}>
          <span aria-hidden>{post.isLiked ? '♥' : '♡'}</span>
          <b>{post.totalLikes || 0}</b>
        </button>
        <Link className="ig-act" to={`/user/feed/${post.id}`}>
          <span aria-hidden>💬</span>
          <b>{post.totalComments || 0}</b>
        </Link>
        <button
          className={`ig-act ig-act-save ${post.isSaved ? 'is-on' : ''}`}
          type="button"
          onClick={async () => {
            try {
              const raw = post.isSaved ? null : window.prompt(t('feed.collection'), post.collectionName || t('feed.saved'));
              if (!post.isSaved && raw === null) return;
              const folder = post.isSaved ? undefined : (raw || '').trim() || t('feed.saved');
              const res = await toggleSave(post.id, folder);
              onChange({ ...post, isSaved: res.isSaved, collectionName: res.collectionName || folder });
              toast(res.isSaved ? `${t('feed.saved')} · ${res.collectionName || folder || t('feed.saved')}` : t('feed.removed'));
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.saveFail'));
            }
          }}
        >
          <span aria-hidden>{post.isSaved ? '★' : '☆'}</span>
          <b>{post.isSaved ? t('feed.saved') : t('feed.save')}</b>
        </button>
      </div>
      {(post.totalLikes || 0) > 0 ? (
        <p className="ig-post-likes">
          {post.totalLikes} {t('labs.likes')}
        </p>
      ) : null}
      {post.description && (post.mediaUrls?.length || post.coverUrl) ? (
        <div className="ig-post-caption">
          <Link to={post.author?.id ? `/profile/${post.author.id}` : `/user/feed/${post.id}`}>
            <b>{authorName}</b>
          </Link>{' '}
          <CaptionText text={post.description} />
        </div>
      ) : null}
    </article>
  );
}

export function StoryViewer({
  groups,
  gi,
  ii,
  ownId,
  onClose,
  onChange,
  onReply,
  onViewers,
  highlightsOn,
}: {
  groups: StoryGroup[];
  gi: number;
  ii: number;
  ownId?: string;
  onClose: () => void;
  onChange: (gi: number, ii: number) => void;
  onReply?: (userId: string, username: string, storyId: string) => void;
  onViewers?: (storyId: string) => void;
  highlightsOn?: boolean;
}) {
  const { t } = useI18n();
  const [paused, setPaused] = useState(false);
  const group = groups[gi];
  const item = group?.stories[ii];
  const [poll, setPoll] = useState(item?.poll || null);

  useEffect(() => {
    setPoll(item?.poll || null);
  }, [item?.id]);

  function go(nextG: number, nextI: number) {
    if (nextG < 0 || nextG >= groups.length) {
      onClose();
      return;
    }
    const g = groups[nextG];
    if (nextI < 0) {
      const prev = nextG - 1;
      if (prev < 0) onClose();
      else onChange(prev, Math.max(0, (groups[prev]?.stories.length || 1) - 1));
      return;
    }
    if (nextI >= g.stories.length) {
      if (nextG + 1 >= groups.length) onClose();
      else onChange(nextG + 1, 0);
      return;
    }
    onChange(nextG, nextI);
  }

  useEffect(() => {
    if (item?.id) void viewStory(item.id).catch(() => undefined);
  }, [item?.id]);

  useEffect(() => {
    if (!item || paused || item.mediaType === 'video') return;
    const id = window.setTimeout(() => go(gi, ii + 1), 5000);
    return () => window.clearTimeout(id);
  }, [gi, ii, paused, item?.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(gi, ii + 1);
      if (e.key === 'ArrowLeft') go(gi, ii - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gi, ii]);

  if (!group || !item) return null;

  return (
    <div className="story-view" role="dialog" aria-label={`${group.username} story`}>
      <div className="story-progress">
        {group.stories.map((s, n) => (
          <i key={s.id || n} className={n < ii ? 'done' : n === ii ? (paused ? 'on is-paused' : 'on') : ''} />
        ))}
      </div>
      <p className="story-user">{group.username}</p>
      <button className="story-close" type="button" onClick={onClose} aria-label={t('feed.close')}>
        ×
      </button>
      <button className="story-hit left" type="button" aria-label={t('feed.prev')} onClick={() => go(gi, ii - 1)} />
      <button className="story-hit right" type="button" aria-label={t('feed.next')} onClick={() => go(gi, ii + 1)} />
      <div
        className="story-frame"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {item.mediaType === 'video' ? (
          <video
            src={item.mediaUrl}
            autoPlay
            muted
            playsInline
            onEnded={() => go(gi, ii + 1)}
          />
        ) : (
          <img src={item.mediaUrl} alt="" />
        )}
        {item.overlayText ? <p className="story-overlay-text">{item.overlayText}</p> : null}
        {(item.stickers || []).map((s, n) => (
          <span key={`${s.emoji}-${n}`} className="story-sticker" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            {s.emoji}
          </span>
        ))}
        {poll?.question ? (
          <div className="story-poll">
            <p>
              {poll.kind === 'quiz' ? t('feed.quiz') : t('feed.poll')} · {poll.question}
            </p>
            {poll.options.map((o, n) => (
              <button
                key={o.text}
                className={`btn btn-ghost${o.chosen ? ' on' : ''}${poll.correct === n ? ' chip-ok' : ''}`}
                type="button"
                onClick={() => {
                  void voteStoryPoll(item.id, n)
                    .then(setPoll)
                    .catch(() => undefined);
                }}
              >
                {o.text} · {o.votes}
                {poll.correct === n ? ` · ${t('feed.correct')}` : ''}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="story-bar">
        {['🔥', '👏', '❤', 'GG'].map((e) => (
          <button
            key={e}
            className="btn btn-ghost"
            type="button"
            onClick={() => void reactStory(item.id, e).catch(() => undefined)}
          >
            {e}
          </button>
        ))}
        {ownId && group.userId === ownId ? (
          <>
            <button className="btn btn-ghost" type="button" onClick={() => onViewers?.(item.id)}>
              {t('feed.viewers')}
            </button>
            {highlightsOn ? (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => void pinStoryHighlight(item.id).catch(() => undefined)}
              >
                {t('feed.highlight')}
              </button>
            ) : null}
          </>
        ) : (
          <button className="btn btn-ghost" type="button" onClick={() => onReply?.(group.userId, group.username, item.id)}>
            {t('feed.reply')}
          </button>
        )}
      </div>
    </div>
  );
}

export function ReelsStage({ reels, onDuet }: { reels: ReelItem[]; onDuet?: (caption: string) => void }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const row = reels[i];

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  }, [i]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        const el = video.current;
        if (!el) return;
        if (el.paused) void el.play();
        else el.pause();
      }
      if (e.key === 'ArrowDown') setI((n) => Math.min(reels.length - 1, n + 1));
      if (e.key === 'ArrowUp') setI((n) => Math.max(0, n - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reels.length]);

  if (!row) return null;

  return (
    <div className="reel-stage">
      <video ref={video} src={row.videoUrl} muted playsInline loop className="reel-video" />
      <div className="reel-meta">
        <strong>{row.username || t('feed.creator')}</strong>
        <p>{row.caption}</p>
        {row.parentReelId ? <small>{t('feed.duetOf')} {row.parentReelId}</small> : null}
        <small>{t('feed.reelHint')}</small>
      </div>
      <div className="reel-nav">
        <button className="btn btn-ghost" type="button" disabled={i === 0} onClick={() => setI((n) => n - 1)}>
          {t('feed.prev')}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          disabled={i >= reels.length - 1}
          onClick={() => setI((n) => n + 1)}
        >
          {t('feed.next')}
        </button>
        {onDuet ? (
          <button className="btn btn-ghost" type="button" onClick={() => onDuet(row.id)}>
            {t('feed.duet')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

const STICKERS = ['🔥', '👑', '💀', '🏆', 'GG', '❤'];

export function StoryComposer({
  previewUrl,
  mediaType,
  busy,
  onCancel,
  onPublish,
  pollsOn,
}: {
  previewUrl: string;
  mediaType: 'image' | 'video';
  busy?: boolean;
  onCancel: () => void;
  onPublish: (extra: {
    overlayText: string;
    stickers: Array<{ emoji: string; x: number; y: number }>;
    poll?: { question: string; options: string[]; kind?: 'poll' | 'quiz'; correctIndex?: number };
  }) => void;
  pollsOn?: boolean;
}) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [stickers, setStickers] = useState<Array<{ emoji: string; x: number; y: number }>>([]);
  const [pollQ, setPollQ] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [quiz, setQuiz] = useState(false);
  const [correct, setCorrect] = useState(0);
  return (
    <div className="story-compose" role="dialog" aria-label={t('feed.storyEditor')}>
      <div className="story-frame">
        {mediaType === 'video' ? <video src={previewUrl} muted playsInline /> : <img src={previewUrl} alt="" />}
        {text ? <p className="story-overlay-text">{text}</p> : null}
        {stickers.map((s, n) => (
          <span key={`${s.emoji}-${n}`} className="story-sticker" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            {s.emoji}
          </span>
        ))}
      </div>
      <label className="field">
        {t('feed.overlay')}
        <input value={text} maxLength={80} onChange={(e) => setText(e.target.value)} placeholder={t('feed.saySomething')} />
      </label>
      <div className="story-sticker-row">
        {STICKERS.map((emoji) => (
          <button
            key={emoji}
            className="btn btn-ghost"
            type="button"
            onClick={() =>
              setStickers((rows) => [...rows, { emoji, x: 20 + (rows.length * 14) % 70, y: 28 + (rows.length * 11) % 50 }].slice(0, 8))
            }
          >
            {emoji}
          </button>
        ))}
      </div>
      {pollsOn ? (
        <>
          <label className="chip">
            <input type="checkbox" checked={quiz} onChange={(e) => setQuiz(e.target.checked)} />
            {t('feed.quiz')}
          </label>
          <label className="field">
            {quiz ? t('feed.quiz') : t('feed.poll')}
            <input value={pollQ} maxLength={80} onChange={(e) => setPollQ(e.target.value)} placeholder={t('feed.pollQ')} />
          </label>
          {pollQ ? (
            <div className="story-sticker-row">
              <input value={optA} maxLength={40} onChange={(e) => setOptA(e.target.value)} placeholder={t('feed.optA')} />
              <input value={optB} maxLength={40} onChange={(e) => setOptB(e.target.value)} placeholder={t('feed.optB')} />
              {quiz ? (
                <select value={correct} onChange={(e) => setCorrect(Number(e.target.value))} aria-label={t('feed.correct')}>
                  <option value={0}>{t('feed.optA')}</option>
                  <option value={1}>{t('feed.optB')}</option>
                </select>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      <div className="match-actions">
        <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={busy}>
          {t('feed.cancel')}
        </button>
        <button
          className="btn btn-primary"
          type="button"
          disabled={busy}
          onClick={() =>
            onPublish({
              overlayText: text.trim(),
              stickers,
              poll:
                pollsOn && pollQ.trim() && optA.trim() && optB.trim()
                  ? {
                      question: pollQ.trim(),
                      options: [optA.trim(), optB.trim()],
                      kind: quiz ? 'quiz' : 'poll',
                      correctIndex: quiz ? correct : undefined,
                    }
                  : undefined,
            })
          }
        >
          {t('feed.shareStory')}
        </button>
      </div>
    </div>
  );
}
