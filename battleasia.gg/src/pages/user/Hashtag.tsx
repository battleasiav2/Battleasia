import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PostCard } from '../../components/feed/FeedMedia';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchFeed, type FeedPost } from '../../lib/social';
import { useI18n } from '../../lib/i18n';

export function HashtagPage() {
  const { t } = useI18n();
  const { tag = '' } = useParams();
  const hash = decodeURIComponent(tag).replace(/^#/, '').toLowerCase();
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState('');
  const { toast } = useHudPage({});

  useEffect(() => {
    let live = true;
    setPosts(null);
    fetchFeed('all', { hashtag: hash })
      .then((rows) => live && setPosts(rows))
      .catch((err) => live && setError(isApiError(err) ? err.message : t('tag.loadFail')));
    return () => {
      live = false;
    };
  }, [hash]);

  return (
    <main className="play-main">
      <Link className="play-back" to="/user/feed">
        {t('feed.back')}
      </Link>
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('tag.title')}</p>
          <h1>#{hash}</h1>
          <p className="play-lead">
            {t('tag.emptyLead')} #{hash}.
          </p>
        </div>
        <p className="play-count">
          <strong>{posts?.length ?? '—'}</strong>
          <small>{t('tag.posts')}</small>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {!posts ? <div className="match-row skeleton" /> : null}
      {posts && posts.length === 0 ? (
        <div className="play-empty">
          <h2>{t('tag.empty')}</h2>
          <p>
            {t('tag.emptyLead')} #{hash}.
          </p>
          <Link className="btn btn-primary" to="/user/feed">
            {t('tag.openFeed')}
          </Link>
        </div>
      ) : null}
      {posts && posts.length > 0 ? (
        <div className="play-stage">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              toast={toast}
              onChange={(next) => setPosts((rows) => (rows || []).map((r) => (r.id === next.id ? next : r)))}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
