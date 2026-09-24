import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PostCard, ReelsStage, StoryComposer, StoryViewer } from '../../components/feed/FeedMedia';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { safeMediaHref } from '../../lib/safeHref';
import { FeedPostPage } from './FeedPost';
import {
  acceptConversation,
  createPost,
  createReel,
  createStory,
  fetchConversations,
  fetchDirectMessages,
  fetchExplore,
  fetchFeed,
  fetchReels,
  fetchSaved,
  fetchStories,
  fetchStoryViewers,
  fetchSuggestedFollows,
  followUser,
  unfollowUser,
  markDmRead,
  reportTarget,
  blockUser,
  searchSocial,
  sendDirectMessage,
  reactDirectMessage,
  startConversation,
  toggleLike,
  uploadMedia,
  updateMe,
  type Conversation,
  type DirectMessage,
  type FeedPost,
  type FollowUser,
  type ReelItem,
  type SearchHits,
  type StoryGroup,
} from '../../lib/social';
import { FilePick } from '../../components/FilePick';
import { fetchP1Flags, type P1Flags } from '../../lib/p1';
import { fetchP2Flags, type P2Flags } from '../../lib/p2';
import { readSessionUser } from '../../lib/auth';
import { getAuthedSocket } from '../../lib/socket';
import { useI18n } from '../../lib/i18n';

const TABS = [
  { id: 'home', label: 'feed.home', to: '/user/feed' },
  { id: 'explore', label: 'feed.explore', to: '/user/feed/explore' },
  { id: 'saved', label: 'feed.saved', to: '/user/feed/saved' },
  { id: 'reels', label: 'feed.reels', to: '/user/feed/reels' },
  { id: 'messages', label: 'feed.messages', to: '/user/feed/messages' },
] as const;

export function FeedSwitch() {
  const { tab = '' } = useParams();
  if (['explore', 'saved', 'reels', 'messages', 'fyp'].includes(tab)) {
    return <FeedPage />;
  }
  return <FeedPostPage />;
}

