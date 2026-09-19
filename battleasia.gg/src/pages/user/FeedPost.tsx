import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { CaptionText } from '../../components/CaptionText';
import {
  addComment,
  fetchComments,
  fetchPost,
  followUser,
  likeComment,
  pinPost,
  searchSocial,
  sendDirectMessage,
  startConversation,
  toggleLike,
  toggleSave,
  type FeedComment,
  type FeedPost,
} from '../../lib/social';
import { fetchP1Flags } from '../../lib/p1';
import { readSessionUser } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

function mentionText(text: string) {
  return text.split(/(@[\w.]+)/g).map((part, i) =>
    part.startsWith('@') ? (
      <b key={i}>{part}</b>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function FeedPostPage() {
  const { t } = useI18n();
  const { id, tab } = useParams();
  const postId = id || tab || '';
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [canPin, setCanPin] = useState(false);
  const [shareTo, setShareTo] = useState('');
  const [shareHits, setShareHits] = useState<Array<{ id: string; username: string }>>([]);
  const lastTap = useRef(0);
  const me = readSessionUser();
  const { toast } = useHudPage({
    follow: async () => {
      if (!post) return;
      try {
        if (post.author?.id) {
          await followUser(post.author.id);
          toast(t('feed.following'));
        } else {
          const res = await toggleLike(post.id);
          toast(res.isLiked ? t('feed.liked') : t('feed.unliked'));
        }
      } catch (err) {
        toast(isApiError(err) ? err.message : t('feed.followLikeFail'));
      }
    },
  });

  useEffect(() => {
    let live = true;
    Promise.all([fetchPost(postId), fetchComments(postId)])
      .then(([p, c]) => {
        if (!live) return;
        setPost(p);
        setComments(c);
      })
      .catch((err) => live && setError(isApiError(err) ? err.message : t('feed.notFound')));
    return () => {
      live = false;
    };
  }, [postId, t]);

  useEffect(() => {
    fetchP1Flags().then((f) => setCanPin(f.igPinnedPosts));
  }, []);

  if (error) {
    return (
      <main className="play-main">
        <div className="play-empty">
          <h2>{error}</h2>
          <Link className="btn btn-primary" to="/user/feed">
            {t('feed.back')}
          </Link>
        </div>
      </main>
    );
  }
  if (!post) return <main className="play-main"><div className="match-row skeleton" /></main>;

  return (
    <main className="play-main">
      <Link className="play-back" to="/user/feed">
        {t('feed.back')}
      </Link>
      <header className="play-head">
        <div>
          <p className="eyebrow">{post.author?.name || t('feed.post')}</p>
          <h1>{post.title || t('feed.post')}</h1>
        </div>
        <p className="play-count">
          <strong>{post.totalLikes || 0}</strong>
          <small>{t('feed.like')}</small>
        </p>
      </header>
      <div className="play-stage">
      {post.coverUrl ? (
        <div
          className="feed-media"
          onPointerUp={() => {
            const now = Date.now();
            if (now - lastTap.current < 280) {
              void (async () => {
                try {
                  const res = await toggleLike(post.id);
                  setPost({ ...post, isLiked: res.isLiked, totalLikes: res.totalLikes });
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('feed.likeFail'));
                }
              })();
            }
            lastTap.current = now;
          }}
        >
          {/\.(mp4|webm)(\?|$)/i.test(post.coverUrl) ? (
            <video src={post.coverUrl} controls playsInline width={960} height={540} />
          ) : (
            <img src={post.coverUrl} alt="" width={960} height={540} />
          )}
        </div>
      ) : null}
      <CaptionText className="play-lead" text={post.description || ''} />
      <div className="match-actions">
        <button
          className="btn btn-primary"
          type="button"
          onClick={async () => {
            try {
              const res = await toggleLike(post.id);
              setPost({ ...post, isLiked: res.isLiked, totalLikes: res.totalLikes });
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.likeFail'));
            }
          }}
        >
          {post.isLiked ? t('feed.unlike') : t('feed.like')} ({post.totalLikes || 0})
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            try {
              const raw = post.isSaved ? null : window.prompt(t('feed.collection'), post.collectionName || t('feed.saved'));
              if (!post.isSaved && raw === null) return;
              const folder = post.isSaved ? undefined : (raw || '').trim() || t('feed.saved');
              const res = await toggleSave(post.id, folder);
              setPost({ ...post, isSaved: res.isSaved, collectionName: res.collectionName || folder });
              toast(res.isSaved ? `${t('feed.saved')} · ${res.collectionName || folder || t('feed.saved')}` : t('feed.removed'));
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.saveFail'));
            }
          }}
        >
          {post.isSaved ? t('feed.unsave') : t('feed.save')}
        </button>
        {canPin && post.author?.id && post.author.id === me?.id ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={async () => {
              try {
                await pinPost(post.id);
                toast(post.pinnedAt ? t('feed.unpinned') : t('feed.pinned'));
                setPost({ ...post, pinnedAt: post.pinnedAt ? null : new Date().toISOString() });
              } catch (err) {
                toast(isApiError(err) ? err.message : t('feed.pinFail'));
              }
            }}
          >
            {post.pinnedAt ? t('feed.unpin') : t('feed.pin')}
          </button>
        ) : null}
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast(t('feed.copied'));
          }}
        >
          {t('feed.copyLink')}
        </button>
        {typeof navigator.share === 'function' ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => void navigator.share({ title: post.title || 'BattleAsia', url: window.location.href }).catch(() => undefined)}
          >
            {t('feed.share')}
          </button>
        ) : null}
        {post.author?.id ? (
          <Link className="btn btn-ghost" to={`/profile/${post.author.id}`}>
            {t('feed.profile')}
          </Link>
        ) : null}
      </div>
      <label className="field">
        {t('feed.shareDm')}
        <input
          value={shareTo}
          onChange={(e) => {
            const v = e.target.value;
            setShareTo(v);
            if (v.trim().length < 2) {
              setShareHits([]);
              return;
            }
            searchSocial(v.trim())
              .then((h) => setShareHits(h.users || []))
              .catch(() => setShareHits([]));
          }}
          placeholder={t('feed.searchPlayer')}
        />
      </label>
      {shareHits.length ? (
        <ul className="roster">
          {shareHits.map((u) => (
            <li key={u.id}>
              <span>{u.username}</span>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={async () => {
                  try {
                    const conv = await startConversation(u.id);
                    await sendDirectMessage(conv.id, `Shared a post: ${window.location.href}`);
                    toast(`${t('feed.sentTo')} ${u.username}`);
                    setShareTo('');
                    setShareHits([]);
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('feed.shareFail'));
                  }
                }}
              >
                {t('feed.send')}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      </div>
      <section className="room-card">
      <h2>{t('feed.comments')}</h2>
      <form
        className="chat-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          try {
            await addComment(post.id, draft.trim(), replyTo || undefined);
            setDraft('');
            setReplyTo(null);
            setComments(await fetchComments(post.id));
          } catch (err) {
            toast(isApiError(err) ? err.message : t('feed.commentFail'));
          }
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={280}
          placeholder={replyTo ? t('feed.replyPh') : t('feed.commentPh')}
          aria-label={t('feed.comment')}
        />
        <button className="btn btn-primary" type="submit">
          {t('feed.send')}
        </button>
      </form>
      {replyTo ? (
        <button className="text-link" type="button" onClick={() => setReplyTo(null)}>
          {t('feed.cancelReply')}
        </button>
      ) : null}
      <ul className="roster comment-list">
        {comments.map((c) => (
          <li key={c.id}>
            <span>
              {c.user?.username}: {mentionText(c.content)}
            </span>
            <span>
              <button
                className="text-link"
                type="button"
                onClick={async () => {
                  try {
                    const res = await likeComment(post.id, c.id);
                    setComments((rows) =>
                      rows.map((row) => (row.id === c.id ? { ...row, isLiked: res.isLiked, totalLikes: res.totalLikes } : row)),
                    );
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('feed.likeFail'));
                  }
                }}
              >
                {c.isLiked ? '♥' : '♡'} {c.totalLikes || 0}
              </button>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setReplyTo(c.id);
                  setDraft(`@${c.user?.username || ''} `);
                }}
              >
                {t('feed.reply')}
              </button>
            </span>
            {c.replies?.length ? (
              <ul className="comment-replies">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    {r.user?.username}: {mentionText(r.content)}{' '}
                    <button
                      className="text-link"
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await likeComment(post.id, r.id);
                          setComments((rows) =>
                            rows.map((row) =>
                              row.id === c.id
                                ? {
                                    ...row,
                                    replies: row.replies?.map((x) =>
                                      x.id === r.id ? { ...x, isLiked: res.isLiked, totalLikes: res.totalLikes } : x,
                                    ),
                                  }
                                : row,
                            ),
                          );
                        } catch (err) {
                          toast(isApiError(err) ? err.message : t('feed.likeFail'));
                        }
                      }}
                    >
                      {r.isLiked ? '♥' : '♡'} {r.totalLikes || 0}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      </section>
    </main>
  );
}
