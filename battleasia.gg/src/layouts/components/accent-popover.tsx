import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';

import { CustomPopover } from 'src/components/custom-popover';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales/use-locales';
import {
  ACCENT_IDS,
  ACCENT_PALETTES,
  applyAccentToDocument,
  persistAccentId,
  resolveAccentId,
  type AccentId,
} from 'src/theme/accent-presets';

import { headerLanguagePillSx } from './header-chrome';

export function AccentPopover() {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const current = resolveAccentId(settings.state.primaryColor);

  const selectAccent = (id: AccentId) => {
    persistAccentId(id);
    applyAccentToDocument(id);
    settings.setState({ primaryColor: id });
    onClose();
  };

  return (
    <>
      <Tooltip title={t('navigation.siteColor')}>
        <ButtonBase
          disableRipple
          aria-label={t('navigation.siteColor')}
          onClick={onOpen}
          sx={{
            ...headerLanguagePillSx(open),
            width: { xs: 34, sm: 36 },
            minWidth: { xs: 34, sm: 36 },
            px: 0,
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor: 'var(--ba-gold)',
              boxShadow: `0 0 0 2px ${alpha('#000000', 0.45)}, 0 0 8px rgba(var(--ba-gold-rgb), 0.45)`,
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
              p: 1.25,
              width: 232,
              overflow: 'hidden',
              borderRadius: 0,
              bgcolor: alpha('#000000', 0.94),
              border: `1px solid ${alpha('#ffffff', 0.08)}`,
              boxShadow: `0 12px 32px ${alpha('#000000', 0.45)}`,
              backdropFilter: 'blur(12px)',
            },
          },
          arrow: { hide: true },
        }}
      >
        <Typography
          sx={{
            px: 0.5,
            pb: 1,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: alpha('#ffffff', 0.55),
          }}
        >
          {t('navigation.siteColor')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0.75,
          }}
        >
          {ACCENT_IDS.map((id) => {
            const palette = ACCENT_PALETTES[id];
            const selected = current === id;
            return (
              <ButtonBase
                key={id}
                onClick={() => selectAccent(id)}
                aria-label={t(`navigation.accent.${id}`)}
                sx={{
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 0.75,
                  borderRadius: 0,
                  border: `1px solid ${selected ? palette.gold : alpha('#ffffff', 0.08)}`,
                  bgcolor: selected ? alpha(palette.gold, 0.12) : 'transparent',
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: palette.gold,
                    boxShadow: selected ? `0 0 10px ${alpha(palette.gold, 0.55)}` : 'none',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    color: selected ? palette.gold : alpha('#ffffff', 0.62),
                    textTransform: 'uppercase',
                  }}
                >
                  {t(`navigation.accent.${id}`)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        <Stack sx={{ pt: 0.75 }}>
          <Typography sx={{ fontSize: 10, color: alpha('#ffffff', 0.38), px: 0.25 }}>
            {t('navigation.siteColorHint')}
          </Typography>
        </Stack>
      </CustomPopover>
    </>
  );
}
