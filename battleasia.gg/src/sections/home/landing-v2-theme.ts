/**
 * BattleAsia 2.0 landing — design tokens from BattleAsia-2.0-landing.zip
 * Keep API / i18n copy wired in sections; only visuals use these tokens.
 */

export const LANDING_V2 = {
  assets: {
    heroPoster: '/landing-v2/hero-poster.webp',
    heroVideo: '/landing-v2/hero.mp4',
    pulseBg: '/landing-v2/pulse-bg.webp',
    aboutBg: '/landing-v2/about-bg.webp',
    footerBg: '/landing-v2/footer-bg.webp',
    logo: '/landing-v2/logo.png',
    games: {
      pubg: '/landing-v2/games/pubg.webp',
      freefire: '/landing-v2/games/freefire.webp',
      cod: '/landing-v2/games/cod.webp',
      valorant: '/landing-v2/games/valorant.webp',
      mlbb: '/landing-v2/games/mlbb.webp',
    },
    modes: {
      solo: '/landing-v2/modes/solo.webp',
      duo: '/landing-v2/modes/duo.webp',
      squad: '/landing-v2/modes/squad.webp',
      tdm: '/landing-v2/modes/tdm.webp',
    },
    pay: {
      bkash: '/landing-v2/pay/bkash.webp',
      nagad: '/landing-v2/pay/nagad.webp',
      crypto: '/landing-v2/pay/crypto.webp',
    },
  },
  ink: '#060607',
  ink2: '#0b0b0d',
  text: '#f4f4f1',
  muted: 'rgba(244,244,241,0.62)',
  faint: 'rgba(244,244,241,0.40)',
  hair: 'rgba(255,255,255,0.09)',
  hair2: 'rgba(255,255,255,0.14)',
  hairStrong: 'rgba(255,255,255,0.22)',
  panel: 'rgba(22,22,24,0.38)',
  panelHi: 'rgba(30,30,33,0.55)',
  gold: 'var(--ba-gold, #cbfb24)',
  goldInk: 'var(--ba-gold-ink, #081401)',
  radius: '18px',
  radiusSm: '12px',
  blur: '20px',
  wrap: 1180,
  ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  display: '"Clash Display", "Satoshi", "Barlow", sans-serif',
  sans: '"Satoshi", "Helvetica Neue", "Public Sans Variable", sans-serif',
} as const;

/** Zip `.panel` glass */
export const landingPanelSx = {
  bgcolor: LANDING_V2.panel,
  backdropFilter: `blur(${LANDING_V2.blur})`,
  WebkitBackdropFilter: `blur(${LANDING_V2.blur})`,
  border: `1px solid ${LANDING_V2.hair}`,
  borderRadius: LANDING_V2.radius,
  boxShadow: '0 30px 80px -44px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
} as const;

/** Zip `.btn-primary` */
export const landingPrimaryBtnSx = {
  bgcolor: `${LANDING_V2.gold} !important`,
  color: `${LANDING_V2.goldInk} !important`,
  border: `1px solid ${LANDING_V2.gold} !important`,
  borderRadius: `${LANDING_V2.radiusSm} !important`,
  boxShadow: '0 8px 28px -12px rgba(203,251,36,0.4), inset 0 1px 0 rgba(255,255,255,0.35) !important',
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase' as const,
  clipPath: 'none !important',
  '&:hover': {
    bgcolor: `${LANDING_V2.gold} !important`,
    transform: 'translateY(-2px)',
    boxShadow: '0 16px 40px -12px rgba(203,251,36,0.4) !important',
  },
} as const;

/** Zip `.btn-ghost` */
export const landingGhostBtnSx = {
  bgcolor: 'rgba(255,255,255,0.04)',
  color: LANDING_V2.text,
  border: `1px solid ${LANDING_V2.hair2}`,
  borderRadius: LANDING_V2.radiusSm,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase' as const,
  clipPath: 'none !important',
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.09)',
    borderColor: LANDING_V2.hairStrong,
    transform: 'translateY(-2px)',
  },
} as const;
