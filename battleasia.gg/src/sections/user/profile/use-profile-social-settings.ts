import { useCallback, useEffect, useState } from 'react';

import useApi from 'src/hooks/use-api';
import { mapProfileSocialSettings, type ProfileSocialSettings } from './profile-social-types';

let cachedSettings: ProfileSocialSettings | null = null;

export function useProfileSocialSettings() {
  const { getProfileSocialSettingsApi } = useApi();
  const [settings, setSettings] = useState<ProfileSocialSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProfileSocialSettingsApi();
      if (response?.data?.status && response.data.data) {
        const mapped = mapProfileSocialSettings(response.data.data);
        cachedSettings = mapped;
        setSettings(mapped);
      }
    } catch (error) {
      console.error('Failed to load profile social settings:', error);
    } finally {
      setLoading(false);
    }
  }, [getProfileSocialSettingsApi]);

  useEffect(() => {
    if (!cachedSettings) {
      void refresh();
    }
  }, [refresh]);

  return { settings, loading, refresh };
}
