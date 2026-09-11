import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, IconButton } from '@mui/material';

import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  goldAlpha,
} from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type ReferralCodeCardProps = {
  referralCode: string;
  referralUrl: string;
};

export function ReferralCodeCard({ referralCode, referralUrl }: ReferralCodeCardProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);

  const handleCopy = async (value: string, field: 'code' | 'link') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <UserGlassCard sx={{ p: { xs: 1.5, md: 2 }, height: 1 }}>
      <Typography
        className="font-tr"
        sx={{
          mb: 1.25,
          color: USER_COLORS.gold,
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {t('referral.yourReferralCode')}
      </Typography>

      <Stack spacing={1}>
        <Box sx={getGlassInnerSx(tokens, { p: { xs: 1.25, md: 1.5 } })}>
          <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, mb: 0.5, textTransform: 'uppercase' }}>
            {t('referral.yourCode')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              sx={{
                flex: 1,
                color: USER_COLORS.gold,
                fontWeight: 800,
                fontSize: { xs: 16, md: 20 },
                letterSpacing: 1.2,
                fontFamily: 'monospace',
              }}
            >
              {referralCode || '—'}
            </Typography>
            <IconButton
              onClick={() => handleCopy(referralCode, 'code')}
              aria-label={t('referral.copyCode')}
              sx={{
                color: copiedField === 'code' ? USER_COLORS.success : USER_COLORS.gold,
                bgcolor: goldAlpha(0.1),
                border: `1px solid ${goldAlpha(0.28)}`,
              }}
            >
              <Iconify icon={copiedField === 'code' ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={20} />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={getGlassInnerSx(tokens, { p: { xs: 1.25, md: 1.5 } })}>
          <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, mb: 0.5, textTransform: 'uppercase' }}>
            {t('referral.yourReferralLink')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              sx={{
                flex: 1,
                color: USER_COLORS.textPrimary,
                fontSize: { xs: 12, md: 13 },
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {referralUrl || '—'}
            </Typography>
            <IconButton
              onClick={() => handleCopy(referralUrl, 'link')}
              aria-label={t('referral.copyReferralLinkAria')}
              sx={{
                color: copiedField === 'link' ? USER_COLORS.success : USER_COLORS.gold,
                bgcolor: goldAlpha(0.1),
                border: `1px solid ${goldAlpha(0.28)}`,
              }}
            >
              <Iconify icon={copiedField === 'link' ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={20} />
            </IconButton>
          </Stack>
        </Box>
      </Stack>

      <UserActionButton
        actionVariant="gold"
        fullWidth
        startIcon={<Iconify icon="solar:copy-bold" width={18} />}
        onClick={() => handleCopy(referralUrl, 'link')}
        disabled={!referralUrl}
        sx={{ mt: 1.25 }}
      >
        {copiedField === 'link' ? t('referral.copiedToClipboard') : t('referral.copyCode')}
      </UserActionButton>
    </UserGlassCard>
  );
}
