import { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import Iconify from 'src/components/iconify';

type ProviderForm = {
  id: string;
  label: string;
  type: string;
  enabled: boolean;
  icon: string;
  color: string;
  url: string;
  openInNewTab: boolean;
};

type MessagingForm = {
  builtinEnabled: boolean;
  defaultProviderId: string;
  allowUserChoice: boolean;
  providers: ProviderForm[];
};

export function MessagingProviderSettingsView() {
  const { getMessagingSettingsApi, updateMessagingSettingsApi } = useApi();
  const [form, setForm] = useState<MessagingForm>({
    builtinEnabled: true,
    defaultProviderId: 'builtin',
    allowUserChoice: true,
    providers: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMessagingSettingsApi();
      const data = response?.data?.data;
      if (data) {
        setForm({
          builtinEnabled: data.builtinEnabled !== false,
          defaultProviderId: data.defaultProviderId || 'builtin',
          allowUserChoice: data.allowUserChoice !== false,
          providers: Array.isArray(data.providers) ? data.providers : [],
        });
      }
    } catch {
      toast.error('Failed to load messaging provider settings');
    } finally {
      setLoading(false);
    }
  }, [getMessagingSettingsApi]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const enabledProviders = form.providers.filter((p) => p.enabled && (p.type !== 'builtin' || form.builtinEnabled));

  const updateProvider = (index: number, key: keyof ProviderForm, value: string | boolean) => {
    setForm((prev) => {
      const next = [...prev.providers];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, providers: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateMessagingSettingsApi(form);
      if (response?.data?.status) {
        toast.success('Messaging provider settings updated');
        if (response.data.data) {
          setForm({
            builtinEnabled: response.data.data.builtinEnabled !== false,
            defaultProviderId: response.data.data.defaultProviderId || 'builtin',
            allowUserChoice: response.data.data.allowUserChoice !== false,
            providers: response.data.data.providers || [],
          });
        }
      } else {
        toast.error(response?.data?.message || 'Failed to update settings');
      }
    } catch {
      toast.error('Failed to update messaging provider settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Messaging Provider Settings"
          subheader="Control built-in DMs and external providers (WhatsApp, Telegram, etc.) shown on player profiles and Messages"
        />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              Players use the Message button on profiles and the Messages page. Enable built-in chat, external links, or let users pick a provider.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={form.builtinEnabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, builtinEnabled: e.target.checked }))}
                  disabled={loading}
                />
              }
              label="Enable built-in BattleAsia direct messages"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.allowUserChoice}
                  onChange={(e) => setForm((prev) => ({ ...prev, allowUserChoice: e.target.checked }))}
                  disabled={loading}
                />
              }
              label="Let players choose provider when multiple are enabled"
            />

            <FormControl fullWidth disabled={loading || enabledProviders.length === 0}>
              <InputLabel>Default provider</InputLabel>
              <Select
                label="Default provider"
                value={form.defaultProviderId}
                onChange={(e) => setForm((prev) => ({ ...prev, defaultProviderId: e.target.value }))}
              >
                {enabledProviders.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <Typography variant="h6">Providers</Typography>

            <Stack spacing={2}>
              {form.providers.map((provider, index) => (
                <Card key={provider.id} variant="outlined">
                  <CardContent>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography fontWeight={700}>{provider.label}</Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={provider.enabled}
                                onChange={(e) => updateProvider(index, 'enabled', e.target.checked)}
                                disabled={loading || provider.type === 'builtin'}
                              />
                            }
                            label={provider.enabled ? 'Enabled' : 'Disabled'}
                          />
                        </Stack>
                      </Grid>
                      {provider.type !== 'builtin' ? (
                        <>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Label"
                              value={provider.label}
                              onChange={(e) => updateProvider(index, 'label', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Icon (iconify)"
                              value={provider.icon}
                              onChange={(e) => updateProvider(index, 'icon', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Color"
                              value={provider.color}
                              onChange={(e) => updateProvider(index, 'color', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="URL"
                              value={provider.url}
                              onChange={(e) => updateProvider(index, 'url', e.target.value)}
                              helperText="Use {username} for player name if needed"
                            />
                          </Grid>
                        </>
                      ) : (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Built-in inbox at /user/messages — no external URL required.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save messaging settings'}
              </Button>
              <Button variant="outlined" onClick={loadSettings} disabled={loading || saving}>
                Reset
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
