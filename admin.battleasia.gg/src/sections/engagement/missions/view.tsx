import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fDateTime } from 'src/utils/format-time';
import { MissionDialog, IMissionRow } from './form';

export default function EngagementMissionsView() {
  const settings = useSettingsContext();
  const { getEngagementMissionsApi, deleteEngagementMissionApi } = useApi();

  const [rows, setRows] = useState<IMissionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    mission: IMissionRow | null;
  }>({ open: false, mode: 'create', mission: null });

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEngagementMissionsApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      if (response?.data?.status && response.data.data) {
        const { results, total } = response.data.data;
        setRows(
          results.map((mission: any) => ({
            ...mission,
            id: mission.id || mission._id,
            createdAt: mission.createdAt ? new Date(mission.createdAt) : new Date(),
            updatedAt: mission.updatedAt ? new Date(mission.updatedAt) : new Date(),
          }))
        );
        setTotalCount(total);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch missions');
    } finally {
      setLoading(false);
    }
  }, [getEngagementMissionsApi, paginationModel]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete.id) return;
    setDeletingId(confirmDelete.id);
    try {
      const response = await deleteEngagementMissionApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('Mission deleted');
        fetchMissions();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete mission');
    } finally {
      setDeletingId(null);
      setConfirmDelete({ open: false, id: null });
    }
  }, [confirmDelete.id, deleteEngagementMissionApi, fetchMissions]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'sortOrder', headerName: '#', width: 60 },
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 180 },
      { field: 'key', headerName: 'Key', width: 140 },
      { field: 'type', headerName: 'Type', width: 100 },
      {
        field: 'inDailyPool',
        headerName: 'Daily pool',
        width: 110,
        renderCell: (params: GridRenderCellParams<IMissionRow>) => (
          <Chip
            size="small"
            label={params.row.type === 'daily' && params.row.inDailyPool ? 'Pool' : '—'}
            color={params.row.type === 'daily' && params.row.inDailyPool ? 'warning' : 'default'}
          />
        ),
      },
      { field: 'action', headerName: 'Action', width: 130 },
      {
        field: 'reward',
        headerName: 'Reward',
        width: 100,
        renderCell: (params: GridRenderCellParams<IMissionRow>) => (
          <Typography variant="body2">{params.row.reward?.bacAmount ?? 0} BAC</Typography>
        ),
      },
      {
        field: 'active',
        headerName: 'Status',
        width: 100,
        renderCell: (params: GridRenderCellParams<IMissionRow>) => (
          <Chip
            size="small"
            label={params.row.active ? 'Active' : 'Off'}
            color={params.row.active ? 'success' : 'default'}
          />
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        width: 170,
        renderCell: (params: GridRenderCellParams<IMissionRow>) => (
          <Typography variant="body2">{fDateTime(params.value)}</Typography>
        ),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<Iconify icon="solar:pen-bold" />}
            label="Edit"
            onClick={() => setDialogState({ open: true, mode: 'edit', mission: params.row })}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            label="Delete"
            onClick={() => setConfirmDelete({ open: true, id: params.row.id })}
            showInMenu
          />,
        ],
      },
    ],
    []
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">Engagement Missions</Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage daily, weekly, and one-time BAC reward missions.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setDialogState({ open: true, mode: 'create', mission: null })}
          >
            New Mission
          </Button>
        </Stack>

        <Card>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={totalCount}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{ toolbar: GridToolbar }}
          />
        </Card>
      </Stack>

      <MissionDialog
        open={dialogState.open}
        mode={dialogState.mode}
        mission={dialogState.mission}
        onClose={() => setDialogState({ open: false, mode: 'create', mission: null })}
        onSuccess={fetchMissions}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Mission?"
        content="Users will no longer see this mission. Existing progress records remain in the database."
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            loading={deletingId === confirmDelete.id}
          >
            Delete
          </LoadingButton>
        }
      />
    </Container>
  );
}
