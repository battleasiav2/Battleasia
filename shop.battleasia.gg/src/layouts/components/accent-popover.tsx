import { usePopover } from 'minimal-shared/hooks';

import { Box, Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, keyframes } from '@mui/material/styles';

import { CustomPopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales/use-locales';
import {
  ACCENT_IDS,
  ACCENT_PALETTES,
  applyAccentToDocument,
  persistAccentId,
  resolveAccentId,
  goldAlpha,
  type AccentId,
} from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const prismRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const corePulse = keyframes`
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px var(--ba-gold)); }
  50% { transform: scale(1.15); filter: drop-shadow(0 0 10px var(--ba-gold)); }
`;

export function AccentPopover() {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const current = resolveAccentId(settings.state.primaryColor);
  const currentPalette = ACCENT_PALETTES[current];

  const selectAccent = (id: AccentId) => {
    persistAccentId(id);
    applyAccentToDocument(id);
    settings.setState({ primaryColor: id });
    onClose();
  };

  return (
    <>
      <Tooltip title={`${t('nav.siteColor')} • ${currentPalette.label}`}>
        <ButtonBase
          disableRipple
          aria-label={t('nav.siteColor')}
          onClick={onOpen}
          sx={{
            width: { xs: 36, sm: 40 },
            minWidth: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            p: 0,
            flexShrink: 0,
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            bgcolor: open ? goldAlpha(0.12) : alpha('#ffffff', 0.06),
            border: `1px solid ${open ? goldAlpha(0.4) : alpha('#ffffff', 0.12)}`,
            borderRadius: '10px',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            '&:hover': {
              bgcolor: goldAlpha(0.14),
              borderColor: goldAlpha(0.45),
            },
          }}
        >
          <Box
            className="prism-ring"
            sx={{
              position: 'absolute',
              width: { xs: 20, sm: 24 },
              height: { xs: 20, sm: 24 },
              borderRadius: '50%',
              border: `1px solid ${goldAlpha(0.4)}`,
              animation: `${prismRotate} 10s linear infinite`,
              pointerEvents: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'var(--ba-gold)',
                boxShadow: '0 0 6px var(--ba-gold)',
              },
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: 'var(--ba-gold)',
              transform: 'rotate(45deg)',
              borderRadius: '1px',
              background: `linear-gradient(135deg, #ffffff 0%, var(--ba-gold) 50%, var(--ba-gold-dark) 100%)`,
              boxShadow: `0 0 10px var(--ba-gold), 0 0 16px ${goldAlpha(0.55)}`,
              animation: `${corePulse} 2.8s ease-in-out infinite`,
            }}
          />
        </ButtonBase>
      </Tooltip>

      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              p: 1.75,
              width: 260,
              overflow: 'hidden',
              borderRadius: '12px',
              bgcolor: alpha('#06090e', 0.96),
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(16px)',
            },
          },
          arrow: { hide: true },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pb: 1.5, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="solar:magic-stick-3-bold-duotone" width={15} sx={{ color: 'var(--ba-gold)' }} />
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
            >
              {t('nav.siteColor')}
            </Typography>
          </Stack>

          <Box
            sx={{
              px: 0.75,
              py: 0.2,
              borderRadius: '4px',
              bgcolor: alpha(currentPalette.gold, 0.15),
              border: `1px solid ${currentPalette.gold}`,
            }}
          >
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 800,
                color: currentPalette.gold,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {currentPalette.label}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            pt: 1.5,
          }}
        >
          {ACCENT_IDS.map((id) => {
            const palette = ACCENT_PALETTES[id];
            const selected = current === id;
            return (
              <ButtonBase
                key={id}
                onClick={() => selectAccent(id)}
                aria-label={t(`nav.accent.${id}`)}
                sx={{
                  flexDirection: 'column',
                  gap: 0.75,
                  py: 1,
                  px: 0.5,
                  borderRadius: '8px',
                  border: `1px solid ${selected ? palette.gold : alpha('#ffffff', 0.1)}`,
                  bgcolor: selected ? alpha(palette.gold, 0.12) : alpha('#ffffff', 0.03),
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  '&:hover': {
                    borderColor: palette.gold,
                    bgcolor: alpha(palette.gold, 0.1),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '4px',
                    transform: 'rotate(45deg)',
                    background: `linear-gradient(135deg, ${palette.goldLight} 0%, ${palette.gold} 60%, ${palette.goldDark} 100%)`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {selected && (
                    <Box
                      sx={{
                        transform: 'rotate(-45deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:check-read-bold" width={12} sx={{ color: palette.ink }} />
                    </Box>
                  )}
                </Box>

                <Typography
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    color: selected ? palette.gold : alpha('#ffffff', 0.7),
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  {t(`nav.accent.${id}`)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </CustomPopover>
    </>
  );
}
