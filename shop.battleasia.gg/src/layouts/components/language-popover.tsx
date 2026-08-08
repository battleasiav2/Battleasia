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
            width: 280,
            overflow: 'hidden',
            borderRadius: 0,
            bgcolor: alpha('#000000', 0.94),
            border: `1px solid ${alpha(GOLD, 0.32)}`,
            boxShadow: `
              0 24px 60px ${alpha('#000000', 0.65)},
              0 0 0 1px ${alpha(GOLD, 0.06)},
              0 0 36px ${alpha(GOLD, 0.1)}
            `,
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
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: `1px solid ${alpha(GOLD, 0.18)}`,
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            color: GOLD,
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          Language
        </Typography>
        <Typography
          sx={{
            color: alpha('#ffffff', 0.45),
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {data.length}
        </Typography>
      </Stack>

      <Stack divider={<Box sx={{ height: '1px', bgcolor: alpha('#ffffff', 0.06) }} />}>
        {data.map((option) => {
          const isSelected = option.value === currentLang?.value;

          return (
            <ButtonBase
              key={option.value}
              onClick={() => handleChangeLang(option.value)}
              sx={{
                width: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                px: 2,
                py: 1.35,
                textAlign: 'left',
                bgcolor: isSelected ? alpha(GOLD, 0.1) : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: isSelected ? alpha(GOLD, 0.14) : alpha('#ffffff', 0.04),
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 24,
                    borderRadius: 0,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: `0 1px 4px ${alpha('#000000', 0.35)}`,
                  }}
                >
                  <FlagIcon code={option.countryCode} sx={{ width: 36, height: 24 }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    className="font-tr"
                    sx={{
                      color: isSelected ? GOLD : '#f3f3f3',
                      fontSize: 16,
                      fontWeight: isSelected ? 700 : 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Typography
                    sx={{
                      color: alpha('#ffffff', 0.42),
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      mt: 0.2,
                    }}
                  >
                    {getLangMeta(option.value)}
                  </Typography>
                </Box>
              </Stack>

              {isSelected ? (
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    bgcolor: GOLD,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="eva:checkmark-fill" width={18} sx={{ color: '#111' }} />
                </Box>
              ) : (
                <Box sx={{ width: 28, height: 28, flexShrink: 0 }} />
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
            width: { xs: 36, sm: 42 },
            height: { xs: 32, sm: 38 },
            borderRadius: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: open ? alpha(GOLD, 0.12) : alpha('#080c14', 0.55),
            border: '2px solid',
            borderColor: open ? alpha(GOLD, 0.5) : alpha('#ffffff', 0.18),
            boxShadow: `inset 0 0 0 1px ${alpha('#000000', 0.25)}`,
            transition: 'transform 0.15s ease, background-color 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              bgcolor: alpha('#0c121c', 0.7),
              borderColor: alpha(GOLD, 0.45),
              transform: 'scale(1.03)',
            },
            '&:active': { transform: 'scale(0.96)' },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <FlagIcon
          code={currentLang?.countryCode}
          sx={{
            width: { xs: 24, sm: 28 },
            height: { xs: 18, sm: 21 },
            borderRadius: 0,
          }}
        />
      </ButtonBase>

      {renderMenuList()}
    </>
  );
}
