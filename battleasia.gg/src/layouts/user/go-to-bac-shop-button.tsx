import type { SxProps, Theme } from '@mui/material/styles';

import { Box, Button } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { getBacShopEntryUrl } from 'src/sections/user/shop/shop-constants';

import { userSolidGoldButtonSx } from './user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const ctaPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 0 0 ${goldAlpha(0.55)},
      0 0 28px ${goldAlpha(0.55)},
      0 10px 28px ${alpha('#000000', 0.45)};
  }
  50% {
    box-shadow:
      0 0 0 10px ${goldAlpha(0)},
      0 0 40px ${goldAlpha(0.75)},
      0 12px 32px ${alpha('#000000', 0.5)};
  }
`;

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
      {!compact ? (
        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', sm: fullWidth ? 'none' : 'block' },
            position: 'absolute',
            inset: -10,
            borderRadius: 1,
            background: `radial-gradient(ellipse at center, ${goldAlpha(0.35)} 0%, transparent 70%)`,
            filter: 'blur(12px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ) : null}
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
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
            animation: disabled ? 'none' : `${ctaPulse} 2.2s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              boxShadow: `0 0 28px ${goldAlpha(0.55)}, 0 10px 28px ${alpha('#000000', 0.45)}`,
            },
            '&:hover': {
              animation: 'none',
              background: 'var(--ba-gold-light, #fbbf24) !important',
              boxShadow: `0 0 36px ${goldAlpha(0.7)}, 0 14px 32px ${alpha('#000000', 0.55)}`,
              transform: disabled ? 'none' : 'translateY(-2px)',
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
