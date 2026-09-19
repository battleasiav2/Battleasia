import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UserAvatar } from '../../components/UserAvatar';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import {
  fetchFollowers,
  fetchFollowing,
  fetchProfile,
  followUser,
  unfollowUser,
  type FollowUser,
  type PublicProfile,
} from '../../lib/social';
import { readSessionUser } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

type Kind = 'followers' | 'following';

export function FollowListPage({ kind }: { kind: Kind }) {
  const { t } = useI18n();
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const me = readSessionUser();
  const [rows, setRows] = useState<FollowUser[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [owner, setOwner] = useState<PublicProfile | null>(null);
  const { toast } = useHudPage();

  const targetId = userId || me?.id || '';
  const isOwn = Boolean(me?.id && targetId === me.id);

  useEffect(() => {
    let live = true;
    if (!targetId) return;
    fetchProfile(targetId)
      .then((p) => live && setOwner(p))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [targetId]);

  useEffect(() => {
    let live = true;
    if (!targetId) {
      setError(t('http.404'));
      setRows([]);
      return;
    }
    setRows(null);
    setError('');
    const load = kind === 'followers' ? fetchFollowers : fetchFollowing;
    load(isOwn ? 'me' : targetId)
      .then((data) => {
        if (!live) return;
        setRows(data.results);
        setTotal(data.total);
      })
      .catch((err) => {
        if (!live) return;
        setError(isApiError(err) ? err.message : t('profile.followListFail'));
        setRows([]);
      });
    return () => {
      live = false;
    };
  }, [targetId, kind, isOwn, t]);

  return (
    <main className="play-main ig-follow-page">
      <header className="ig-follow-top">
        <button className="ig-back" type="button" aria-label={t('profile.backProfile')} onClick={() => navigate(`/profile/${targetId}`)}>
          ←
        </button>
        <div>
          <strong>{owner?.username || '…'}</strong>
          <small>{total} {kind === 'followers' ? t('profile.followers') : t('profile.followingN')}</small>
        </div>
      </header>

      <div className="ig-follow-tabs">
        <button
          type="button"
          className={kind === 'followers' ? 'active' : ''}
          onClick={() => navigate(`/profile/${targetId}/followers`, { replace: true })}
        >
          {t('profile.followers')}
        </button>
        <button
          type="button"
          className={kind === 'following' ? 'active' : ''}
          onClick={() => navigate(`/profile/${targetId}/following`, { replace: true })}
        >
          {t('profile.followingN')}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {rows === null ? (
        <div className="match-row skeleton" />
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{kind === 'followers' ? t('profile.noFollowers') : t('profile.noFollowing')}</h2>
          <p>{t('profile.followListEmpty')}</p>
          <Link className="btn btn-primary" to="/user/feed/explore">
            {t('feed.explore')}
          </Link>
        </div>
      ) : (
        <div className="ig-follow-list">
          {rows.map((row) => {
            const self = row.id === me?.id;
            return (
              <article key={row.id} className="ig-follow-row">
                <Link className="ig-follow-user" to={`/profile/${row.id}`}>
                  <UserAvatar src={row.avatar} name={row.username} size={44} />
                  <span>
                    <b>{row.username}</b>
                    {row.role ? <small>{row.role}</small> : null}
                  </span>
                </Link>
                {self ? (
                  <span className="ig-you">{t('profile.you')}</span>
                ) : (
                  <button
                    className={`ig-follow-btn ${row.isFollowing ? 'is-following' : ''}`}
                    type="button"
                    disabled={busyId === row.id}
                    onClick={async () => {
                      if (row.isFollowing && !window.confirm(t('profile.unfollowConfirm'))) return;
                      setBusyId(row.id);
                      try {
                        if (row.isFollowing) {
                          await unfollowUser(row.id);
                          setRows((prev) =>
                            prev ? prev.map((u) => (u.id === row.id ? { ...u, isFollowing: false } : u)) : prev
                          );
                        } else {
                          await followUser(row.id);
                          setRows((prev) =>
                            prev ? prev.map((u) => (u.id === row.id ? { ...u, isFollowing: true } : u)) : prev
                          );
                        }
                      } catch (err) {
                        toast(isApiError(err) ? err.message : t('profile.followFail'));
                      } finally {
                        setBusyId('');
                      }
                    }}
                  >
                    {row.isFollowing ? t('profile.following') : t('profile.follow')}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
