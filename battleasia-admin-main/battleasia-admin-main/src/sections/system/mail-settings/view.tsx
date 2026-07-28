import { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';

type MailSettingsForm = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
};

const DEFAULT_FORM: MailSettingsForm = {
  enabled: false,
  smtpHost: '',
  smtpPort: 587,
  secure: false,
  smtpUser: '',
  smtpPass: '',
  fromName: 'BattleAsia',
  fromEmail: '',
};

export function MailSettingsView() {
  const { getMailSettingsApi, updateMailSettingsApi, sendTestMailApi } = useApi();
  const [form, setForm] = useState<MailSettingsForm>(DEFAULT_FORM);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMailSettingsApi();
      const data = response?.data?.data;
      if (data) {
        setForm({
          enabled: data.enabled === true,
          smtpHost: data.smtpHost || '',
          smtpPort: Number(data.smtpPort) || 587,
          secure: data.secure === true,
          smtpUser: data.smtpUser || '',
          smtpPass: data.smtpPass || '',
          fromName: data.fromName || 'BattleAsia',
          fromEmail: data.fromEmail || '',
        });
      }
    } catch {
      toast.error('Failed to load mail settings');
    } finally {
      setLoading(false);
    }
  }, [getMailSettingsApi]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = <K extends keyof MailSettingsForm>(key: K, value: MailSettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateMailSettingsApi(form);
      if (response?.data?.status) {
        toast.success('Mail settings updated');
        if (response?.data?.data) {
          setForm((prev) => ({ ...prev, ...response.data.data }));
        }
      } else {
        toast.error(response?.data?.message || 'Failed to update mail settings');
      }
    } catch {
      toast.error('Failed to update mail settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestMail = async () => {
    if (!testEmail.trim()) {
      toast.error('Enter a test email address');
      return;
    }

    setTesting(true);
    try {
      const response = await sendTestMailApi(testEmail.trim());
      if (response?.data?.status) {
        toast.success('Test email sent');
      } else {
        toast.error(response?.data?.message || 'Failed to send test email');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Mail Configuration"
          subheader="SMTP settings for registration, password reset, and admin OTP emails"
        />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              When enabled, verification codes and admin OTP emails are sent through SMTP. If sending fails,
              codes still appear in server logs when LOG_AUTH_CODES=true.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Enable outbound email"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP host"
                  value={form.smtpHost}
                  onChange={(e) => updateField('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="SMTP port"
                  value={form.smtpPort}
                  onChange={(e) => updateField('smtpPort', Number(e.target.value) || 587)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.secure}
                      onChange={(e) => updateField('secure', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Use SSL/TLS"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP username"
                  value={form.smtpUser}
                  onChange={(e) => updateField('smtpUser', e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="SMTP password"
                  value={form.smtpPass}
                  onChange={(e) => updateField('smtpPass', e.target.value)}
                  helperText="Leave ******** unchanged to keep current password"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From name"
                  value={form.fromName}
                  onChange={(e) => updateField('fromName', e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From email"
                  value={form.fromEmail}
                  onChange={(e) => updateField('fromEmail', e.target.value)}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save mail settings'}
              </Button>
              <Button variant="outlined" onClick={loadSettings} disabled={loading || saving}>
                Reset
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle1">Send test email</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Test recipient"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                />
                <Button variant="outlined" onClick={handleTestMail} disabled={testing || loading}>
                  {testing ? 'Sending...' : 'Send test'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
