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
import { BadgeDialog, IBadgeRow } from './form';

const CRITERIA_LABELS: Record<string, string> = {
  total_kills: 'Total kills',
  total_wins: 'Total wins',
};

export default function EngagementBadgesView() {
  const settings = useSettingsContext();
  const { getEngagementBadgesApi, deleteEngagementBadgeApi } = useApi();

  const [rows, setRows] = useState<IBadgeRow[]>([]);
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
    badge: IBadgeRow | null;
  }>({ open: false, mode: 'create', badge: null });

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEngagementBadgesApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      if (response?.data?.status && response.data.data) {
        const { results, total } = response.data.data;
        setRows(
          results.map((badge: any) => ({
            ...badge,
            id: badge.id || badge._id,
            createdAt: badge.createdAt ? new Date(badge.createdAt) : new Date(),
            updatedAt: badge.updatedAt ? new Date(badge.updatedAt) : new Date(),
          }))
        );
        setTotalCount(total);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }, [getEngagementBadgesApi, paginationModel]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete.id) return;
    setDeletingId(confirmDelete.id);
    try {
      const response = await deleteEngagementBadgeApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('Badge deleted');
        fetchBadges();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete badge');
    } finally {
      setDeletingId(null);
      setConfirmDelete({ open: false, id: null });
    }
  }, [confirmDelete.id, deleteEngagementBadgeApi, fetchBadges]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'sortOrder', headerName: '#', width: 60 },
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 180 },
      { field: 'key', headerName: 'Key', width: 140 },
      {
        field: 'criteria',
        headerName: 'Criteria',
        width: 120,
        renderCell: (params: GridRenderCellParams<IBadgeRow>) => (
          <Typography variant="body2">{CRITERIA_LABELS[params.row.criteria] || params.row.criteria}</Typography>
        ),
      },
      { field: 'threshold', headerName: 'Threshold', width: 100 },
      { field: 'tier', headerName: 'Tier', width: 70 },
      {
        field: 'active',
        headerName: 'Status',
        width: 100,
        renderCell: (params: GridRenderCellParams<IBadgeRow>) => (
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
        renderCell: (params: GridRenderCellParams<IBadgeRow>) => (
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
            onClick={() => setDialogState({ open: true, mode: 'edit', badge: params.row })}
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
            <Typography variant="h4">Achievement Badges</Typography>
            <Typography variant="body2" color="text.secondary">
              Define kill and win milestones that unlock profile badges automatically.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setDialogState({ open: true, mode: 'create', badge: null })}
          >
            New Badge
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

      <BadgeDialog
        open={dialogState.open}
        mode={dialogState.mode}
        badge={dialogState.badge}
        onClose={() => setDialogState({ open: false, mode: 'create', badge: null })}
        onSuccess={fetchBadges}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Badge?"
        content="Users who already unlocked this badge will keep it. The definition will be removed from admin."
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
