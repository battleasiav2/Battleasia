import { Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

import { AUTH_TEXT_MUTED } from './auth-form-styles';

const GOLD = '#f5c518';

type AuthTrustRowProps = {
  insideCard?: boolean;
};

export function AuthTrustRow({ insideCard }: AuthTrustRowProps) {
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
      sx={{ mt: insideCard ? 0 : 2.5, gap: { xs: 1.25, sm: 2 } }}
    >
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ minHeight: 22 }}
        >
          <Iconify icon={item.icon} width={14} sx={{ color: GOLD }} />
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: AUTH_TEXT_MUTED,
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
