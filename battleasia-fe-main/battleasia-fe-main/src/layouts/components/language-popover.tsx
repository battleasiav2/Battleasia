import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { FlagIcon } from 'src/components/flag-icon';
import { Iconify } from 'src/components/iconify/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { varTap, varHover, transitionTap } from 'src/components/animate';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

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
            bgcolor: 'rgba(16, 20, 28, 0.96)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
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
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            color: '#feab02',
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          Language
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {data.length}
        </Typography>
      </Stack>

      <Stack divider={<Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.06)' }} />}>
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
                bgcolor: isSelected ? 'rgba(254, 171, 2, 0.1)' : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: isSelected ? 'rgba(254, 171, 2, 0.14)' : 'rgba(255,255,255,0.04)',
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
                    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                  }}
                >
                  <FlagIcon code={option.countryCode} sx={{ width: 36, height: 24 }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    className="font-tr"
                    sx={{
                      color: isSelected ? '#feab02' : '#f3f3f3',
                      fontSize: 16,
                      fontWeight: isSelected ? 700 : 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.42)',
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
                    bgcolor: '#feab02',
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
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.03)}
        transition={transitionTap()}
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
            bgcolor: open ? 'rgba(254, 171, 2, 0.12)' : 'rgba(8, 12, 20, 0.55)',
            border: '2px solid',
            borderColor: open ? 'rgba(254, 171, 2, 0.5)' : 'rgba(255,255,255,0.18)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(12, 18, 28, 0.7)',
              borderColor: 'rgba(254, 171, 2, 0.45)',
            },
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
