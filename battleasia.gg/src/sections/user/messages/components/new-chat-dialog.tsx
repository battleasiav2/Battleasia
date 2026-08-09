import { useState, useCallback } from 'react';

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

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { getImageUrl } from 'src/utils/get-image-url';
import { USER_COLORS, userFieldSx, userPolishedDialogPaperSx, userPolishedDialogRailSx, userPolishedDialogTitleSx, userPolishedDialogEyebrowSx, userPolishedDialogHeadingSx, userPolishedDialogContentSx, userPolishedDialogCloseButtonSx } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type SearchUser = {
  id: string;
  username: string;
  avatar: string;
};

type NewChatDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
};

export function NewChatDialog({ open, onClose, onSelectUser }: NewChatDialogProps) {
  const { t } = useTranslate();
  const { globalSearchApi } = useApi();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await globalSearchApi(q);
      if (response?.data?.status && response.data.data?.users) {
        setResults(response.data.data.users);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [globalSearchApi, query]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: userPolishedDialogPaperSx }}>
      <Box sx={userPolishedDialogRailSx} />
      <DialogTitle sx={userPolishedDialogTitleSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={userPolishedDialogEyebrowSx}>Messages</Typography>
          <Typography sx={userPolishedDialogHeadingSx}>{t('messages.newChat')}</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={userPolishedDialogCloseButtonSx}>
          <Iconify icon="eva:close-fill" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={userPolishedDialogContentSx}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder={t('messages.searchPlayers')}
            sx={userFieldSx}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => void handleSearch()} disabled={searching} sx={{ color: USER_COLORS.gold }}>
                  {searching ? <CircularProgress size={18} sx={{ color: USER_COLORS.gold }} /> : <Iconify icon="eva:search-fill" />}
                </IconButton>
              ),
            }}
          />

          <Stack spacing={0.75}>
            {results.map((user) => (
              <Stack
                key={user.id}
                direction="row"
                spacing={1.25}
                alignItems="center"
                onClick={() => {
                  onSelectUser(user.id);
                  handleClose();
                }}
                sx={{
                  p: 1.25,
                  cursor: 'pointer',
                  border: `1px solid ${alpha('#ffffff', 0.08)}`,
                  bgcolor: alpha('#000000', 0.25),
                  '&:hover': { borderColor: alpha(USER_COLORS.gold, 0.3), bgcolor: alpha(USER_COLORS.gold, 0.06) },
                }}
              >
                <Avatar src={getImageUrl(user.avatar)} alt={user.username} sx={{ width: 40, height: 40 }} />
                <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary }}>{user.username}</Typography>
              </Stack>
            ))}

            {!searching && query.trim().length >= 2 && results.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: USER_COLORS.textMuted, textAlign: 'center', py: 2 }}>
                {t('messages.noUsersFound')}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
