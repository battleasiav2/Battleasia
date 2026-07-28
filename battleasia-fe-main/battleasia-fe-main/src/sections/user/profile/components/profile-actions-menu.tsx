import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user';

import { SocialReportDialog } from '../../social/social-report-dialog';

// ----------------------------------------------------------------------

type ProfileActionsMenuProps = {
  userId: string;
  isBlocked?: boolean;
  onBlockChange?: () => void;
};

export function ProfileActionsMenu({ userId, isBlocked = false, onBlockChange }: ProfileActionsMenuProps) {
  const { t } = useTranslate();
  const { blockUserApi, unblockUserApi } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlockToggle = async () => {
    if (!userId || loading) return;
    try {
      setLoading(true);
      const response = isBlocked ? await unblockUserApi(userId) : await blockUserApi(userId);
      if (response?.data?.status) {
        toast.success(isBlocked ? t('profile.unblocked') : t('profile.blocked'));
        onBlockChange?.();
      }
    } catch (error) {
      console.error('Failed to toggle block:', error);
      toast.error(t('profile.blockFailed'));
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          color: USER_COLORS.textMuted,
          border: `1px solid ${alpha('#ffffff', 0.12)}`,
          bgcolor: alpha('#000000', 0.25),
        }}
      >
        <Iconify icon="eva:more-vertical-fill" width={20} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setReportOpen(true);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:flag-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary={t('report.title')} />
        </MenuItem>
        <MenuItem onClick={() => void handleBlockToggle()} disabled={loading}>
          <ListItemIcon>
            <Iconify icon={isBlocked ? 'solar:user-check-bold' : 'solar:user-block-bold'} width={18} />
          </ListItemIcon>
          <ListItemText primary={isBlocked ? t('profile.unblock') : t('profile.block')} />
        </MenuItem>
      </Menu>

      <SocialReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={userId} />
    </>
  );
}
