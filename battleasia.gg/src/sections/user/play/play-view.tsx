import { useState, useEffect, useMemo } from 'react';

import { Box, Stack, Typography, Grid2 as Grid } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import useApi from 'src/hooks/use-api';

import { CONFIG } from 'src/global-config';
import { useImagePreloader } from 'src/hooks';
import { useTranslate } from 'src/locales/use-locales';
import { UserPageShell, UserEmptyState } from 'src/layouts/user';
import { USER_COLORS } from 'src/layouts/user/user-theme';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { ScrollReveal } from 'src/components/animate';

import type { PublicDashboardStats } from 'src/types';

import { GameCard, PlayArenaHero, PlayPageSkeleton } from './components';
import { PLAY_IMAGE_PATHS, resolvePlayGameArt, sortGamesForArena } from './play-constants';

// Re-export for backward compatibility
export { PLAY_IMAGE_PATHS } from './play-constants';

// ----------------------------------------------------------------------

const imagePaths = [PLAY_IMAGE_PATHS.heroBanner];

const GAMES_ANCHOR_ID = 'play-games';

interface IGame {
  id: string;
  name: string;
  packageName: string;
  image: string;
  logo: string;
  canCreateChallenge: boolean;
  comingSoon: boolean;
  idPrefix: string;
  rules: string;
}

export function PlayView() {
  const { t } = useTranslate();
  const router = useRouter();
  const { getGamesApi } = useApi();
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchCounts, setMatchCounts] = useState<Pick<PublicDashboardStats, 'liveCountByGame' | 'upcomingCountByGame'>>({});

  const { isLoaded } = useImagePreloader(imagePaths, {
    delay: 300,
    continueOnError: true,
  });

  const fetchMatchCounts = async () => {
    try {
      const res = await fetch(`${CONFIG.serverUrl}/api/v3/public/dashboard`);
      if (!res.ok) return;
      const json = await res.json();
      const data = json?.data ?? json;
      setMatchCounts({
        liveCountByGame: data?.liveCountByGame,
        upcomingCountByGame: data?.upcomingCountByGame,
      });
    } catch {
      // Non-blocking — cards still render without counts
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await getGamesApi();
      if (res?.data?.status) {
        setGames(sortGamesForArena<IGame>(res.data.data));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchMatchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countsByGameName = useMemo(
    () => ({
      live: matchCounts.liveCountByGame ?? {},
      upcoming: matchCounts.upcomingCountByGame ?? {},
    }),
    [matchCounts]
  );

  const handleGameClick = (gameId: string | number) => {
    router.push(paths.user.playDetail(gameId));
  };

  const handleWatchLive = () => {
    window.open('https://www.youtube.com/@BattleAsia', '_blank');
  };

  const handleBrowseGames = () => {
    document.getElementById(GAMES_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeGames = games.filter((g) => !g.comingSoon).length;
  const upcomingGames = games.filter((g) => g.comingSoon).length;
  const isPageLoading = !isLoaded || loading;

  return (
    <UserPageShell>
      <PlayArenaHero
        badge={t('play.badgeTournamentHub')}
        title={t('play.battleasia')}
        description={t('play.bannerDescription')}
        imageUrl={PLAY_IMAGE_PATHS.heroBanner}
        liveLabel={t('play.watchLive')}
        primaryLabel={t('play.watchLive')}
        secondaryLabel={t('play.tournament')}
        onPrimary={handleWatchLive}
        onSecondary={handleBrowseGames}
        stats={[
          { label: t('play.totalGames'), value: games.length },
          { label: t('play.playableNow'), value: activeGames },
          { label: t('common.comingSoon'), value: upcomingGames },
        ]}
      />

      {isPageLoading ? (
        <PlayPageSkeleton />
      ) : (
        <ScrollReveal preset="cinematic">
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Box id={GAMES_ANCHOR_ID} sx={{ scrollMarginTop: { xs: 90, md: 110 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 2.5 }}
              >
                <Box>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 22, md: 28 },
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: USER_COLORS.textPrimary,
                      letterSpacing: 0.5,
                    }}
                  >
                    {t('play.tournament')}
                  </Typography>
                  <BattleGoldDivider variant="section" sx={{ mt: 0.75, width: 120 }} />
                </Box>
                <Typography sx={{ fontSize: 13, color: USER_COLORS.textMuted }}>
                  {t('play.selectTitleHint')}
                </Typography>
              </Stack>

              {games.length === 0 ? (
                <UserEmptyState
                  icon="solar:gamepad-bold-duotone"
                  title={t('play.noGames')}
                  description={t('play.noGamesDescription')}
                  actionLabel={t('common.refresh')}
                  onAction={fetchGames}
                />
              ) : (
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                  {games.map((game) => (
                    <Grid key={game.id} size={{ xs: 6, sm: 4, md: 2.4 }}>
                      <GameCard
                        title={game.name}
                        subTitle={game.packageName || game.idPrefix}
                        logo={resolvePlayGameArt(game, 'logo')}
                        imageUrl={resolvePlayGameArt(game, 'image')}
                        comingSoon={game.comingSoon}
                        disabled={game.comingSoon}
                        liveCount={countsByGameName.live[game.name] ?? 0}
                        upcomingCount={countsByGameName.upcoming[game.name] ?? 0}
                        liveLabel={t('play.liveGames')}
                        upcomingLabel={t('play.upcomingGames')}
                        onClick={() => handleGameClick(game.id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Stack>
        </ScrollReveal>
      )}
    </UserPageShell>
  );
}
