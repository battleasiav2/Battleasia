import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

const GOLD = '#f5c518';

export function AuthTrustRow() {
  const { t } = useTranslate();

  const items = [
    { icon: 'solar:shield-check-bold-duotone', label: t('auth.featureSecure') },
    { icon: 'solar:cup-star-bold-duotone', label: t('auth.featureFairPlay') },
    { icon: 'solar:wallet-money-bold-duotone', label: t('auth.featureCashPrizes') },
  ];

  return (
    <Stack
      direction="row"
      justifyContent="center"
      flexWrap="wrap"
      sx={{ mt: 1.5, gap: { xs: 0.75, sm: 1.25 } }}
    >
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ minHeight: 22 }}
        >
          <Iconify icon={item.icon} width={13} sx={{ color: GOLD }} />
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.2,
              color: alpha('#fff', 0.62),
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
