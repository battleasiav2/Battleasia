import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fDateTime } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { IConversation } from 'src/contexts/api/customer-support';

export default function CustomerSupportListView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { getAllConversationsApi, closeConversationApi } = useApi();

  const [rows, setRows] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'pending'>('all');
  const [closingId, setClosingId] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllConversationsApi({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response?.data?.status && response.data.data) {
        const { results, total } = response.data.data;
        setRows(
          results.map((conv: any) => ({
            ...conv,
            id: conv.id || conv._id,
            createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
            lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(),
          }))
        );
        setTotalCount(total);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [getAllConversationsApi, paginationModel, statusFilter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleViewRow = useCallback((row: IConversation) => {
    navigate(paths.customerSupport.detail(row.id));
  }, [navigate]);

  const handleCloseRow = useCallback((id: string) => {
    setConfirmClose({ open: true, id });
  }, []);

  const handleConfirmClose = useCallback(async () => {
    if (!confirmClose.id) return;

    setClosingId(confirmClose.id);
    try {
      const response = await closeConversationApi(confirmClose.id);
      if (response?.data?.status) {
        toast.success('Conversation closed successfully');
        fetchConversations();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to close conversation');
    } finally {
      setClosingId(null);
      setConfirmClose({ open: false, id: null });
    }
  }, [confirmClose.id, closeConversationApi, fetchConversations]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'user',
        headerName: 'User',
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<IConversation>) => {
          const user = params.row.userId;
          if (typeof user === 'object' && user !== null) {
            return (
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                  {user.username?.charAt(0) || 'U'}
                </Avatar>
                <Box height={1} >
                  <Typography >{user.username || 'Unknown'}</Typography>
                  <Typography fontSize={12} color="text.secondary" >
                    {user.email || ''}
                  </Typography>
                </Box>
              </Stack>
            );
          }
          return <Typography variant="body2">Unknown User</Typography>;
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<IConversation>) => {
          const getColor = () => {
            if (params.value === 'open') return 'success';
            if (params.value === 'closed') return 'default';
            return 'warning';
          };
          return (
            <Chip
              label={params.value}
              color={getColor()}
              size="small"
            />
          );
        },
      },
      {
        field: 'lastMessageAt',
        headerName: 'Last Message',
        width: 180,
        renderCell: (params: GridRenderCellParams<IConversation>) =>
          fDateTime(params.value),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 180,
        renderCell: (params: GridRenderCellParams<IConversation>) =>
          fDateTime(params.value),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            key="view"
            icon={<Iconify icon="solar:eye-bold" />}
            label="View"
            onClick={() => handleViewRow(params.row)}
          />,
          params.row.status !== 'closed' && (
            <GridActionsCellItem
              key="close"
              icon={<Iconify icon="solar:close-circle-bold" />}
              label="Close"
              onClick={() => handleCloseRow(params.row.id)}
              showInMenu
            />
          ),
        ].filter(Boolean) as React.ReactElement[],
      },
    ],
    [handleViewRow, handleCloseRow]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack
        spacing={3}
        sx={{
          p: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Customer Support</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('all')}
              size="small"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'open' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('open')}
              size="small"
              color="success"
            >
              Open
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('pending')}
              size="small"
              color="warning"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'closed' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('closed')}
              size="small"
            >
              Closed
            </Button>
          </Stack>
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
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            disableRowSelectionOnClick
            sx={{ border: 'none' }}
          />
        </Card>
      </Stack>

      <ConfirmDialog
        open={confirmClose.open}
        onClose={() => setConfirmClose({ open: false, id: null })}
        title="Close Conversation"
        content="Are you sure you want to close this conversation?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleConfirmClose}
            loading={closingId === confirmClose.id}
          >
            Close
          </LoadingButton>
        }
      />
    </Container>
  );
}

