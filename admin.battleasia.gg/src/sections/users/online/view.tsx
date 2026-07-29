import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import {
  Avatar,
  Button,
  Container,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { API_URL } from 'src/config-global';
import { FlagIcon } from 'src/components/flag-icon';

type OnlineUserRow = {
  id: string;
  userId?: string;
  username?: string;
  email?: string;
  role?: string;
  status?: boolean;
  avatar?: string;
  ip?: string;
  country?: string;
  useragent?: any;
  expiration: Date | null;
};

export default function UserOnlineView() {
  const settings = useSettingsContext();
  const { getOnlineUsersApi, logoutAllSessionsApi, logoutUserSessionsApi } = useApi();

  const [rows, setRows] = useState<OnlineUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchOnlineUsers = useCallback(async () => {
    setLoading(true);
    const response = await getOnlineUsersApi();

    if (response?.data?.status && response.data.data) {
      const { results } = response.data.data;
      setRows(
        results.map((session: any) => ({
          ...session,
          id: session._id || session.id,
          expiration: session.expiration ? new Date(session.expiration) : null,
        }))
      );
    }
    setLoading(false);
  }, [getOnlineUsersApi]);

  useEffect(() => {
    fetchOnlineUsers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchOnlineUsers]);

  const handleRefresh = useCallback(() => {
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  const handleLogoutAll = useCallback(async () => {
    setLogoutLoading(true);
    try {
      const response = await logoutAllSessionsApi();
      if (response?.data?.status) {
        toast.success(`All sessions logged out successfully (${response.data.data.deletedCount} sessions)`);
        setConfirmOpen(false);
        await fetchOnlineUsers();
      }
    } catch (error: any) {
      console.error('Failed to logout all sessions:', error);
      toast.error(error?.response?.data || 'Failed to logout all sessions');
    } finally {
      setLogoutLoading(false);
    }
  }, [logoutAllSessionsApi, fetchOnlineUsers]);

  const handleLogoutUser = useCallback(async (userId: string) => {
    if (!userId) return;
    const response = await logoutUserSessionsApi(userId);
    if (response?.data?.status) {
      toast.success(`User sessions logged out successfully (${response.data.data.deletedCount} sessions)`);
      await fetchOnlineUsers();
    }
  }, [logoutUserSessionsApi, fetchOnlineUsers]);

  const columns = useMemo<GridColDef<OnlineUserRow>[]>(
    () => [
      {
        field: 'actions',
        type: 'actions',
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem
            key="logout"
            icon={<Iconify icon="ic:round-logout" color="error.main" />}
            label="Logout"
            onClick={() => handleLogoutUser(params.row.userId || '')}
          />,
        ],
      },
      {
        field: 'user',
        headerName: 'User',
        flex: 1,
        minWidth: 220,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<OnlineUserRow>) => (
          <UserCell row={params.row} />
        ),
      },
      { field: 'ip', headerName: 'IP Address', width: 140 },
      {
        field: 'country',
        headerName: 'Country',
        width: 150,
        renderCell: (params: GridRenderCellParams<OnlineUserRow, string>) => {
          const countryCode = params.value;
          if (!countryCode) {
            return <Chip label="N/A" size="small" />;
          }
          return (
            <Stack direction="row" spacing={1} alignItems="center" height={1} >
              <FlagIcon code={countryCode} />
              <Typography variant="body2">{countryCode}</Typography>
            </Stack>
          );
        },
      },
      {
        field: 'useragent.browser',
        headerName: 'Browser',
        width: 120,
        valueGetter: (_value, row: OnlineUserRow) => row?.useragent?.browser ?? 'N/A',
      },
      {
        field: 'useragent.os',
        headerName: 'OS',
        width: 120,
        valueGetter: (_value, row: OnlineUserRow) => row?.useragent?.os ?? 'N/A',
      },
      {
        field: 'useragent.platform',
        headerName: 'Platform',
        width: 120,
        valueGetter: (_value, row: OnlineUserRow) => row?.useragent?.platform ?? 'N/A',
      },
      {
        field: 'expiration',
        headerName: 'Expires At',
        width: 180,
        type: 'dateTime',
      },
    ],
    [handleLogoutUser]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Online Users</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        View all currently online users with active sessions. 
      </Typography>

      <Card sx={{ mt: 4 }}>
        <Stack
          direction="row"
          gap={1}
          p={3}
          justifyContent="flex-end"
          flexWrap="wrap"
        >
          <LoadingButton
            variant="contained"
            color="info"
            loading={loading}
            onClick={handleRefresh}
            startIcon={<Iconify icon="flowbite:refresh-outline" />}
          >
            Refresh
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="error"
            loading={logoutLoading}
            startIcon={<Iconify icon="mdi:power" />}
            onClick={() => setConfirmOpen(true)}
          >
            Logout All
          </LoadingButton>
        </Stack>

        <Divider />

        <Stack p={3} pt={1.5}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 250 },
              },
            }}
          />
        </Stack>
      </Card>

      <Dialog open={confirmOpen} onClose={() => !logoutLoading && setConfirmOpen(false)}>
        <DialogTitle>Logout all sessions?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will log out all active sessions for all users. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={logoutLoading}>
            Cancel
          </Button>
          <LoadingButton
            color="error"
            variant="contained"
            onClick={handleLogoutAll}
            loading={logoutLoading}
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

type UserCellProps = {
  row: OnlineUserRow;
};

function UserCell({ row }: UserCellProps) {
  if (!row.username) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar />
        <Stack minWidth={0}>
          <Typography variant="subtitle2" noWrap>
            Unknown user
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            —
          </Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar src={row.avatar ? `${API_URL}${row.avatar}` : undefined} alt={row.username} />
      <Stack minWidth={0}>
        <Typography variant="subtitle2" noWrap>
          {row.username}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {row.email || '—'}
        </Typography>
      </Stack>
    </Stack>
  );
}

