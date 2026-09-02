import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { useTranslate } from 'src/locales/use-locales';

const GOLD = 'var(--ba-gold)';

const TRUST_ITEMS = [
  { key: 'auth.featureSecure', icon: 'solar:shield-check-bold-duotone' },
  { key: 'auth.featureFairPlay', icon: 'solar:cup-star-bold-duotone' },
  { key: 'auth.featureCashPrizes', icon: 'solar:wallet-money-bold-duotone' },
] as const;

type HeroTrustRowProps = {
  align?: 'center' | 'right';
};

/** Brand seal under hero copy — matches Player Pass auth trust row */
export function HeroTrustRow({ align = 'center' }: HeroTrustRowProps) {
  const { t } = useTranslate();

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      useFlexGap
      spacing={{ xs: 1.25, sm: 1.5 }}
      justifyContent={align === 'right' ? { xs: 'center', md: 'flex-end' } : 'center'}
      sx={{
        width: 1,
        pt: { xs: 0.75, md: 1 },
      }}
    >
      {TRUST_ITEMS.map((item) => (
        <Stack
          key={item.key}
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ minWidth: 0 }}
        >
          <Iconify icon={item.icon} width={14} sx={{ color: GOLD, flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: alpha('#ffffff', 0.5),
              whiteSpace: 'nowrap',
            }}
          >
            {t(item.key)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
