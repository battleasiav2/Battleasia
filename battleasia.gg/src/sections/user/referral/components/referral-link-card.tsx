import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, IconButton } from '@mui/material';

import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS, goldAlpha } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type ReferralLinkCardProps = {
  referralUrl: string;
  title: string;
  copiedLabel: string;
  copyLabel: string;
};

export function ReferralLinkCard({ referralUrl, title, copiedLabel, copyLabel }: ReferralLinkCardProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 2.5 }, height: 1 }}>
      <Typography
        className="font-tr"
        sx={{
          mb: 2,
          color: USER_COLORS.gold,
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>

      <Box sx={getGlassInnerSx(tokens, { p: { xs: 1.5, md: 2 } })}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography
            sx={{
              flex: 1,
              color: USER_COLORS.textPrimary,
              fontWeight: 500,
              fontSize: { xs: 12, md: 14 },
              wordBreak: 'break-all',
              userSelect: 'all',
              fontFamily: 'monospace',
              lineHeight: 1.5,
            }}
          >
            {referralUrl || 'Loading...'}
          </Typography>

          <IconButton
            onClick={handleCopy}
            aria-label={t('referral.copyReferralLinkAria')}
            sx={{
              flexShrink: 0,
              color: copied ? USER_COLORS.success : USER_COLORS.gold,
              bgcolor: goldAlpha(0.1),
              border: `1px solid ${goldAlpha(0.28)}`,
              '&:hover': { bgcolor: goldAlpha(0.18) },
            }}
          >
            <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={22} />
          </IconButton>
        </Stack>
      </Box>

      {copied ? (
        <Typography sx={{ mt: 1.25, textAlign: 'center', color: USER_COLORS.success, fontSize: 13, fontWeight: 600 }}>
          {copiedLabel}
        </Typography>
      ) : null}

      <UserActionButton
        actionVariant="gold"
        fullWidth
        startIcon={<Iconify icon="solar:copy-bold" width={18} />}
        onClick={handleCopy}
        disabled={!referralUrl}
        sx={{ mt: 2 }}
      >
        {copied ? copiedLabel : copyLabel}
      </UserActionButton>
    </UserGlassCard>
  );
}
