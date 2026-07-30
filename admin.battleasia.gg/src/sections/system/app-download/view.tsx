import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';

type AppDownloadForm = {
  enabled: boolean;
  version: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  updatedAt: string | null;
};

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function AppDownloadSettingsView() {
  const { getAppDownloadSettingsApi, updateAppDownloadSettingsApi, uploadAppApkApi } = useApi();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<AppDownloadForm>({
    enabled: true,
    version: '',
    downloadUrl: '',
    fileName: 'BattleAsia.apk',
    fileSize: 0,
    updatedAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAppDownloadSettingsApi();
      const data = response?.data?.data;
      if (data) {
        setForm({
          enabled: data.enabled !== false,
          version: data.version || '',
          downloadUrl: data.downloadUrl || '',
          fileName: data.fileName || 'BattleAsia.apk',
          fileSize: Number(data.fileSize) || 0,
          updatedAt: data.updatedAt || null,
        });
      }
    } catch {
      toast.error('Failed to load app download settings');
    } finally {
      setLoading(false);
    }
  }, [getAppDownloadSettingsApi]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateAppDownloadSettingsApi({
        enabled: form.enabled,
        version: form.version,
      });
      if (response?.data?.status) {
        toast.success('App download settings updated');
        if (response?.data?.data) {
          setForm((prev) => ({ ...prev, ...response.data.data }));
        }
      } else {
        toast.error(response?.data?.message || 'Failed to update settings');
      }
    } catch {
      toast.error('Failed to update app download settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast.error('Please select an APK file');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAppApkApi(file, form.version);
      if (response?.data?.status) {
        toast.success('APK uploaded as BattleAsia.apk');
        if (response?.data?.data) {
          setForm((prev) => ({ ...prev, ...response.data.data, enabled: true }));
        } else {
          await loadSettings();
        }
      } else {
        toast.error(response?.data?.message || 'Failed to upload APK');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload APK');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Home APK Upload"
          subheader="Upload the Android app — any uploaded file is saved as BattleAsia.apk for the home page download button"
        />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              The logged-in user menu shows <strong>Download APK</strong> when enabled. Uploaded APK is stored at
              <strong> /uploads/app/BattleAsia.apk</strong>. Maximum upload size: 500 MB.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                  disabled={loading}
                />
              }
              label="Show download button on home page"
            />

            <TextField
              fullWidth
              label="App version"
              value={form.version}
              onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
              placeholder="1.0.0"
              disabled={loading}
            />

            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Current file: {form.fileName || 'BattleAsia.apk'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {formatBytes(form.fileSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated: {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : 'Not uploaded yet'}
              </Typography>
              {form.downloadUrl ? (
                <Typography variant="body2" color="text.secondary">
                  URL: {form.downloadUrl}
                </Typography>
              ) : null}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={() => fileInputRef.current?.click()} disabled={uploading || loading}>
                {uploading ? 'Uploading...' : 'Upload APK'}
              </Button>
              <Button variant="outlined" onClick={handleSave} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save settings'}
              </Button>
              <Button variant="text" onClick={loadSettings} disabled={loading || uploading}>
                Refresh
              </Button>
            </Stack>

            <input
              ref={fileInputRef}
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              hidden
              onChange={handleUpload}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
