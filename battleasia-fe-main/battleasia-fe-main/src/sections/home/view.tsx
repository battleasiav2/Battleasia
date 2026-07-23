

import { Box, Grid, Stack, SvgIcon, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useImagePreloader } from 'src/hooks';

import { Image } from 'src/components/image';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { HeroMeshButtons } from 'src/components/mesh-buttons';
import {
  GlassPanelCard,
  GlassStatTile,
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassInnerSx,
  GLASS_CARD_RADIUS,
} from 'src/components/battle-glass-card';
import { LandingDashboardSection } from './dashboard-widgets';
import { PlayYourGameSection, PLAY_YOUR_GAME_IMAGE_PATHS } from './play-your-game-section';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

const HOME_IMAGE_PATHS = {
  banner: '/assets/images/hero-banner-pubg.webp',
  aboutBg: '/assets/images/about-pubg-black.webp',
  howToPlayBg: '/assets/images/about-pubg-black.webp',
  rulesBg: '/assets/images/dashboard-pubg-black.webp',
  sBg: '/assets/images/s-bg.webp',
  gsBg: '/assets/images/gs-bg.webp',
  gsTop: '/assets/images/gs-top.webp',
  spr: '/assets/images/spr.webp',
  gameUiBg: '/assets/images/game-ui-bg.webp',
  blackBg: '/assets/images/black_bg.webp',
  dealer: '/assets/images/dealer.webp',
} as const;

// ----------------------------------------------------------------------
const imagePaths = [HOME_IMAGE_PATHS.banner];

