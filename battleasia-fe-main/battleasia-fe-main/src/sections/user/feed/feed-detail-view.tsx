import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Dialog,
  Avatar,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import Link from '@mui/material/Link';

import useApi from 'src/hooks/use-api';

import { fDate } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';

import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserGlassCard,
  UserPageTitle,
  UserBackButton,
  UserActionButton,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
  userGlassDialogPaperSx,
} from 'src/layouts/user';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { usePopover } from 'minimal-shared/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Logo } from 'src/components/logo';
import {
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { FeedDetailSkeleton } from './components';
import { getFeedCoverUrl, isOfficialAuthor } from './feed-types';

// ----------------------------------------------------------------------

type FeedDetail = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  status: 'published' | 'draft';
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  totalViews: number;
  totalShares: number;
  totalComments: number;
  totalLikes: number;
  isLiked?: boolean;
  createdAt: Date | string;
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
    role?: {
      id: string;
      name: string;
    } | null;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    username: string;
    avatar: string;
    role?: {
      id: string;
      name: string;
    } | null;
  };
};

const feedIconButtonSx = {
  color: USER_COLORS.textMuted,
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.06),
    color: USER_COLORS.textSubtle,
  },
};

const authorLinkSx = {
  color: USER_COLORS.textPrimary,
  fontWeight: 600,
  fontSize: 14,
  '&:hover': {
    color: USER_COLORS.gold,
  },
};

const feedCommentInputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: alpha('#000000', 0.5),
    pr: 10,
    pl: 5,
    borderRadius: 2,
    color: USER_COLORS.textPrimary,
    '& fieldset': {
      borderColor: alpha('#ffffff', 0.22),
    },
    '&:hover fieldset': {
      borderColor: alpha('#ffffff', 0.38),
    },
    '&.Mui-focused fieldset': {
      borderColor: USER_COLORS.gold,
    },
    '& input::placeholder': {
      color: alpha('#ffffff', 0.4),
      opacity: 1,
    },
  },
};

