import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography
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
import { fShortenNumber } from 'src/utils/format-number';
import { FeedDialog } from './form';
import { IFeedRow } from './types';

export default function FeedListView() {
  const settings = useSettingsContext();
  const { getFeedsApi, deleteFeedApi } = useApi();

  const [rows, setRows] = useState<IFeedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [feedDialogState, setFeedDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    feed: IFeedRow | null;
  }>({
    open: false,
    mode: 'create',
    feed: null,
  });

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFeedsApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      if (response?.data?.status && response.data.data) {
        const { results, total } = response.data.data;
        setRows(
          results.map((feed: any) => {
            let createdAtDate = new Date();
            if (feed.createdAt) {
              createdAtDate = new Date(feed.createdAt);
            } else if (feed._createdAt) {
              createdAtDate = new Date(feed._createdAt);
            }
            return {
              ...feed,
              id: feed.id || feed._id || feed._id,
              createdAt: createdAtDate,
              updatedAt: feed.updatedAt ? new Date(feed.updatedAt) : new Date(),
            };
          })
        );
        setTotalCount(total);
      }
    } catch (error: any) {
      console.error('Failed to fetch feeds:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  }, [getFeedsApi, paginationModel]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const openCreateDialog = useCallback(() => {
    setFeedDialogState({
      open: true,
      mode: 'create',
      feed: null,
    });
  }, []);

  const handleEditRow = useCallback((row: IFeedRow) => {
    setFeedDialogState({
      open: true,
      mode: 'edit',
      feed: row,
    });
  }, []);

  const handleDeleteRow = useCallback((id: string) => {
    setConfirmDelete({ open: true, id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete.id) return;

    setDeletingId(confirmDelete.id);
    try {
      const response = await deleteFeedApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('Feed deleted successfully');
        fetchFeeds();
      }
    } catch (error: any) {
      console.error('Failed to delete feed:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete feed');
    } finally {
      setDeletingId(null);
      setConfirmDelete({ open: false, id: null });
    }
  }, [confirmDelete.id, deleteFeedApi, fetchFeeds]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => (
          <Chip
            label={params.value}
            color={params.value === 'published' ? 'info' : 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'premiumOnly',
        headerName: 'Premium',
        width: 100,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => (
          params.row.premiumOnly ? (
            <Chip label="Premium" color="warning" size="small" />
          ) : (
            <Chip label="Free" variant="outlined" size="small" />
          )
        ),
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 150,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => (
          params.row.category?.name || 'N/A'
        ),
      },
      {
        field: 'author',
        headerName: 'Author',
        width: 150,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => (params.row.author?.name || 'Unknown'),
      },
      {
        field: 'totalViews',
        headerName: 'Views',
        width: 100,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => fShortenNumber(params.value || 0),
      },
      {
        field: 'totalShares',
        headerName: 'Shares',
        width: 100,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => fShortenNumber(params.value || 0),
      },
      {
        field: 'totalComments',
        headerName: 'Comments',
        width: 100,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => fShortenNumber(params.value || 0),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 180,
        renderCell: (params: GridRenderCellParams<IFeedRow>) => fDateTime(params.value),
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
            onClick={() => handleEditRow(params.row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            label="Delete"
            onClick={() => handleDeleteRow(params.row.id)}
            showInMenu
          />,
        ],
      },
    ],
    [handleEditRow, handleDeleteRow]
  );


  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Feed Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreateDialog}
          >
            New Feed
          </Button>
        </Stack>

        <Card>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={totalCount}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{
              toolbar: () => (
                <GridToolbar
                  showQuickFilter
                  quickFilterProps={{ placeholder: 'Search...' }}
                />
              ),
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
          />
        </Card>
      </Stack>

      <FeedDialog
        open={feedDialogState.open}
        mode={feedDialogState.mode}
        feed={feedDialogState.feed}
        onClose={() => setFeedDialogState({ open: false, mode: 'create', feed: null })}
        onSuccess={fetchFeeds}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Feed?"
        content="This action cannot be undone. The feed will be permanently deleted."
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

