import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import useApi from 'src/hooks/use-api';

type TransferSettings = {
  enabled: boolean;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
};

export function UserTransferSettingsView() {
  const { getTransferSettingsApi, updateTransferSettingsApi } = useApi();
  const [settings, setSettings] = useState<TransferSettings>({
    enabled: true,
    feePercent: 2,
    minAmount: 1,
    maxAmount: 10000,
  });
  const [loading, setLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const response = await getTransferSettingsApi();
      const data = response?.data?.transferSettings;
      if (data) {
        setSettings({
          enabled: data.enabled !== false,
          feePercent: Number(data.feePercent) || 0,
          minAmount: Number(data.minAmount) || 1,
          maxAmount: Number(data.maxAmount) || 10000,
        });
      }
    } catch (error) {
      console.error('Failed to fetch transfer settings:', error);
    }
  }, [getTransferSettingsApi]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async () => {
    if (settings.feePercent < 0 || settings.feePercent > 100) {
      toast.error('Fee percent must be between 0 and 100');
      return;
    }
    if (settings.minAmount <= 0 || settings.maxAmount <= 0 || settings.minAmount > settings.maxAmount) {
      toast.error('Check min/max transfer amounts');
      return;
    }

    setLoading(true);
    try {
      const response = await updateTransferSettingsApi(settings);
      if (response?.status === 200) {
        toast.success('Transfer settings updated successfully');
        loadSettings();
      } else {
        toast.error(response?.data?.message || 'Failed to update transfer settings');
      }
    } catch {
      toast.error('Failed to update transfer settings');
    } finally {
      setLoading(false);
    }
  }, [updateTransferSettingsApi, settings, loadSettings]);

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Coin Transfer Settings"
          subheader="Configure user-to-user BAC transfer fee and limits (Shop → Wallet tab)"
        />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              When a user sends BAC to another player, the fee is deducted from the sender on top of the
              transfer amount. Example: 100 BAC at 2% fee = 102 BAC deducted, recipient receives 100 BAC.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enable user-to-user transfers"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Transfer fee"
                  type="number"
                  value={settings.feePercent}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, feePercent: Number(e.target.value) }))
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Minimum amount"
                  type="number"
                  value={settings.minAmount}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, minAmount: Number(e.target.value) }))
                  }
                  InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Maximum amount"
                  type="number"
                  value={settings.maxAmount}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, maxAmount: Number(e.target.value) }))
                  }
                  InputProps={{ inputProps: { min: 1, step: 1 } }}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              Current fee: <strong>{settings.feePercent}%</strong> — sending 100 BAC costs the sender{' '}
              {(100 + (100 * settings.feePercent) / 100).toFixed(2)} BAC total.
            </Typography>

            <Button variant="outlined" onClick={updateSettings} disabled={loading}>
              {loading ? 'Updating…' : 'Update Transfer Settings'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
