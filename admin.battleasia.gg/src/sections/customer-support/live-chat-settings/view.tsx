import { useCallback, useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import Iconify from 'src/components/iconify';

type SocialLink = {
  label: string;
  icon: string;
  color: string;
  href: string;
};

type LiveChatForm = {
  enabled: boolean;
  agentName: string;
  agentTitle: string;
  agentAvatar: string;
  logoUrl: string;
  welcomeMessage: string;
  socialLinks: SocialLink[];
};

const EMPTY_LINK: SocialLink = {
  label: '',
  icon: 'mingcute:facebook-fill',
  color: '#f5c518',
  href: '',
};

export function LiveChatSettingsView() {
  const { getLiveChatSettingsApi, updateLiveChatSettingsApi } = useApi();
  const [form, setForm] = useState<LiveChatForm>({
    enabled: true,
    agentName: 'BattleAsia Support',
    agentTitle: 'Live Support',
    agentAvatar: '',
    logoUrl: '',
    welcomeMessage: 'Hi! How can we help you today?',
    socialLinks: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLiveChatSettingsApi();
      const data = response?.data?.data;
      if (data) {
        setForm({
          enabled: data.enabled !== false,
          agentName: data.agentName || '',
          agentTitle: data.agentTitle || '',
          agentAvatar: data.agentAvatar || '',
          logoUrl: data.logoUrl || '',
          welcomeMessage: data.welcomeMessage || '',
          socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
        });
      }
    } catch (error) {
      toast.error('Failed to load live chat settings');
    } finally {
      setLoading(false);
    }
  }, [getLiveChatSettingsApi]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = <K extends keyof LiveChatForm>(key: K, value: LiveChatForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocialLink = (index: number, key: keyof SocialLink, value: string) => {
    setForm((prev) => {
      const next = [...prev.socialLinks];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, socialLinks: next };
    });
  };

  const addSocialLink = () => {
    setForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { ...EMPTY_LINK }] }));
  };

  const removeSocialLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateLiveChatSettingsApi(form);
      if (response?.data?.status) {
        toast.success('Live chat settings updated');
        if (response?.data?.data) {
          setForm((prev) => ({ ...prev, ...response.data.data }));
        }
      } else {
        toast.error(response?.data?.message || 'Failed to update settings');
      }
    } catch {
      toast.error('Failed to update live chat settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Live Chat Widget Settings"
          subheader="Control floating chat logo, agent profile, welcome text, and social links shown on the website"
        />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              Changes apply to the floating live-chat box on the main site. Users chat here; admins reply from Customer Support conversations.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Enable live chat widget"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agent / people name"
                  value={form.agentName}
                  onChange={(e) => updateField('agentName', e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agent title"
                  value={form.agentTitle}
                  onChange={(e) => updateField('agentTitle', e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chat logo URL"
                  value={form.logoUrl}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  helperText="Shown in chat header (site logo or custom image)"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agent avatar URL"
                  value={form.agentAvatar}
                  onChange={(e) => updateField('agentAvatar', e.target.value)}
                  helperText="Optional — fallback if logo empty"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Welcome message"
                  value={form.welcomeMessage}
                  onChange={(e) => updateField('welcomeMessage', e.target.value)}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Social / contact links</Typography>
              <Button startIcon={<Iconify icon="mingcute:add-line" />} onClick={addSocialLink}>
                Add link
              </Button>
            </Stack>

            <Stack spacing={2}>
              {form.socialLinks.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No social links yet. Add Facebook, WhatsApp, etc.
                </Typography>
              )}
              {form.socialLinks.map((link, index) => (
                <Card key={`social-${index}`} variant="outlined">
                  <CardContent>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Label"
                          value={link.label}
                          onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Icon (iconify)"
                          value={link.icon}
                          onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                          placeholder="mingcute:facebook-fill"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Color"
                          value={link.color}
                          onChange={(e) => updateSocialLink(index, 'color', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="URL"
                          value={link.href}
                          onChange={(e) => updateSocialLink(index, 'href', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton color="error" onClick={() => removeSocialLink(index)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save live chat settings'}
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
