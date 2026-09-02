import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';
import { USER_COLORS, goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

export type FeedHubSection = 'feed' | 'explore' | 'reels' | 'saved' | 'messages';

type FeedHubTabsProps = {
  active: FeedHubSection;
  onChange: (section: FeedHubSection) => void;
};

export function FeedHubTabs({ active, onChange }: FeedHubTabsProps) {
  const { t } = useTranslate();

  const tabs: Array<{ value: FeedHubSection; label: string; icon: string }> = [
    { value: 'feed', label: t('feed.title'), icon: 'solar:home-2-bold' },
    { value: 'explore', label: t('explore.title'), icon: 'solar:magnifer-bold' },
    { value: 'reels', label: t('reels.title'), icon: 'solar:clapperboard-play-bold' },
    { value: 'saved', label: t('saved.title'), icon: 'solar:bookmark-bold' },
    { value: 'messages', label: t('messages.title'), icon: 'solar:chat-round-dots-bold' },
  ];

  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: 64, md: 72 },
        zIndex: 11,
        mx: { xs: -2, sm: -3, md: -5 },
        px: { xs: 1, sm: 2, md: 5 },
        py: 0.5,
        bgcolor: alpha('#000000', 0.9),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${goldAlpha(0.22)}`,
        boxShadow: `0 10px 28px ${alpha('#000000', 0.45)}`,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          maxWidth: 720,
          mx: 'auto',
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <Box
              key={tab.value}
              onClick={() => onChange(tab.value)}
              sx={{
                flex: 1,
                minWidth: { xs: 64, sm: 88 },
                py: 1.25,
                px: 0.5,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                borderBottom: `2px solid ${isActive ? USER_COLORS.gold : 'transparent'}`,
                color: isActive ? USER_COLORS.gold : alpha('#ffffff', 0.5),
                transition: 'color 0.2s ease, border-color 0.2s ease',
                '&:hover': { color: isActive ? USER_COLORS.gold : alpha('#ffffff', 0.78) },
              }}
            >
              <Iconify icon={tab.icon} width={22} />
              <Typography
                sx={{
                  fontSize: { xs: 9, sm: 10 },
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export function parseFeedHubSection(value: string | null): FeedHubSection {
  if (value === 'explore' || value === 'reels' || value === 'saved' || value === 'messages') {
    return value;
  }
  return 'feed';
}
