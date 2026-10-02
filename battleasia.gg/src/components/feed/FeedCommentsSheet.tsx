import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isApiError } from '../../lib/api';
import { feedPreviewSrc } from '../../lib/feedMedia';
import {
  addComment,
  fetchComments,
  likeComment,
  type FeedComment,
  type FeedPost,
} from '../../lib/social';
import { useI18n } from '../../lib/i18n';

type Toast = (msg: string) => void;

function mentionText(text: string) {
  return text.split(/(@[\w.]+)/g).map((part, i) =>
    part.startsWith('@') ? (
      <b key={i}>{part}</b>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function FeedCommentsSheet({
  post,
  open,
  onClose,
  toast,
  onCommentCount,
}: {
  post: FeedPost;
  open: boolean;
  onClose: () => void;
  toast: Toast;
  onCommentCount?: (total: number) => void;
}) {
  const { t } = useI18n();
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setLoading(true);
    void fetchComments(post.id)
      .then((rows) => {
        if (live) setComments(rows);
      })
      .catch((err) => {
        toast(isApiError(err) ? err.message : t('feed.commentFail'));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [open, post.id, t, toast]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (replyTo && inputRef.current) inputRef.current.focus();
  }, [replyTo]);

  if (!open) return null;

  async function refreshComments() {
    const rows = await fetchComments(post.id);
    setComments(rows);
  }

  return (
    <div className="ig-comments-sheet" role="dialog" aria-modal="true" aria-label={t('feed.comments')}>
      <button type="button" className="ig-comments-backdrop" aria-label={t('feed.close')} onClick={onClose} />
      <div className="ig-comments-panel">
        <i className="ig-comments-grab" aria-hidden />
        <header className="ig-comments-head">
          <h2>{t('feed.comments')}</h2>
        </header>
        <div className="ig-comments-scroll">
          {loading ? (
            <div className="match-row skeleton" />
          ) : comments.length === 0 ? (
            <p className="play-muted ig-comments-empty">{t('feed.noComments')}</p>
          ) : (
            comments.map((c) => (
              <article key={c.id} className="ig-comment-row">
                <span className="ig-comment-avatar ph" aria-hidden>
                  {(c.user?.username || '?').slice(0, 1).toUpperCase()}
                </span>
                <div className="ig-comment-body">
                  <p className="ig-comment-text">
                    <Link to={c.user?.id ? `/profile/${c.user.id}` : '#'} className="ig-comment-user">
                      {c.user?.username || t('feed.player')}
                    </Link>{' '}
                    {mentionText(c.content)}{' '}
                    <time className="ig-comment-time">{timeAgo(c.createdAt)}</time>
                  </p>
                  <div className="ig-comment-actions">
                    <button
                      type="button"
                      className="text-link"
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
                      {c.isLiked ? t('feed.unlike') : t('feed.like')}
                      {(c.totalLikes || 0) > 0 ? ` · ${c.totalLikes}` : ''}
                    </button>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setReplyTo({ id: c.id, username: c.user?.username || '' });
                        setDraft(`@${c.user?.username || ''} `);
                      }}
                    >
                      {t('feed.reply')}
                    </button>
                  </div>
                  {c.replies?.length ? (
                    <div className="ig-comment-replies">
                      {c.replies.map((r) => (
                        <div key={r.id} className="ig-comment-reply">
                          <p className="ig-comment-text">
                            <b>{r.user?.username || t('feed.player')}</b> {mentionText(r.content)}{' '}
                            <time className="ig-comment-time">{timeAgo(r.createdAt)}</time>
                          </p>
                          <button
                            type="button"
                            className="text-link"
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
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                              setReplyTo({ id: c.id, username: r.user?.username || c.user?.username || '' });
                              setDraft(`@${r.user?.username || ''} `);
                            }}
                          >
                            {t('feed.reply')}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
        {replyTo ? (
          <div className="ig-comments-reply-bar">
            <span>
              {t('feed.replyingTo')} @{replyTo.username}
            </span>
            <button type="button" className="text-link" onClick={() => { setReplyTo(null); setDraft(''); }}>
              {t('feed.cancelReply')}
            </button>
          </div>
        ) : null}
        <form
          className="ig-comments-compose"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!draft.trim() || busy) return;
            setBusy(true);
            try {
              await addComment(post.id, draft.trim(), replyTo?.id);
              setDraft('');
              setReplyTo(null);
              await refreshComments();
              onCommentCount?.((post.totalComments || 0) + 1);
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.commentFail'));
            } finally {
              setBusy(false);
            }
          }}
        >
          {post.author?.avatarUrl ? (
            <img
              className="ig-comment-avatar"
              src={feedPreviewSrc(post.author.avatarUrl)}
              alt=""
              width={32}
              height={32}
            />
          ) : (
            <span className="ig-comment-avatar ph" aria-hidden>
              {(post.author?.name || '?').slice(0, 1).toUpperCase()}
            </span>
          )}
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={280}
            placeholder={replyTo ? t('feed.replyPh') : t('feed.commentPh')}
            aria-label={t('feed.comment')}
          />
          <button className="btn btn-primary ig-comments-post" type="submit" disabled={busy || !draft.trim()}>
            {t('feed.send')}
          </button>
        </form>
      </div>
    </div>
  );
}
