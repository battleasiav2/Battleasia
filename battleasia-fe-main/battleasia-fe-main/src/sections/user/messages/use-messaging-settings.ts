import { useCallback, useEffect, useState } from 'react';

import useApi from 'src/hooks/use-api';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import {
  mapMessagingSettings,
  getActiveMessagingProviders,
  buildMessagingAction,
  openMessagingAction,
  type MessagingSettings,
} from './messaging-settings-utils';

// ----------------------------------------------------------------------

let cachedSettings: MessagingSettings | null = null;

export function useMessagingSettings() {
  const { getMessagingSettingsApi } = useApi();
  const [settings, setSettings] = useState<MessagingSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMessagingSettingsApi();
      if (response?.data?.status && response.data.data) {
        const mapped = mapMessagingSettings(response.data.data);
        cachedSettings = mapped;
        setSettings(mapped);
      }
    } catch (error) {
      console.error('Failed to load messaging settings:', error);
    } finally {
      setLoading(false);
    }
  }, [getMessagingSettingsApi]);

  useEffect(() => {
    if (!cachedSettings) {
      void refresh();
    }
  }, [refresh]);

  return {
    settings,
    loading,
    refresh,
    hasActiveMessaging: settings ? getActiveMessagingProviders(settings).length > 0 : false,
  };
}

export function useMessagingHandler() {
  const router = useRouter();
  const { settings, hasActiveMessaging } = useMessagingSettings();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerContext, setPickerContext] = useState<{ username?: string; userId?: string }>({});

  const startMessaging = useCallback(
    (options: { username?: string; userId?: string }) => {
      if (!settings) {
        if (options.userId) {
          router.push(paths.user.messagesWithUser(options.userId));
        } else {
          router.push(paths.user.messages);
        }
        return;
      }

      const active = getActiveMessagingProviders(settings);
      if (active.length === 0) return;

      if (settings.allowUserChoice && active.length > 1) {
        setPickerContext(options);
        setPickerOpen(true);
        return;
      }

      const action = buildMessagingAction(settings, options);
      if (!action) return;

      if (action.isBuiltin) {
        router.push(action.href);
        return;
      }

      openMessagingAction(action);
    },
    [router, settings]
  );

  const pickerProviders = settings ? getActiveMessagingProviders(settings) : [];

  const handleSelectBuiltin = useCallback(() => {
    if (pickerContext.userId) {
      router.push(paths.user.messagesWithUser(pickerContext.userId));
    } else {
      router.push(paths.user.messages);
    }
  }, [pickerContext.userId, router]);

  return {
    settings,
    hasActiveMessaging,
    startMessaging,
    pickerOpen,
    setPickerOpen,
    pickerProviders,
    pickerContext,
    handleSelectBuiltin,
  };
}