export function FeedDetailView() {
  const { t } = useTranslate();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFeedByIdApi, incrementFeedViewsApi, toggleFeedLikeApi, getFeedCommentsApi, addFeedCommentApi } = useApi();
  const [feed, setFeed] = useState<FeedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumRestricted, setPremiumRestricted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const emojiPopover = usePopover();

  useEffect(() => {
    const fetchFeed = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getFeedByIdApi(id);

        if (response?.data?.status && response.data.data) {
          const feedData = response.data.data;
          setFeed({
            id: feedData.id || feedData._id,
            title: feedData.title,
            description: feedData.description,
            coverUrl: feedData.coverUrl || '',
            status: feedData.status,
            category: feedData.category,
            totalViews: feedData.totalViews || 0,
            totalShares: feedData.totalShares || 0,
            totalComments: feedData.totalComments || 0,
            totalLikes: feedData.totalLikes || 0,
            isLiked: feedData.isLiked || false,
            createdAt: feedData.createdAt ? new Date(feedData.createdAt) : new Date(),
            author: feedData.author,
          });

          // Fetch comments
          try {
            setCommentLoading(true);
            const commentsResponse = await getFeedCommentsApi(id, { limit: 50 });
            if (commentsResponse?.data?.status && commentsResponse.data.data?.results) {
              setComments(
                commentsResponse.data.data.results.map((comment: any) => ({
                  id: comment.id,
                  content: comment.content,
                  createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
                  user: {
                    id: comment.user?.id || '',
                    username: comment.user?.username || 'Unknown',
                    avatar: comment.user?.avatar || '',
                    role: comment.user?.role || null,
                  },
                }))
              );
            }
          } catch (error) {
            console.error('Failed to fetch comments:', error);
          } finally {
            setCommentLoading(false);
          }

          // Increment view count
          try {
            await incrementFeedViewsApi(id);
          } catch (error) {
            console.error('Failed to increment views:', error);
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch feed:', error);
        if (error?.response?.status === 403) {
          setPremiumRestricted(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [id, getFeedByIdApi, incrementFeedViewsApi, getFeedCommentsApi]);

  const handleLike = async () => {
    if (!feed || !id) return;
    try {
      const response = await toggleFeedLikeApi(id);
      if (response?.data?.status) {
        setFeed({
          ...feed,
          isLiked: response.data.data.isLiked,
          totalLikes: response.data.data.totalLikes,
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!feed || !id || !newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const response = await addFeedCommentApi(id, newComment.trim());
      if (response?.data?.status && response.data.data) {
        const comment = response.data.data;
        setComments((prev) => [
          {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
            user: {
              id: comment.user?.id || '',
              username: comment.user?.username || 'Unknown',
              avatar: comment.user?.avatar || '',
              role: comment.user?.role || null,
            },
          },
          ...prev,
        ]);
        setFeed({
          ...feed,
          totalComments: comment.totalComments || feed.totalComments + 1,
        });
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const openInNewTab = (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleShare = (platform: 'facebook' | 'twitter') => {
    if (!feed) return;

    const url = window.location.href;
    const text = encodeURIComponent(feed.title);
    const shareUrl = encodeURIComponent(url);

    if (platform === 'facebook') {
      openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
    } else if (platform === 'twitter') {
      openInNewTab(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
    emojiPopover.onClose();
  };

  // Common emojis for the picker
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎',
    '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
    '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
    '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️',
    '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌',
    '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
    '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
    '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾',
    '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷',
    '🦴', '👀', '👁️', '👅', '👄', '💋', '❤️', '🧡', '💛', '💚',
    '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓',
    '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊',
    '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔',
    '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺',
    '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹',
    '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑',
    '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱',
    '🔞', '📵', '🚭', '❗', '❓', '❕', '❔', '‼️', '⁉️', '🔅',
    '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯',
    '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧',
    '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹',
    '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤',
    '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣',
    '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢',
    '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮',
    '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️',
    '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️',
    '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖',
    '➗', '✖️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿',
    '🔚', '🔙', '🔛', '🔜', '🔝', '✔️', '☑️', '🔘', '⚪',
    '⚫', '🔴', '🔵', '🟠', '🟡', '🟢', '🟣', '🟤', '⚫', '🔶',
    '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '▪️',
    '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦',
    '🟪', '🟫', '⬛', '⬜', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕',
    '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️',
    '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
    '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠',
    '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧',
  ];

  if (loading) {
    return (
      <UserPageShell contentSx={{ maxWidth: 760, mx: 'auto' }}>
        <FeedDetailSkeleton />
      </UserPageShell>
    );
  }

  if (!feed) {
    return (
      <UserPageShell contentSx={{ maxWidth: 760, mx: 'auto' }}>
        {premiumRestricted ? (
          <Stack spacing={2}>
            <UserBackButton onClick={() => navigate(paths.user.feed)} label={t('common.goBack')} />
            <UserGlassCard sx={{ maxWidth: 480, mx: 'auto', p: { xs: 3, md: 4 } }}>
            <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(USER_COLORS.gold, 0.1),
                  border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
                  color: USER_COLORS.gold,
                }}
              >
                <Iconify icon="solar:crown-bold-duotone" width={36} />
              </Box>
              <Typography className="font-tr" sx={{ fontSize: 22, fontWeight: 800, color: USER_COLORS.textPrimary, textTransform: 'uppercase' }}>
                {t('profile.premiumMembership')}
              </Typography>
              <Typography sx={{ ...userMutedTextSx, maxWidth: 360 }}>
                {t('match.premiumOnlyDescription')}
              </Typography>
              <UserActionButton actionVariant="gold" onClick={() => navigate(paths.user.account.profile)}>
                {t('profile.getPremium')}
              </UserActionButton>
            </Stack>
          </UserGlassCard>
          </Stack>
        ) : (
          <UserEmptyState icon="solar:document-text-bold-duotone" title={t('feed.feedNotFound')} />
        )}
      </UserPageShell>
    );
  }

  const tokens = getDefaultGlassTokens();
  const coverUrl = getFeedCoverUrl(feed.coverUrl);
  const isOfficial = isOfficialAuthor(feed.author?.role?.name);

  return (
    <UserPageShell contentSx={{ maxWidth: 760, mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <UserBackButton onClick={() => navigate(-1)} />
      </Box>

      <UserPageTitle
        badge={feed.category?.name || 'Article'}
        title={feed.title}
        subtitle={`${feed.category?.name || 'Stake'} · ${fDate(feed.createdAt)}`}
        action={
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => handleShare('facebook')}
              sx={{
                bgcolor: alpha('#ffffff', 0.06),
                color: USER_COLORS.textSubtle,
                border: `1px solid ${USER_COLORS.border}`,
                '&:hover': { bgcolor: alpha(USER_COLORS.gold, 0.12), color: USER_COLORS.gold },
              }}
            >
              <Iconify icon="eva:facebook-fill" width={20} />
            </IconButton>
            <IconButton
              onClick={() => handleShare('twitter')}
              sx={{
                bgcolor: alpha('#ffffff', 0.06),
                color: USER_COLORS.textSubtle,
                border: `1px solid ${USER_COLORS.border}`,
                '&:hover': { bgcolor: alpha(USER_COLORS.gold, 0.12), color: USER_COLORS.gold },
              }}
            >
              <Iconify icon="eva:twitter-fill" width={20} />
            </IconButton>
          </Stack>
        }
      />

      {feed.author ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <Link component={RouterLink} href={paths.profile(feed.author.id)} underline="none" sx={{ display: 'inline-flex' }}>
            {isOfficial ? (
              <Logo sx={{ p: 0.5, width: 36, height: 36, bgcolor: USER_COLORS.gold, borderRadius: '50%' }} />
            ) : (
              <Avatar src={getImageUrl(feed.author.avatarUrl)} alt={feed.author.name} sx={{ width: 36, height: 36 }} />
            )}
          </Link>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Link component={RouterLink} href={paths.profile(feed.author.id)} underline="none" sx={authorLinkSx}>
              {feed.author.name}
            </Link>
            {isOfficial ? <Iconify icon="solar:verified-check-bold" width={16} sx={{ color: USER_COLORS.gold }} /> : null}
          </Stack>
        </Stack>
      ) : null}

      <Box sx={getGlassShellSx(tokens, { mb: 3, p: 2 })}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <IconButton
              onClick={handleLike}
              sx={{
                ...feedIconButtonSx,
                color: feed.isLiked ? USER_COLORS.error : USER_COLORS.textMuted,
              }}
            >
              <Iconify icon={feed.isLiked ? 'solar:heart-bold' : 'solar:heart-outline'} width={22} />
            </IconButton>
            <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 700, minWidth: 32 }}>
              {feed.totalLikes || 0}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            onClick={() => setCommentsOpen(true)}
            sx={{ cursor: 'pointer' }}
          >
            <Iconify icon="solar:chat-round-outline" width={22} sx={{ color: USER_COLORS.textMuted }} />
            <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 700, minWidth: 32 }}>
              {feed.totalComments || 0}
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Box sx={getGlassBadgeChipSx(tokens)}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
              <Iconify icon="solar:eye-outline" width={14} sx={{ color: USER_COLORS.textMuted }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{feed.totalViews || 0} views</Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {coverUrl ? (
        <Box
          sx={getGlassShellSx(tokens, {
            width: '100%',
            mb: 3,
            p: 0,
            overflow: 'hidden',
            borderColor: alpha(USER_COLORS.gold, 0.35),
          })}
        >
          <Image alt={feed.title} src={coverUrl} sx={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      ) : null}

      <UserGlassCard sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Box
              ref={descriptionRef}
              sx={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                '& p': {
                  mb: 2,
                  color: USER_COLORS.textSubtle,
                  lineHeight: 1.8,
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  mb: 2,
                  mt: 3,
                  color: USER_COLORS.textPrimary,
                  fontWeight: 700,
                },
                '& a': {
                  color: USER_COLORS.gold,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: 2,
                },
                '& ul, & ol': {
                  pl: 3,
                  mb: 2,
                },
                '& li': {
                  mb: 1,
                  color: USER_COLORS.textSubtle,
                },
              }}
              dangerouslySetInnerHTML={{ __html: feed.description }}
            />
          </UserGlassCard>

          <Dialog
            open={commentsOpen}
            onClose={() => setCommentsOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                ...(userGlassDialogPaperSx as object),
                maxHeight: '90vh',
                height: '90vh',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
                borderBottom: `1px solid ${USER_COLORS.border}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: USER_COLORS.textPrimary }}>
                Comments
              </Typography>
              <IconButton
                onClick={() => setCommentsOpen(false)}
                sx={feedIconButtonSx}
              >
                <Iconify icon="eva:close-fill" width={24} />
              </IconButton>
            </DialogTitle>

            {/* Dialog Content - Scrollable Comments List */}
            <DialogContent
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {commentLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress size={24} sx={{ color: USER_COLORS.gold }} />
                </Box>
              ) : comments.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <Typography variant="body2" sx={userMutedTextSx}>
                    No comments yet. Be the first to comment!
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={0} sx={{ px: 2, py: 2 }}>
                  {comments.map((comment) => (
                    <Box
                      key={comment.id}
                      sx={{
                        py: 2,
                        borderBottom: `1px solid ${USER_COLORS.border}`,
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {(comment.user.role?.name === 'admin' || comment.user.role?.name === 'official') ? (
                          <Logo
                            sx={{
                              p: 0.5,
                              width: 40,
                              height: 40,
                              bgcolor: USER_COLORS.gold,
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          <Avatar
                            src={`${CONFIG.serverUrl}${comment.user.avatar}`}
                            alt={comment.user.username}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: alpha('#ffffff', 0.08),
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: USER_COLORS.textPrimary,
                                }}
                              >
                                {comment.user.username}
                              </Typography>
                              {(comment.user.role?.name === 'admin' || comment.user.role?.name === 'official') && (
                                <Iconify
                                  icon="solar:verified-check-bold"
                                  width={14}
                                  sx={{ color: USER_COLORS.gold }}
                                />
                              )}
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{
                                ...userMutedTextSx,
                                fontSize: '0.75rem',
                              }}
                            >
                              {fDate(comment.createdAt)}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              color: USER_COLORS.textSubtle,
                              wordBreak: 'break-word',
                              mb: 1,
                            }}
                          >
                            {comment.content}
                          </Typography>
                          {/* <Button
                            size="small"
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem',
                              color: 'text.secondary',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'transparent',
                                color: 'text.primary',
                              },
                            }}
                          >
                            Reply
                          </Button> */}
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </DialogContent>

            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${USER_COLORS.border}`,
                bgcolor: alpha('#000000', 0.35),
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  placeholder={`Add a comment for ${feed.author?.name || 'this post'}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && newComment.trim() && !submittingComment) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  sx={feedCommentInputSx}
                />
                <IconButton
                  onClick={emojiPopover.onOpen}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 32,
                    height: 32,
                    color: USER_COLORS.gold,
                    '&:hover': {
                      bgcolor: alpha(USER_COLORS.gold, 0.12),
                    },
                  }}
                >
                  <Iconify icon="line-md:emoji-grin-filled" width={20} />
                </IconButton>
                <IconButton
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 32,
                    height: 32,
                    bgcolor: newComment.trim() && !submittingComment ? USER_COLORS.gold : 'transparent',
                    color: newComment.trim() && !submittingComment ? USER_COLORS.surface : USER_COLORS.textMuted,
                    '&:hover': {
                      bgcolor: newComment.trim() && !submittingComment ? USER_COLORS.goldDark : alpha('#ffffff', 0.06),
                    },
                    '&:disabled': {
                      bgcolor: 'transparent',
                      color: alpha('#ffffff', 0.25),
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {submittingComment ? (
                    <CircularProgress size={16} sx={{ color: USER_COLORS.textMuted }} />
                  ) : (
                    <Iconify icon="eva:paper-plane-fill" width={18} />
                  )}
                </IconButton>
              </Box>

              <CustomPopover
                open={emojiPopover.open}
                anchorEl={emojiPopover.anchorEl}
                onClose={emojiPopover.onClose}
                slotProps={{
                  paper: {
                    sx: {
                      width: 320,
                      maxHeight: 400,
                      overflow: 'auto',
                      p: 1.5,
                      bgcolor: alpha(USER_COLORS.surface, 0.96),
                      border: `1px solid ${USER_COLORS.border}`,
                      backdropFilter: 'blur(16px)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'wrap',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: alpha('#ffffff', 0.04),
                      borderRadius: 1,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: alpha('#ffffff', 0.18),
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: alpha('#ffffff', 0.28),
                      },
                    },
                  }}
                >
                  {commonEmojis.map((emoji, index) => (
                    <IconButton
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: '1.5rem',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: alpha(USER_COLORS.gold, 0.12),
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      {emoji}
                    </IconButton>
                  ))}
                </Box>
              </CustomPopover>
            </Box>
          </Dialog>
    </UserPageShell>
  );
}

