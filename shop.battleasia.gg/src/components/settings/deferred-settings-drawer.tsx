import { lazy, Suspense } from 'react';

import { useSettingsContext } from './context/use-settings-context';

import type { SettingsDrawerProps } from './types';

// ----------------------------------------------------------------------

const SettingsDrawerLazy = lazy(() =>
  import('./drawer/settings-drawer').then((m) => ({ default: m.SettingsDrawer }))
);

/**
 * Mount settings UI only when the drawer is open — keeps settings JS off first paint.
 */
export function DeferredSettingsDrawer({ defaultSettings, sx }: SettingsDrawerProps) {
  const settings = useSettingsContext();
  const open = settings.openDrawer;

  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <SettingsDrawerLazy defaultSettings={defaultSettings} sx={sx} />
    </Suspense>
  );
}