export function FeedPage() {
  const { t } = useI18n();
  const { tab = 'home' } = useParams();
  const active = ['explore', 'saved', 'reels', 'messages', 'fyp'].includes(tab) ? tab : 'home';
  const focused = useRef<FeedPost | null>(null);
  const { toast } = useHudPage({
    follow: async () => {
      const post = focused.current;
      if (!post) {
        toast(t('feed.focus'));
        return;
      }
      try {
        const res = await toggleLike(post.id);
        toast(res.isLiked ? t('feed.liked') : t('feed.unliked'));
      } catch (err) {
        toast(isApiError(err) ? err.message : t('feed.likeFail'));
      }
    },
  });
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [reels, setReels] = useState<ReelItem[] | null>(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [reelFile, setReelFile] = useState<File[]>([]);
  const [reelCaption, setReelCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const uploadAbort = useRef<AbortController | null>(null);

  async function sendFile(file: File, folder: string) {
    uploadAbort.current?.abort();
    const ctrl = new AbortController();
    uploadAbort.current = ctrl;
    setUploadPct(1);
    try {
      return await uploadMedia(file, folder, { onProgress: setUploadPct, signal: ctrl.signal });
    } finally {
      if (uploadAbort.current === ctrl) {
        uploadAbort.current = null;
        setUploadPct(0);
      }
    }
  }
  const [dmFiles, setDmFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [creators, setCreators] = useState<FollowUser[]>([]);
  const [homeScope, setHomeScope] = useState<'all' | 'following'>('all');
  const [chats, setChats] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<Conversation[]>([]);
  const [flags, setFlags] = useState<P1Flags | null>(null);
  const [p2, setP2] = useState<P2Flags | null>(null);
  const [gameTag, setGameTag] = useState('');
  const [postType, setPostType] = useState('');
  const [msgTab, setMsgTab] = useState<'inbox' | 'requests'>('inbox');
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [story, setStory] = useState<{ gi: number; ii: number } | null>(null);
  const [openChat, setOpenChat] = useState<Conversation | null>(null);
  const [dms, setDms] = useState<DirectMessage[]>([]);
  const [dmDraft, setDmDraft] = useState('');
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHits | null>(null);
  const [typing, setTyping] = useState('');
  const [viewers, setViewers] = useState<Array<{ username: string }>>([]);
  const [storyDraft, setStoryDraft] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [folder, setFolder] = useState('');
  const [dmReply, setDmReply] = useState<DirectMessage | null>(null);
  const [muteDraft, setMuteDraft] = useState(() => (readSessionUser()?.muteWords || []).join(', '));
  const [stitch, setStitch] = useState('');
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const me = readSessionUser();

  useEffect(() => {
    fetchP1Flags().then(setFlags);
    fetchP2Flags().then(setP2);
  }, []);

  useEffect(() => {
    let live = true;
    setPosts(null);
    setReels(null);
    setError('');
    (async () => {
      try {
        if (active === 'reels') {
          const rows = await fetchReels();
          if (live) setReels(rows);
          return;
        }
        if (active === 'messages') {
          const [inbox, reqs] = await Promise.all([fetchConversations('inbox'), fetchConversations('requests')]);
          if (!live) return;
          setChats(inbox);
          setRequests(reqs);
          return;
        }
        if (active === 'fyp') {
          if (live) setPosts(await fetchFeed('fyp'));
          return;
        }
        if (active === 'explore') {
          const data = await fetchExplore();
          if (!live) return;
          setPosts(data.trendingPosts || []);
          setTags(data.trendingHashtags || []);
          setCreators(
            (data.recommendedCreators || []).map((c) => ({
              id: c.id,
              username: c.username,
              avatar: c.avatar,
              isFollowing: false,
            }))
          );
          return;
        }
        const extra = flags?.igGameFeed ? { gameTag: gameTag || undefined, postType: postType || undefined } : {};
        const mode =
          active === 'saved'
            ? 'all'
            : homeScope === 'following'
              ? 'following'
              : flags?.igGameFeed && gameTag
                ? 'games'
                : 'all';
        const [rows, storyRows, suggested] = await Promise.all([
          active === 'saved' ? fetchSaved() : fetchFeed(mode, extra),
          active === 'home' ? fetchStories().catch(() => []) : Promise.resolve([]),
          active === 'home'
            ? fetchSuggestedFollows().catch(() => [] as FollowUser[])
            : Promise.resolve([] as FollowUser[]),
        ]);
        if (live) {
          setPosts(rows);
          if (active === 'home') {
            setStories(storyRows);
            setCreators(suggested);
          }
        }
      } catch (err) {
        if (!live) return;
        setPosts([]);
        setReels([]);
        setError(isApiError(err) ? err.message : t('feed.offline'));
      }
    })();
    return () => {
      live = false;
    };
  }, [active, flags, gameTag, postType, homeScope, t]);

  useEffect(() => {
    if (active !== 'explore' && active !== 'messages') return;
    const q = query.trim();
    if (q.length < 2) {
      setHits(null);
      return;
    }
    let live = true;
    const t = window.setTimeout(() => {
      searchSocial(q)
        .then((data) => {
          if (live) setHits(data);
        })
        .catch(() => {
          if (live) setHits({ users: [], posts: [], hashtags: [] });
        });
    }, 350);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [query, active]);

  useEffect(() => {
    if (!openChat) return;
    let sockOff: (() => void) | undefined;
    void markDmRead(openChat.id).catch(() => undefined);
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      sock.emit('join-dm', openChat.id);
      const onType = (data: { conversationId?: string; isTyping?: boolean }) => {
        if (data.conversationId !== openChat.id) return;
        setTyping(data.isTyping ? t('feed.typing') : '');
      };
      const onMsg = (row: DirectMessage) => {
        if ((row as { conversationId?: string }).conversationId && (row as { conversationId?: string }).conversationId !== openChat.id) return;
        setDms((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, { ...row, id: row.id }]));
      };
      sock.on('user-typing', onType);
      sock.on('new-message', onMsg);
      sockOff = () => {
        sock.emit('leave-dm', openChat.id);
        sock.off('user-typing', onType);
        sock.off('new-message', onMsg);
      };
    });
    return () => sockOff?.();
  }, [openChat, t]);

  return (
    <main className={`play-main play-main-tight ig-feed${active === 'home' ? ' ig-feed--home' : ''}`}>
      <header className="play-head play-head-compact ig-feed-head">
        <div>
          <h1>{t('feed.arena')}</h1>
        </div>
        <nav className="ig-feed-tabs" aria-label={t('feed.eyebrow')}>
          {TABS.map((tab) => (
            <Link key={tab.id} className={`tab-link ${active === tab.id ? 'active' : ''}`} to={tab.to}>
              {t(tab.label)}
            </Link>
          ))}
          {p2?.igForYou ? (
            <Link className={`tab-link ${active === 'fyp' ? 'active' : ''}`} to="/user/feed/fyp">
              {t('feed.fyp')}
            </Link>
          ) : null}
        </nav>
      </header>
      {active === 'home' ? (
        <div className="money-tabs feed-scope-tabs ig-scope">
          <button type="button" className={homeScope === 'all' ? 'active' : ''} onClick={() => setHomeScope('all')}>
            {t('feed.forEveryone')}
          </button>
          <button
            type="button"
            className={homeScope === 'following' ? 'active' : ''}
            onClick={() => setHomeScope('following')}
          >
            {t('feed.followingTab')}
          </button>
        </div>
      ) : null}
      {active === 'home' ? (
        <div className="story-tray ig-stories">
          <label className="story-dot story-add">
            <span className="ph">+</span>
            <small>{t('feed.yourStory')}</small>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              hidden
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setBusy(true);
                try {
                  const url = await sendFile(file, 'stories');
                  setStoryDraft({ url, type: file.type.startsWith('video/') ? 'video' : 'image' });
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('feed.storyFail'));
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {stories.map((g, i) => (
            <button key={g.userId} className="story-dot" type="button" onClick={() => setStory({ gi: i, ii: 0 })}>
              {g.avatar ? <img src={g.avatar} alt="" width={56} height={56} /> : <span className="ph">{(g.username || '?')[0]}</span>}
              <small>{g.username}</small>
            </button>
          ))}
        </div>
      ) : null}
      {active === 'home' ? (
        <form
          className="money-form room-card ig-composer"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!draft.trim() && !postFiles.length) return;
            setBusy(true);
            try {
              const mediaUrls: string[] = [];
              let hasVideo = false;
              for (const file of postFiles.slice(0, 4)) {
                const folder = file.type.startsWith('video/') ? 'reels' : 'social';
                mediaUrls.push(await sendFile(file, folder));
                if (file.type.startsWith('video/')) hasVideo = true;
              }
              const text = draft.trim() || (hasVideo ? t('feed.clip') : t('feed.photo'));
              await createPost(text, mediaUrls.length ? { mediaUrls, coverUrl: mediaUrls[0], postType: hasVideo ? 'video' : 'image' } : {});
              setDraft('');
              setPostFiles([]);
              toast(t('feed.posted'));
              const refreshMode = homeScope === 'following' ? 'following' : flags?.igGameFeed && gameTag ? 'games' : 'all';
              setPosts(await fetchFeed(refreshMode, flags?.igGameFeed ? { gameTag: gameTag || undefined, postType: postType || undefined } : {}));
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.postFail'));
            } finally {
              setBusy(false);
            }
          }}
        >
                    <div className="ig-composer-row">
            {me?.avatar ? (
              <img className="ig-composer-avatar" src={me.avatar} alt="" width={40} height={40} />
            ) : (
              <span className="ig-composer-avatar ph" aria-hidden>
                {(me?.username || '?').slice(0, 1).toUpperCase()}
              </span>
            )}
            <label className="field ig-composer-field">
              <span className="sr-only">{t('feed.dropLine')}</span>
              <input value={draft} maxLength={500} onChange={(e) => setDraft(e.target.value)} placeholder={t('feed.dropLine')} />
            </label>
            <button className="btn btn-primary ig-composer-go" type="submit" disabled={busy || (!draft.trim() && !postFiles.length)}>
              {busy ? t('feed.publishing') : t('feed.publish')}
            </button>
          </div>
          <FilePick
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            multiple
            disabled={busy}
            hint={t('feed.photo') + ' / video'}
            files={postFiles}
            onFiles={setPostFiles}
          />
          {uploadPct > 0 ? (
            <div className="upload-row">
              <div className="upload-bar" aria-hidden>
                <i style={{ width: `${uploadPct}%` }} />
              </div>
              <p className="play-muted">{t('feed.progress').replace('{n}', String(uploadPct))}</p>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => uploadAbort.current?.abort()}
              >
                {t('feed.cancelUpload')}
              </button>
            </div>
          ) : null}

        </form>
      ) : null}
      {active === 'home' && creators.length ? (
        <section className="feed-rail ig-suggest">
          <div className="ig-suggest-head">
            <h2>{t('feed.suggested')}</h2>
          </div>
          <div className="ig-suggest-row">
            {creators.slice(0, 8).map((c) => (
              <article key={c.id} className="ig-suggest-card">
                <Link to={`/profile/${c.id}`} className="ig-suggest-avatar">
                  {c.avatar ? (
                    <img src={c.avatar} alt="" width={56} height={56} />
                  ) : (
                    <span aria-hidden>{(c.username || '?').slice(0, 1).toUpperCase()}</span>
                  )}
                </Link>
                <div className="ig-suggest-meta">
                  <Link to={`/profile/${c.id}`} className="ig-suggest-name">
                    {c.username}
                  </Link>
                  <button
                    className={`btn ${c.isFollowing ? 'btn-ghost' : 'btn-primary'} ig-suggest-follow`}
                    type="button"
                    onClick={async () => {
                      try {
                        if (c.isFollowing) {
                          await unfollowUser(c.id);
                          setCreators((prev) =>
                            prev.map((u) => (u.id === c.id ? { ...u, isFollowing: false } : u))
                          );
                          toast(t('profile.unfollowed'));
                        } else {
                          await followUser(c.id);
                          setCreators((prev) =>
                            prev.map((u) => (u.id === c.id ? { ...u, isFollowing: true } : u))
                          );
                          toast(`${t('feed.following')} ${c.username}`);
                        }
                      } catch (err) {
                        toast(isApiError(err) ? err.message : t('feed.followFail'));
                      }
                    }}
                  >
                    {c.isFollowing ? t('profile.following') : t('feed.follow')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {active === 'home' && (p2?.igForYou || p2?.voiceNotes || flags?.igGameFeed) ? (
        <details className="feed-rail ig-tools">
          <summary>{t('feed.mutes')} · Filters</summary>
          {p2?.igForYou || p2?.voiceNotes ? (
            <form
              className="money-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const muteWords = muteDraft
                  .split(',')
                  .map((w) => w.trim().toLowerCase())
                  .filter(Boolean)
                  .slice(0, 24);
                try {
                  await updateMe({ muteWords });
                  toast(t('feed.mutesSaved'));
                } catch (err) {
                  toast(isApiError(err) ? err.message : t('feed.mutesFail'));
                }
              }}
            >
              <label className="field">
                {t('feed.mutes')}
                <input value={muteDraft} onChange={(e) => setMuteDraft(e.target.value)} placeholder={t('feed.mutePh')} />
              </label>
              <button className="btn btn-ghost" type="submit">
                {t('feed.saveMutes')}
              </button>
            </form>
          ) : null}
          {flags?.igGameFeed ? (
            <div className="money-tabs ig-game-chips">
              {[['','feed.allGames'],['pubg','PUBG'],['freefire','Free Fire'],['cod','COD'],['mlbb','MLBB'],['valorant','Valorant']].map(([g, label]) => (
                <button key={g || 'all'} type="button" className={!gameTag && !g ? 'active' : gameTag === g ? 'active' : ''} onClick={() => setGameTag(g)}>
                  {g ? label : t(label)}
                </button>
              ))}
              {flags.igHighlights ? (
                <button type="button" className={postType === 'match_result' ? 'active' : ''} onClick={() => setPostType(postType === 'match_result' ? '' : 'match_result')}>
                  Highlights
                </button>
              ) : null}
            </div>
          ) : null}
        </details>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      {active === 'explore' ? (
        <label className="field">
          {t('feed.exploreSearch')}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('feed.searchPlayer')}
            aria-label={t('feed.exploreSearch')}
          />
        </label>
      ) : null}
      {active === 'explore' && hits ? (
        <div className="search-hits">
          {hits.users.length ? (
            <ul className="roster">
              {hits.users.map((u) => (
                <li key={u.id}>
                  <Link to={`/profile/${u.id}`}>{u.username}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          {hits.hashtags.length ? (
            <div className="explore-tags">
              {hits.hashtags.map((tag) => (
                <Link key={tag} className="chip" to={`/user/hashtag/${encodeURIComponent(tag)}`}>
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}
          {hits.posts.length ? (
            <div className="explore-grid">
              {hits.posts.map((p) => (
                <Link key={p.id} className="explore-tile" to={`/user/feed/${p.id}`}>
                  {p.coverUrl ? <img src={p.coverUrl} alt="" /> : <span>{p.title || p.description}</span>}
                </Link>
              ))}
            </div>
          ) : null}
          {!hits.users.length && !hits.posts.length && !hits.hashtags.length ? (
            <p className="play-muted">{t('feed.noSearch')} “{query}”.</p>
          ) : null}
        </div>
      ) : null}
      {active === 'explore' && tags.length ? (
        <div className="explore-tags">
          {tags.map((t) => (
            <Link
              key={t.tag}
              className="chip"
              to={`/user/hashtag/${encodeURIComponent(t.tag)}`}
            >
              #{t.tag} {t.count}
            </Link>
          ))}
        </div>
      ) : null}
      {active === 'reels' ? (
        <>
          <form
            className="money-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const file = reelFile[0];
              if (!file) {
                toast(t('feed.pickVideo'));
                return;
              }
              setBusy(true);
              try {
                const videoUrl = await sendFile(file, 'reels');
                await createReel(videoUrl, stitch ? `${reelCaption.trim()} · duet ${stitch}` : reelCaption.trim(), stitch.trim());
                setReelCaption('');
                setStitch('');
                setReelFile([]);
                toast(t('feed.reelOk'));
                setReels(await fetchReels());
              } catch (err) {
                toast(isApiError(err) ? err.message : t('feed.reelFail'));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">{t('feed.newReel')}</label>
            <FilePick accept="video/mp4,video/webm" disabled={busy} hint={t('feed.dropVideo')} files={reelFile} onFiles={setReelFile} />
            <label className="field">
              Caption
              <input value={reelCaption} maxLength={220} onChange={(e) => setReelCaption(e.target.value)} placeholder={t('feed.caption')} />
            </label>
            <label className="field">
              {t('feed.stitch')}
              <input value={stitch} maxLength={80} onChange={(e) => setStitch(e.target.value)} placeholder="@player or reel id" />
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? t('feed.uploading') : t('feed.publishReel')}
            </button>
          </form>
          {reels === null ? (
            <div className="match-row skeleton" />
          ) : reels.length === 0 ? (
            <div className="play-empty">
              <h2>{t('feed.noReels')}</h2>
              <p>{t('feed.noReelsLead')}</p>
            </div>
          ) : (
            <ReelsStage reels={reels} onDuet={(cap) => setStitch(cap)} />
          )}
        </>
      ) : null}
      {active === 'messages' ? (
        <div className="dm-split">
          <section className="room-card dm-pane">
            <h2>{t('feed.inbox')}</h2>
            <label className="field">
              {t('feed.newMsg')}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('feed.searchPlayer')}
                aria-label={t('feed.newMsg')}
              />
            </label>
            {hits?.users.length ? (
              <ul className="roster">
                {hits.users.map((u) => (
                  <li key={u.id}>
                    <span>{u.username}</span>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={async () => {
                        try {
                          const conv = await startConversation(u.id);
                          toast(conv.requestStatus === 'pending' ? t('feed.reqSent') : t('feed.chatOpen'));
                          const inbox = await fetchConversations('inbox');
                          setChats(inbox);
                          const found = inbox.find((c) => c.id === conv.id) || {
                            id: conv.id,
                            participant: { id: u.id, username: u.username },
                          };
                          setOpenChat(found);
                          setDms(await fetchDirectMessages(conv.id).catch(() => []));
                          setQuery('');
                          setHits(null);
                        } catch (err) {
                          toast(isApiError(err) ? err.message : t('feed.chatFail'));
                        }
                      }}
                    >
                      {t('feed.message')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {flags?.igMessageRequests ? (
              <div className="money-tabs">
                <button type="button" className={msgTab === 'inbox' ? 'active' : ''} onClick={() => setMsgTab('inbox')}>
                  {t('feed.inbox')}
                </button>
                <button type="button" className={msgTab === 'requests' ? 'active' : ''} onClick={() => setMsgTab('requests')}>
                  {t('feed.requests')} ({requests.length})
                </button>
              </div>
            ) : null}
            {(msgTab === 'requests' && flags?.igMessageRequests ? requests : chats).length === 0 ? (
              <p className="play-muted">{t('feed.noThreadsLead')}</p>
            ) : (
              <ul className="roster">
                {(msgTab === 'requests' && flags?.igMessageRequests ? requests : chats).map((c) => (
                  <li key={c.id}>
                    <button
                      className={`dm-thread ${openChat?.id === c.id ? 'on' : ''}`}
                      type="button"
                      onClick={async () => {
                        setOpenChat(c);
                        try {
                          setDms(await fetchDirectMessages(c.id));
                        } catch (err) {
                          toast(isApiError(err) ? err.message : t('feed.loadChat'));
                        }
                      }}
                    >
                      {c.participant?.isOnline ? <span className="online-dot" aria-hidden /> : null}
                      <b>{c.participant?.username || t('feed.player')}</b>
                    </button>
                    {msgTab === 'requests' ? (
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={async () => {
                          try {
                            await acceptConversation(c.id);
                            toast(t('feed.accepted'));
                            setRequests((prev) => prev.filter((x) => x.id !== c.id));
                            setChats(await fetchConversations('inbox'));
                          } catch (err) {
                            toast(isApiError(err) ? err.message : t('feed.acceptFail'));
                          }
                        }}
                      >
                        {t('feed.accept')}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="room-card dm-pane">
            {openChat ? (
              <>
                <div className="dm-thread-head">
                  <h2>
                    {openChat.participant?.isOnline ? <span className="online-dot" aria-hidden /> : null}{' '}
                    {openChat.participant?.username || t('feed.chat')}
                  </h2>
                  <div className="match-actions">
                    {openChat.participant?.id ? (
                      <>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={async () => {
                            try {
                              await blockUser(openChat.participant!.id!);
                              toast(t('feed.blocked'));
                            } catch (err) {
                              toast(isApiError(err) ? err.message : t('feed.blockFail'));
                            }
                          }}
                        >
                          {t('feed.block')}
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={async () => {
                            try {
                              await reportTarget('user', openChat.participant!.id!);
                              toast(t('feed.reported'));
                            } catch (err) {
                              toast(isApiError(err) ? err.message : t('feed.reportFail'));
                            }
                          }}
                        >
                          {t('feed.report')}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                {p2?.voiceNotes && dms.some((m) => m.attachments?.length) ? (
                  <div className="dm-media">
                    {dms.flatMap((m) => m.attachments || []).slice(0, 12).map((url) => {
                      const href = safeMediaHref(url);
                      if (!href) return null;
                      return (
                      <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                        {t('feed.mediaLink')}
                      </a>
                      );
                    })}
                  </div>
                ) : null}
                {typing ? <p className="play-muted">{typing}</p> : null}
                <div className="dm-log">
                  {dms.map((m) => (
                    <div key={m.id} className={m.isMine ? 'mine dm-bubble' : 'dm-bubble'}>
                      <small>{m.senderName}</small>
                      {m.replyTo ? <small className="play-muted">{t('feed.reply')}</small> : null}
                      {m.body ? <p>{m.body}</p> : null}
                      {m.isMine ? <small>{(m.readBy?.length || 0) > 1 ? t('feed.seen') : t('feed.sent')}</small> : null}
                      {m.attachments?.length ? (
                        <div className="dm-media">
                          {m.attachments.map((url) => {
                            const href = safeMediaHref(url);
                            if (!href) return null;
                            return /\.(mp3|m4a|ogg)(\?|$)/i.test(href) || /voice/i.test(href) ? (
                              <audio key={href} src={href} controls />
                            ) : /\.(mp4|webm)(\?|$)/i.test(href) ? (
                              <video key={href} src={href} controls playsInline />
                            ) : (
                              <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                                <img src={href} alt="" />
                              </a>
                            );
                          })}
                        </div>
                      ) : null}
                      <div className="story-sticker-row">
                        {['🔥', '👏', '❤'].map((e) => (
                          <button
                            key={e}
                            className="text-link"
                            type="button"
                            onClick={async () => {
                              if (!openChat) return;
                              const next = await reactDirectMessage(openChat.id, m.id, e);
                              setDms((rows) => rows.map((row) => (row.id === m.id ? { ...row, reactions: next } : row)));
                            }}
                          >
                            {e}
                            {(m.reactions || []).filter((r) => r.emoji === e).length || ''}
                          </button>
                        ))}
                        <button className="text-link" type="button" onClick={() => setDmReply(m)}>
                          {t('feed.reply')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="chat-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if ((!dmDraft.trim() && !dmFiles.length) || !openChat) return;
                    setBusy(true);
                    try {
                      const attachments: string[] = [];
                      for (const file of dmFiles.slice(0, 4)) {
                        attachments.push(await sendFile(file, 'support'));
                      }
                      await sendDirectMessage(openChat.id, dmDraft.trim(), attachments, dmReply?.id);
                      setDmDraft('');
                      setDmFiles([]);
                      setDmReply(null);
                      setDms(await fetchDirectMessages(openChat.id));
                    } catch (err) {
                      toast(isApiError(err) ? err.message : t('feed.sendFail'));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <input
                    value={dmDraft}
                    onChange={(e) => {
                      setDmDraft(e.target.value);
                      void getAuthedSocket().then((sock) => {
                        sock?.emit('typing', { conversationId: openChat.id, isTyping: Boolean(e.target.value) });
                      });
                    }}
                    placeholder={dmReply ? `${t('feed.message')} ${dmReply.senderName}` : t('feed.message')}
                  />
                  <label className="btn btn-ghost">
                    {t('feed.attach')}
                    <input
                      type="file"
                      accept={p2?.voiceNotes ? 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/webm,audio/mpeg' : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,application/pdf'}
                      multiple
                      hidden
                      onChange={(e) => setDmFiles(Array.from(e.target.files || []).slice(0, 4))}
                    />
                  </label>
                  {p2?.voiceNotes ? (
                    <button
                      className="btn btn-ghost"
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (recording && recRef.current) {
                          recRef.current.stop();
                          recRef.current = null;
                          return;
                        }
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                          const rec = new MediaRecorder(stream);
                          const chunks: Blob[] = [];
                          rec.ondataavailable = (ev) => {
                            if (ev.data.size) chunks.push(ev.data);
                          };
                          rec.onstop = () => {
                            stream.getTracks().forEach((tr) => tr.stop());
                            const file = new File(chunks, 'voice.webm', { type: rec.mimeType || 'audio/webm' });
                            setDmFiles((prev) => [...prev, file].slice(0, 4));
                            setRecording(false);
                            recRef.current = null;
                          };
                          recRef.current = rec;
                          rec.start();
                          setRecording(true);
                          window.setTimeout(() => {
                            if (rec.state === 'recording') rec.stop();
                          }, 15000);
                        } catch {
                          toast(t('feed.micBlocked'));
                        }
                      }}
                    >
                      {recording ? t('feed.stopVoice') : t('feed.voice')}
                    </button>
                  ) : null}
                  <button className="btn btn-primary" type="submit" disabled={busy}>
                    {t('feed.send')}
                  </button>
                </form>
                {dmFiles.length ? <p className="play-muted">{dmFiles.map((f) => f.name).join(', ')}</p> : null}
              </>
            ) : (
              <div className="dm-empty">
                <p>{t('feed.pickThread')}</p>
              </div>
            )}
          </section>
        </div>
      ) : null}
      {active !== 'reels' && active !== 'messages' && !hits ? (
        posts === null ? (
          <div className="play-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="play-card skeleton" key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="play-empty">
            <h2>
              {active === 'saved'
                ? t('feed.nothingSaved')
                : active === 'home' && homeScope === 'following'
                  ? t('feed.followingEmpty')
                  : t('feed.quiet')}
            </h2>
            <p>
              {active === 'saved'
                ? t('feed.saveHint')
                : active === 'home' && homeScope === 'following'
                  ? t('feed.followingEmptyLead')
                  : t('feed.beFirst')}
            </p>
            {active === 'home' && homeScope === 'following' ? (
              <div className="match-actions">
                <button className="btn btn-primary" type="button" onClick={() => setHomeScope('all')}>
                  {t('feed.forEveryone')}
                </button>
                <Link className="btn btn-ghost" to="/user/feed/explore">
                  {t('feed.explore')}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={active === 'explore' ? 'explore-grid' : 'feed-list'}>
            {active === 'saved' ? (
              <div className="explore-tags">
                {['', ...new Set(posts.map((p) => p.collectionName || t('feed.saved')))].map((name) => (
                  <button key={name || 'all'} className={`chip ${folder === name ? 'on' : ''}`} type="button" onClick={() => setFolder(name)}>
                    {name || t('feed.all')}
                  </button>
                ))}
              </div>
            ) : null}
            {(active === 'saved' && folder ? posts.filter((p) => (p.collectionName || t('feed.saved')) === folder) : posts).map((p) =>
              active === 'explore' ? (
                <Link key={p.id} className="explore-tile" to={`/user/feed/${p.id}`}>
                  {p.coverUrl ? <img src={p.coverUrl} alt="" /> : <span>{p.description || p.title}</span>}
                </Link>
              ) : (
                <PostCard
                  key={p.id}
                  post={p}
                  toast={toast}
                  onChange={(next) => {
                    focused.current = next;
                    setPosts((rows) => rows?.map((row) => (row.id === next.id ? next : row)) || rows);
                  }}
                />
              ),
            )}
          </div>
        )
      ) : null}
      {active === 'explore' && creators.length ? (
        <div className="creator-row">
          {creators.map((c) => (
            <span key={c.id} className="creator-chip">
              <Link to={`/profile/${c.id}`}>{c.username}</Link>
              <button
                className="text-link"
                type="button"
                onClick={async () => {
                  try {
                    await followUser(c.id);
                    toast(`${t('feed.following')} ${c.username}`);
                  } catch (err) {
                    toast(isApiError(err) ? err.message : t('feed.followFail'));
                  }
                }}
              >
                {t('feed.follow')}
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {storyDraft ? (
        <StoryComposer
          previewUrl={storyDraft.url}
          mediaType={storyDraft.type}
          busy={busy}
          pollsOn={Boolean(flags?.igHighlights)}
          onCancel={() => setStoryDraft(null)}
          onPublish={async (extra) => {
            setBusy(true);
            try {
              await createStory(storyDraft.url, storyDraft.type, extra.overlayText, extra);
              toast(t('feed.storyLive'));
              setStoryDraft(null);
              setStories(await fetchStories());
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.storyFail'));
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
      {story ? (
        <StoryViewer
          groups={stories}
          gi={story.gi}
          ii={story.ii}
          ownId={me?.id}
          highlightsOn={Boolean(flags?.igHighlights)}
          onClose={() => {
            setStory(null);
            setViewers([]);
          }}
          onChange={(gi, ii) => setStory({ gi, ii })}
          onReply={async (userId, username, storyId) => {
            try {
              const conv = await startConversation(userId);
              await sendDirectMessage(conv.id, `Re: your story ${storyId}`);
              toast(`${t('feed.replied')} ${username}`);
              setStory(null);
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.replyFail'));
            }
          }}
          onViewers={async (storyId) => {
            try {
              setViewers(await fetchStoryViewers(storyId));
            } catch (err) {
              toast(isApiError(err) ? err.message : t('feed.viewersHidden'));
            }
          }}
        />
      ) : null}
      {viewers.length ? (
        <ul className="roster">
          {viewers.map((v) => (
            <li key={v.username}>{v.username} {t('feed.viewed')}</li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
