import { useEffect, useState } from 'react';

import useApi from 'src/hooks/use-api';
import { resolveAppDownloadHref } from 'src/utils/app-download-url';

export type AppDownloadState = {
  enabled: boolean;
  href: string;
  fileName: string;
  loading: boolean;
};

const DEFAULT_STATE: AppDownloadState = {
  enabled: false,
  href: '',
  fileName: 'BattleAsia.apk',
  loading: true,
};

export function useAppDownload() {
  const { getAppDownloadSettingsApi } = useApi();
  const [state, setState] = useState<AppDownloadState>(DEFAULT_STATE);

  useEffect(() => {
    let active = true;

    getAppDownloadSettingsApi()
      .then((response) => {
        if (!active) return;

        const data = response?.data?.data;
        if (data?.enabled && data?.downloadUrl) {
          setState({
            enabled: true,
            href: resolveAppDownloadHref(data.downloadUrl),
            fileName: data.fileName || 'BattleAsia.apk',
            loading: false,
          });
          return;
        }

        setState({ ...DEFAULT_STATE, loading: false });
      })
      .catch(() => {
        if (active) {
          setState({ ...DEFAULT_STATE, loading: false });
        }
      });

    return () => {
      active = false;
    };
  }, [getAppDownloadSettingsApi]);

  return state;
}
