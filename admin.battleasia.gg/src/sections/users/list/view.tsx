import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbarProps,
} from '@mui/x-data-grid';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import toast from 'react-hot-toast';
// components
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
// hooks
import useApi from 'src/hooks/use-api';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';

import { API_URL, GAME_SERVERS } from 'src/config-global';
import { IDateRangeValue, IUserRow } from 'src/types';
import { PlayerDialog } from './form';
import { BalanceDialog } from './balance-dialog';
import { UsersTableToolbar } from './users-table-toolbar';


export default function UserListView() {
  const settings = useSettingsContext();
  const { getUsersApi, updatePlayerStatusApi, deletePlayerApi, deleteAllPlayersApi } = useApi();
  const { copy } = useCopyToClipboard();
  const { hasPermission } = usePermissions();

  const [rows, setRows] = useState<IUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [dateRange, setDateRange] = useState<IDateRangeValue>([null, null]);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null; username?: string }>({
    open: false,
    id: null,
    username: undefined,
  });
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [playerDialogState, setPlayerDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    player: IUserRow | null;
  }>({
    open: false,
    mode: 'create',
    player: null,
  });
  const [balanceDialogState, setBalanceDialogState] = useState<{
    open: boolean;
    player: IUserRow | null;
  }>({
    open: false,
    player: null,
  });

  const serverLabelMap = useMemo(
    () =>
      GAME_SERVERS.reduce<Record<string, string>>((acc, server) => {
        acc[server.value] = server.label;
        return acc;
      }, {}),
    []
  );

  const formatCountryCode = useCallback((code?: string | null) => {
    if (!code) {
      return '-';
    }
    const cleanCode = code.startsWith('+') ? code : `+${code}`;
    return cleanCode.replace(/\+\+/, '+');
  }, []);

  const formatMobileNumber = useCallback(
    (code?: string | null, mobile?: string | null) => {
      const formattedCode = formatCountryCode(code);
      if (formattedCode === '-') {
        return mobile ?? '-';
      }
      if (!mobile) {
        return formattedCode;
      }
      return `${formattedCode} ${mobile}`;
    },
    [formatCountryCode]
  );

  const getGameServerLabel = useCallback(
    (value?: string | null) => {
      if (!value) {
        return 'N/A';
      }
      return serverLabelMap[value] ?? value;
    },
    [serverLabelMap]
  );

  const balanceFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      }),
    []
  );

  const formatBalanceValue = useCallback(
    (value?: number | null) => balanceFormatter.format(value ?? 0),
    [balanceFormatter]
  );

  const handleCopyId = useCallback(
    async (value?: string | null) => {
      if (!value) {
        return;
      }
      const success = await copy(value);
      if (success) {
        toast.success('User ID copied to clipboard');
      } else {
        toast.error('Failed to copy User ID');
      }
    },
    [copy]
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const response = await getUsersApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });

      if (response?.data?.status && response.data.data) {
        const { results, count } = response.data.data;
        setRows(
          results.map((user: any) => ({
            ...user,
            id: user._id || user.id,
            balance: Number(user.balance ?? 0),
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getUsersApi, paginationModel, search]);

  const openCreateDialog = useCallback(() => {
    if (!hasPermission(PERMISSIONS.USERS.CREATE)) {
      toast.error('You do not have permission to create users');
      return;
    }
    setPlayerDialogState({
      open: true,
      mode: 'create',
      player: null,
    });
  }, [hasPermission]);

  const handleEditRow = useCallback((row: IUserRow) => {
    if (!hasPermission(PERMISSIONS.USERS.EDIT)) {
      toast.error('You do not have permission to edit users');
      return;
    }
    setPlayerDialogState({
      open: true,
      mode: 'edit',
      player: row,
    });
  }, [hasPermission]);

  const handleClosePlayerDialog = useCallback(() => {
    setPlayerDialogState((prev) => ({ ...prev, open: false, player: null }));
  }, []);

  const handleDialogSuccess = useCallback(() => {
    handleClosePlayerDialog();
    fetchUsers();
  }, [fetchUsers, handleClosePlayerDialog]);

  const handleOpenBalanceDialog = useCallback((row: IUserRow) => {
    if (!hasPermission(PERMISSIONS.PAYMENTS.MANAGE)) {
      toast.error('You do not have permission to manage payments');
      return;
    }
    setBalanceDialogState({
      open: true,
      player: row,
    });
  }, [hasPermission]);

  const handleCloseBalanceDialog = useCallback(() => {
    setBalanceDialogState({
      open: false,
      player: null,
    });
  }, []);

  const handleBalanceDialogSuccess = useCallback(() => {
    handleCloseBalanceDialog();
    fetchUsers();
  }, [fetchUsers, handleCloseBalanceDialog]);

  const handleToggleStatus = useCallback(
    async (row: IUserRow) => {
      if (!hasPermission(PERMISSIONS.USERS.EDIT)) {
        toast.error('You do not have permission to update user status');
        return;
      }
      try {
        setStatusUpdatingId(row.id);
        const newStatus = !row.status;
        const response = await updatePlayerStatusApi(row.id, newStatus);
        if (response?.data?.status) {
          toast.success(newStatus ? 'Player activated' : 'Player suspended');
          fetchUsers();
        }
      } catch (error: any) {
        console.error('Failed to update status:', error);
        toast.error(error?.response?.data?.message || 'Failed to update player status');
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [fetchUsers, updatePlayerStatusApi, hasPermission]
  );

  const handleDeleteClick = useCallback((row: IUserRow) => {
    setConfirmDelete({
      open: true,
      id: row.id,
      username: row.username,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete.id) return;

    if (!hasPermission(PERMISSIONS.USERS.DELETE)) {
      toast.error('You do not have permission to delete users');
      setConfirmDelete({ open: false, id: null, username: undefined });
      return;
    }

    try {
      setDeletingId(confirmDelete.id);
      const response = await deletePlayerApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('User deleted successfully');
        setConfirmDelete({ open: false, id: null, username: undefined });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete.id, deletePlayerApi, fetchUsers, hasPermission]);

  const handleDeleteAllClick = useCallback(() => {
    if (!hasPermission(PERMISSIONS.USERS.DELETE)) {
      toast.error('You do not have permission to delete users');
      return;
    }
    setConfirmDeleteAll(true);
  }, [hasPermission]);

  const handleDeleteAllConfirm = useCallback(async () => {
    if (!hasPermission(PERMISSIONS.USERS.DELETE)) {
      toast.error('You do not have permission to delete users');
      setConfirmDeleteAll(false);
      return;
    }

    try {
      setDeletingAll(true);
      const response = await deleteAllPlayersApi();
      if (response?.data?.status) {
        const deleted = response?.data?.data?.deleted ?? 0;
        toast.success(response?.data?.message || `${deleted} user(s) deleted successfully`);
        setConfirmDeleteAll(false);
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Failed to delete all users:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to delete all users');
    } finally {
      setDeletingAll(false);
    }
  }, [deleteAllPlayersApi, fetchUsers, hasPermission]);

  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDateRangeChange = useCallback((newValue: IDateRangeValue) => {
    setDateRange(newValue);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const onFilterChange = useCallback((filterModel: GridFilterModel) => {
    let value = filterModel.quickFilterValues ? filterModel.quickFilterValues[0] : '';
    if (!value) {
      setSearch(value);
      return;
    }
    // eslint-disable-next-line no-useless-escape
    value = value.replace(/[\]\[{}()\\]+/g, '');
    setSearch(value);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getStatusColor = useCallback(
    (status: boolean): 'success' | 'default' => (status ? 'success' : 'default'),
    []
  );

  const columns = useMemo<GridColDef<IUserRow>[]>(
    () => [
      {
        field: 'actions',
        type: 'actions',
        width: 80,
        getActions: (params) => {
          const actions = [];
          
          if (hasPermission(PERMISSIONS.USERS.EDIT)) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<Iconify icon="mdi:pencil" color="info.main" />}
                label="Edit"
                onClick={() => handleEditRow(params.row)}
              />
            );
          }
          
          if (hasPermission(PERMISSIONS.PAYMENTS.MANAGE)) {
            actions.push(
              <GridActionsCellItem
                key="balance"
                showInMenu
                icon={<Iconify icon="mdi:cash-plus" color="warning.main" />}
                label="Adjust Balance"
                onClick={() => handleOpenBalanceDialog(params.row)}
              />
            );
          }
          
          if (hasPermission(PERMISSIONS.USERS.EDIT)) {
            actions.push(
              <GridActionsCellItem
                key="toggle"
                showInMenu
                icon={<Iconify icon="mdi:account-cancel" color="error.main" />}
                label={params.row.status ? 'Suspend' : 'Activate'}
                disabled={statusUpdatingId === params.row.id}
                onClick={() => handleToggleStatus(params.row)}
              />
            );
          }

          if (hasPermission(PERMISSIONS.USERS.DELETE)) {
            actions.push(
              <GridActionsCellItem
                key="delete"
                showInMenu
                icon={<Iconify icon="solar:trash-bin-trash-bold" color="error.main" />}
                label="Delete"
                disabled={deletingId === params.row.id}
                onClick={() => handleDeleteClick(params.row)}
              />
            );
          }
          
          return actions;
        },
      },
      {
        field: '_id',
        headerName: 'User ID',
        width: 160,
        renderCell: (params) => (
          <Button
            variant="text" size="small" color="info"
            onClick={() => handleCopyId(String(params.value))}
          >
            {params.value.toString().slice(0, 12)}...
          </Button>
        ),
      },
      {
        field: 'username',
        headerName: 'User',
        minWidth: 220,
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<IUserRow>) => (
          <UserCell user={params.row} />
        ),
      },
      { field: 'email', headerName: 'Email', minWidth: 220 },
      { field: 'roleName', headerName: 'Role', width: 150 },
      {
        field: 'balance',
        headerName: 'Balance',
        width: 140,
        renderCell: (params: GridRenderCellParams<IUserRow, number>) => formatBalanceValue(params.value ?? 0),
      },
      {
        field: 'pubgId',
        headerName: 'PUBG ID',
        width: 150,
      },
      {
        field: 'countryCode',
        headerName: 'Country Code',
        width: 130,
        renderCell: (params: any) => formatCountryCode(params.value as string | undefined),
      },
      {
        field: 'mobileNo',
        headerName: 'Mobile',
        width: 180,
        renderCell: (params: any) =>
          formatMobileNumber(params.row?.countryCode, params.row?.mobileNo),
      },
      {
        field: 'gameServer',
        headerName: 'Game Server',
        width: 160,
        renderCell: (params: any) => getGameServerLabel(params.value as string | undefined),
      },
      { field: 'referralCode', headerName: 'Referral Code', width: 140 },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<IUserRow, boolean>) => (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            color={getStatusColor(params.value ?? false)}
            variant="soft"
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 180,
        type: 'dateTime',
      },
    ],
    [
      formatCountryCode,
      formatMobileNumber,
      getGameServerLabel,
      handleCopyId,
      handleEditRow,
      handleOpenBalanceDialog,
      handleToggleStatus,
      handleDeleteClick,
      getStatusColor,
      statusUpdatingId,
      deletingId,
      formatBalanceValue,
      hasPermission,
    ]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Users</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        Manage users, view details, and monitor account status. Search and filter to find specific users.
      </Typography>

      <Card sx={{ mt: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          p={3}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexWrap="wrap"
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Registered Date
              </Typography>
              <DateRangePicker
                value={dateRange}
                onChange={(newValue) => handleDateRangeChange(newValue as IDateRangeValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>
          </LocalizationProvider>

          <Stack direction="row" gap={1}>
            {hasPermission(PERMISSIONS.USERS.CREATE) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="ic:round-add" />}
                onClick={openCreateDialog}
              >
                Create Player
              </Button>
            )}
            <LoadingButton
              loading={loading}
              variant="contained"
              color="info"
              onClick={handleRefresh}
            >
              <Iconify icon="flowbite:refresh-outline" />
            </LoadingButton>
          </Stack>
        </Stack>

        <Divider />

        <Stack p={3} pt={1.5}>
          <DataGrid
            autoHeight
            rows={rows}
            rowCount={totalCount}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={onFilterChange}
            filterMode="server"
            paginationMode="server"
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              toolbar: (props: GridToolbarProps) => (
                <UsersTableToolbar
                  {...props}
                  canDeleteAll={hasPermission(PERMISSIONS.USERS.DELETE)}
                  onDeleteAllClick={handleDeleteAllClick}
                />
              ),
            }}
          />
        </Stack>
      </Card>

      <PlayerDialog
        key={
          playerDialogState.mode === 'edit'
            ? `edit-${playerDialogState.player?.id ?? 'unknown'}`
            : 'create'
        }
        open={playerDialogState.open}
        mode={playerDialogState.mode}
        player={playerDialogState.player ?? undefined}
        onClose={handleClosePlayerDialog}
        onSuccess={handleDialogSuccess}
      />
      <BalanceDialog
        open={balanceDialogState.open}
        user={balanceDialogState.player ?? undefined}
        onClose={handleCloseBalanceDialog}
        onSuccess={handleBalanceDialogSuccess}
      />

      <ConfirmDialog
        open={confirmDeleteAll}
        onClose={() => setConfirmDeleteAll(false)}
        title="Delete all users?"
        content="This will permanently delete all users except admin accounts and your own account. This action cannot be undone."
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDeleteAllConfirm}
            loading={deletingAll}
          >
            Delete all
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, username: undefined })}
        title="Delete user?"
        content={
          confirmDelete.username
            ? `Are you sure you want to permanently delete "${confirmDelete.username}"? This action cannot be undone.`
            : 'This action cannot be undone.'
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={!!deletingId}
          >
            Delete
          </Button>
        }
      />
    </Container>
  );
}

type UserCellProps = {
  user: IUserRow;
};

function UserCell({ user }: UserCellProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: 1 }}>
      <Avatar src={`${API_URL}${user.avatar}`} alt={user.username} />
      <Stack minWidth={0}>
        <Typography variant="subtitle2" noWrap>
          {user.username}
        </Typography>
        {/* <Typography variant="caption" color="text.secondary" noWrap>
          {user.countryCode || 'N/A'}
        </Typography> */}
      </Stack>
    </Stack>
  );
}

