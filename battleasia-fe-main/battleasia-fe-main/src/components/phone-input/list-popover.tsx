import type { Country } from 'react-phone-number-input/input';

import { useMemo } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { FlagIcon } from 'src/components/flag-icon';
import { SearchNotFound } from 'src/components/search-not-found';

import type { CountryListProps } from './types';

// ----------------------------------------------------------------------

const POPOVER_BG = alpha('#0a0a0a', 0.97);
const POPOVER_BORDER = alpha('#ffffff', 0.14);

const listScrollbarSx = {
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarWidth: 'thin',
  scrollbarColor: `${alpha('#ffffff', 0.28)} transparent`,
  '&::-webkit-scrollbar': { width: 6 },
  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: alpha('#ffffff', 0.22),
    borderRadius: 4,
    '&:hover': { bgcolor: alpha('#ffffff', 0.35) },
  },
};

// ----------------------------------------------------------------------

export function CountryListPopover({
  sx,
  countries,
  countryCode,
  searchCountry,
  onClickCountry,
  onSearchCountry,
}: CountryListProps) {
  const { open, onClose, onOpen, anchorEl } = usePopover();

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === countryCode),
    [countries, countryCode]
  );

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: countries,
        query: searchCountry,
      }),
    [countries, searchCountry]
  );

  const notFound = dataFiltered.length === 0 && !!searchCountry;

  const btnId = 'country-list-button';
  const menuId = 'country-list-menu';

  const renderButton = () => (
    <ButtonBase
      disableRipple
      id={btnId}
      aria-haspopup="true"
      aria-controls={open ? menuId : undefined}
      aria-expanded={open ? 'true' : undefined}
      onClick={onOpen}
      sx={[
        {
          zIndex: 9,
          display: 'flex',
          position: 'absolute',
          justifyContent: 'flex-start',
          width: 'var(--popover-button-width)',
          height: 'var(--popover-button-height)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FlagIcon
        code={selectedCountry?.code}
        sx={{
          borderRadius: '50%',
          width: 'var(--popover-button-height)',
          height: 'var(--popover-button-height)',
        }}
      />

      <Iconify
        icon="eva:chevron-down-fill"
        sx={{ ml: 0.25, flexShrink: 0, color: alpha('#ffffff', 0.65) }}
      />

      <Box
        component="span"
        sx={{
          height: 20,
          ml: 'auto',
          width: '1px',
          bgcolor: alpha('#ffffff', 0.2),
        }}
      />
    </ButtonBase>
  );

  const renderList = () => (
    <MenuList dense disablePadding sx={{ py: 0.5 }}>
      {dataFiltered.map((country) => {
        const isSelected = countryCode === country.code;

        return (
          <MenuItem
            key={country.code}
            selected={isSelected}
            autoFocus={open && isSelected}
            onClick={() => {
              onClose();
              onSearchCountry('');
              onClickCountry(country.code as Country);
            }}
            sx={{
              mx: 0.75,
              mb: 0.25,
              borderRadius: '2px',
              py: 1,
              color: '#ffffff',
              '&:hover': { bgcolor: alpha('#f59e0b', 0.12) },
              '&.Mui-selected': {
                bgcolor: alpha('#f59e0b', 0.2),
                '&:hover': { bgcolor: alpha('#f59e0b', 0.26) },
              },
            }}
          >
            <FlagIcon
              code={country.code}
              sx={{ mr: 1.25, width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }}
            />

            <ListItemText
              primary={country.label}
              secondary={`${country.code} (+${country.phone})`}
              slotProps={{
                primary: {
                  noWrap: true,
                  sx: {
                    typography: 'body2',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.35,
                  },
                },
                secondary: {
                  sx: {
                    typography: 'caption',
                    color: alpha('#ffffff', 0.55),
                    lineHeight: 1.3,
                  },
                },
              }}
            />
          </MenuItem>
        );
      })}
    </MenuList>
  );

  return (
    <>
      {renderButton()}

      <Popover
        id={menuId}
        aria-labelledby={btnId}
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          onClose();
          onSearchCountry('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 1,
              height: 320,
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: POPOVER_BG,
              border: `1px solid ${POPOVER_BORDER}`,
              borderRadius: '2px',
              backdropFilter: 'blur(14px)',
              boxShadow: `0 20px 48px ${alpha('#000000', 0.72)}`,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box
          sx={{
            px: 1.25,
            py: 1.25,
            borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
          }}
        >
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={searchCountry}
            onChange={(event) => onSearchCountry(event.target.value)}
            placeholder="Search country..."
            slotProps={{
              input: {
                sx: {
                  color: '#ffffff',
                  fontSize: 14,
                  bgcolor: alpha('#000000', 0.45),
                  borderRadius: '2px',
                  '& fieldset': { border: `1px solid ${alpha('#ffffff', 0.18)}` },
                  '&:hover fieldset': { borderColor: alpha('#ffffff', 0.3) },
                  '&.Mui-focused fieldset': { borderColor: '#f59e0b' },
                  '& input::placeholder': {
                    color: alpha('#ffffff', 0.4),
                    opacity: 1,
                  },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: alpha('#ffffff', 0.5) }} />
                  </InputAdornment>
                ),
                endAdornment: searchCountry && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => onSearchCountry('')}
                      sx={{ color: alpha('#ffffff', 0.6) }}
                    >
                      <Iconify width={16} icon="mingcute:close-line" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ flex: '1 1 auto', ...listScrollbarSx }}>
          {notFound ? (
            <SearchNotFound
              query={searchCountry}
              sx={{
                px: 2,
                pt: 5,
                color: alpha('#ffffff', 0.55),
                '& .MuiTypography-root': { color: 'inherit' },
              }}
            />
          ) : (
            renderList()
          )}
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  query: string;
  inputData: CountryListProps['countries'];
};

function applyFilter({ inputData, query }: ApplyFilterProps) {
  if (!query) return inputData;

  return inputData.filter(({ label, code, phone }) =>
    [label, code, phone].some((field) => field?.toLowerCase().includes(query.toLowerCase()))
  );
}
