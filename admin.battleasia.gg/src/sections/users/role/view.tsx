import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
} from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
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
import useApi from 'src/hooks/use-api';
import ConfirmDialog from 'src/components/custom-dialog/confirm-dialog';
import { RoleDialog } from './form';

type RoleRow = {
  id: string;
  name: string;
  description?: string;
  parent?: { id: string; name: string; level: number } | null;
  permissions?: string[];
  level?: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export default function UserRoleView() {
  const settings = useSettingsContext();
  const { getRolesApi, deleteRoleApi } = useApi();

  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [roleDialogState, setRoleDialogState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    role: RoleRow | null;
  }>({
    open: false,
    mode: 'create',
    role: null,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRolesApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
      });

      if (response?.data?.status && response.data.data) {
        const { results, count } = response.data.data;
        setRows(
          results.map((role: any) => ({
            ...role,
            id: role._id || role.id,
            parent: role.parent || null,
            permissions: role.permissions || [],
            level: role.level || 0,
            createdAt: role.createdAt ? new Date(role.createdAt) : null,
            updatedAt: role.updatedAt ? new Date(role.updatedAt) : null,
          }))
        );
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [getRolesApi, paginationModel, search]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleRefresh = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreateDialog = useCallback(() => {
    setRoleDialogState({ open: true, mode: 'create', role: null });
  }, []);

  const openEditDialog = useCallback((role: RoleRow) => {
    setRoleDialogState({ open: true, mode: 'edit', role });
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setConfirmDelete({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete.id) return;

    const roleId = confirmDelete.id;
    setDeletingId(roleId);
    setConfirmDelete({ open: false, id: null });

    try {
      const response = await deleteRoleApi(roleId);
      if (response?.data?.status) {
        toast.success('Role deleted successfully');
        fetchRoles();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data || error?.message || 'Failed to delete role';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete role');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete.id, deleteRoleApi, fetchRoles]);

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

  const columns = useMemo<GridColDef<RoleRow>[]>(
    () => [
      {
        field: 'actions',
        type: 'actions',
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<Iconify icon="mdi:pencil" color="info.main" />}
            label="Edit"
            onClick={() => openEditDialog(params.row)}
          />,
          <GridActionsCellItem
            key="delete"
            showInMenu
            icon={<Iconify icon="mdi:delete" color="error.main" />}
            label="Delete"
            onClick={() => handleDeleteClick(params.id as string)}
            disabled={deletingId === params.id}
          />,
        ],
      },
      { 
        field: 'name', 
        headerName: 'Role Name', 
        flex: 1, 
        minWidth: 150,
        renderCell: (params) => {
          let chipColor: 'error' | 'warning' | 'default' = 'default';
          if (params.row.level === 0) {
            chipColor = 'error';
          } else if (params.row.level === 1) {
            chipColor = 'warning';
          }
          
          return (
            <Stack direction="row" height={1} width={1} spacing={1} alignItems="center" justifyContent="flex-start">
              <Box sx={{ width: params.row.level ? params.row.level * 16 : 0 }} />
              <Typography variant="body2">{params.value}</Typography>
              {params.row.level !== undefined && (
                <Chip 
                  label={`Level ${params.row.level}`} 
                  size="small" 
                  color={chipColor}
                />
              )}
            </Stack>
          );
        },
      },
      { 
        field: 'parent', 
        headerName: 'Parent Role', 
        flex: 0.8, 
        minWidth: 120,
        renderCell: (params) => (
          params.value ? (
            <Chip label={params.value.name} size="small" variant="outlined" />
          ) : (
            <Typography variant="body2" color="text.secondary">Top Level</Typography>
          )
        ),
      },
      {
        field: 'type',
        headerName: 'Role Type',
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => (
          <Chip label={params.value} size="small" variant="outlined" />
        ),
      },
      { 
        field: 'permissions', 
        headerName: 'Permissions', 
        flex: 1.2, 
        minWidth: 200,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          params.value && params.value.length > 0 ? (
            <Stack 
              direction="row" 
              spacing={0.5} 
              flexWrap="wrap" 
              justifyContent="center" 
              alignItems="center"
              sx={{ width: '100%', height: '100%' }}
            >
              {params.value.slice(0, 3).map((perm: string) => (
                <Chip key={perm} label={perm.split('.')[0]} size="small" />
              ))}
              {params.value.length > 3 && (
                <Chip label={`+${params.value.length - 3}`} size="small" />
              )}
            </Stack>
          ) : (
            <Stack 
              justifyContent="center" 
              alignItems="center" 
              sx={{ width: '100%', height: '100%' }}
            >
              <Typography variant="body2" color="text.secondary">
                No permissions
              </Typography>
            </Stack>
          )
        ),
      },
      { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
      {
        field: 'createdAt',
        headerName: 'Created At',
        type: 'dateTime',
        width: 180,
      },
    ],
    [openEditDialog, handleDeleteClick, deletingId]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4">Roles</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
        Review all system roles, their descriptions, and creation dates. Use filters to quickly find a specific role.
      </Typography>

      <Card sx={{ mt: 4 }}>
        <Stack
          direction="row"
          gap={1}
          p={3}
          justifyContent="flex-end"
          flexWrap="wrap"
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="ic:round-add" />}
            onClick={openCreateDialog}
          >
            Create Role
          </Button>
          <LoadingButton
            variant="contained"
            color="info"
            loading={loading}
            onClick={handleRefresh}
            startIcon={<Iconify icon="flowbite:refresh-outline" />}
          >
            Refresh
          </LoadingButton>
        </Stack>

        <Divider />

        <Box sx={{ p: 3 }}>
          <DataGrid
            autoHeight
            rows={rows}
            rowCount={totalCount}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            filterMode="server"
            pageSizeOptions={[5, 10, 25, 50]}
            onFilterModelChange={onFilterChange}
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
        </Box>
      </Card>

      <Dialog open={Boolean(selectedRole)} onClose={() => setSelectedRole(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRole?.name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedRole?.description || 'No description provided.'}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created: {selectedRole?.createdAt?.toLocaleString() ?? '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated: {selectedRole?.updatedAt?.toLocaleString() ?? '-'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRole(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <RoleDialog
        open={roleDialogState.open}
        onClose={() => setRoleDialogState({ open: false, mode: 'create', role: null })}
        mode={roleDialogState.mode}
        role={roleDialogState.role ? {
          id: roleDialogState.role.id,
          name: roleDialogState.role.name,
          description: roleDialogState.role.description,
          parent: roleDialogState.role.parent || null,
          permissions: roleDialogState.role.permissions || [],
        } : null}
        onSuccess={fetchRoles}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Role"
        content="Are you sure you want to delete this role? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deletingId !== null}
          >
            Delete
          </Button>
        }
      />
    </Container>
  );
}

