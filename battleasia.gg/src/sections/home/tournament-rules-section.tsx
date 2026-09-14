import { useMemo, useState } from 'react';

import { Box, Stack, Collapse, ButtonBase, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { LANDING_V2, landingPanelSx, landingPrimaryBtnSx } from './landing-v2-theme';

// ----------------------------------------------------------------------

type RuleCategory = 'all' | 'fair-play' | 'match-ops' | 'prizes';

// ----------------------------------------------------------------------

export function TournamentRulesSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('all');
  const [openRule, setOpenRule] = useState<string | null>('01');

  const accentColor = theme.palette.primary.main || '#cbfb24';

  const allRules = useMemo(
    () => [
      {
        id: '01',
        question: t('home.faq.noHacks'),
        answer: t('home.faq.noHacksAnswer'),
        category: 'fair-play' as const,
      },
      {
        id: '02',
        question: t('home.faq.matchJoinTime'),
        answer: t('home.faq.matchJoinTimeAnswer'),
        category: 'match-ops' as const,
      },
      {
        id: '03',
        question: t('home.faq.nameMustMatch'),
        answer: t('home.faq.nameMustMatchAnswer'),
        category: 'match-ops' as const,
      },
      {
        id: '04',
        question: t('home.faq.killPrizeClaims'),
        answer: t('home.faq.killPrizeClaimsAnswer'),
        category: 'prizes' as const,
      },
      {
        id: '05',
        question: t('home.faq.noTeaming'),
        answer: t('home.faq.noTeamingAnswer'),
        category: 'fair-play' as const,
      },
      {
        id: '06',
        question: t('home.faq.paymentRules'),
        answer: t('home.faq.paymentRulesAnswer'),
        category: 'prizes' as const,
      },
      {
        id: '07',
        question: t('home.faq.disconnectNoRefund'),
        answer: t('home.faq.disconnectNoRefundAnswer'),
        category: 'match-ops' as const,
      },
      {
        id: '08',
        question: t('home.faq.abusiveBehaviour'),
        answer: t('home.faq.abusiveBehaviourAnswer'),
        category: 'fair-play' as const,
      },
      {
        id: '09',
        question: t('home.faq.prizeDistribution'),
        answer: t('home.faq.prizeDistributionAnswer'),
        category: 'prizes' as const,
      },
      {
        id: '10',
        question: t('home.faq.finalDecision'),
        answer: t('home.faq.finalDecisionAnswer'),
        category: 'fair-play' as const,
      },
    ],
    [t]
  );

  const categoryTabs = [
    { value: 'all' as const, label: 'ALL REGULATIONS (10)' },
    { value: 'fair-play' as const, label: 'FAIR PLAY & INTEGRITY' },
    { value: 'match-ops' as const, label: 'MATCH PROCEDURES' },
    { value: 'prizes' as const, label: 'BOUNTIES & PRIZES' },
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
        bgcolor: LANDING_V2.ink,
        color: LANDING_V2.text,
        py: { xs: 9, sm: 11, md: 'clamp(72px, 10vw, 148px)' },
        px: { xs: 2.5, sm: 4, md: 5 },
        borderTop: `1px solid ${LANDING_V2.hair}`,
      }}
    >
      <Box sx={{ maxWidth: LANDING_V2.wrap, mx: 'auto' }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: { xs: 4, md: 4.5 }, textAlign: 'center' }}>
          <Typography
            component="h2"
            className="landing-display"
            sx={{
              fontFamily: LANDING_V2.display,
              fontWeight: 600,
              fontSize: { xs: '2.2rem', sm: 'clamp(2.2rem, 5.4vw, 4.4rem)' },
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: LANDING_V2.text,
            }}
          >
            {t('home.tournamentRules')}
          </Typography>

          <Typography
            sx={{
              color: LANDING_V2.muted,
              fontSize: { xs: '1rem', md: '1.12rem' },
              maxWidth: '48ch',
              lineHeight: 1.5,
            }}
          >
            {t('home.officialRegulations')}
          </Typography>

          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1}
            sx={{ pt: 0.5 }}
          >
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.value;
              return (
                <ButtonBase
                  key={tab.value}
                  onClick={() => setActiveCategory(tab.value)}
                  sx={{
                    px: 2,
                    py: 0.9,
                    borderRadius: 999,
                    bgcolor: isActive ? accentColor : 'transparent',
                    color: isActive
                      ? theme.palette.primary.contrastText || LANDING_V2.goldInk
                      : LANDING_V2.muted,
                    fontWeight: 700,
                    fontSize: { xs: 11, sm: 12 },
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: `1px solid ${isActive ? accentColor : LANDING_V2.hair2}`,
                    transition: `background-color 0.2s ${LANDING_V2.ease}, color 0.2s ${LANDING_V2.ease}`,
                    '&:hover': {
                      borderColor: accentColor,
                      color: isActive
                        ? theme.palette.primary.contrastText || LANDING_V2.goldInk
                        : LANDING_V2.text,
                    },
                  }}
                >
                  {tab.label}
                </ButtonBase>
              );
            })}
          </Stack>
        </Stack>

        {/* Zip single-column FAQ */}
        <Stack spacing={1}>
          {filteredRules.map((rule) => {
            const isOpen = openRule === rule.id;
            return (
              <Box
                key={rule.id}
                sx={{
                  ...landingPanelSx,
                  borderColor: isOpen ? LANDING_V2.hair2 : LANDING_V2.hair,
                  bgcolor: isOpen ? LANDING_V2.panelHi : LANDING_V2.panel,
                  overflow: 'hidden',
                }}
              >
                <ButtonBase
                  onClick={() => toggleRule(rule.id)}
                  aria-expanded={isOpen}
                  sx={{
                    width: 1,
                    px: { xs: 2.2, sm: 2.75 },
                    py: { xs: 1.75, sm: 2 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    textAlign: 'left',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: LANDING_V2.display,
                      fontWeight: 500,
                      fontSize: { xs: '1rem', sm: '1.06rem' },
                      color: LANDING_V2.text,
                      lineHeight: 1.35,
                    }}
                  >
                    {rule.question}
                  </Typography>

                  <Box
                    aria-hidden
                    sx={{
                      position: 'relative',
                      width: 16,
                      height: 16,
                      flex: '0 0 auto',
                      '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        background: accentColor,
                        borderRadius: '2px',
                        transition: `transform 0.3s ${LANDING_V2.ease}`,
                      },
                      '&::before': {
                        top: 7,
                        left: 0,
                        width: 16,
                        height: 2,
                      },
                      '&::after': {
                        left: 7,
                        top: 0,
                        width: 2,
                        height: 16,
                        transform: isOpen ? 'scaleY(0)' : 'none',
                      },
                    }}
                  />
                </ButtonBase>

                <Collapse in={isOpen} timeout={280} unmountOnExit>
                  <Typography
                    sx={{
                      px: { xs: 2.2, sm: 2.75 },
                      pb: { xs: 2, sm: 2.5 },
                      color: LANDING_V2.muted,
                      maxWidth: '70ch',
                      fontSize: '0.96rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {rule.answer}
                  </Typography>
                </Collapse>
              </Box>
            );
          })}
        </Stack>

        <Box
          sx={{
            mt: { xs: 3.5, md: 4.5 },
            ...landingPanelSx,
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: LANDING_V2.display,
                fontWeight: 600,
                fontSize: '1.4rem',
              }}
            >
              {t('home.needHelp')}
            </Typography>
            <Typography sx={{ color: LANDING_V2.muted, mt: 0.5, fontSize: '0.95rem' }}>
              Direct satellite relay to on-duty tournament referees
            </Typography>
          </Box>

          <ButtonBase
            component={RouterLink}
            href="/support"
            sx={{
              ...landingPrimaryBtnSx,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              minHeight: 46,
              fontSize: 12,
              textDecoration: 'none',
            }}
          >
            <span>{t('home.contactSupport')}</span>
            <Iconify icon="solar:arrow-right-bold" width={16} />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}

export default TournamentRulesSection;
