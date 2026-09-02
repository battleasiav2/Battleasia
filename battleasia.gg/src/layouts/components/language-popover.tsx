import type { IconButtonProps } from '@mui/material/IconButton';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { FlagIcon } from 'src/components/flag-icon';
import { Iconify } from 'src/components/iconify/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { useTranslate } from 'src/locales/use-locales';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { headerLanguageCodeSx, headerLanguagePillSx } from './header-chrome';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const RTL_LANGS = new Set(['ur', 'ar']);

export type LanguagePopoverProps = IconButtonProps & {
  data?: {
    value: string;
    label: string;
    countryCode: string;
  }[];
};

function getLangMeta(value: string) {
  const code = value.toUpperCase();
  return RTL_LANGS.has(value) ? `${code} • RTL` : code;
}

export function LanguagePopover({ data = [], sx, ...other }: LanguagePopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const { currentLang, onChangeLang } = useTranslate();

  const handleChangeLang = async (newLang: string) => {
    await onChangeLang(newLang as any);
    onClose();
  };

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            p: 0,
            width: 196,
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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.25,
          py: 0.75,
          borderBottom: `1px solid ${alpha('#ffffff', 0.07)}`,
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            color: goldAlpha(0.9),
            fontWeight: 600,
            fontSize: 11,
            lineHeight: 1,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Language
        </Typography>
        <Typography
          sx={{
            color: alpha('#ffffff', 0.35),
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          {data.length}
        </Typography>
      </Stack>

      <Stack divider={<Box sx={{ height: '1px', bgcolor: alpha('#ffffff', 0.06) }} />}>
        {data.map((option) => {
          const isSelected = option.value === currentLang?.value;
          const meta = getLangMeta(option.value);

          return (
            <ButtonBase
              key={option.value}
              onClick={() => handleChangeLang(option.value)}
              sx={{
                width: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 1.25,
                py: 0.75,
                textAlign: 'left',
                bgcolor: isSelected ? goldAlpha(0.1) : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: isSelected ? goldAlpha(0.14) : alpha('#ffffff', 0.04),
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 15,
                    borderRadius: 0,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: `0 1px 3px ${alpha('#000000', 0.3)}`,
                  }}
                >
                  <FlagIcon code={option.countryCode} sx={{ width: 22, height: 15 }} />
                </Box>

                <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography
                    className="font-tr"
                    noWrap
                    sx={{
                      color: isSelected ? GOLD : '#f3f3f3',
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: alpha('#ffffff', 0.35),
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {meta}
                  </Typography>
                </Box>
              </Stack>

              {isSelected ? (
                <Iconify icon="eva:checkmark-fill" width={14} sx={{ color: GOLD, flexShrink: 0 }} />
              ) : (
                <Box sx={{ width: 14, flexShrink: 0 }} />
              )}
            </ButtonBase>
          );
        })}
      </Stack>
    </CustomPopover>
  );

  return (
    <>
      <ButtonBase
        aria-label="Languages button"
        onClick={onOpen}
        sx={[
          {
            p: 0,
            minWidth: 0,
            ...headerLanguagePillSx(open),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            boxShadow: `0 0 0 1px ${alpha('#ffffff', 0.12)}`,
          }}
        >
          <FlagIcon
            code={currentLang?.countryCode}
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
            }}
          />
        </Box>
        <Typography component="span" sx={headerLanguageCodeSx}>
          {(currentLang?.value ?? 'en').toUpperCase()}
        </Typography>
      </ButtonBase>

      {renderMenuList()}
    </>
  );
}
