import { useCallback, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import toast from 'react-hot-toast';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { dispatch, useSelector, RootState } from 'src/store';
import { userAction } from 'src/store/reducers/auth';
import useApi from 'src/hooks/use-api';

// ----------------------------------------------------------------------

export default function ProfileView() {
  const settings = useSettingsContext();
  const { user } = useSelector((state: RootState) => state.auth);
  const { updateProfileApi } = useApi();

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle avatar file selection
  const handleAvatarSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);
      setAvatarBase64(base64);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  }, []);

  // Handle avatar remove
  const handleAvatarRemove = useCallback(() => {
    setAvatarPreview('');
    setAvatarBase64('');
  }, []);

  // Save avatar
  const handleSaveAvatar = useCallback(async () => {
    if (avatarBase64 === null) {
      toast.error('No changes to save');
      return;
    }

    setAvatarLoading(true);
    try {
      const response = await updateProfileApi({ avatar: avatarBase64 });
      if (response?.data?.status) {
        dispatch(userAction(response.data.user));
        toast.success('Avatar updated successfully');
        setAvatarBase64(null); // Reset dirty state
      } else {
        toast.error(response?.data?.message || 'Failed to update avatar');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  }, [avatarBase64, updateProfileApi]);

  // Save password
  const handleSavePassword = useCallback(async () => {
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await updateProfileApi({
        currentPassword,
        newPassword,
      });
      if (response?.data?.status) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response?.data?.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, updateProfileApi]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Typography variant="h4">Profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Manage your account avatar and password
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 4 }}>
        {/* Avatar Card */}
        <Card sx={{ p: 4, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Avatar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a new avatar image. Maximum file size is 2MB.
          </Typography>

          <Stack alignItems="center" spacing={3}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview}
                alt={user?.username}
                sx={{
                  width: 144,
                  height: 144,
                  border: (theme) => `dashed 1px ${theme.palette.divider}`,
                  fontSize: 48,
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: 'background.paper',
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify icon="solar:camera-add-bold" width={20} />
              </IconButton>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarSelect}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              Allowed *.jpeg, *.jpg, *.png, *.gif
              <br />
              Max size 2MB
            </Typography>

            <Stack direction="row" spacing={1.5}>
              {avatarPreview && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleAvatarRemove}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                >
                  Remove
                </Button>
              )}

              <LoadingButton
                variant="contained"
                size="small"
                loading={avatarLoading}
                disabled={avatarBase64 === null}
                onClick={handleSaveAvatar}
                startIcon={<Iconify icon="ic:round-save" />}
              >
                Save Avatar
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>

        {/* Password Card */}
        <Card sx={{ p: 4, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update your account password. Minimum 6 characters.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                      <Iconify icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      <Iconify icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              error={!!confirmPassword && confirmPassword !== newPassword}
              helperText={
                confirmPassword && confirmPassword !== newPassword
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Divider />

            <LoadingButton
              variant="contained"
              loading={passwordLoading}
              onClick={handleSavePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              startIcon={<Iconify icon="solar:lock-password-bold" />}
              sx={{ alignSelf: 'flex-end' }}
            >
              Change Password
            </LoadingButton>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
