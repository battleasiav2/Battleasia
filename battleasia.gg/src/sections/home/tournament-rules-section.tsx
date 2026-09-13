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
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

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
        bgcolor: '#06090e',
        color: '#ffffff',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Stack spacing={1.5} alignItems="center" sx={{ mb: { xs: 4.5, md: 6 }, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2,
              py: 0.6,
              borderRadius: '8px',
              bgcolor: '#161618',
              border: `1px solid ${alpha(accentColor, 0.28)}`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: accentColor,
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
          </Box>

          <Typography
            variant="h2"
            className="font-tr"
            sx={{
              fontSize: { xs: 26, sm: 36, md: 44 },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: { xs: 1.5, md: 2.5 },
              lineHeight: 1.15,
              color: '#ffffff',
            }}
          >
            {t('home.tournamentRules')}
          </Typography>

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

          <Box sx={{ width: '100%', maxWidth: 360, mt: 0.5 }}>
            <BattleGoldDivider variant="hero" showCenterGem />
          </Box>
        </Stack>

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
                  borderRadius: '8px',
                  bgcolor: isActive ? accentColor : '#161618',
                  color: isActive ? accentContrast : alpha('#ffffff', 0.72),
                  fontWeight: 800,
                  fontSize: { xs: 10.5, sm: 11.5 },
                  fontFamily: 'monospace',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  border: isActive
                    ? `1px solid ${alpha(accentColor, 0.28)}`
                    : `1px solid ${alpha('#ffffff', 0.08)}`,
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive ? accentColor : alpha('#ffffff', 0.06),
                    color: isActive ? accentContrast : '#ffffff',
                    borderColor: isActive ? alpha(accentColor, 0.45) : alpha(accentColor, 0.28),
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
                    borderRadius: '12px',
                    bgcolor: '#161618',
                    border: `1px solid ${
                      isOpen
                        ? alpha(accentColor, 0.28)
                        : isHovered
                          ? alpha('#ffffff', 0.14)
                          : alpha('#ffffff', 0.08)
                    }`,
                    transition: 'border-color 0.2s ease',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      bgcolor: isOpen
                        ? accentColor
                        : isHovered
                          ? alpha(accentColor, 0.5)
                          : alpha(accentColor, 0.25),
                      transition: 'background-color 0.2s ease',
                    },
                  }}
                >
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
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: isOpen ? alpha(accentColor, 0.22) : alpha(accentColor, 0.12),
                          color: accentColor,
                          display: 'grid',
                          placeItems: 'center',
                          border: `1px solid ${alpha(accentColor, 0.28)}`,
                          flexShrink: 0,
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <Iconify icon={rule.icon} width={16} />
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
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

                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        bgcolor: alpha(accentColor, isOpen ? 0.22 : 0.12),
                        border: `1px solid ${alpha(accentColor, 0.28)}`,
                        color: accentColor,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease, background-color 0.2s ease',
                      }}
                    >
                      <Iconify icon="solar:alt-arrow-down-bold" width={16} />
                    </Box>
                  </ButtonBase>

                  <Collapse in={isOpen} timeout={280} unmountOnExit>
                    <Box
                      sx={{
                        px: { xs: 2.4, sm: 2.6 },
                        pb: { xs: 2.2, sm: 2.6 },
                        pt: 0.5,
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          height: '1px',
                          borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                          mb: 1.6,
                        }}
                      />

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
                    </Box>
                  </Collapse>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Box
          sx={{
            mt: { xs: 4, md: 5.5 },
            p: { xs: 2, sm: 2.5 },
            borderRadius: '12px',
            bgcolor: '#161618',
            border: `1px solid ${alpha('#ffffff', 0.08)}`,
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
                  bgcolor: alpha(accentColor, 0.1),
                  border: `1px solid ${alpha(accentColor, 0.28)}`,
                  color: accentColor,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:chat-round-dots-bold" width={20} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  {t('home.needHelp')}
                </Typography>
                <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.5) }}>
                  Direct satellite relay to on-duty tournament referees
                </Typography>
              </Box>
            </Stack>

            <ButtonBase
              component={RouterLink}
              href="/support"
              sx={{
                px: 2.8,
                py: 1,
                borderRadius: '8px',
                bgcolor: accentColor,
                color: accentContrast,
                fontWeight: 900,
                fontSize: 12,
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: `1px solid ${alpha(accentColor, 0.28)}`,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 0.92,
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
