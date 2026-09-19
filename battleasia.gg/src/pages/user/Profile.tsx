import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMe, markSignedIn, readSessionUser } from '../../lib/auth';
import { mediaUrl, UserAvatar } from '../../components/UserAvatar';
import { useI18n } from '../../lib/i18n';
import { safeHref } from '../../lib/safeHref';
import { RankBadge } from '../../components/RankBadge';
import {
  fetchProfile,
  fetchUserFeed,
  fetchHighlights,
  followUser,
  unfollowUser,
  updateMe,
  blockUser,
  reportTarget,
  uploadMedia,
  startConversation,
  sendDirectMessage,
  fetchUserMatchHistory,
  type FeedPost,
  type PublicProfile,
} from '../../lib/social';
import { fetchP1Flags, type P1Flags } from '../../lib/p1';
import { sendTip } from '../../lib/wallet';
import { sanitizeLine, useUnsaved } from '../../lib/form';
import { tierFromWins } from '../../lib/tier';
import { countries, countryDial, isoFromDial } from '../../lib/countries';

const SERVERS = [
  { value: '', key: 'srv.select' },
  { value: 'europe', key: 'srv.europe' },
  { value: 'asia', key: 'srv.asia' },
  { value: 'south-america', key: 'srv.southAmerica' },
  { value: 'middle-east', key: 'srv.middleEast' },
  { value: 'krjp', key: 'srv.krjp' },
] as const;

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const PUBG_RE = /^[a-zA-Z0-9]{1,20}$/;
const URL_RE = /^https?:\/\/.+/i;

type EditForm = {
  username: string;
  email: string;
  countryIso: string;
  mobile: string;
  pubgId: string;
  gameServer: string;
  referralCode: string;
  bio: string;
  twitterLink: string;
  facebookLink: string;
  instagramLink: string;
};

function formFromProfile(p: PublicProfile): EditForm {
  return {
    username: p.username || '',
    email: p.email || '',
    countryIso: isoFromDial(p.countryCode || 'BD'),
    mobile: p.mobileNo || '',
    pubgId: p.pubgId || '',
    gameServer: p.gameServer || '',
    referralCode: p.referralCode || '',
    bio: p.bio || '',
    twitterLink: p.twitterLink || '',
    facebookLink: p.facebookLink || '',
    instagramLink: p.instagramLink || '',
  };
}

function formsEqual(a: EditForm, b: EditForm) {
  return (Object.keys(a) as Array<keyof EditForm>).every((k) => a[k] === b[k]);
}

