import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Container,
  Stack,
  Typography,
  Tab,
  Tabs,
  Box,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
} from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { useSocket } from 'src/contexts/SocketContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

type DepositRow = {
  _id: string;
  user_email: string;
  username: string;
  transaction_id: string;
  coin_amount: number;
  payment_currency: string;
  payment_amount: number;
  from_address: string;
  payment_channel: {
    _id: string;
    channel_name: string;
    icon: string;
  };
  to_wallet_address: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  notes?: string;
};

export default function DepositView() {
  const settings = useSettingsContext();
  const { hasPermission } = usePermissions();
  const { socket, refreshPendingCount } = useSocket();
  const accessToken = useSelector((state: any) => state.auth.token);
  const [currentTab, setCurrentTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);
    try {
      let endpoint = `${API_URL}/api/v4/payments/deposit-history`;
      
      if (currentTab === 'pending') {
        endpoint += '/pending';
      } else {
        // Get all deposits with status filter
        const response = await axios.get(`${API_URL}/api/v4/payments/deposit-history`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            limit: 1000,
          },
        });

        if (response.data.status) {
          const allDeposits = response.data.data?.results || response.data.data || [];
          const filtered = allDeposits.filter((d: DepositRow) => d.status === currentTab);
          setDeposits(filtered);
        }
        setLoading(false);
        return;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.status) {
        const depositsData = response.data.data?.results || response.data.data || [];
        setDeposits(depositsData);
      }
    } catch (error: any) {
      console.error('Failed to fetch deposits:', error);
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load deposits');
      }
    } finally {
      setLoading(false);
    }
  }, [currentTab, accessToken]);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.PAYMENTS.MANAGE)) {
      toast.error('You do not have permission to manage deposits');
      return;
    }
    fetchDeposits();
  }, [hasPermission, fetchDeposits, currentTab]);

  // Listen for real-time new deposit notifications
  useEffect(() => {
    if (!socket) return undefined;

    const handleNewDeposit = (data: any) => {
      console.log('[Admin View] New deposit notification received:', data);
      
      // Show toast notification
      toast.success(`New deposit: ${data.coin_amount} coins from ${data.username}`, {
        duration: 5000,
      });
      
      // Refresh the deposits list if we're on the pending tab
      if (currentTab === 'pending') {
        console.log('[Admin View] Refreshing deposits table...');
        fetchDeposits();
      }
    };

    socket.on('new-deposit', handleNewDeposit);
    console.log('[Admin View] Listening for new-deposit events');

    return () => {
      socket.off('new-deposit', handleNewDeposit);
      console.log('[Admin View] Stopped listening for new-deposit events');
    };
  }, [socket, currentTab, fetchDeposits]);

  const handleApproveConfirm = async () => {
    if (!selectedDeposit || !accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setProcessingId(selectedDeposit._id);
      
      await axios.patch(
        `${API_URL}/api/v4/payments/deposit-history/${selectedDeposit._id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      toast.success(`Deposit approved! ${selectedDeposit.coin_amount} coins will be added to ${selectedDeposit.username}'s account.`);
      setOpenApproveDialog(false);
      setSelectedDeposit(null);
      fetchDeposits();
      refreshPendingCount();
    } catch (error: any) {
      console.error('Failed to approve deposit:', error);
      toast.error(error.response?.data?.message || 'Failed to approve deposit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setProcessingId(selectedDeposit._id);
      
      await axios.patch(
        `${API_URL}/api/v4/payments/deposit-history/${selectedDeposit._id}/reject`,
        {
          rejection_reason: rejectionReason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      toast.success('Deposit rejected');
      setOpenRejectDialog(false);
      setRejectionReason('');
      setSelectedDeposit(null);
      fetchDeposits();
      refreshPendingCount();
    } catch (error: any) {
      console.error('Failed to reject deposit:', error);
      toast.error(error.response?.data?.message || 'Failed to reject deposit');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'Username',
      width: 120,
    },
    {
      field: 'user_email',
      headerName: 'Email',
      width: 180,
    },
    {
      field: 'coin_amount',
      headerName: 'Coin Amount',
      width: 110,
      renderCell: (params) => params.value.toFixed(2),
    },
    {
      field: 'payment_channel',
      headerName: 'Payment Channel',
      width: 140,
      renderCell: (params) => params.value?.channel_name || 'N/A',
    },
    /*
    {
      field: 'to_wallet_address',
      headerName: 'Deposit Wallet',
      width: 150,
     
    },
    {
      field: 'from_address',
      headerName: 'From Address',
      width: 150,
     
    },
    */
    {
      field: 'transaction_id',
      headerName: 'Transaction ID',
      width: 130,
    },
    {
      field: 'payment_currency',
      headerName: 'Currency',
      width: 90,
    },
    {
      field: 'payment_amount',
      headerName: 'Amount',
      width: 110,
      renderCell: (params) => params.value.toFixed(2),
    },
    {
      field: 'created_at',
      headerName: 'Date/Time',
      width: 160,
      renderCell: (params) => new Date(params.value).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ 
            height: '100%', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          {currentTab === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => {
                  setSelectedDeposit(params.row);
                  setOpenApproveDialog(true);
                }}
                disabled={processingId === params.row._id}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  setSelectedDeposit(params.row);
                  setRejectionReason('');
                  setOpenRejectDialog(true);
                }}
                disabled={processingId === params.row._id}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedDeposit(params.row);
              setOpenDialog(true);
            }}
          >
            View
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Deposit Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:refresh-fill" />}
            onClick={fetchDeposits}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>

        <Card>
          <Tabs
            value={currentTab}
            onChange={(e, value) => setCurrentTab(value)}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
              '& .MuiTab-root.Mui-selected': {
                color: '#05be87ff',
                fontWeight: 'bold',
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#05be87ff',
              },
            }}
          >
            <Tab label="Pending" value="pending" />
            <Tab label="Completed" value="completed" />
            <Tab label="Failed" value="rejected" />
          </Tabs>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={deposits}
              columns={columns}
              loading={loading}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </Card>
      </Stack>

      {/* Approve Confirmation Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
            <Typography variant="h6">Approve Deposit Request</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDeposit && (
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
                <Typography variant="subtitle2" color="success.dark" sx={{ mb: 0.5 }}>
                  ✓ Approval Confirmation
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Are you sure you want to approve this deposit request? The user will receive {selectedDeposit.coin_amount.toFixed(2)} BAC coins.
                </Typography>
              </Box>

              {/* User Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  User Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField label="Username" value={selectedDeposit.username} InputProps={{ readOnly: true }} fullWidth />
                  <TextField label="Email Address" value={selectedDeposit.user_email} InputProps={{ readOnly: true }} fullWidth />
                </Box>
              </Box>

              {/* Coin Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Coin Information
                </Typography>
                <TextField 
                  label="Requested Coin Amount" 
                  value={selectedDeposit.coin_amount.toFixed(2)} 
                  InputProps={{ readOnly: true }} 
                  fullWidth 
                />
              </Box>

              {/* Payment Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Payment Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Payment Channel"
                    value={selectedDeposit.payment_channel?.channel_name || 'N/A'}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    label="Currency Type"
                    value={selectedDeposit.payment_currency}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    label="Currency Amount"
                    value={selectedDeposit.payment_amount.toFixed(2)}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Box>
              </Box>

              {/* Transaction Details */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Transaction Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField 
                    label="Transaction ID" 
                    value={selectedDeposit.transaction_id} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField
                    label="Date/Time"
                    value={new Date(selectedDeposit.created_at).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField 
                    label="Deposit Wallet Address (To)" 
                    value={selectedDeposit.to_wallet_address} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField 
                    label="Remittance Wallet Address (From)" 
                    value={selectedDeposit.from_address} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenApproveDialog(false);
            setSelectedDeposit(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApproveConfirm}
            disabled={processingId !== null}
          >
            {processingId ? 'Processing...' : 'Confirm Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Deposit Details</Typography>
            <Chip label={selectedDeposit?.status.toUpperCase()} color={getStatusColor(selectedDeposit?.status || 'pending')} />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDeposit && (
            <Stack spacing={3}>
              {/* User Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  User Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField label="Username" value={selectedDeposit.username} InputProps={{ readOnly: true }} fullWidth />
                  <TextField label="Email Address" value={selectedDeposit.user_email} InputProps={{ readOnly: true }} fullWidth />
                </Box>
              </Box>

              {/* Coin Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Coin Information
                </Typography>
                <TextField 
                  label="Requested Coin Amount" 
                  value={selectedDeposit.coin_amount.toFixed(2)} 
                  InputProps={{ readOnly: true }} 
                  fullWidth 
                />
              </Box>

              {/* Payment Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Payment Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Payment Channel"
                    value={selectedDeposit.payment_channel?.channel_name || 'N/A'}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    label="Currency Type"
                    value={selectedDeposit.payment_currency}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    label="Currency Amount"
                    value={selectedDeposit.payment_amount.toFixed(2)}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Box>
              </Box>

              {/* Transaction Details */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Transaction Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField 
                    label="Transaction ID" 
                    value={selectedDeposit.transaction_id} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  />
                  <TextField 
                    label="Deposit Wallet Address (To)" 
                    value={selectedDeposit.to_wallet_address} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField 
                    label="Remittance Wallet Address (From)" 
                    value={selectedDeposit.from_address} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField
                    label="Date/Time"
                    value={new Date(selectedDeposit.created_at).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  />
                </Box>
              </Box>

              {/* Additional Information (if rejected) */}
              {selectedDeposit.rejection_reason && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Rejection Information
                  </Typography>
                  <TextField
                    label="Rejection Reason"
                    value={selectedDeposit.rejection_reason}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Box>
              )}

              {selectedDeposit.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Notes
                  </Typography>
                  <TextField
                    label="Notes"
                    value={selectedDeposit.notes}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:close-circle-fill" sx={{ color: 'error.main' }} />
            <Typography variant="h6">Reject Deposit Request</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {selectedDeposit && (
              <>
                {/* User Information */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    User Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField label="Username" value={selectedDeposit.username} InputProps={{ readOnly: true }} fullWidth />
                    <TextField label="Email Address" value={selectedDeposit.user_email} InputProps={{ readOnly: true }} fullWidth />
                  </Stack>
                </Box>

                {/* Coin Information */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Coin Information
                  </Typography>
                  <TextField 
                    label="Requested Coin Amount" 
                    value={selectedDeposit.coin_amount.toFixed(2)} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                </Box>

                {/* Payment Information */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Payment Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Payment Channel"
                      value={selectedDeposit.payment_channel?.channel_name || 'N/A'}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField
                      label="Currency Type"
                      value={selectedDeposit.payment_currency}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField
                      label="Currency Amount"
                      value={selectedDeposit.payment_amount.toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Stack>
                </Box>

                {/* Transaction Details */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Transaction Details
                  </Typography>
                  <Stack spacing={2}>
                    <TextField 
                      label="Transaction ID" 
                      value={selectedDeposit.transaction_id} 
                      InputProps={{ readOnly: true }} 
                      fullWidth 
                    />
                    <TextField 
                      label="Deposit Wallet Address (To)" 
                      value={selectedDeposit.to_wallet_address} 
                      InputProps={{ readOnly: true }} 
                      fullWidth 
                    />
                    <TextField 
                      label="Remittance Wallet Address (From)" 
                      value={selectedDeposit.from_address} 
                      InputProps={{ readOnly: true }} 
                      fullWidth 
                    />
                  </Stack>
                </Box>
              </>
            )}

            {/* Rejection Reason */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Rejection Reason
              </Typography>
              <TextField
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                multiline
                rows={4}
                fullWidth
                required
                placeholder="e.g., Invalid transaction ID, Incorrect amount, Fraudulent activity..."
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenRejectDialog(false);
            setRejectionReason('');
            setSelectedDeposit(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || processingId !== null}
          >
            {processingId ? 'Rejecting...' : 'Reject Deposit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

