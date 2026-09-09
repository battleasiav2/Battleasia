import { useState } from 'react';

import {
  Box,
  Stack,
  Accordion,
  ButtonBase,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

type FAQItem = {
  id: string;
  tag: string;
  question: string;
  answer: string;
  icon: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    tag: 'PAYOUTS // ESCROW',
    question: 'How fast are BAC token tournament deposits and withdrawals processed?',
    answer:
      'BAC token deposits are credited automatically via instant cryptographic confirmation (typically within 15–45 seconds). Withdrawals undergo automated security auditing and are dispatched within 2 to 10 minutes directly to your connected wallet or local gateway.',
    icon: 'solar:wallet-money-bold-duotone',
  },
  {
    id: 'faq-2',
    tag: 'ARBITRATION // COMBAT',
    question: 'How do I dispute an unfair match outcome or score discrepancy?',
    answer:
      'Transmit an Incident Report under the "Match" channel within 15 minutes of match completion. Provide your match ID and upload screenshot or video evidence of the final scorecard. BattleAsia tournament referees audit telemetry and settle prize escrows swiftly.',
    icon: 'solar:shield-check-bold-duotone',
  },
  {
    id: 'faq-3',
    tag: 'INTEGRITY // ANTI-CHEAT',
    question: 'What anti-cheat protocols are enforced during prize matches?',
    answer:
      'BattleAsia enforces server-side behavioral anomaly scanning, hardware fingerprint validation, and strict game UID binding. Any use of unauthorized emulators, injected memory tools, or third-party modifications results in immediate forfeiture and account termination.',
    icon: 'solar:danger-triangle-bold-duotone',
  },
  {
    id: 'faq-4',
    tag: 'MULTI-PLATFORM // HARDWARE',
    question: 'Can I play on both mobile devices and PC?',
    answer:
      'Mobile-exclusive tournaments (PUBG Mobile, Free Fire, COD Mobile) require native Android/iOS hardware. PC titles like Valorant run on verified desktop clients. Tournament queues segregate inputs to guarantee equal tactical parity for all combatants.',
    icon: 'solar:gamepad-bold-duotone',
  },
];

type SupportFaqMatrixProps = {
  onCreateTicketClick: () => void;
};

export function SupportFaqMatrix({ onCreateTicketClick }: SupportFaqMatrixProps) {
  const theme = useTheme();
  const themeAccent = theme.palette.primary.main || USER_COLORS.gold;
  const [expandedId, setExpandedId] = useState<string | false>('faq-1');

  const handleChange = (panelId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedId(isExpanded ? panelId : false);
  };

  return (
    <Box
      sx={{
        mt: 4,
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '16px',
        bgcolor: '#090b0e',
        border: `1px solid ${alpha(themeAccent, 0.2)}`,
        boxShadow: `0 12px 32px -8px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 ${alpha('#ffffff', 0.06)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: `'Barlow', 'Public Sans Variable', sans-serif`,
              fontSize: { xs: 15, sm: 18 },
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#ffffff',
            }}
          >
            TACTICAL KNOWLEDGE PROTOCOL // FAQ
          </Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: alpha('#ffffff', 0.5), letterSpacing: 0.3 }}>
            Immediate answers to common operational questions
          </Typography>
        </Box>

        <ButtonBase
          onClick={onCreateTicketClick}
          sx={{
            px: 2,
            py: 0.85,
            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
            bgcolor: alpha(themeAccent, 0.15),
            border: `1px solid ${alpha(themeAccent, 0.4)}`,
            color: themeAccent,
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: themeAccent,
              color: '#081401',
              transform: 'translateY(-1px)',
              boxShadow: `0 0 16px ${alpha(themeAccent, 0.4)}`,
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <Iconify icon="solar:ticket-bold" width={14} />
            <span>Open Dedicated Ticket</span>
          </Stack>
        </ButtonBase>
      </Stack>

      {/* Accordion FAQ Items */}
      <Stack spacing={1.5}>
        {FAQ_ITEMS.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <Accordion
              key={item.id}
              expanded={isExpanded}
              onChange={handleChange(item.id)}
              disableGutters
              sx={{
                bgcolor: isExpanded ? alpha(themeAccent, 0.05) : alpha('#ffffff', 0.02),
                border: `1px solid ${isExpanded ? alpha(themeAccent, 0.4) : alpha('#ffffff', 0.08)}`,
                borderRadius: '10px !important',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isExpanded ? `0 4px 18px -4px ${alpha(themeAccent, 0.15)}` : 'none',
                '&::before': { display: 'none' },
                '&:hover': {
                  borderColor: alpha(themeAccent, 0.3),
                  bgcolor: alpha(themeAccent, 0.03),
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Iconify
                    icon="solar:alt-arrow-down-bold"
                    width={16}
                    sx={{
                      color: isExpanded ? themeAccent : alpha('#ffffff', 0.4),
                      transition: 'transform 0.25s ease',
                    }}
                  />
                }
                sx={{
                  px: 2.25,
                  py: 1.25,
                  minHeight: 54,
                  '& .MuiAccordionSummary-content': { my: 0.5 },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: isExpanded ? alpha(themeAccent, 0.2) : alpha('#ffffff', 0.05),
                      border: `1px solid ${isExpanded ? themeAccent : alpha('#ffffff', 0.1)}`,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={item.icon} width={16} sx={{ color: isExpanded ? themeAccent : alpha('#ffffff', 0.7) }} />
                  </Box>

                  <Box>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 800, letterSpacing: 1.2, color: themeAccent, mb: 0.2 }}>
                      {item.tag}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 700, color: '#ffffff' }}>
                      {item.question}
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2.5, pb: 2.25, pt: 0 }}>
                <Box sx={{ pl: { sm: 5.5 } }}>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: alpha('#ffffff', 0.7),
                      lineHeight: 1.65,
                      borderLeft: `2px solid ${alpha(themeAccent, 0.4)}`,
                      pl: 2,
                    }}
                  >
                    {item.answer}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
