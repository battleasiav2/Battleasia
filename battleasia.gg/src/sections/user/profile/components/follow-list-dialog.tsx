import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import { USER_COLORS, userGlassDialogPaperSx, UserActionButton } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { mapFollowUser, type FollowUserItem } from '../profile-social-types';

// ----------------------------------------------------------------------

type FollowListDialogProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  mode: 'followers' | 'following';
  onFollowChange?: () => void;
};

export function FollowListDialog({ open, onClose, userId, mode, onFollowChange }: FollowListDialogProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { getFollowersApi, getFollowingApi, followUserApi, unfollowUserApi } = useApi();
  const [items, setItems] = useState<FollowUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response =
        mode === 'followers' ? await getFollowersApi(userId) : await getFollowingApi(userId);
      const results = response?.data?.data?.results;
      setItems(Array.isArray(results) ? results.map(mapFollowUser) : []);
    } catch (error) {
      console.error('Failed to load follow list:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getFollowersApi, getFollowingApi, mode, userId]);

  useEffect(() => {
    if (open) {
      void fetchList();
    }
  }, [open, fetchList]);

  const toggleFollow = async (targetId: string, isFollowing?: boolean) => {
    try {
      setActionId(targetId);
      const response = isFollowing ? await unfollowUserApi(targetId) : await followUserApi(targetId);
      if (response?.data?.status) {
        setItems((prev) =>
          prev.map((item) => (item.id === targetId ? { ...item, isFollowing: !isFollowing } : item))
        );
        onFollowChange?.();
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setActionId(null);
    }
  };

  const title = mode === 'followers' ? t('profile.followers') : t('profile.following');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: userGlassDialogPaperSx }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary, textTransform: 'uppercase' }}>{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: USER_COLORS.textMuted }}>
          <Iconify icon="eva:close-fill" width={22} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2, pb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} sx={{ color: USER_COLORS.gold }} />
          </Box>
        ) : items.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: USER_COLORS.textMuted, py: 4 }}>
            {mode === 'followers' ? t('profile.noFollowers') : t('profile.noFollowing')}
          </Typography>
        ) : (
          <Scrollbar sx={{ maxHeight: 420 }}>
            <Stack spacing={1}>
              {items.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  sx={{
                    p: 1.25,
                    border: `1px solid ${alpha('#ffffff', 0.1)}`,
                    bgcolor: alpha('#000000', 0.25),
                  }}
                >
                  <Avatar
                    src={getImageUrl(item.avatar)}
                    alt={item.username}
                    sx={{ width: 40, height: 40, cursor: 'pointer', border: `1px solid ${alpha(USER_COLORS.gold, 0.25)}` }}
                    onClick={() => {
                      onClose();
                      navigate(paths.profile(item.id));
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => { onClose(); navigate(paths.profile(item.id)); }}>
                    <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary }} noWrap>
                      {item.username}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted }}>{item.role}</Typography>
                  </Box>
                  {typeof item.isFollowing === 'boolean' ? (
                    <UserActionButton
                      size="small"
                      actionVariant={item.isFollowing ? 'mesh' : 'gold'}
                      disabled={actionId === item.id}
                      onClick={() => void toggleFollow(item.id, item.isFollowing)}
                    >
                      {item.isFollowing ? t('profile.unfollow') : t('profile.follow')}
                    </UserActionButton>
                  ) : null}
                </Stack>
              ))}
            </Stack>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