export function HomeView() {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  useImagePreloader(imagePaths, {
    delay: 100,
    continueOnError: true,
  }); 

  const FAQ = [
    {
      question: t('home.faq.noHacks'),
      answer: t('home.faq.noHacksAnswer')
    },
    {
      question: t('home.faq.matchJoinTime'),
      answer: t('home.faq.matchJoinTimeAnswer')
    },
    {
      question: t('home.faq.nameMustMatch'),
      answer: t('home.faq.nameMustMatchAnswer')
    },
    {
      question: t('home.faq.killPrizeClaims'),
      answer: t('home.faq.killPrizeClaimsAnswer')
    },
    {
      question: t('home.faq.noTeaming'),
      answer: t('home.faq.noTeamingAnswer')
    },
    {
      question: t('home.faq.paymentRules'),
      answer: t('home.faq.paymentRulesAnswer')
    },
    {
      question: t('home.faq.disconnectNoRefund'),
      answer: t('home.faq.disconnectNoRefundAnswer')
    },
    {
      question: t('home.faq.abusiveBehaviour'),
      answer: t('home.faq.abusiveBehaviourAnswer')
    },
    {
      question: t('home.faq.prizeDistribution'),
      answer: t('home.faq.prizeDistributionAnswer')
    },
    {
      question: t('home.faq.finalDecision'),
      answer: t('home.faq.finalDecisionAnswer')
    },
  ];

  const sectionSlide = (
    <Box id="home" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      height: { xs: 500, sm: 720, md: 892 },
      bgcolor: '#000000',
      backgroundImage: `url(${HOME_IMAGE_PATHS.banner})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1,
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(0,0,0,0.75) 100%)',
        zIndex: 1,
      },
    }}>
      <Stack sx={{
        position: 'absolute',
        top: { xs: '20%', sm: '26%', md: '30%' },
        right: { xs: '4%', sm: '6%', md: '8%' },
        left: { xs: '4%', sm: 'auto' },
        maxWidth: { xs: '92%', sm: 520, md: 580 },
        zIndex: 2,
      }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: alpha('#f5c518', 0.9),
            mb: 1.5,
          }}
        >
          {t('common.brandTagline')}
        </Typography>
        <Typography
          className='font-tr'
          sx={{
            fontSize: { xs: 26, sm: 34, md: 50, lg: 58 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.08,
            mb: { xs: 1.25, sm: 2 },
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.85)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            letterSpacing: { md: 0.5 },
          }}
        >
          {t('home.title')}
        </Typography>
        <Typography
          className='font-tr'
          sx={{
            fontSize: { xs: 14, sm: 18, md: 26 },
            color: alpha('#ffffff', 0.88),
            lineHeight: { xs: 1.35, sm: 1.25 },
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: 520,
          }}
        >
          {t('home.subtitle')}
        </Typography>
        <BattleGoldDivider variant="hero" />
      </Stack>

      <Stack sx={{
        width: 1,
        bottom: { xs: 36, sm: 48, md: 64 },
        position: 'absolute',
        alignItems: 'center',
        px: 2,
        zIndex: 2,
      }} >
        <HeroMeshButtons
          joinLabel={t('home.joinTournament')}
          downloadLabel={t('home.downloadApkButton')}
        />
      </Stack>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(180deg, transparent, #000000)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );

  const sectionAbout = (
    <Box id="about-us" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      position: 'relative',
      overflow: 'hidden',
      py: { xs: 4, md: 5 },
      bgcolor: '#000000',
      '&::before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${HOME_IMAGE_PATHS.aboutBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${alpha('#000000', 0.62)} 0%, ${alpha('#000000', 0.42)} 50%, ${alpha('#000000', 0.78)} 100%)`,
        zIndex: 0,
      },
    }}>
      <Stack sx={{
        position: 'relative',
        zIndex: 1,
        width: { xs: 1, lg: 1129 },
        maxWidth: '100%',
        margin: '0 auto',
        px: { xs: 2, sm: 4, md: 5 },
        alignItems: 'center',
      }} >
        <Stack sx={{ alignItems: 'center', mb: { xs: 2, md: 3 } }}>
          <Typography
            variant='h2'
            className='font-tr'
            sx={{
              fontSize: { xs: 24, sm: 32, md: 48 },
              fontWeight: 'bold',
              textAlign: 'center',
              color: glassTokens.titleColor,
              wordBreak: 'break-word',
            }}
          >
            {t('home.aboutBattleAsia')}
          </Typography>
          <BattleGoldDivider variant="hero" sx={{ mt: 1.5, width: { xs: 150, sm: 200 } }} />
        </Stack>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ width: 1 }}>
          <Grid item xs={12} md={7}>
            <GlassPanelCard sx={{ height: '100%', textAlign: 'left' }}>
              <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
                <Typography className="font-tr" sx={{ fontSize: { xs: 13, sm: 15, md: 18 }, lineHeight: 1.7, color: glassTokens.subtitleColor }}>
                  {t('home.aboutDescription1')}
                </Typography>
                <Typography className="font-tr" sx={{ fontSize: { xs: 13, sm: 15, md: 18 }, lineHeight: 1.7, color: glassTokens.subtitleColor }}>
                  {t('home.aboutDescription2')}
                </Typography>
                <Typography className="font-tr" sx={{ fontSize: { xs: 13, sm: 15, md: 18 }, lineHeight: 1.7, color: glassTokens.subtitleColor }}>
                  {t('home.aboutDescription3')}
                </Typography>
              </Stack>
            </GlassPanelCard>
          </Grid>

          <Grid item xs={12} md={5}>
            <Grid container spacing={{ xs: 1.25, sm: 2 }}>
              {[
                { value: '500K+', label: t('home.stats.activePlayers') },
                { value: '$2M+', label: t('home.stats.prizeMoney') },
                { value: '15+', label: t('home.stats.gamesSupported') },
                { value: '24/7', label: t('home.stats.tournaments') },
              ].map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <GlassStatTile
                    label={stat.label}
                    value={stat.value}
                    tokens={glassTokens}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )

  const gameModes = [
    {
      title: t('home.gameModes.solo.title'),
      description: t('home.gameModes.solo.description'),
      iconType: 'svg',
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      iconColor: '#9333ea',
      shadowColor: 'rgba(147, 51, 234, 0.3)',
      hoverShadowColor: 'rgba(147, 51, 234, 0.5)',
      features: [
        { iconPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', text: t('home.gameModes.solo.feature1') },
        { iconPath: 'M15.5 12c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5zm-2.5-8c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-1 15l-5-5 1.41-1.41L12 16.17l4.59-4.58L18 13l-6 6z', text: t('home.gameModes.solo.feature2') },
        { iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', text: t('home.gameModes.solo.feature3') },
        { iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', text: t('home.gameModes.solo.feature4') },
      ],
    },
    {
      title: t('home.gameModes.duo.title'),
      description: t('home.gameModes.duo.description'),
      iconType: 'dual-svg',
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      iconColor: '#9333ea',
      shadowColor: 'rgba(147, 51, 234, 0.3)',
      hoverShadowColor: 'rgba(147, 51, 234, 0.5)',
      features: [
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.duo.feature1') },
        { iconPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', text: t('home.gameModes.duo.feature2') },
        { iconPath: 'M20 12v-1c0-.6-.4-1-1-1h-3V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v4H1c-.6 0-1 .4-1 1v1c0 1.1.9 2 2 2h1v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4h1c1.1 0 2-.9 2-2zm-6 8H6v-4h8v4zm-8-8V6h8v6H6zm14 0h-1v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2V9c0-.6-.4-1-1-1s-1 .4-1 1v3h3c1.1 0 2 .9 2 2v2h2v-2c0-1.1.9-2 2-2h3z', text: t('home.gameModes.duo.feature3') },
        { iconPath: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', text: t('home.gameModes.duo.feature4') },
      ],
    },
    {
      title: t('home.gameModes.squad.title'),
      description: t('home.gameModes.squad.description'),
      iconType: 'emoji',
      iconEmoji: '👥',
      iconColor: '#ff8c00',
      shadowColor: 'rgba(255, 140, 0, 0.3)',
      hoverShadowColor: 'rgba(255, 140, 0, 0.5)',
      features: [
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.squad.feature1') },
        { iconPath: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', text: t('home.gameModes.squad.feature2') },
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.squad.feature3') },
        { iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', text: t('home.gameModes.squad.feature4') },
      ],
    },
    {
      title: t('home.gameModes.tdm.title'),
      description: t('home.gameModes.tdm.description'),
      iconType: 'svg',
      iconPath: 'M7.05 2.05L5 12h3v7l8-14h-4l2-3z',
      iconColor: '#ff8c00',
      shadowColor: 'rgba(255, 140, 0, 0.3)',
      hoverShadowColor: 'rgba(255, 140, 0, 0.5)',
      features: [
        { iconPath: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z', text: t('home.gameModes.tdm.feature1') },
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.tdm.feature2') },
        { iconPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', text: t('home.gameModes.tdm.feature3') },
        { iconPath: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z', text: t('home.gameModes.tdm.feature4') },
      ],
    },
  ];

  const sectionHowToPlay = (
    <Box id="how-to-play" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      position: 'relative',
      overflow: 'hidden',
      py: { xs: 4, md: 5 },
      bgcolor: '#000000',
      '&::before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${HOME_IMAGE_PATHS.howToPlayBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${alpha('#000000', 0.72)} 0%, ${alpha('#000000', 0.5)} 50%, ${alpha('#000000', 0.82)} 100%)`,
        zIndex: 0,
      },
    }}>
      <Stack sx={{
        position: 'relative',
        zIndex: 1,
        maxWidth: { xs: 1, md: 1200 },
        margin: '0 auto',
        px: { xs: 2, md: 4 },
      }}>
        <Stack sx={{ alignItems: 'center', mb: { xs: 2.5, md: 3.5 } }}>
          <Typography
            variant='h2'
            className='font-tr'
            sx={{
              fontSize: { xs: 24, sm: 36, md: 48 },
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              color: glassTokens.titleColor,
              mb: 1,
              wordBreak: 'break-word',
            }}
          >
            {t('home.howToPlay')}
          </Typography>
          <BattleGoldDivider variant="section" />
        </Stack>

        <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          {gameModes.map((mode, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Box
                sx={getGlassShellSx(glassTokens, {
                  p: { xs: 2, md: 3 },
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 20px 50px ${alpha('#000000', 0.65)}, inset 0 1px 0 ${alpha('#ffffff', 0.16)}`,
                  },
                })}
              >
                <Box sx={{ mb: { xs: 1, sm: 2.5 }, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 56, sm: 72 },
                      height: { xs: 56, sm: 72 },
                      borderRadius: `${GLASS_CARD_RADIUS}px`,
                      bgcolor: alpha('#000000', 0.35),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${alpha('#ffffff', 0.14)}`,
                      boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.12)}`,
                      position: mode.iconType === 'dual-svg' ? 'relative' : 'static',
                    }}
                  >
                    {mode.iconType === 'emoji' ? (
                      <Typography sx={{ fontSize: { xs: 36, sm: 50 } }}>{mode.iconEmoji}</Typography>
                    ) : mode.iconType === 'dual-svg' ? (
                      <>
                        <SvgIcon sx={{ fontSize: { xs: 28, sm: 40 }, color: mode.iconColor, position: 'absolute', left: { xs: 4, sm: 8 } }}>
                          <path d={mode.iconPath} />
                        </SvgIcon>
                        <SvgIcon sx={{ fontSize: { xs: 28, sm: 40 }, color: mode.iconColor, position: 'absolute', right: { xs: 4, sm: 8 } }}>
                          <path d={mode.iconPath} />
                        </SvgIcon>
                      </>
                    ) : (
                      <SvgIcon sx={{ fontSize: { xs: 36, sm: 50 }, color: mode.iconColor }}>
                        <path d={mode.iconPath} />
                      </SvgIcon>
                    )}
                  </Box>
                </Box>

                <Typography
                  className='font-tr'
                  sx={{
                    fontSize: { xs: 18, sm: 24, md: 28 },
                    fontWeight: 'bold',
                    color: glassTokens.titleColor,
                    mb: { xs: 0.5, sm: 1.25 },
                    wordBreak: 'break-word',
                  }}
                >
                  {mode.title}
                </Typography>

                <Typography
                  className='font-tr'
                  sx={{
                    fontSize: { xs: 12, sm: 14, md: 15 },
                    color: glassTokens.subtitleColor,
                    mb: { xs: 1.5, sm: 2.5 },
                    lineHeight: 1.5,
                  }}
                >
                  {mode.description}
                </Typography>

                <Stack spacing={{ xs: 0.75, sm: 1.5 }} sx={{ alignItems: 'flex-start', textAlign: 'left', mt: 'auto' }}>
                  {mode.features.map((feature, featureIndex) => (
                    <Stack key={featureIndex} direction="row" spacing={1} alignItems="flex-start">
                      <SvgIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: glassTokens.stat.suffixColor, flexShrink: 0, mt: 0.25 }}>
                        <path d={feature.iconPath} />
                      </SvgIcon>
                      <Typography className='font-tr' sx={{ fontSize: { xs: 11, sm: 13 }, color: glassTokens.stat.labelColor, lineHeight: 1.4 }}>
                        {feature.text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );

  const sectionRoules = (
    <Box id="rules" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      position: 'relative',
      overflow: 'hidden',
      py: { xs: 4, md: 5 },
      bgcolor: '#000000',
      '&::before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${HOME_IMAGE_PATHS.rulesBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${alpha('#000000', 0.68)} 0%, ${alpha('#000000', 0.48)} 50%, ${alpha('#000000', 0.8)} 100%)`,
        zIndex: 0,
      },
    }}>
      <Stack sx={{
        position: 'relative',
        zIndex: 1,
        maxWidth: { xs: 1, sm: 980 },
        margin: '0 auto',
        px: { xs: 2, sm: 3 },
      }}>
        <Stack sx={{ alignItems: 'center', mb: { xs: 2, md: 3 } }}>
          <Typography
            variant='h2'
            className='font-tr'
            sx={{
              fontSize: { xs: 22, sm: 32, md: 42 },
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              color: glassTokens.titleColor,
              mb: 1,
              wordBreak: 'break-word',
            }}
          >
            {t('home.tournamentRules')}
          </Typography>
          <Typography
            className='font-tr'
            sx={{
              fontSize: { xs: 13, sm: 16, md: 20 },
              color: glassTokens.subtitleColor,
              textAlign: 'center',
            }}
          >
            {t('home.officialRegulations')}
          </Typography>
          <BattleGoldDivider variant="section" sx={{ mt: 1.5 }} />
        </Stack>

        <GlassPanelCard>
          <Stack spacing={1.25}>
            {FAQ.map((faq, index) => (
              <Accordion
                key={index}
                disableGutters
                elevation={0}
                sx={{
                  ...getGlassInnerSx(glassTokens, {
                    p: 0,
                    overflow: 'hidden',
                  }),
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: 0,
                    bgcolor: glassTokens.stat.bgcolor,
                    backgroundColor: glassTokens.stat.bgcolor,
                    boxShadow: glassTokens.stat.boxShadow,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <SvgIcon sx={{ color: glassTokens.stat.suffixColor, fontSize: { xs: 20, sm: 24 } }}>
                      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                    </SvgIcon>
                  }
                  sx={{
                    py: { xs: 0.5, sm: 1 },
                    px: { xs: 1.25, sm: 2 },
                    minHeight: 48,
                    bgcolor: 'transparent',
                    '& .MuiAccordionSummary-content': { margin: '10px 0' },
                    '&.Mui-expanded': { bgcolor: 'transparent' },
                  }}
                >
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 14, sm: 16, md: 18 },
                      fontWeight: 700,
                      color: glassTokens.titleColor,
                      wordBreak: 'break-word',
                      lineHeight: 1.35,
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pb: 2, px: { xs: 1.25, sm: 2 }, pt: 0, bgcolor: 'transparent' }}>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 12, sm: 14, md: 16 },
                      color: glassTokens.subtitleColor,
                      lineHeight: 1.65,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </GlassPanelCard>
      </Stack>
    </Box>
  )


  return (
    <Box sx={{ bgcolor: '#000000' }}>
      {sectionSlide}
      <LandingDashboardSection />
      <PlayYourGameSection />
      {sectionAbout}
      {sectionHowToPlay}
      {sectionRoules}
    </Box >
  );
}
