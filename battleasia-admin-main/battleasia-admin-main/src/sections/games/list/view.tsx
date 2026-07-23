import { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
// hooks
import useApi from 'src/hooks/use-api';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { API_URL } from 'src/config-global';
import { GameDialog, IGameRow } from './form';

// ----------------------------------------------------------------------

export default function GameListView() {
  const settings = useSettingsContext();
  const { getGamesApi, deleteGameApi } = useApi();

  const [rows, setRows] = useState<IGameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [gameDialogState, setGameDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    game: IGameRow | null;
  }>({
    open: false,
    mode: 'create',
    game: null,
  });

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getGamesApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
      });

      if (response?.data?.status && response.data.data) {
        const { results, count } = response.data.data;
        setRows(
          results.map((game: any) => ({
            ...game,
            id: game._id || game.id,
            createdAt: game.createdAt ? new Date(game.createdAt) : new Date(),
            updatedAt: game.updatedAt ? new Date(game.updatedAt) : new Date(),
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch games:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, [getGamesApi, paginationModel, search]);

  const openCreateDialog = useCallback(() => {
    setGameDialogState({
      open: true,
      mode: 'create',
      game: null,
    });
  }, []);

  const handleEditRow = useCallback((row: IGameRow) => {
    setGameDialogState({
      open: true,
      mode: 'edit',
      game: row,
    });
  }, []);

  const handleCloseGameDialog = useCallback(() => {
    setGameDialogState((prev) => ({ ...prev, open: false, game: null }));
  }, []);

  const handleDialogSuccess = useCallback(() => {
    handleCloseGameDialog();
    fetchGames();
  }, [fetchGames, handleCloseGameDialog]);

  const handleDeleteClick = useCallback((id: string) => {
    setConfirmDelete({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      setDeletingId(confirmDelete.id);
      const response = await deleteGameApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('Game deleted successfully');
        setConfirmDelete({ open: false, id: null });
        fetchGames();
      }
    } catch (error: any) {
      console.error('Failed to delete game:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to delete game');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete.id, deleteGameApi, fetchGames]);

  const handleRefresh = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

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
    fetchGames();
  }, [fetchGames]);

  const columns = useMemo<GridColDef<IGameRow>[]>(
    () => [
      {
        field: 'actions',
        type: 'actions',
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<Iconify icon="solar:pen-2-bold" color="info.main" />}
            label="Edit"
            onClick={() => handleEditRow(params.row)}
          />,
          <GridActionsCellItem
            key="delete"
            showInMenu
            icon={<Iconify icon="solar:trash-bin-trash-bold" color="error.main" />}
            label="Delete"
            onClick={() => handleDeleteClick(params.row.id)}
            disabled
          />,
        ],
      },
      { field: 'name', headerName: 'Game Name', flex: 1, minWidth: 200 },
      { field: 'packageName', headerName: 'Package Name', width: 200 },
      {
        field: 'image',
        headerName: 'Image',
        width: 120,
        renderCell: (params: GridRenderCellParams<IGameRow, string>) => {
          if (!params.value) {
            return <Typography variant="body2">-</Typography>;
          }
          const imageUrl = params.value.startsWith('http') ? params.value : `${API_URL}${params.value}`;
          console.log("~ GameListView ~ imageUrl:", imageUrl)
          return (
            <Box
              component="img"
              src={imageUrl}
              alt={params.row.name}
              sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover' }}
            />
          );
        },
      },
      {
        field: 'idPrefix',
        headerName: 'ID Prefix',
        width: 120,
      },
      {
        field: 'canCreateChallenge',
        headerName: 'Can Create Challenge',
        width: 180,
        renderCell: (params: GridRenderCellParams<IGameRow, boolean>) => (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            size="small"
            color={params.value ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<IGameRow, 'active' | 'inactive'>) => (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            color={params.value ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'comingSoon',
        headerName: 'Coming Soon',
        width: 130,
        renderCell: (params: GridRenderCellParams<IGameRow, boolean>) => (
          <Chip
            label={params.value ? 'Yes' : 'No'}
            size="small"
            color={params.value ? 'warning' : 'default'}
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
    [handleEditRow, handleDeleteClick]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Games</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        Manage games, view details, and monitor game status. Search and filter to find specific games.
      </Typography>

      <Card sx={{ mt: 4 }}>
        <Stack
          gap={2}
          p={3}
          direction="row"
          justifyContent="flex-end"
          flexWrap="wrap"
        >
          <Button
            variant="contained"
            disabled
            color="primary"
            startIcon={<Iconify icon="ic:round-add" />}
            onClick={openCreateDialog}
          >
            Add Game
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            color="info"
            onClick={handleRefresh}
          >
            <Iconify icon="flowbite:refresh-outline" />
          </LoadingButton>
        </Stack>

        <Divider />

        <Stack p={3} pt={1.5}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            rowCount={totalCount}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onFilterModelChange={onFilterChange}
            filterMode="server"
            pageSizeOptions={[5, 10, 25]}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 250 },
              },
            }}
            disableRowSelectionOnClick
          />
        </Stack>
      </Card>

      <GameDialog
        open={gameDialogState.open}
        onClose={handleCloseGameDialog}
        mode={gameDialogState.mode}
        game={gameDialogState.game}
        onSuccess={handleDialogSuccess}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Game"
        content="Are you sure you want to delete this game? This action cannot be undone."
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
