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

type WithdrawalRow = {
  _id: string;
  user_email: string;
  username: string;
  coin_amount: number;
  wallet_type: string;
  wallet_address: string;
  currency_type: string;
  currency_amount: number;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  notes?: string;
  transaction_hash?: string;
};

export default function WithdrawalView() {
  const settings = useSettingsContext();
  const { hasPermission } = usePermissions();
  const { socket, refreshPendingWithdrawalsCount } = useSocket();
  const accessToken = useSelector((state: any) => state.auth.token);
  const [currentTab, setCurrentTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openTransactionHashDialog, setOpenTransactionHashDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${API_URL}/api/v4/payments/withdrawal-history`;
      
      let statusFilter = 'pending';
      if (currentTab === 'processing') {
        statusFilter = 'processing';
      } else if (currentTab === 'completed') {
        statusFilter = 'completed';
      } else if (currentTab === 'rejected') {
        statusFilter = 'rejected';
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 1000,
          status: statusFilter,
        },
      });

      if (response.data.status) {
        const withdrawalsData = response.data.data?.results || response.data.data || [];
        setWithdrawals(withdrawalsData);
      }
    } catch (error: any) {
      console.error('Failed to fetch withdrawals:', error);
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load withdrawals');
      }
    } finally {
      setLoading(false);
    }
  }, [currentTab, accessToken]);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.PAYMENTS.MANAGE)) {
      toast.error('You do not have permission to manage withdrawals');
      return;
    }
    fetchWithdrawals();
  }, [hasPermission, fetchWithdrawals, currentTab]);

  // Listen for real-time new withdrawal notifications
  useEffect(() => {
    if (!socket) return undefined;

    const handleNewWithdrawal = (data: any) => {
      // Show toast notification
      toast.success(`New withdrawal request: ${data.coin_amount} coins from ${data.username}`, {
        duration: 5000,
      });

      // Refresh the withdrawals list if we're on the pending tab
      if (currentTab === 'pending') {
        fetchWithdrawals();
      }
    };

    socket.on('new-withdrawal', handleNewWithdrawal);

    return () => {
      socket.off('new-withdrawal', handleNewWithdrawal);
    };
  }, [socket, currentTab, fetchWithdrawals]);

  // Step 1: Approve (deduct balance) — then open transaction hash modal
  const handleApproveConfirm = async () => {
    if (!selectedWithdrawal || !accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setProcessingId(selectedWithdrawal._id);
      
      await axios.patch(
        `${API_URL}/api/v4/payments/withdrawal-history/${selectedWithdrawal._id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      toast.success(`Balance deducted! ${selectedWithdrawal.coin_amount} BAC removed from ${selectedWithdrawal.username}. Please enter the transaction hash.`);
      
      // Close approve dialog and open transaction hash dialog
      setOpenApproveDialog(false);
      setTransactionHash('');
      setOpenTransactionHashDialog(true);

      fetchWithdrawals();
      refreshPendingWithdrawalsCount();
    } catch (error: any) {
      console.error('Failed to approve withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  // Step 2: Complete withdrawal — submit transaction hash
  const handleCompleteWithdrawal = async () => {
    if (!selectedWithdrawal || !transactionHash.trim()) {
      toast.error('Please enter the transaction hash');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setProcessingId(selectedWithdrawal._id);
      
      await axios.patch(
        `${API_URL}/api/v4/payments/withdrawal-history/${selectedWithdrawal._id}/complete`,
        {
          transaction_hash: transactionHash.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      toast.success('Withdrawal completed successfully! Transaction hash registered.');
      setOpenTransactionHashDialog(false);
      setTransactionHash('');
      setSelectedWithdrawal(null);
      fetchWithdrawals();
      refreshPendingWithdrawalsCount();
    } catch (error: any) {
      console.error('Failed to complete withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to complete withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      setProcessingId(selectedWithdrawal._id);
      
      await axios.patch(
        `${API_URL}/api/v4/payments/withdrawal-history/${selectedWithdrawal._id}/reject`,
        {
          rejection_reason: rejectionReason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      toast.success('Withdrawal rejected');
      setOpenRejectDialog(false);
      setRejectionReason('');
      setSelectedWithdrawal(null);
      fetchWithdrawals();
      refreshPendingWithdrawalsCount();
    } catch (error: any) {
      console.error('Failed to reject withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
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
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
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
      headerName: 'Coin Amount (BAC)',
      width: 140,
      renderCell: (params) => params.value.toFixed(2),
    },
    /*
    {
      field: 'currency_type',
      headerName: 'Currency',
      width: 100,
    },
    {
      field: 'currency_amount',
      headerName: 'Currency Amount',
      width: 140,
      renderCell: (params) => {
        const row = params.row as WithdrawalRow;
        return `${params.value.toFixed(2)} ${row.currency_type}`;
      },
    },
    {
      field: 'wallet_type',
      headerName: 'Wallet Type',
      width: 140,
    },
    */
    {
      field: 'wallet_address',
      headerName: 'Wallet Address',
      width: 200,
    },
    
    {
      field: 'created_at',
      headerName: 'Request Date',
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
      minWidth: 280,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center" sx={{ 
            height: '100%', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
          {currentTab === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => {
                  setSelectedWithdrawal(params.row);
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
                  setSelectedWithdrawal(params.row);
                  setRejectionReason('');
                  setOpenRejectDialog(true);
                }}
                disabled={processingId === params.row._id}
              >
                Reject
              </Button>
            </>
          )}
          {currentTab === 'processing' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  setSelectedWithdrawal(params.row);
                  setTransactionHash('');
                  setOpenTransactionHashDialog(true);
                }}
                disabled={processingId === params.row._id}
                sx={{ whiteSpace: 'nowrap', minWidth: 'auto', px: 1 }}
              >
                Confirm
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  setSelectedWithdrawal(params.row);
                  setRejectionReason('');
                  setOpenRejectDialog(true);
                }}
                disabled={processingId === params.row._id}
                sx={{ whiteSpace: 'nowrap', minWidth: 'auto', px: 1 }}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedWithdrawal(params.row);
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
          <Typography variant="h4">Withdrawal Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:refresh-fill" />}
            onClick={fetchWithdrawals}
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
                color: '#43a047',
                fontWeight: 'bold',
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#43a047',
              },
            }}
          >
            <Tab label="Pending" value="pending" />
            <Tab label="Processing" value="processing" />
            <Tab label="Completed" value="completed" />
            <Tab label="Rejected" value="rejected" />
          </Tabs>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={withdrawals}
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
            <Typography variant="h6">Approve Withdrawal Request</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWithdrawal && (
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
                <Typography variant="subtitle2" color="success.dark" sx={{ mb: 0.5 }}>
                  ✓ Approval Confirmation
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Are you sure you want to approve this withdrawal request? The user&apos;s balance will be deducted immediately.
                </Typography>
              </Box>

              {/* User Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  User Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField label="Username" value={selectedWithdrawal.username} InputProps={{ readOnly: true }} fullWidth />
                  <TextField label="Email Address" value={selectedWithdrawal.user_email} InputProps={{ readOnly: true }} fullWidth />
                </Box>
              </Box>

              {/* Withdrawal Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Withdrawal Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField 
                    label="Coin Amount (BAC)" 
                    value={selectedWithdrawal.coin_amount.toFixed(2)} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField
                    label="Currency Type"
                    value={selectedWithdrawal.currency_type}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField 
                    label="Currency Amount" 
                    value={`${selectedWithdrawal.currency_amount.toFixed(2)} ${selectedWithdrawal.currency_type}`} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField
                    label="Wallet Type"
                    value={selectedWithdrawal.wallet_type}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField 
                    label="Wallet Address" 
                    value={selectedWithdrawal.wallet_address} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  />
                </Box>
              </Box>

              {/* Request Date */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Request Details
                </Typography>
                <TextField
                  label="Request Date/Time"
                  value={new Date(selectedWithdrawal.created_at).toLocaleString('en-US', {
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
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenApproveDialog(false);
            setSelectedWithdrawal(null);
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

      {/* Withdrawal Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Withdrawal Details</Typography>
            <Chip label={selectedWithdrawal?.status.toUpperCase()} color={getStatusColor(selectedWithdrawal?.status || 'pending')} />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWithdrawal && (
            <Stack spacing={3}>
              {/* User Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  User Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField label="Username" value={selectedWithdrawal.username} InputProps={{ readOnly: true }} fullWidth />
                  <TextField label="Email Address" value={selectedWithdrawal.user_email} InputProps={{ readOnly: true }} fullWidth />
                </Box>
              </Box>

              {/* Coin Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Withdrawal Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField 
                    label="Coin Amount (BAC)" 
                    value={selectedWithdrawal.coin_amount.toFixed(2)} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField
                    label="Currency Type"
                    value={selectedWithdrawal.currency_type}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField 
                    label="Currency Amount" 
                    value={`${selectedWithdrawal.currency_amount.toFixed(2)} ${selectedWithdrawal.currency_type}`} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                  />
                  <TextField
                    label="Wallet Type"
                    value={selectedWithdrawal.wallet_type}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField 
                    label="Wallet Address" 
                    value={selectedWithdrawal.wallet_address} 
                    InputProps={{ readOnly: true }} 
                    fullWidth 
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  />
                  {selectedWithdrawal.description && (
                    <TextField
                      label="Description"
                      value={selectedWithdrawal.description}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={2}
                      fullWidth
                      sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    />
                  )}
                </Box>
              </Box>

              {/* Transaction Details */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Transaction Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Request Date/Time"
                    value={new Date(selectedWithdrawal.created_at).toLocaleString('en-US', {
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
                  {selectedWithdrawal.processed_at && (
                    <TextField
                      label="Processed Date/Time"
                      value={new Date(selectedWithdrawal.processed_at).toLocaleString('en-US', {
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
                  )}
                  {selectedWithdrawal.processed_by && (
                    <TextField
                      label="Processed By"
                      value={selectedWithdrawal.processed_by}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    />
                  )}
                </Box>
              </Box>

              {/* Additional Information (if rejected) */}
              {selectedWithdrawal.rejection_reason && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Rejection Information
                  </Typography>
                  <TextField
                    label="Rejection Reason"
                    value={selectedWithdrawal.rejection_reason}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Box>
              )}

              {selectedWithdrawal.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Notes
                  </Typography>
                  <TextField
                    label="Notes"
                    value={selectedWithdrawal.notes}
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
            <Typography variant="h6">
              {selectedWithdrawal?.status === 'processing' ? 'Reject & Refund Withdrawal' : 'Reject Withdrawal Request'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {selectedWithdrawal?.status === 'processing' && (
              <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
                <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 0.5 }}>
                  ⚠️ Balance Refund Warning
                </Typography>
                <Typography variant="body2" color="warning.dark">
                  This withdrawal is currently in <strong>processing</strong> state — the user&apos;s balance ({selectedWithdrawal.coin_amount.toFixed(2)} BAC) has already been deducted. Rejecting it will <strong>refund the balance</strong> back to the user.
                </Typography>
              </Box>
            )}

            {selectedWithdrawal && (
              <>
                {/* User Information */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    User Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField label="Username" value={selectedWithdrawal.username} InputProps={{ readOnly: true }} fullWidth />
                    <TextField label="Email Address" value={selectedWithdrawal.user_email} InputProps={{ readOnly: true }} fullWidth />
                  </Box>
                </Box>

                {/* Withdrawal Information */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Withdrawal Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField 
                      label="Coin Amount (BAC)" 
                      value={selectedWithdrawal.coin_amount.toFixed(2)} 
                      InputProps={{ readOnly: true }} 
                      fullWidth 
                    />
                    <TextField
                      label="Currency Type"
                      value={selectedWithdrawal.currency_type}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField 
                      label="Currency Amount" 
                      value={`${selectedWithdrawal.currency_amount.toFixed(2)} ${selectedWithdrawal.currency_type}`} 
                      InputProps={{ readOnly: true }} 
                      fullWidth 
                    />
                    <TextField
                      label="Wallet Type"
                      value={selectedWithdrawal.wallet_type}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField 
                      label="Wallet Address" 
                      value={selectedWithdrawal.wallet_address} 
                      InputProps={{ readOnly: true }} 
                      fullWidth 
                      sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    />
                  </Box>
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
                placeholder="e.g., Insufficient balance, Invalid wallet address, Suspicious activity..."
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenRejectDialog(false);
            setRejectionReason('');
            setSelectedWithdrawal(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || processingId !== null}
          >
            {(() => {
              if (processingId) return 'Rejecting...';
              if (selectedWithdrawal?.status === 'processing') return 'Reject & Refund';
              return 'Reject Withdrawal';
            })()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Hash Dialog - Step 2 of Approval */}
      <Dialog
        open={openTransactionHashDialog}
        onClose={() => {
          setOpenTransactionHashDialog(false);
          setTransactionHash('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
            <Typography variant="h6">Enter Transaction Hash</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              The user&apos;s balance has been deducted successfully. Please enter the withdrawal transaction identifier (hash) to complete this request.
            </Typography>

            {selectedWithdrawal && (
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>User:</strong> {selectedWithdrawal.username} ({selectedWithdrawal.user_email})
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amount:</strong> {selectedWithdrawal.coin_amount.toFixed(2)} BAC → {selectedWithdrawal.currency_amount.toFixed(2)} {selectedWithdrawal.currency_type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Wallet:</strong> {selectedWithdrawal.wallet_type} — {selectedWithdrawal.wallet_address}
                  </Typography>
                </Stack>
              </Box>
            )}

            <TextField
              label="Transaction Hash / ID"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              fullWidth
              required
              placeholder="Enter the transaction hash or identifier..."
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenTransactionHashDialog(false);
            setTransactionHash('');
          }}>
            Cancel (Complete Later)
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCompleteWithdrawal}
            disabled={!transactionHash.trim() || processingId !== null}
          >
            {processingId ? 'Completing...' : 'Complete Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
