import type { SxProps, Theme } from '@mui/material/styles';

import { Box, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { getBacShopEntryUrl } from 'src/sections/user/shop/shop-constants';

import { userSolidGoldButtonSx } from './user-theme';

// ----------------------------------------------------------------------

export type GoToBacShopButtonProps = {
  /** Override label (default: shop.goToBacShop) */
  label?: string;
  href?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Compact for sidebar / header */
  size?: 'default' | 'compact';
  sx?: SxProps<Theme>;
};

/** Shared solid-gold “Go to BAC Shop” CTA — one style everywhere. */
export function GoToBacShopButton({
  label,
  href,
  fullWidth = false,
  disabled = false,
  size = 'default',
  sx,
}: GoToBacShopButtonProps) {
  const { t } = useTranslate();
  const shopHref = href || getBacShopEntryUrl();
  const buttonLabel = label || t('shop.goToBacShop');
  const compact = size === 'compact';

  return (
    <Box
      sx={{
        position: 'relative',
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? 1 : { xs: '100%', sm: 'auto' },
      }}
    >
      <Button
        component="a"
        href={disabled ? undefined : shopHref}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        disableElevation
        disabled={disabled}
        startIcon={<Iconify icon="solar:shop-bold" width={compact ? 18 : 22} />}
        endIcon={!disabled ? <Iconify icon="solar:arrow-right-up-bold" width={compact ? 16 : 20} /> : undefined}
        sx={[
          userSolidGoldButtonSx,
          {
            position: 'relative',
            zIndex: 1,
            width: fullWidth ? 1 : { xs: '100%', sm: 'auto' },
            minHeight: compact ? 44 : { xs: 52, md: 56 },
            height: compact ? 44 : { xs: 52, md: 56 },
            px: compact ? 1.75 : { xs: 3.25, md: 4.5 },
            fontSize: compact ? 12 : { xs: 14, sm: 15.5 },
            fontWeight: 900,
            letterSpacing: compact ? 0.6 : 1.1,
            whiteSpace: 'nowrap',
            clipPath: 'none',
            animation: 'none',
            boxShadow: 'none',
            '&:hover': {
              animation: 'none',
              background: 'var(--ba-gold-light, #fbbf24) !important',
              boxShadow: 'none',
              transform: 'none',
            },
            '&.Mui-disabled': {
              background: `${alpha('#ffffff', 0.12)} !important`,
              color: `${alpha('#ffffff', 0.4)} !important`,
              borderColor: alpha('#ffffff', 0.15),
              boxShadow: 'none',
            },
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
}