export function ProfilePage({ own = false }: { own?: boolean }) {
  const { t } = useI18n();
  const { userId = '' } = useParams();
  const session = readSessionUser();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState<EditForm | null>(null);
  const [baseline, setBaseline] = useState<EditForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'posts' | 'reels' | 'highlights' | 'history'>('posts');
  const [highlights, setHighlights] = useState<Array<{ id: string; mediaUrl: string }>>([]);
  const [history, setHistory] = useState<Array<Record<string, unknown>> | null>(null);
  const [p1, setP1] = useState<P1Flags | null>(null);
  const { toast } = useHudPage({
    follow: async () => {
      if (!profile || profile.isOwnProfile) return;
      try {
        if (profile.isFollowing) await unfollowUser(profile.id);
        else await followUser(profile.id);
        setProfile(await fetchProfile(profile.id));
      } catch (err) {
        toast(isApiError(err) ? err.message : t('profile.followFail'));
      }
    },
  });

  const setField = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    let live = true;
    const boot = async () => {
      let id = userId;
      let me: Awaited<ReturnType<typeof fetchMe>> | null = null;
      if (own) {
        me = await fetchMe();
        id = me.id || '';
      }
      if (!id) throw new Error('No profile');
      const [p, feed] = await Promise.all([fetchProfile(id), fetchUserFeed(id).catch(() => [] as FeedPost[])]);
      const highs = await fetchHighlights(id).catch(() => []);
      const matchHistory = await fetchUserMatchHistory(id).catch(() => [] as Array<Record<string, unknown>>);
      const merged: PublicProfile =
        me && (own || p.isOwnProfile || p.id === me.id)
          ? {
              ...p,
              email: me.email || p.email,
              username: me.username || p.username,
              bio: me.bio ?? p.bio,
              pubgId: me.pubgId || p.pubgId,
              gameServer: me.gameServer || p.gameServer,
              referralCode: me.referralCode || p.referralCode,
              countryCode: me.countryCode || p.countryCode,
              mobileNo: me.mobileNo || p.mobileNo,
              twitterLink: me.twitterLink || p.twitterLink,
              facebookLink: me.facebookLink || p.facebookLink,
              instagramLink: me.instagramLink || p.instagramLink,
              avatar: me.avatar || p.avatar,
              coverUrl: me.coverUrl || p.coverUrl,
            }
          : p;
      return { p: merged, feed, highs, matchHistory };
    };
    boot()
      .then(({ p, feed, highs, matchHistory }) => {
        if (!live) return;
        setProfile(p);
        setPosts(feed);
        setHighlights(highs);
        setHistory(matchHistory as Array<Record<string, unknown>>);
        const next = formFromProfile(p);
        setForm(next);
        setBaseline(next);
      })
      .catch((err) => live && setError(isApiError(err) ? err.message : t('http.404')));
    return () => {
      live = false;
    };
  }, [own, userId, t]);

  useEffect(() => {
    fetchP1Flags().then(setP1);
  }, []);

  const dirty = Boolean(editing && form && baseline && !formsEqual(form, baseline));
  useUnsaved(dirty);

  if (error) {
    return (
      <main className="play-main">
        <div className="play-empty">
          <h2>{error}</h2>
        </div>
      </main>
    );
  }
  if (!profile || !form) return <main className="play-main"><div className="match-row skeleton" /></main>;

  const isOwn = own || profile.isOwnProfile || profile.id === session?.id;
  const grid =
    tab === 'highlights'
      ? []
      : tab === 'reels'
        ? posts.filter((p) => (p.mediaUrls || []).some((u) => u.includes('.mp4')))
        : posts;

  const validate = () => {
    const next: Record<string, string> = {};
    const username = sanitizeLine(form.username);
    if (!username || !USERNAME_RE.test(username)) next.username = t('errors.username');
    const pubg = sanitizeLine(form.pubgId);
    if (!pubg || !PUBG_RE.test(pubg)) next.pubgId = t('errors.pubg');
    const mobile = sanitizeLine(form.mobile).replace(/\D/g, '');
    if (!mobile || mobile.length < 6) next.mobile = t('errors.mobile');
    if (!form.gameServer) next.gameServer = t('errors.server');
    for (const key of ['twitterLink', 'facebookLink', 'instagramLink'] as const) {
      const v = sanitizeLine(form[key]);
      if (v && !URL_RE.test(v)) next[key] = t('profile.linkInvalid');
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <main className="play-main profile-page">
      <div className="play-stage profile-stage">
      {profile.coverUrl ? (
        <img className="profile-cover" src={mediaUrl(profile.coverUrl)} alt="" width={960} height={240} />
      ) : (
        <div className="profile-cover ph" aria-hidden />
      )}

      <header className="ig-profile">
        <div className="ig-profile-main">
          <label className={`ig-avatar-wrap profile-avatar-wrap${isOwn ? ' can-edit' : ''}`}>
            <UserAvatar
              className={`profile-avatar ig-avatar frame-${profile.cosmeticId || 'none'}`}
              src={profile.avatar}
              name={profile.username}
              size={150}
            />
            {isOwn ? (
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                aria-label={t('profile.changePhoto')}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  setBusy(true);
                  try {
                    const url = await uploadMedia(file, 'avatars');
                    await updateMe({ avatar: url });
                    const next = { ...profile, avatar: url };
                    setProfile(next);
                    markSignedIn({ ...readSessionUser(), ...next });
                    window.dispatchEvent(new CustomEvent('ba:avatar-updated', { detail: { avatar: url } }));
                    toast(t('profile.photoOk'));
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('profile.photoFail'));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            ) : null}
          </label>

          <div className="ig-profile-info">
            <div className="ig-user-row">
              <h1 className="ig-username">
                {profile.username}
                <VerifiedBadge on={profile.isVerified} />
                {profile.isOnline ? <i className="ig-online" title={t('profile.live')} /> : null}
              </h1>
              <div className="ig-actions">
                {isOwn ? (
                  <button
                    className="btn btn-ghost ig-btn"
                    type="button"
                    onClick={() => {
                      if (editing && dirty && !window.confirm(t('profile.unsaved'))) return;
                      if (editing && baseline) {
                        setForm(baseline);
                        setFieldErrors({});
                      }
                      setEditing((v) => !v);
                    }}
                  >
                    {editing ? t('profile.closeEdit') : t('profile.edit')}
                  </button>
                ) : (
                  <>
                    <button
                      className={`btn ig-btn ${profile.isFollowing ? 'btn-ghost ig-following' : 'btn-primary'}`}
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (profile.isFollowing && !window.confirm(t('profile.unfollowConfirm'))) return;
                        setBusy(true);
                        try {
                          if (profile.isFollowing) {
                            const res = await unfollowUser(profile.id);
                            setProfile((p) =>
                              p
                                ? {
                                    ...p,
                                    isFollowing: false,
                                    followers: res.followers ?? Math.max(0, (p.followers ?? 1) - 1),
                                  }
                                : p
                            );
                          } else {
                            const res = await followUser(profile.id);
                            setProfile((p) =>
                              p
                                ? {
                                    ...p,
                                    isFollowing: true,
                                    followers: res.followers ?? (p.followers ?? 0) + 1,
                                  }
                                : p
                            );
                          }
                        } catch (err) {
                          toast(isApiError(err) ? err.message : t('profile.followFail'));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {profile.isFollowing ? t('profile.following') : t('profile.follow')}
                    </button>
                    <Link className="btn btn-ghost ig-btn" to="/user/feed/messages">
                      {t('profile.message')}
                    </Link>
                  </>
                )}
                {!isOwn ? (
                  <details className="ig-more">
                    <summary aria-label={t('profile.more')}>⋯</summary>
                    <div className="ig-more-pop">
                      {p1?.playerTip
                        ? [10, 25, 50].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={async () => {
                                try {
                                  await sendTip(profile.username, n);
                                  toast(t('profile.tipped').replace('{n}', String(n)));
                                } catch (err) {
                                  toast(isApiError(err) ? err.message : t('profile.tipFail'));
                                }
                              }}
                            >
                              {t('profile.tip').replace('{n}', String(n))}
                            </button>
                          ))
                        : null}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const conv = await startConversation(profile.id);
                            await sendDirectMessage(
                              conv.id,
                              `Check this profile: ${window.location.origin}/profile/${profile.id}`
                            );
                            toast(t('profile.shared'));
                          } catch (err) {
                            toast(isApiError(err) ? err.message : t('profile.shareFail'));
                          }
                        }}
                      >
                        {t('profile.share')}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await blockUser(profile.id);
                            toast(t('profile.blocked'));
                          } catch (err) {
                            toast(isApiError(err) ? err.message : t('profile.blockFail'));
                          }
                        }}
                      >
                        {t('profile.block')}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await reportTarget('user', profile.id);
                            toast(t('profile.reported'));
                          } catch (err) {
                            toast(isApiError(err) ? err.message : t('profile.reportFail'));
                          }
                        }}
                      >
                        {t('profile.report')}
                      </button>
                    </div>
                  </details>
                ) : null}
              </div>
            </div>

            <ul className="ig-counts">
              <li>
                <b>{profile.posts ?? posts.length}</b>
                <span>{t('profile.postsN')}</span>
              </li>
              <li>
                <Link to={`/profile/${profile.id}/followers`}>
                  <b>{profile.followers ?? 0}</b>
                  <span>{t('profile.followers')}</span>
                </Link>
              </li>
              <li>
                <Link to={`/profile/${profile.id}/following`}>
                  <b>{profile.following ?? 0}</b>
                  <span>{t('profile.followingN')}</span>
                </Link>
              </li>
            </ul>

            <div className="ig-bio">
              <p className="ig-display">
                <RankBadge tier={tierFromWins(profile.gamingStats?.totalWins ?? 0)} />
                <span>
                  {(profile.gamingStats?.totalWins ?? 0).toLocaleString()} {t('profile.wins')} ·{' '}
                  {(profile.gamingStats?.totalKills ?? 0).toLocaleString()} {t('profile.kills')}
                </span>
              </p>
              <p className="ig-bio-text">{profile.bio || t('profile.noBio')}</p>
              <p className="ig-meta-line">
                PUBG {profile.pubgId || '—'} · {profile.gameServer || t('profile.serverTbd')}
              </p>
              {safeHref(profile.instagramLink) || safeHref(profile.twitterLink) || safeHref(profile.facebookLink) ? (
                <p className="ig-links">
                  {safeHref(profile.instagramLink) ? (
                    <a href={safeHref(profile.instagramLink)} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  ) : null}
                  {safeHref(profile.twitterLink) ? (
                    <a href={safeHref(profile.twitterLink)} target="_blank" rel="noopener noreferrer">
                      X
                    </a>
                  ) : null}
                  {safeHref(profile.facebookLink) ? (
                    <a href={safeHref(profile.facebookLink)} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  ) : null}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {highlights.length ? (
          <div className="ig-highlights" aria-label={t('profile.highlights')}>
            {highlights.slice(0, 8).map((h) => (
              <button key={h.id} type="button" className="ig-highlight" onClick={() => setTab('highlights')}>
                <img src={h.mediaUrl} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {isOwn && editing ? (
        <form
          className="money-form profile-edit-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!validate()) return;
            setBusy(true);
            try {
              const username = sanitizeLine(form.username);
              const pubgId = sanitizeLine(form.pubgId);
              const mobileNo = sanitizeLine(form.mobile).replace(/\D/g, '');
              const countryCode = countryDial(form.countryIso);
              const bio = sanitizeLine(form.bio).slice(0, 160);
              const referralCode = sanitizeLine(form.referralCode);
              const twitterLink = safeHref(sanitizeLine(form.twitterLink));
              const facebookLink = safeHref(sanitizeLine(form.facebookLink));
              const instagramLink = safeHref(sanitizeLine(form.instagramLink));
              const payload = {
                username,
                email: form.email,
                countryCode,
                mobileNo,
                pubgId,
                gameServer: form.gameServer,
                referralCode,
                bio,
                twitterLink,
                facebookLink,
                instagramLink,
              };
              await updateMe(payload);
              const nextProfile: PublicProfile = {
                ...profile,
                ...payload,
                countryCode,
              };
              const nextForm = formFromProfile(nextProfile);
              setProfile(nextProfile);
              setForm(nextForm);
              setBaseline(nextForm);
              markSignedIn({ ...readSessionUser(), ...payload, countryCode });
              toast(t('profile.saved'));
              setEditing(false);
            } catch (err) {
              toast(isApiError(err) ? err.message : t('profile.saveFail'));
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            {t('auth.username')}
            <input
              value={form.username}
              autoComplete="username"
              maxLength={32}
              onChange={(e) => setField('username', e.target.value)}
              onBlur={(e) => setField('username', sanitizeLine(e.target.value))}
            />
            {fieldErrors.username ? <span className="field-error">{fieldErrors.username}</span> : null}
          </label>

          <label className="field">
            {t('auth.phone')}
            <span className="phone-row">
              <select
                value={form.countryIso}
                aria-label={t('auth.country')}
                onChange={(e) => setField('countryIso', e.target.value)}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} +{c.phone}
                  </option>
                ))}
              </select>
              <input
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                value={form.mobile}
                onChange={(e) => setField('mobile', e.target.value)}
                onBlur={(e) => setField('mobile', sanitizeLine(e.target.value))}
              />
            </span>
            {fieldErrors.mobile ? <span className="field-error">{fieldErrors.mobile}</span> : null}
          </label>

          <label className="field">
            {t('auth.pubg')}
            <input
              value={form.pubgId}
              maxLength={20}
              onChange={(e) => setField('pubgId', e.target.value)}
              onBlur={(e) => setField('pubgId', sanitizeLine(e.target.value))}
            />
            {fieldErrors.pubgId ? <span className="field-error">{fieldErrors.pubgId}</span> : null}
          </label>

          <label className="field">
            {t('auth.server')}
            <select value={form.gameServer} onChange={(e) => setField('gameServer', e.target.value)}>
              {SERVERS.map((s) => (
                <option key={s.value || 'none'} value={s.value} disabled={!s.value}>
                  {t(s.key)}
                </option>
              ))}
            </select>
            {fieldErrors.gameServer ? <span className="field-error">{fieldErrors.gameServer}</span> : null}
          </label>

          <label className="field">
            {t('auth.email')}
            <input value={form.email} disabled readOnly aria-readonly="true" />
            <span className="field-hint">{t('profile.emailLocked')}</span>
          </label>

          <label className="field">
            {t('profile.referral')}
            <input
              value={form.referralCode}
              maxLength={32}
              onChange={(e) => setField('referralCode', e.target.value)}
              onBlur={(e) => setField('referralCode', sanitizeLine(e.target.value))}
            />
          </label>

          <label className="field">
            {t('profile.bio')} {form.bio.length}/160
            <input
              value={form.bio}
              maxLength={160}
              onChange={(e) => setField('bio', e.target.value)}
              onBlur={(e) => setField('bio', sanitizeLine(e.target.value))}
            />
          </label>

          <label className="field">
            {t('profile.twitter')}
            <input
              value={form.twitterLink}
              placeholder="https://twitter.com/username"
              onChange={(e) => setField('twitterLink', e.target.value)}
              onBlur={(e) => setField('twitterLink', sanitizeLine(e.target.value))}
            />
            {fieldErrors.twitterLink ? <span className="field-error">{fieldErrors.twitterLink}</span> : null}
          </label>

          <label className="field">
            {t('profile.facebook')}
            <input
              value={form.facebookLink}
              placeholder="https://facebook.com/username"
              onChange={(e) => setField('facebookLink', e.target.value)}
              onBlur={(e) => setField('facebookLink', sanitizeLine(e.target.value))}
            />
            {fieldErrors.facebookLink ? <span className="field-error">{fieldErrors.facebookLink}</span> : null}
          </label>

          <label className="field">
            {t('profile.instagram')}
            <input
              value={form.instagramLink}
              placeholder="https://instagram.com/username"
              onChange={(e) => setField('instagramLink', e.target.value)}
              onBlur={(e) => setField('instagramLink', sanitizeLine(e.target.value))}
            />
            {fieldErrors.instagramLink ? <span className="field-error">{fieldErrors.instagramLink}</span> : null}
          </label>

          <button className="btn btn-primary" type="submit" disabled={busy || !dirty}>
            {t('profile.save')}
          </button>
        </form>
      ) : null}
      </div>

      <div className="ig-tabs money-tabs">
        <button type="button" className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>
          {t('profile.posts')}
        </button>
        <button type="button" className={tab === 'reels' ? 'active' : ''} onClick={() => setTab('reels')}>
          {t('profile.reels')}
        </button>
        <button type="button" className={tab === 'highlights' ? 'active' : ''} onClick={() => setTab('highlights')}>
          {t('profile.highlights')}
        </button>
        <button type="button" className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          {t('profile.history')}
        </button>
      </div>

      {tab === 'history' ? (
        history === null ? (
          <div className="match-row skeleton" />
        ) : history.length === 0 ? (
          <div className="play-empty">
            <h2>{t('profile.noHistory')}</h2>
            <p>{t('profile.historyLead')}</p>
          </div>
        ) : (
          <div className="play-stage">
            <div className="result-table wallet-table">
              <div className="result-head">
                <span>{t('matches.match')}</span>
                <span>{t('matches.rank')}</span>
                <span>{t('matches.kills')}</span>
                <span>{t('matches.won')}</span>
              </div>
              {history.slice(0, 24).map((row) => {
                const id = String(row.matchId || row.id);
                return (
                  <Link className="result-row" key={id} to={`/user/play/${id}/result`}>
                    <span>{String(row.matchName || '—')}</span>
                    <span>{String(row.rank ?? '—')}</span>
                    <span>{String(row.kills ?? 0)}</span>
                    <span>
                      <CoinValue value={Number(row.winnings || row.amountWon) || 0} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )
      ) : tab === 'highlights' ? (
        highlights.length === 0 ? (
          <div className="play-empty">
            <h2>{t('profile.noHighlights')}</h2>
            <p>{t('profile.highlightsLead')}</p>
          </div>
        ) : (
          <div className="explore-grid">
            {highlights.map((h) => (
              <span key={h.id} className="explore-tile">
                <img src={h.mediaUrl} alt="" />
              </span>
            ))}
          </div>
        )
      ) : grid.length === 0 ? (
        <div className="play-empty">
          <h2>{tab === 'reels' ? t('profile.noReels') : t('profile.noPosts')}</h2>
          <p>{isOwn ? t('profile.ownEmpty') : t('profile.otherEmpty')}</p>
        </div>
      ) : (
        <div className="explore-grid ig-grid">
          {grid.map((p) => (
            <Link key={p.id} className="explore-tile ig-tile" to={`/user/feed/${p.id}`}>
              {p.coverUrl ? <img src={p.coverUrl} alt="" /> : <span>{p.description || p.title}</span>}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
