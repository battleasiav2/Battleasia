import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import Iconify from 'src/components/iconify';

type ProfileSocialForm = {
  showMutualFollowers: boolean;
  showSuggestedFollows: boolean;
  showRecentFollows: boolean;
  autoSuggestEnabled: boolean;
  suggestedLimit: number;
  mutualFollowersLimit: number;
  recentFollowsLimit: number;
  pinnedUserIds: string[];
};

type UserOption = {
  id: string;
  label: string;
};

export function ProfileSocialSettingsView() {
  const { getProfileSocialSettingsApi, updateProfileSocialSettingsApi, getUsersApi } = useApi();
  const [form, setForm] = useState<ProfileSocialForm>({
    showMutualFollowers: true,
    showSuggestedFollows: true,
    showRecentFollows: true,
    autoSuggestEnabled: true,
    suggestedLimit: 8,
    mutualFollowersLimit: 3,
    recentFollowsLimit: 6,
    pinnedUserIds: [],
  });
  const [pinnedOptions, setPinnedOptions] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProfileSocialSettingsApi();
      const data = response?.data?.data;
      if (data) {
        setForm({
          showMutualFollowers: data.showMutualFollowers !== false,
          showSuggestedFollows: data.showSuggestedFollows !== false,
          showRecentFollows: data.showRecentFollows !== false,
          autoSuggestEnabled: data.autoSuggestEnabled !== false,
          suggestedLimit: Number(data.suggestedLimit) || 8,
          mutualFollowersLimit: Number(data.mutualFollowersLimit) || 3,
          recentFollowsLimit: Number(data.recentFollowsLimit) || 6,
          pinnedUserIds: Array.isArray(data.pinnedUserIds) ? data.pinnedUserIds : [],
        });
      }
    } catch {
      toast.error('Failed to load profile social settings');
    } finally {
      setLoading(false);
    }
  }, [getProfileSocialSettingsApi]);

  useEffect(() => {
    loadSettings().catch(() => undefined);
  }, [loadSettings]);

  useEffect(() => {
    if (!form.pinnedUserIds.length) {
      setPinnedOptions([]);
      return undefined;
    }

    (async () => {
      try {
        const response = await getUsersApi({ page: 1, limit: 50, search: '' });
        const users = response?.data?.data?.results || response?.data?.data || [];
        const mapped = (Array.isArray(users) ? users : [])
          .filter((user: any) => form.pinnedUserIds.includes(String(user._id || user.id)))
          .map((user: any) => ({
            id: String(user._id || user.id),
            label: user.username || user.email || user._id,
          }));
        setPinnedOptions(mapped);
      } catch {
        setPinnedOptions(form.pinnedUserIds.map((id) => ({ id, label: id })));
      }
    })().catch(() => undefined);

    return undefined;
  }, [form.pinnedUserIds, getUsersApi]);

  useEffect(() => {
    if (!userSearch.trim()) {
      setSearchOptions([]);
      return () => undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await getUsersApi({ page: 1, limit: 10, search: userSearch.trim() });
        const users = response?.data?.data?.results || response?.data?.data || [];
        setSearchOptions(
          (Array.isArray(users) ? users : []).map((user: any) => ({
            id: String(user._id || user.id),
            label: user.username || user.email || user._id,
          }))
        );
      } catch {
        setSearchOptions([]);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [getUsersApi, userSearch]);

  const selectedPinned = useMemo(
    () =>
      form.pinnedUserIds.map((id) => pinnedOptions.find((option) => option.id === id) || { id, label: id }),
    [form.pinnedUserIds, pinnedOptions]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileSocialSettingsApi(form);
      toast.success('Profile social settings saved');
      await loadSettings();
    } catch {
      toast.error('Failed to update profile social settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:users-group-rounded-bold" width={28} />
        <Typography variant="h4">Profile Social Settings</Typography>
      </Stack>

      <Alert severity="info">
        Control Instagram-style profile features: mutual followers, suggested follows, recent follows, and admin-pinned users.
      </Alert>

      <Card>
        <CardHeader title="Visibility" subheader="Toggle what players see on profile pages" />
        <CardContent>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.showMutualFollowers}
                  onChange={(e) => setForm((prev) => ({ ...prev, showMutualFollowers: e.target.checked }))}
                />
              }
              label="Show mutual followers (Followed by...)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.showSuggestedFollows}
                  onChange={(e) => setForm((prev) => ({ ...prev, showSuggestedFollows: e.target.checked }))}
                />
              }
              label="Show suggested follows on profiles"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.showRecentFollows}
                  onChange={(e) => setForm((prev) => ({ ...prev, showRecentFollows: e.target.checked }))}
                />
              }
              label="Show recent follows on profiles"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.autoSuggestEnabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, autoSuggestEnabled: e.target.checked }))}
                />
              }
              label="Auto-suggest users (friends of friends + popular)"
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Limits" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Suggested limit"
                value={form.suggestedLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, suggestedLimit: Number(e.target.value) || 8 }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Mutual followers preview limit"
                value={form.mutualFollowersLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, mutualFollowersLimit: Number(e.target.value) || 3 }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Recent follows limit"
                value={form.recentFollowsLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, recentFollowsLimit: Number(e.target.value) || 6 }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Pinned suggested users" subheader="These users appear first in suggestions" />
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              options={searchOptions}
              inputValue={userSearch}
              onInputChange={(_, value) => setUserSearch(value)}
              onChange={(_, option) => {
                if (!option) return;
                setForm((prev) =>
                  prev.pinnedUserIds.includes(option.id)
                    ? prev
                    : { ...prev, pinnedUserIds: [...prev.pinnedUserIds, option.id] }
                );
                setUserSearch('');
              }}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label="Search user to pin" placeholder="Username or email" />}
            />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedPinned.map((user) => (
                <Chip
                  key={user.id}
                  label={user.label}
                  onDelete={() =>
                    setForm((prev) => ({
                      ...prev,
                      pinnedUserIds: prev.pinnedUserIds.filter((id) => id !== user.id),
                    }))
                  }
                />
              ))}
              {selectedPinned.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pinned users yet
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
        <Divider />
        <CardContent>
          <Button
            variant="contained"
            onClick={() => {
              handleSave().catch(() => undefined);
            }}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save profile social settings'}
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}
