import type { ReactNode } from 'react';

import { GlassStatTile, getDefaultGlassTokens } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type UserStatTileProps = {
  label: string;
  value: ReactNode;
  suffix?: string;
  icon?: string;
  loading?: boolean;
};

export function UserStatTile({ label, value, suffix, icon, loading }: UserStatTileProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <GlassStatTile
      label={label}
      value={value}
      suffix={suffix}
      icon={icon}
      loading={loading}
      tokens={tokens}
    />
  );
}
