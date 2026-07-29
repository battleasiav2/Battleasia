import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Card,
  Chip,
  Container,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fDateTime } from 'src/utils/format-time';
import useApi from 'src/hooks/use-api';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { IMatchRow, IMatchStatus } from 'src/types';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { MatchDialog } from './form';
import { MatchParticipantsDialog } from './participants-dialog';

// ----------------------------------------------------------------------

export default function MatchView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { getMatchesApi, deleteMatchApi, updateMatchApi } = useApi();
  const { hasPermission } = usePermissions();

  const [rows, setRows] = useState<IMatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    match: IMatchRow | null;
  }>({
    open: false,
    mode: 'create',
    match: null,
  });

  const [participantsDialogState, setParticipantsDialogState] = useState<{
    open: boolean;
    match: IMatchRow | null;
  }>({
    open: false,
    match: null,
  });

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMatchesApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
      });

      if (response?.data?.status && response.data.data) {
        const { results, count } = response.data.data;
        setRows(
          results.map((match: any) => ({
            ...match,
            id: match._id || match.id,
            matchSchedule: match.matchSchedule || '',
            createdAt: match.createdAt ? new Date(match.createdAt) : undefined,
            updatedAt: match.updatedAt ? new Date(match.updatedAt) : undefined,
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch matches:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [getMatchesApi, paginationModel, search]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const openCreateDialog = useCallback(() => {
    if (!hasPermission(PERMISSIONS.MATCHES.CREATE)) {
      toast.error('You do not have permission to create matches');
      return;
    }
    setDialogState({
      open: true,
      mode: 'create',
      match: null,
    });
  }, [hasPermission]);

  const handleEditRow = useCallback((row: IMatchRow) => {
    if (!hasPermission(PERMISSIONS.MATCHES.EDIT)) {
      toast.error('You do not have permission to edit matches');
      return;
    }
    setDialogState({
      open: true,
      mode: 'edit',
      match: row,
    });
  }, [hasPermission]);

  const handleViewResult = useCallback((row: IMatchRow) => {
    if (!hasPermission(PERMISSIONS.MATCHES.RESULT)) {
      toast.error('You do not have permission to manage match results');
      return;
    }
    router.push(paths.games.matchesResult(row.id));
  }, [router, hasPermission]);

  const handleViewParticipants = useCallback((row: IMatchRow) => {
    setParticipantsDialogState({
      open: true,
      match: row,
    });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false, match: null }));
  }, []);

  const handleDialogSuccess = useCallback(() => {
    handleCloseDialog();
    fetchMatches();
  }, [fetchMatches, handleCloseDialog]);


  const handleCloseParticipantsDialog = useCallback(() => {
    setParticipantsDialogState({ open: false, match: null });
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setConfirmDelete({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete.id) return;

    if (!hasPermission(PERMISSIONS.MATCHES.DELETE)) {
      toast.error('You do not have permission to delete matches');
      setConfirmDelete({ open: false, id: null });
      return;
    }

    try {
      setDeletingId(confirmDelete.id);
      const response = await deleteMatchApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('Match deleted successfully');
        setConfirmDelete({ open: false, id: null });
        fetchMatches();
      }
    } catch (error: any) {
      console.error('Failed to delete match:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to delete match');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete.id, deleteMatchApi, fetchMatches, hasPermission]);

  const handleRefresh = useCallback(() => {
    fetchMatches();
  }, [fetchMatches]);

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

  const handleStatusChange = useCallback(async (matchId: string, newStatus: IMatchStatus) => {
    if (!hasPermission(PERMISSIONS.MATCHES.EDIT)) {
      toast.error('You do not have permission to update match status');
      return;
    }
    try {
      const response = await updateMatchApi(matchId, {
        status: newStatus
      });

      if (response?.data?.status) {
        toast.success('Match status updated successfully');
        fetchMatches();
      }
    } catch (error: any) {
      console.error('Failed to update match status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update match status');
    }
  }, [updateMatchApi, fetchMatches, hasPermission]);

  const columns = useMemo<GridColDef<IMatchRow>[]>(
    () => [
      {
        field: 'actions',
        type: 'actions',
        width: 190,
        getActions: (params) => {
          const actions = [];
          
          if (hasPermission(PERMISSIONS.MATCHES.VIEW)) {
            actions.push(
              <GridActionsCellItem
                key="participants"
                icon={<Iconify icon="solar:users-group-rounded-bold" color="primary.main" />}
                label="View Participants"
                onClick={() => handleViewParticipants(params.row)}
              />
            );
          }
          
          if (hasPermission(PERMISSIONS.MATCHES.EDIT)) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<Iconify icon="solar:pen-2-bold" color="info.main" />}
                label="Edit"
                onClick={() => handleEditRow(params.row)}
              />
            );
          }
          
          if (hasPermission(PERMISSIONS.MATCHES.RESULT)) {
            actions.push(
              <GridActionsCellItem
                key="result"
                icon={<Iconify icon="solar:medal-ribbons-star-bold" color="success.main" />}
                label="Update Results"
                onClick={() => handleViewResult(params.row)}
              />
            );
          }
          
          if (hasPermission(PERMISSIONS.MATCHES.DELETE)) {
            actions.push(
              <GridActionsCellItem
                key="delete"
                showInMenu
                icon={<Iconify icon="solar:trash-bin-trash-bold" color="error.main" />}
                label="Delete"
                onClick={() => handleDeleteClick(params.row.id)}
              />
            );
          }
          
          return actions;
        },
      },
      { field: 'matchName', headerName: 'Match Name', flex: 1, minWidth: 220 },
      {
        field: 'gameName',
        headerName: 'Game',
        width: 180,
      },
      {
        field: 'matchSchedule',
        headerName: 'Schedule',
        width: 200,
        renderCell: (params) => fDateTime(params.row.matchSchedule),
      },
      {
        field: 'matchType',
        headerName: 'Type',
        width: 110,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value?.toUpperCase()}
            color={params.value === 'paid' ? 'warning' : 'success'}
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'killRateType',
        headerName: 'Kill Rate',
        width: 130,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value}
            color={params.value === 'manual' ? 'info' : 'default'}
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'teamType',
        headerName: 'Team',
        width: 110,
        renderCell: (params: any) => params.value?.toUpperCase(),
      },
      {
        field: 'entryFee',
        headerName: 'Entry Fee',
        width: 120,
        renderCell: (params: any) => (params.value ?? 0).toLocaleString(),
      },
      {
        field: 'perKill',
        headerName: 'Per Kill',
        width: 120,
        renderCell: (params: any) => (params.value ?? 0).toLocaleString(),
      },
      {
        field: 'platformFeePercent',
        headerName: 'Fee %',
        width: 80,
        renderCell: (params: any) => `${params.value ?? 5}%`,
      },
      {
        field: 'totalPlayer',
        headerName: 'Total Player',
        width: 140,
      },
      {
        field: 'premiumOnly',
        headerName: 'Premium',
        width: 100,
        renderCell: (params: any) => (
          params.row.premiumOnly ? (
            <Chip label="Premium" color="warning" size="small" />
          ) : (
            <Chip label="Free" variant="outlined" size="small" />
          )
        ),
      },
      {
        field: 'status',
        headerName: 'Match Status',
        width: 150,
        renderCell: (params) => (
          <FormControl size="small" sx={{ minWidth: 120, height: 1, justifyContent: 'center' }}>
            <Select
              value={params.value}
              onChange={(e) => handleStatusChange(params.row.id, e.target.value as IMatchStatus)}
              sx={{
                height: 32,
                fontSize: '0.75rem',
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 1,
                },
              }}
            >
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="deactive">Deactive</MenuItem>
              <MenuItem value="complete">Complete</MenuItem>
              <MenuItem value="cancel">Cancel</MenuItem>
            </Select>
          </FormControl>
        ),
      },
    ],
    [handleDeleteClick, handleEditRow, handleStatusChange, handleViewResult, handleViewParticipants, hasPermission]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <div>
            <Typography variant="h4">Matches</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage PUBG mobile matches
            </Typography>
          </div>
          <Stack direction="row" spacing={2}>
            <LoadingButton
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              loading={loading}
              onClick={handleRefresh}
            >
              Refresh
            </LoadingButton>
            {hasPermission(PERMISSIONS.MATCHES.CREATE) && (
              <Button variant="contained" startIcon={<Iconify icon="solar:add-square-bold" />} onClick={openCreateDialog}>
                New Match
              </Button>
            )}
          </Stack>
        </Stack>

        <Card>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            loading={loading}
            rowCount={totalCount}
            pageSizeOptions={[5, 10, 25, 50]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            onFilterModelChange={onFilterChange}
            getRowId={(row) => row.id}
          />
        </Card>
      </Container>

      <MatchDialog
        open={dialogState.open}
        mode={dialogState.mode}
        match={dialogState.match}
        onClose={handleCloseDialog}
        onSuccess={handleDialogSuccess}
      />

      <MatchParticipantsDialog
        open={participantsDialogState.open}
        match={participantsDialogState.match}
        onClose={handleCloseParticipantsDialog}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete match?"
        content="This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={!!deletingId}>
            Delete
          </Button>
        }
      />
    </>
  );
}


