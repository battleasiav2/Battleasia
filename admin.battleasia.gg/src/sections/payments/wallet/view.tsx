import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Container,
  Stack,
  Typography,
  Box,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  IconButton,
} from '@mui/material';
import toast from 'react-hot-toast';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { assetPath } from 'src/utils/asset-path';

type WalletStats = {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeUsers: number;
};

type PaymentChannel = {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  description: string;
};

type BusinessWallet = {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_icon: string;
  wallet_address: string;
  currency_type: string;
  enabled: boolean;
  qr_code?: string;
};

export default function WalletView() {
  const settings = useSettingsContext();
  const { hasPermission } = usePermissions();
  const { 
    getBalanceHistoriesApi,
    getPaymentChannelsApi,
    createPaymentChannelApi,
    createBusinessWalletApi,
    getBusinessWalletsApi,
    deleteBusinessWalletApi,
    updateBusinessWalletApi,
  } = useApi();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WalletStats>({
    totalBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeUsers: 0,
  });

  // Modal states
  const [openChannelModal, setOpenChannelModal] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [openEditWalletModal, setOpenEditWalletModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<BusinessWallet | null>(null);
  const [walletToEdit, setWalletToEdit] = useState<BusinessWallet | null>(null);

  // Form states for Add Channel
  const [channelForm, setChannelForm] = useState({
    channel_name: '',
    description: '',
    icon: '',
  });

  // Image preview state
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // Form states for Add Wallet
  const [walletForm, setWalletForm] = useState({
    channel_id: '',
    wallet_address: '',
    currency_type: '',
  });

  // Form states for Edit Wallet
  const [editWalletForm, setEditWalletForm] = useState({
    channel_id: '',
    wallet_address: '',
    currency_type: '',
  });

  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [businessWallets, setBusinessWallets] = useState<BusinessWallet[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const fetchWalletStats = useCallback(async () => {
    setLoading(true);
    // Clear any active filter when refreshing
    setSelectedChannelId(null);
    
    try {
      // Fetch payment channels
      const channelsResponse = await getPaymentChannelsApi({ limit: 100 });
      if (channelsResponse?.data?.status && channelsResponse.data.data?.results) {
        const channels = channelsResponse.data.data.results.map((ch: any) => ({
          id: ch._id,
          name: ch.channel_name,
          icon: ch.icon || assetPath('/assets/images/default-payment.webp'),
          enabled: ch.enabled,
          description: ch.description || '',
        }));
        setPaymentChannels(channels);
      }

      // Fetch business wallets
      const walletsResponse = await getBusinessWalletsApi({ limit: 100 });
      if (walletsResponse?.data?.status && walletsResponse.data.data?.results) {
        const wallets = walletsResponse.data.data.results.map((wallet: any) => ({
          id: wallet._id,
          channel_id: wallet.channel_id?._id || wallet.channel_id,
          channel_name: wallet.channel_id?.channel_name || 'Unknown',
          channel_icon: wallet.channel_id?.icon || assetPath('/assets/images/default-payment.webp'),
          wallet_address: wallet.wallet_address,
          currency_type: wallet.currency_type,
          enabled: wallet.enabled,
          qr_code: wallet.qr_code || null,
        }));
        setBusinessWallets(wallets);
      }

      // TODO: Implement actual wallet stats API
      // For now, using mock data
      setStats({
        totalBalance: 125000,
        totalDeposits: 350000,
        totalWithdrawals: 225000,
        activeUsers: 1250,
      });
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error);
      toast.error('Failed to load wallet statistics');
    } finally {
      setLoading(false);
    }
  }, [getPaymentChannelsApi, getBusinessWalletsApi]);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.PAYMENTS.VIEW)) {
      toast.error('You do not have permission to view wallet information');
      return;
    }
    fetchWalletStats();
  }, [hasPermission, fetchWalletStats]);

  // Handle icon file upload
  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setUploadingIcon(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIconPreview(base64String);
        setChannelForm({ ...channelForm, icon: base64String });
        toast.success('Icon selected successfully');
        setUploadingIcon(false);
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
        setIconPreview(null);
        setUploadingIcon(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error reading icon:', error);
      toast.error('Failed to read icon file');
      setIconPreview(null);
      setUploadingIcon(false);
    }
  };

  // Remove icon
  const handleRemoveIcon = () => {
    setChannelForm({ ...channelForm, icon: '' });
    setIconPreview(null);
  };

  // Handle Add Channel
  const handleAddChannel = async () => {
    if (!channelForm.channel_name) {
      toast.error('Please enter a channel name');
      return;
    }

    if (!channelForm.icon) {
      toast.error('Please upload a channel icon');
      return;
    }

    try {
      const response = await createPaymentChannelApi(channelForm);
      
      if (response?.data?.status) {
        toast.success('Payment channel created successfully');
        setOpenChannelModal(false);
        setChannelForm({ channel_name: '', description: '', icon: '' });
        setIconPreview(null);
        // Refresh the list
        fetchWalletStats();
      } else {
        // Handle non-success response
        const errorData = response?.data;
        let errorMsg = 'Failed to create payment channel';
        
        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.message === 'string') {
            errorMsg = errorData.message;
          } else if (errorData.message && typeof errorData.message === 'object' && errorData.message.message) {
            errorMsg = String(errorData.message.message);
          }
        }
        
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Failed to create payment channel:', error);
      
      // Extract error message safely
      let errorMsg = 'Failed to create payment channel';
      
      try {
        const errorData = error?.response?.data;
        
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (typeof errorData === 'object') {
            if (typeof errorData.message === 'string') {
              errorMsg = errorData.message;
            } else if (errorData.message && typeof errorData.message === 'object') {
              errorMsg = errorData.message.message || JSON.stringify(errorData.message);
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMsg = errorData.error;
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
      }
      
      toast.error(String(errorMsg));
    }
  };

  // Handle Add Wallet
  const handleAddWallet = async () => {
    if (!walletForm.channel_id || !walletForm.wallet_address || !walletForm.currency_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for duplicate wallet address in the same channel (Frontend validation)
    const duplicateWallet = businessWallets.find(
      (wallet) => 
        wallet.channel_id === walletForm.channel_id && 
        wallet.wallet_address.toLowerCase() === walletForm.wallet_address.toLowerCase()
    );

    if (duplicateWallet) {
      toast.error('This wallet address is already registered in this channel. Please use a different address.');
      return;
    }

    try {
      const response = await createBusinessWalletApi(walletForm);
      
      if (response?.data?.status) {
        toast.success('Business wallet created successfully');
        setOpenWalletModal(false);
        setWalletForm({ channel_id: '', wallet_address: '', currency_type: '' });
        // Refresh the list
        fetchWalletStats();
      } else {
        // Handle non-success response
        const errorData = response?.data;
        let errorMsg = 'Failed to create business wallet';
        
        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.message === 'string') {
            errorMsg = errorData.message;
          } else if (errorData.message && typeof errorData.message === 'object' && errorData.message.message) {
            errorMsg = String(errorData.message.message);
          }
        }
        
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Failed to create business wallet:', error);
      
      // Extract error message safely
      let errorMsg = 'Failed to create business wallet';
      
      try {
        const errorData = error?.response?.data;
        
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (typeof errorData === 'object') {
            if (typeof errorData.message === 'string') {
              errorMsg = errorData.message;
            } else if (errorData.message && typeof errorData.message === 'object') {
              errorMsg = errorData.message.message || JSON.stringify(errorData.message);
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMsg = errorData.error;
            }
          }
        }
        
        // Check for duplicate error in the message
        if (typeof errorMsg === 'string' && (
          errorMsg.toLowerCase().includes('duplicate') || 
          errorMsg.toLowerCase().includes('already exists') ||
          errorMsg.toLowerCase().includes('wallet address already')
        )) {
          errorMsg = 'This wallet address is already registered. Please use a different address.';
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
      }
      
      toast.error(String(errorMsg));
    }
  };

  // Handle Delete Wallet - Open confirmation dialog
  const handleDeleteClick = (wallet: BusinessWallet) => {
    setWalletToDelete(wallet);
    setDeleteConfirmOpen(true);
  };

  // Handle Delete Wallet - Confirm deletion
  const handleDeleteConfirm = async () => {
    if (!walletToDelete) return;

    try {
      const response = await deleteBusinessWalletApi(walletToDelete.id);
      
      if (response?.data?.status) {
        toast.success('Business wallet deleted successfully');
        setDeleteConfirmOpen(false);
        setWalletToDelete(null);
        // Refresh the list
        fetchWalletStats();
      } else {
        // Handle non-success response
        const errorData = response?.data;
        let errorMsg = 'Failed to delete business wallet';
        
        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.message === 'string') {
            errorMsg = errorData.message;
          } else if (errorData.message && typeof errorData.message === 'object' && errorData.message.message) {
            errorMsg = String(errorData.message.message);
          }
        }
        
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Failed to delete business wallet:', error);
      
      // Extract error message safely
      let errorMsg = 'Failed to delete business wallet';
      
      try {
        const errorData = error?.response?.data;
        
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (typeof errorData === 'object') {
            if (typeof errorData.message === 'string') {
              errorMsg = errorData.message;
            } else if (errorData.message && typeof errorData.message === 'object') {
              errorMsg = errorData.message.message || JSON.stringify(errorData.message);
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMsg = errorData.error;
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
      }
      
      toast.error(String(errorMsg));
    }
  };

  // Handle Delete Wallet - Cancel deletion
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setWalletToDelete(null);
  };

  // Handle Edit Wallet - Open edit modal
  const handleEditClick = (wallet: BusinessWallet) => {
    setWalletToEdit(wallet);
    setEditWalletForm({
      channel_id: wallet.channel_id,
      wallet_address: wallet.wallet_address,
      currency_type: wallet.currency_type,
    });
    setOpenEditWalletModal(true);
  };

  // Handle Edit Wallet - Submit update
  const handleEditWallet = async () => {
    if (!walletToEdit) return;
    
    if (!editWalletForm.channel_id || !editWalletForm.wallet_address || !editWalletForm.currency_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for duplicate wallet address in the same channel (Frontend validation)
    // Exclude the current wallet being edited
    const duplicateWallet = businessWallets.find(
      (wallet) => 
        wallet.id !== walletToEdit.id && // Exclude current wallet
        wallet.channel_id === editWalletForm.channel_id && 
        wallet.wallet_address.toLowerCase() === editWalletForm.wallet_address.toLowerCase()
    );

    if (duplicateWallet) {
      toast.error('This wallet address is already registered in this channel. Please use a different address.');
      return;
    }

    try {
      const response = await updateBusinessWalletApi(walletToEdit.id, editWalletForm);
      
      if (response?.data?.status) {
        toast.success('Business wallet updated successfully');
        setOpenEditWalletModal(false);
        setWalletToEdit(null);
        setEditWalletForm({ channel_id: '', wallet_address: '', currency_type: '' });
        // Refresh the list
        fetchWalletStats();
      } else {
        // Handle non-success response
        const errorData = response?.data;
        let errorMsg = 'Failed to update business wallet';
        
        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.message === 'string') {
            errorMsg = errorData.message;
          } else if (errorData.message && typeof errorData.message === 'object' && errorData.message.message) {
            errorMsg = String(errorData.message.message);
          }
        }
        
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Failed to update business wallet:', error);
      
      // Extract error message safely
      let errorMsg = 'Failed to update business wallet';
      
      try {
        const errorData = error?.response?.data;
        
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (typeof errorData === 'object') {
            if (typeof errorData.message === 'string') {
              errorMsg = errorData.message;
            } else if (errorData.message && typeof errorData.message === 'object') {
              errorMsg = errorData.message.message || JSON.stringify(errorData.message);
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMsg = errorData.error;
            }
          }
        }
        
        // Check for duplicate error in the message
        if (typeof errorMsg === 'string' && (
          errorMsg.toLowerCase().includes('duplicate') || 
          errorMsg.toLowerCase().includes('already exists') ||
          errorMsg.toLowerCase().includes('wallet address already')
        )) {
          errorMsg = 'This wallet address is already registered. Please use a different address.';
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
      }
      
      toast.error(String(errorMsg));
    }
  };

  // Handle Edit Wallet - Cancel edit
  const handleEditCancel = () => {
    setOpenEditWalletModal(false);
    setWalletToEdit(null);
    setEditWalletForm({ channel_id: '', wallet_address: '', currency_type: '' });
  };

  // Handle channel filter
  const handleChannelClick = (channelId: string) => {
    if (selectedChannelId === channelId) {
      // If clicking the same channel, deselect it (show all)
      setSelectedChannelId(null);
    } else {
      // Select the channel to filter wallets
      setSelectedChannelId(channelId);
    }
  };

  // Filter wallets based on selected channel
  const filteredWallets = selectedChannelId
    ? businessWallets.filter((wallet) => wallet.channel_id === selectedChannelId)
    : businessWallets;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Wallet Management</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenChannelModal(true)}
            >
              Add Channel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenWalletModal(true)}
            >
              Add Wallet
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:refresh-fill" />}
              onClick={fetchWalletStats}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        
        {/* Payment Channels Section */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Payment Channels
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Available payment methods for deposits and withdrawals
          </Typography>

          <Grid container spacing={3}>
            {paymentChannels.map((channel) => (
              <Grid item xs={12} sm={6} md={4} key={channel.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: selectedChannelId === channel.id ? 'primary.main' : 'divider',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    bgcolor: selectedChannelId === channel.id ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleChannelClick(channel.id)}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.neutral',
                        borderRadius: 2,
                        p: 1,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={channel.icon}
                        alt={channel.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Typography variant="h6">{channel.name}</Typography>
                        {channel.enabled && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.75,
                              bgcolor: 'success.lighter',
                              color: 'success.dark',
                            }}
                          >
                            <Typography variant="caption" fontWeight={600}>
                              Active
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {channel.description}
                      </Typography>
                    </Box>                    
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Wallet Overview
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="body2" color="text.secondary">
              {selectedChannelId 
                ? `Showing wallets for ${paymentChannels.find(ch => ch.id === selectedChannelId)?.name || 'selected channel'} (${filteredWallets.length})` 
                : `Registered business wallet addresses for each payment channel (${businessWallets.length} total)`}
            </Typography>
            {selectedChannelId && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="eva:close-fill" />}
                onClick={() => setSelectedChannelId(null)}
              >
                Clear Filter
              </Button>
            )}
          </Stack>

          {filteredWallets.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
              }}
            >
              <Iconify icon="solar:wallet-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {selectedChannelId 
                  ? `No wallets found for ${paymentChannels.find(ch => ch.id === selectedChannelId)?.name || 'this channel'}.` 
                  : 'No business wallets registered yet. Click "Add Wallet" to create one.'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredWallets.map((wallet) => (
                <Grid item xs={12} sm={6} md={4} key={wallet.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Header with Channel Info */}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.neutral',
                            borderRadius: 1.5,
                            p: 0.5,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={wallet.channel_icon}
                            alt={wallet.channel_name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {wallet.channel_name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 0.75,
                                bgcolor: 'info.lighter',
                                color: 'info.dark',
                              }}
                            >
                              <Typography variant="caption" fontWeight={600}>
                                {wallet.currency_type}
                              </Typography>
                            </Box>
                            {wallet.enabled && (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 0.75,
                                  bgcolor: 'success.lighter',
                                  color: 'success.dark',
                                }}
                              >
                                <Typography variant="caption" fontWeight={600}>
                                  Active
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Stack>

                      <Divider />

                      {/* Wallet Address */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          Wallet Address
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            bgcolor: 'background.neutral',
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          {wallet.wallet_address}
                        </Typography>
                      </Box>

                      {/* QR Code */}
                      {wallet.qr_code && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            py: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" mb={1}>
                            QR Code
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: '#fff',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          >
                            <img
                              src={wallet.qr_code}
                              alt={`QR Code for ${wallet.wallet_address}`}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                          </Box>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          startIcon={<Iconify icon="eva:edit-fill" />}
                          onClick={() => handleEditClick(wallet)}
                        >
                          Edit
                        </Button>
                        <IconButton 
                          size="small" 
                          color="error"
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                          onClick={() => handleDeleteClick(wallet)}
                        >
                          <Iconify icon="eva:trash-2-fill" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Card>
      </Stack>

      {/* Add Payment Channel Modal */}
      <Dialog 
        open={openChannelModal} 
        onClose={() => {
          setOpenChannelModal(false);
          setChannelForm({ channel_name: '', description: '', icon: '' });
          setIconPreview(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:wallet-bold" width={24} />
            <Typography variant="h6">Add Payment Channel</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Channel Name"
              placeholder="e.g., bKash, Nagad, Crypto"
              value={channelForm.channel_name}
              onChange={(e) => setChannelForm({ ...channelForm, channel_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              placeholder="e.g., Mobile Financial Service"
              value={channelForm.description}
              onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
              multiline
              rows={2}
            />
            
            {/* Icon Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Channel Icon *
              </Typography>
              <Stack spacing={2}>
                {/* Preview Area */}
                {iconPreview || channelForm.icon ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Avatar
                      src={iconPreview || channelForm.icon}
                      alt="Channel Icon"
                      sx={{ width: 100, height: 100 }}
                      variant="rounded"
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                      onClick={handleRemoveIcon}
                    >
                      <Iconify icon="eva:close-fill" width={16} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 120,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => document.getElementById('icon-upload-input')?.click()}
                  >
                    <Iconify icon="eva:image-outline" width={40} sx={{ color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to select icon
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      PNG, JPG (max 2MB)
                    </Typography>
                  </Box>
                )}
                
                {/* Hidden File Input */}
                <input
                  id="icon-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleIconUpload}
                />
                
                {/* Upload Button */}
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:image-outline" />}
                  onClick={() => document.getElementById('icon-upload-input')?.click()}
                  disabled={uploadingIcon}
                  fullWidth
                >
                  {uploadingIcon ? 'Processing...' : 'Select Icon'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              setOpenChannelModal(false);
              setChannelForm({ channel_name: '', description: '', icon: '' });
              setIconPreview(null);
            }} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddChannel}
            startIcon={<Iconify icon="eva:save-fill" />}
            disabled={uploadingIcon}
          >
            Create Channel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Business Wallet Modal */}
      <Dialog 
        open={openWalletModal} 
        onClose={() => {
          setOpenWalletModal(false);
          setWalletForm({ channel_id: '', wallet_address: '', currency_type: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:wallet-money-bold" width={24} />
            <Typography variant="h6">Add Business Wallet</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Payment Channel</InputLabel>
              <Select
                value={walletForm.channel_id}
                onChange={(e) => {
                  const newChannelId = e.target.value;
                  const selectedChannel = paymentChannels.find(ch => ch.id === newChannelId);
                  const isCrypto = selectedChannel?.name.toLowerCase() === 'crypto';
                  
                  setWalletForm({ 
                    ...walletForm, 
                    channel_id: newChannelId,
                    currency_type: isCrypto ? 'USDT' : 'BDT' // Reset currency based on channel type
                  });
                }}
                label="Payment Channel"
              >
                {paymentChannels.map((channel) => (
                  <MenuItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Wallet Address"
              placeholder="e.g., 01XXXXXXXXX or crypto wallet address"
              value={walletForm.wallet_address}
              onChange={(e) => setWalletForm({ ...walletForm, wallet_address: e.target.value })}
              required
              helperText="Enter the wallet address or phone number"
            />
            
            <FormControl fullWidth required>
              <InputLabel>Currency Type</InputLabel>
              <Select
                value={walletForm.currency_type}
                onChange={(e) => setWalletForm({ ...walletForm, currency_type: e.target.value })}
                label="Currency Type"
              >
                {(() => {
                  const selectedChannel = paymentChannels.find(ch => ch.id === walletForm.channel_id);
                  const isCrypto = selectedChannel?.name.toLowerCase() === 'crypto';
                  
                  const cryptoCurrencies = [
                    { value: 'USDT', label: 'USDT - Tether (Crypto)' },
                    { value: 'BTC', label: 'BTC - Bitcoin (Crypto)' },
                    { value: 'ETH', label: 'ETH - Ethereum (Crypto)' },
                    { value: 'TRX', label: 'TRX - Tron (Crypto)' },
                    { value: 'BNB', label: 'BNB - Binance Coin (Crypto)' },
                  ];
                  
                  const fiatCurrencies = [
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
                    { value: 'INR', label: 'INR - Indian Rupee' },
                    { value: 'PKR', label: 'PKR - Pakistani Rupee' },
                  ];
                  
                  const currencies = isCrypto ? cryptoCurrencies : fiatCurrencies;
                  
                  return currencies.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ));
                })()}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenWalletModal(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddWallet}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            Create Wallet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Business Wallet Modal */}
      <Dialog 
        open={openEditWalletModal} 
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:edit-fill" width={24} />
            <Typography variant="h6">Edit Business Wallet</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Payment Channel</InputLabel>
              <Select
                value={editWalletForm.channel_id}
                onChange={(e) => {
                  const newChannelId = e.target.value;
                  const selectedChannel = paymentChannels.find(ch => ch.id === newChannelId);
                  const isCrypto = selectedChannel?.name.toLowerCase() === 'crypto';
                  
                  setEditWalletForm({ 
                    ...editWalletForm, 
                    channel_id: newChannelId,
                    currency_type: isCrypto ? 'USDT' : 'BDT'
                  });
                }}
                label="Payment Channel"
              >
                {paymentChannels.map((channel) => (
                  <MenuItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Wallet Address"
              placeholder="e.g., 01XXXXXXXXX or crypto wallet address"
              value={editWalletForm.wallet_address}
              onChange={(e) => setEditWalletForm({ ...editWalletForm, wallet_address: e.target.value })}
              required
              helperText="Enter the wallet address or phone number"
            />
            
            <FormControl fullWidth required>
              <InputLabel>Currency Type</InputLabel>
              <Select
                value={editWalletForm.currency_type}
                onChange={(e) => setEditWalletForm({ ...editWalletForm, currency_type: e.target.value })}
                label="Currency Type"
              >
                {(() => {
                  const selectedChannel = paymentChannels.find(ch => ch.id === editWalletForm.channel_id);
                  const isCrypto = selectedChannel?.name.toLowerCase() === 'crypto';
                  
                  const cryptoCurrencies = [
                    { value: 'USDT', label: 'USDT - Tether (Crypto)' },
                    { value: 'BTC', label: 'BTC - Bitcoin (Crypto)' },
                    { value: 'ETH', label: 'ETH - Ethereum (Crypto)' },
                    { value: 'TRX', label: 'TRX - Tron (Crypto)' },
                    { value: 'BNB', label: 'BNB - Binance Coin (Crypto)' },
                  ];
                  
                  const fiatCurrencies = [
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
                    { value: 'INR', label: 'INR - Indian Rupee' },
                    { value: 'PKR', label: 'PKR - Pakistani Rupee' },
                  ];
                  
                  const currencies = isCrypto ? cryptoCurrencies : fiatCurrencies;
                  
                  return currencies.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ));
                })()}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleEditCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEditWallet}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            Update Wallet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:alert-triangle-fill" width={24} sx={{ color: 'error.main' }} />
            <Typography variant="h6">Delete Business Wallet</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body1">
              Are you sure you want to delete this wallet?
            </Typography>
            {walletToDelete && (
              <Paper sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        p: 0.5,
                      }}
                    >
                      <img
                        src={walletToDelete.channel_icon}
                        alt={walletToDelete.channel_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">{walletToDelete.channel_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {walletToDelete.currency_type}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Wallet Address:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {walletToDelete.wallet_address}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
              This action cannot be undone.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            startIcon={<Iconify icon="eva:trash-2-fill" />}
          >
            Delete Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
