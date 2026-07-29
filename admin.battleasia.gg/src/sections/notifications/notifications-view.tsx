import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import useApi from 'src/hooks/use-api';
import { fDateTime } from 'src/utils/format-time';
import TextMaxLine from 'src/components/text-max-line';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { RootState } from 'src/store';

type NotificationFormState = {
  title: string;
  message: string;
  category: string;
  type: string;
  premiumOnly: boolean;
  target: 'all' | 'selected';
  userIds: string[];
};

type NotificationListItem = {
  id: string;
  subject?: string;
  title: string;
  category: string;
  type: string;
  premiumOnly?: boolean;
  target: 'all' | 'selected';
  recipients: string[];
  createdAt?: string;
};

const defaultFormState: NotificationFormState = {
  title: '',
  message: '',
  category: 'General',
  type: 'general',
  premiumOnly: false,
  target: 'all',
  userIds: [],
};

export function NotificationsManagementView() {
  const { getUsersApi, getAdminNotificationsApi, createNotificationAdminApi } = useApi();
  const { hasPermission } = usePermissions();
  const { user } = useSelector((state: RootState) => state.auth);
  const [formState, setFormState] = useState<NotificationFormState>(defaultFormState);
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ label: string; value: string }[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await getAdminNotificationsApi({ limit: 100 });
      const items = response?.data?.data?.results || [];
      const formatted = items.map(
        (item: any): NotificationListItem => ({
          id: item?.id,
          subject: item?.subject,
          title: item?.title,
          category: item?.category || 'General',
          type: item?.type || 'general',
          premiumOnly: item?.premiumOnly || false,
          target: item?.target || 'all',
          recipients: item?.recipients || [],
          createdAt: item?.createdAt,
        })
      );
      setNotifications(formatted);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notifications');
    } finally {
      setLoadingList(false);
    }
  }, [getAdminNotificationsApi]);

  const loadUsers = useCallback(async () => {
    setFetchingUsers(true);
    try {
      const response = await getUsersApi({ page: 1, limit: 500 });
      const results = response?.data?.data?.results || [];
      const options = results.map((u: any) => ({
        label: u?.username || u?.email,
        value: u?.id || u?._id,
      }));
      setUserOptions(options);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    } finally {
      setFetchingUsers(false);
    }
  }, [getUsersApi]);

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, [loadNotifications, loadUsers]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTargetChange = useCallback(
    (target: 'all' | 'selected') => {
      setFormState((prev) => ({
        ...prev,
        target,
        userIds: target === 'all' ? [] : prev.userIds,
      }));
      if (target === 'all') {
        setSelectedUsers([]);
      }
    },
    []
  );

  const handleRecipientsChange = useCallback((_event: any, values: { label: string; value: string }[]) => {
    setSelectedUsers(values);
    setFormState((prev) => ({ ...prev, userIds: values.map((option) => option.value) }));
  }, []);

  const handleSendNotification = useCallback(async () => {
    if (!hasPermission(PERMISSIONS.NOTIFICATIONS.SEND)) {
      toast.error('You do not have permission to send notifications');
      return;
    }
    
    if (!formState.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formState.message.trim()) {
      toast.error('Message is required');
      return;
    }
    if (formState.target === 'selected' && formState.userIds.length === 0) {
      toast.error('Select at least one player');
      return;
    }

    const payload = {
      title: formState.title.trim(),
      message: formState.message.replace(/\n/g, '<br />'),
      category: formState.category.trim() || 'General',
      type: formState.type.trim() || 'general',
      avatarUrl: user?.avatar || '',
      premiumOnly: formState.premiumOnly,
      target: formState.target,
      userIds: formState.target === 'selected' ? formState.userIds : [],
    };

    try {
      setSending(true);
      await createNotificationAdminApi(payload);
      toast.success('Notification sent');
      setFormState(defaultFormState);
      setSelectedUsers([]);
      loadNotifications();
    } catch (error) {
      console.error(error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  }, [createNotificationAdminApi, formState, loadNotifications, hasPermission, user?.avatar]);

  const targetSummary = useMemo(() => {
    if (formState.target === 'all') {
      return 'All registered players will receive this notification.';
    }
    if (!formState.userIds.length) {
      return 'Select one or more players.';
    }
    return `${formState.userIds.length} player(s) selected.`;
  }, [formState.target, formState.userIds.length]);

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Card>
        <CardHeader title="Send Notification" subheader="Notify players instantly" />
        <CardContent>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formState.category}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Type"
                  name="type"
                  value={formState.type}
                  onChange={handleInputChange}
                  helperText="Used to display icon on players side (e.g., order, chat, mail)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formState.premiumOnly}
                      onChange={(e) => setFormState((prev) => ({ ...prev, premiumOnly: e.target.checked }))}
                    />
                  }
                  label="Premium Only"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
                  Only premium members will receive this notification
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={formState.message}
                  onChange={handleInputChange}
                  multiline
                  minRows={4}
                  helperText="Supports basic HTML or line breaks."
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2">Audience</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(['all', 'selected'] as const).map((option) => (
                  <Chip
                    key={option}
                    label={option === 'all' ? 'All players' : 'Selected players'}
                    color={formState.target === option ? 'primary' : 'default'}
                    onClick={() => handleTargetChange(option)}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {targetSummary}
              </Typography>
              <Autocomplete
                multiple
                options={userOptions}
                loading={fetchingUsers}
                value={selectedUsers}
                onChange={handleRecipientsChange}
                disabled={formState.target === 'all'}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Players"
                    placeholder="Search player"
                    helperText="Search and pick players to receive this notification"
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={loadNotifications} disabled={loadingList}>
                Refresh Notifications
              </Button>
              <LoadingButton 
                variant="contained" 
                onClick={handleSendNotification} 
                loading={sending}
                disabled={!hasPermission(PERMISSIONS.NOTIFICATIONS.SEND)}
              >
                Send Notification
              </LoadingButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Notification History" subheader="Recent notifications sent to players" />
        <CardContent>
          {loadingList ? (
            <Typography variant="body2" color="text.secondary">
              Loading notifications...
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell align="right">Recipients</TableCell>
                    <TableCell>Sent At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No notifications yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell sx={{ maxWidth: 260 }}>
                          <TextMaxLine variant="subtitle2" noWrap line={1} >
                            {notification.subject || 'Untitled'}
                          </TextMaxLine>
                          <TextMaxLine variant="caption" color="text.secondary" noWrap line={1}>
                            {notification.title?.replace(/<[^>]+>/g, '')}
                          </TextMaxLine>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={notification.category} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={notification.type} />
                        </TableCell>
                        <TableCell>
                          {notification.premiumOnly ? (
                            <Chip size="small" color="warning" label="Premium" />
                          ) : (
                            <Chip size="small" variant="outlined" label="Free" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={notification.target === 'all' ? 'primary' : 'default'}
                            label={notification.target === 'all' ? 'All players' : 'Selected'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {notification.target === 'all' ? '—' : notification.recipients?.length || 0}
                        </TableCell>
                        <TableCell>{notification.createdAt ? fDateTime(notification.createdAt) : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}


