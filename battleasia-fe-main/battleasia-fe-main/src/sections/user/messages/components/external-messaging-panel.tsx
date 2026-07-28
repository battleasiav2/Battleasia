import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import { USER_COLORS } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { UserActionButton } from 'src/layouts/user';

import type { MessagingProvider } from '../messaging-settings-utils';
import { resolveProviderUrl, openMessagingAction } from '../messaging-settings-utils';

// ----------------------------------------------------------------------

type ExternalMessagingPanelProps = {
  providers: MessagingProvider[];
  title: string;
  description: string;
  openLabel: string;
};

export function ExternalMessagingPanel({
  providers,
  title,
  description,
  openLabel,
}: ExternalMessagingPanelProps) {
  const externalProviders = providers.filter((provider) => provider.type !== 'builtin');

  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: { xs: 6, md: 8 }, px: 3, textAlign: 'center', minHeight: 360 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(USER_COLORS.gold, 0.1),
          border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
          color: USER_COLORS.gold,
        }}
      >
        <Iconify icon="solar:chat-round-dots-bold-duotone" width={36} />
      </Box>

      <Box>
        <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, color: USER_COLORS.textPrimary, textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 1, color: USER_COLORS.textMuted, maxWidth: 420, mx: 'auto' }}>{description}</Typography>
      </Box>

      {externalProviders.length > 0 ? (
        <Stack spacing={1.25} sx={{ width: '100%', maxWidth: 360, mt: 1 }}>
          {externalProviders.map((provider) => (
            <UserActionButton
              key={provider.id}
              actionVariant="mesh"
              fullWidth
              startIcon={<Iconify icon={provider.icon} width={18} sx={{ color: provider.color || USER_COLORS.gold }} />}
              onClick={() =>
                openMessagingAction({
                  provider,
                  href: resolveProviderUrl(provider),
                  isBuiltin: false,
                })
              }
              sx={{
                justifyContent: 'flex-start',
                borderColor: alpha(provider.color || USER_COLORS.gold, 0.35),
                '&:hover': { bgcolor: alpha(provider.color || USER_COLORS.gold, 0.08) },
              }}
            >
              {openLabel.replace('{{provider}}', provider.label)}
            </UserActionButton>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
