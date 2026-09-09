import { useMemo, useState } from 'react';

import {
  Box,
  Stack,
  Collapse,
  Container,
  Typography,
  ButtonBase,
  Grid2 as Grid,
} from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------
// KEYFRAME ANIMATIONS
// ----------------------------------------------------------------------

const beaconPulse = keyframes`
  0% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(203, 251, 36, 0.7);
  }
  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 10px rgba(203, 251, 36, 0);
  }
  100% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(203, 251, 36, 0);
  }
`;

const titleShimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const scanlineDown = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(1000%);
  }
`;


const gridPulse = keyframes`
  0%, 100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.55;
  }
`;

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type RuleCategory = 'all' | 'fair-play' | 'match-ops' | 'prizes';

// ----------------------------------------------------------------------

export function TournamentRulesSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('all');
  const [openRule, setOpenRule] = useState<string | null>('01');
  const [hoveredRule, setHoveredRule] = useState<string | null>(null);

  const accentColor = theme.palette.primary.main || '#cbfb24';
  const accentContrast = theme.palette.primary.contrastText || '#081401';

  // Complete FAQ rules list preserving 100% of the original question & answer contents
  const allRules = useMemo(
    () => [
      {
        id: '01',
        question: t('home.faq.noHacks'),
        answer: t('home.faq.noHacksAnswer'),
        category: 'fair-play' as const,
        badge: 'INTEGRITY PROTOCOL',
        icon: 'solar:shield-warning-bold-duotone',
      },
      {
        id: '02',
        question: t('home.faq.matchJoinTime'),
        answer: t('home.faq.matchJoinTimeAnswer'),
        category: 'match-ops' as const,
        badge: 'DISPATCH TIMING',
        icon: 'solar:clock-circle-bold-duotone',
      },
      {
        id: '03',
        question: t('home.faq.nameMustMatch'),
        answer: t('home.faq.nameMustMatchAnswer'),
        category: 'match-ops' as const,
        badge: 'OPERATIVE IDENTITY',
        icon: 'solar:user-id-bold-duotone',
      },
      {
        id: '04',
        question: t('home.faq.killPrizeClaims'),
        answer: t('home.faq.killPrizeClaimsAnswer'),
        category: 'prizes' as const,
        badge: 'FRAG BOUNTIES',
        icon: 'solar:target-bold-duotone',
      },
      {
        id: '05',
        question: t('home.faq.noTeaming'),
        answer: t('home.faq.noTeamingAnswer'),
        category: 'fair-play' as const,
        badge: 'ANTI-COLLUSION',
        icon: 'solar:users-group-two-rounded-bold-duotone',
      },
      {
        id: '06',
        question: t('home.faq.paymentRules'),
        answer: t('home.faq.paymentRulesAnswer'),
        category: 'prizes' as const,
        badge: 'ESCROW SETTLEMENT',
        icon: 'solar:wallet-money-bold-duotone',
      },
      {
        id: '07',
        question: t('home.faq.disconnectNoRefund'),
        answer: t('home.faq.disconnectNoRefundAnswer'),
        category: 'match-ops' as const,
        badge: 'SATELLITE LINK',
        icon: 'solar:wifi-router-bold-duotone',
      },
      {
        id: '08',
        question: t('home.faq.abusiveBehaviour'),
        answer: t('home.faq.abusiveBehaviourAnswer'),
        category: 'fair-play' as const,
        badge: 'COMBAT CONDUCT',
        icon: 'solar:shield-cross-bold-duotone',
      },
      {
        id: '09',
        question: t('home.faq.prizeDistribution'),
        answer: t('home.faq.prizeDistributionAnswer'),
        category: 'prizes' as const,
        badge: 'AUTOMATED PAYOUTS',
        icon: 'solar:cup-star-bold-duotone',
      },
      {
        id: '10',
        question: t('home.faq.finalDecision'),
        answer: t('home.faq.finalDecisionAnswer'),
        category: 'fair-play' as const,
        badge: 'HQ ARBITRATION',
        icon: 'solar:scale-bold-duotone',
      },
    ],
    [t]
  );

  // Category filter tabs
  const categoryTabs = [
    { value: 'all' as const, label: 'ALL REGULATIONS (10)', icon: 'solar:documents-minimalistic-bold-duotone' },
    { value: 'fair-play' as const, label: 'FAIR PLAY & INTEGRITY', icon: 'solar:shield-check-bold-duotone' },
    { value: 'match-ops' as const, label: 'MATCH PROCEDURES', icon: 'solar:gamepad-bold-duotone' },
    { value: 'prizes' as const, label: 'BOUNTIES & PRIZES', icon: 'solar:cup-star-bold-duotone' },
  ];

  const filteredRules = useMemo(() => {
    if (activeCategory === 'all') return allRules;
    return allRules.filter((r) => r.category === activeCategory);
  }, [allRules, activeCategory]);

  const toggleRule = (id: string) => {
    setOpenRule((prev) => (prev === id ? null : id));
  };

  return (
    <Box
      id="rules"
      component="section"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: '#06080d',
        color: '#ffffff',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
        // Dual ambient neon lighting: Primary accent right, cyan left
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: '10%',
          width: { xs: 320, md: 540 },
          height: { xs: 320, md: 540 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accentColor, 0.12)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '5%',
          width: { xs: 320, md: 500 },
          height: { xs: 320, md: 500 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#38bdf8', 0.08)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Tactical Cyber Grid Background Lines */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${alpha('#ffffff', 0.028)} 1px, transparent 1px),
            linear-gradient(to bottom, ${alpha('#ffffff', 0.028)} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 50%, #000000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 50%, #000000 40%, transparent 100%)',
          animation: `${gridPulse} 8s ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sweeping Laser Scanner Accent */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${alpha(accentColor, 0.75)} 50%, transparent 100%)`,
          animation: `${scanlineDown} 10s linear infinite`,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.45,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* ============================================================= */}
        {/* HEADER: PROTOCOL TITLE & SUBTITLE */}
        {/* ============================================================= */}
        <Stack spacing={1.5} alignItems="center" sx={{ mb: { xs: 4.5, md: 6 }, textAlign: 'center' }}>
          {/* Tactical HUD Classification Pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2,
              py: 0.6,
              borderRadius: '999px',
              bgcolor: alpha(accentColor, 0.06),
              border: `1px solid ${alpha(accentColor, 0.25)}`,
              boxShadow: `0 0 16px ${alpha(accentColor, 0.15)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: accentColor,
                animation: `${beaconPulse} 2s infinite ease-in-out`,
              }}
            />
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 800,
                letterSpacing: 2.8,
                color: accentColor,
                textTransform: 'uppercase',
              }}
            >
              {t('home.playYourGame.brandLabel')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 10,
                color: alpha('#ffffff', 0.4),
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              [ ESPORTS CODEX // v2.4 ]
            </Typography>
          </Box>

          {/* Monumental Esports Title */}
          <Typography
            variant="h2"
            className="font-tr"
            sx={{
              fontSize: { xs: 26, sm: 36, md: 44 },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: { xs: 1.5, md: 2.5 },
              lineHeight: 1.15,
              background: `linear-gradient(135deg, #ffffff 0%, #f1f5f9 35%, ${accentColor} 70%, #ffffff 100%)`,
              backgroundSize: '200% auto',
              animation: `${titleShimmer} 7s linear infinite`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 4px 20px ${alpha(accentColor, 0.3)})`,
            }}
          >
            {t('home.tournamentRules')}
          </Typography>

          {/* Official Regulations Subtitle (Verbatim) */}
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 13, sm: 14.5, md: 15.5 },
              color: alpha('#ffffff', 0.62),
              textAlign: 'center',
              maxWidth: 580,
              lineHeight: 1.6,
            }}
          >
            {t('home.officialRegulations')}
          </Typography>

          {/* Center Tactical Battle Divider */}
          <Box sx={{ width: '100%', maxWidth: 360, mt: 0.5 }}>
            <BattleGoldDivider variant="hero" showCenterGem />
          </Box>
        </Stack>

        {/* ============================================================= */}
        {/* TACTICAL FILTER TABS (POLYGON CHAMFERED) */}
        {/* ============================================================= */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          gap={1.2}
          sx={{ mb: { xs: 3.5, md: 4.5 } }}
        >
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.value;

            return (
              <ButtonBase
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                sx={{
                  px: { xs: 1.8, sm: 2.4 },
                  py: 0.9,
                  clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                  bgcolor: isActive ? accentColor : alpha('#10141f', 0.85),
                  color: isActive ? accentContrast : alpha('#ffffff', 0.72),
                  fontWeight: 800,
                  fontSize: { xs: 10.5, sm: 11.5 },
                  fontFamily: 'monospace',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  border: isActive ? 'none' : `1px solid ${alpha('#ffffff', 0.12)}`,
                  boxShadow: isActive ? `0 0 20px ${alpha(accentColor, 0.45)}` : 'none',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    bgcolor: isActive ? accentColor : alpha('#1a2133', 0.95),
                    color: isActive ? accentContrast : '#ffffff',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.9}>
                  <Iconify icon={tab.icon} width={15} />
                  <span>{tab.label}</span>
                </Stack>
              </ButtonBase>
            );
          })}
        </Stack>

        {/* ============================================================= */}
        {/* 2-COLUMN CODEX MATRIX (ACCORDION CARDS) */}
        {/* ============================================================= */}
        <Grid container spacing={{ xs: 2, md: 2.5 }} alignItems="flex-start">
          {filteredRules.map((rule) => {
            const isOpen = openRule === rule.id;
            const isHovered = hoveredRule === rule.id;

            return (
              <Grid key={rule.id} size={{ xs: 12, md: 6 }}>
                <Box
                  onMouseEnter={() => setHoveredRule(rule.id)}
                  onMouseLeave={() => setHoveredRule(null)}
                  sx={{
                    position: 'relative',
                    clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                    bgcolor: isOpen
                      ? alpha('#0e131d', 0.95)
                      : isHovered
                        ? alpha('#0d111a', 0.9)
                        : alpha('#090c12', 0.82),
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${isOpen ? alpha(accentColor, 0.5) : isHovered ? alpha('#ffffff', 0.2) : alpha('#ffffff', 0.08)}`,
                    boxShadow: isOpen
                      ? `0 12px 32px rgba(0,0,0,0.7), 0 0 20px ${alpha(accentColor, 0.15)}`
                      : '0 6px 20px rgba(0,0,0,0.45)',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left Animated Laser Rail */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3.5px',
                      bgcolor: isOpen ? accentColor : isHovered ? alpha(accentColor, 0.6) : alpha(accentColor, 0.15),
                      boxShadow: isOpen ? `0 0 14px ${accentColor}` : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  />

                  {/* Corner Reticle Marks */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 8,
                      fontFamily: 'monospace',
                      fontSize: 9,
                      color: isOpen ? accentColor : alpha('#ffffff', 0.2),
                      userSelect: 'none',
                    }}
                  >
                    ⌜ ⌝
                  </Box>

                  {/* Header Button Trigger */}
                  <ButtonBase
                    onClick={() => toggleRule(rule.id)}
                    aria-expanded={isOpen}
                    sx={{
                      width: 1,
                      p: { xs: 2, sm: 2.2 },
                      pl: { xs: 2.4, sm: 2.6 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Left: Index Hex Badge + Question */}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                      {/* Chamfered Index Badge */}
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                          bgcolor: isOpen ? accentColor : alpha(accentColor, 0.12),
                          color: isOpen ? accentContrast : accentColor,
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: isOpen ? `0 0 14px ${alpha(accentColor, 0.45)}` : 'none',
                          flexShrink: 0,
                          transition: 'all 0.25s ease',
                        }}
                      >
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 900 }}>
                          {rule.id}
                        </Typography>
                      </Box>

                      {/* Question Text & Badge */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }} flexWrap="wrap">
                          <Typography
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: 9.5,
                              fontWeight: 800,
                              letterSpacing: 1.2,
                              color: isOpen ? accentColor : alpha('#ffffff', 0.5),
                              textTransform: 'uppercase',
                            }}
                          >
                            {rule.badge}
                          </Typography>
                        </Stack>

                        {/* Verbatim Question Text */}
                        <Typography
                          className="font-tr"
                          sx={{
                            fontSize: { xs: 13, sm: 14, md: 14.5 },
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            color: isOpen ? '#ffffff' : alpha('#ffffff', 0.88),
                            lineHeight: 1.35,
                            wordBreak: 'break-word',
                            transition: 'color 0.2s ease',
                          }}
                        >
                          {rule.question}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Right: Rotating Holographic Chevron Trigger */}
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        bgcolor: isOpen ? alpha(accentColor, 0.15) : alpha('#ffffff', 0.05),
                        border: `1.5px solid ${isOpen ? accentColor : alpha('#ffffff', 0.15)}`,
                        color: isOpen ? accentColor : alpha('#ffffff', 0.6),
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        boxShadow: isOpen ? `0 0 12px ${alpha(accentColor, 0.4)}` : 'none',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <Iconify icon="solar:add-bold" width={16} />
                    </Box>
                  </ButtonBase>

                  {/* Body: Collapsible Answer Dossier */}
                  <Collapse in={isOpen} timeout={280} unmountOnExit>
                    <Box
                      sx={{
                        px: { xs: 2.4, sm: 2.6 },
                        pb: { xs: 2.2, sm: 2.6 },
                        pt: 0.5,
                        position: 'relative',
                      }}
                    >
                      {/* Top Dashed Divider Line */}
                      <Box
                        sx={{
                          height: '1px',
                          borderTop: `1px dashed ${alpha(accentColor, 0.3)}`,
                          mb: 1.6,
                        }}
                      />

                      {/* Verbatim Answer Content */}
                      <Typography
                        className="font-tr"
                        sx={{
                          fontSize: { xs: 12.5, sm: 13.5 },
                          color: alpha('#ffffff', 0.78),
                          lineHeight: 1.7,
                          letterSpacing: 0.2,
                        }}
                      >
                        {rule.answer}
                      </Typography>

                      {/* Bottom Protocol Enforcement Status */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mt: 2, pt: 1.2, borderTop: `1px solid ${alpha('#ffffff', 0.06)}` }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.7}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#22c55e' }} />
                          <Typography sx={{ fontFamily: 'monospace', fontSize: 9.5, color: '#22c55e', fontWeight: 700 }}>
                            RULE ENFORCED // AUTOMATED ARBITRATION
                          </Typography>
                        </Stack>

                        <Typography sx={{ fontFamily: 'monospace', fontSize: 9.5, color: alpha('#ffffff', 0.35) }}>
                          REF_ID: #{rule.id}
                        </Typography>
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* ============================================================= */}
        {/* SUPPORT DIRECTIVE STRIP (UNTOUCHED TEXT & LINK) */}
        {/* ============================================================= */}
        <Box
          sx={{
            mt: { xs: 4, md: 5.5 },
            p: { xs: 2, sm: 2.5 },
            borderRadius: '14px',
            bgcolor: alpha('#090d15', 0.8),
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: alpha(accentColor, 0.12),
                  border: `1px solid ${alpha(accentColor, 0.3)}`,
                  color: accentColor,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:chat-round-dots-bold" width={20} />
              </Box>

              {/* Untouched "Need help?" text */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  {t('home.needHelp')}
                </Typography>
                <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.5) }}>
                  Direct satellite relay to on-duty tournament referees
                </Typography>
              </Box>
            </Stack>

            {/* Untouched "Contact Support" link */}
            <ButtonBase
              component={RouterLink}
              href="/support"
              sx={{
                px: 2.8,
                py: 1,
                clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                bgcolor: accentColor,
                color: accentContrast,
                fontWeight: 900,
                fontSize: 12,
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: `0 4px 18px ${alpha(accentColor, 0.45)}`,
                transition: 'all 0.22s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha(accentColor, 0.65)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>{t('home.contactSupport')}</span>
                <Iconify icon="solar:arrow-right-bold" width={16} />
              </Stack>
            </ButtonBase>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default TournamentRulesSection;
