import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
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
import { CategoryDialog, ICategoryRow } from './form';

export default function CategoryListView() {
  const settings = useSettingsContext();
  const { getCategoriesApi, deleteCategoryApi } = useApi();

  const [rows, setRows] = useState<ICategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [categoryDialogState, setCategoryDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    category: ICategoryRow | null;
  }>({
    open: false,
    mode: 'create',
    category: null,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCategoriesApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      if (response?.data?.status && response.data.data) {
        const { results, total } = response.data.data;
        setRows(
          results.map((category: any) => ({
            ...category,
            id: category.id || category._id,
            createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
            updatedAt: category.updatedAt ? new Date(category.updatedAt) : new Date(),
          }))
        );
        setTotalCount(total);
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [getCategoriesApi, paginationModel]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateDialog = useCallback(() => {
    setCategoryDialogState({
      open: true,
      mode: 'create',
      category: null,
    });
  }, []);

  const handleEditRow = useCallback((row: ICategoryRow) => {
    setCategoryDialogState({
      open: true,
      mode: 'edit',
      category: row,
    });
  }, []);

  const handleDeleteRow = useCallback((id: string) => {
    setConfirmDelete({ open: true, id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete.id) return;

    setDeletingId(confirmDelete.id);
    try {
      const response = await deleteCategoryApi(confirmDelete.id);
      if (response?.data?.status) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
      setConfirmDelete({ open: false, id: null });
    }
  }, [confirmDelete.id, deleteCategoryApi, fetchCategories]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'slug',
        headerName: 'Slug',
        width: 200,
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 180,
        renderCell: (params: GridRenderCellParams<ICategoryRow>) => (
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
          <Typography variant="h4">Category Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreateDialog}
          >
            New Category
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
              toolbar: GridToolbar,
            }}
          />
        </Card>
      </Stack>

      <CategoryDialog
        open={categoryDialogState.open}
        mode={categoryDialogState.mode}
        category={categoryDialogState.category}
        onClose={() => setCategoryDialogState({ open: false, mode: 'create', category: null })}
        onSuccess={fetchCategories}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Category?"
        content="This action cannot be undone. The category will be permanently deleted."
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

