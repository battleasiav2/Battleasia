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

const GOLD = '#f59e0b';

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
        sx={{ ml: 0.25, flexShrink: 0, color: 'text.disabled' }}
      />

      <Box
        component="span"
        sx={(theme) => ({
          height: 20,
          ml: 'auto',
          width: '1px',
          bgcolor: theme.vars.palette.divider,
        })}
      />
    </ButtonBase>
  );

  const renderList = () => (
    <MenuList sx={{ py: 0.5 }}>
      {dataFiltered.map((country) => (
        <MenuItem
          key={country.code}
          selected={open && countryCode === country.code}
          autoFocus={open && countryCode === country.code}
          onClick={() => {
            onClose();
            onSearchCountry('');
            onClickCountry(country.code as Country);
          }}
          sx={{
            minHeight: 48,
            py: 1.15,
            px: 1.5,
            borderRadius: 0,
            gap: 1,
            color: alpha('#ffffff', 0.9),
            '&:hover': { bgcolor: alpha(GOLD, 0.12) },
            '&.Mui-selected': {
              bgcolor: alpha(GOLD, 0.18),
              '&:hover': { bgcolor: alpha(GOLD, 0.24) },
            },
          }}
        >
          <FlagIcon
            code={country.code}
            sx={{ mr: 0.5, width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }}
          />

          <ListItemText
            primary={country.label}
            secondary={`${country.code} (+${country.phone})`}
            slotProps={{
              primary: {
                noWrap: true,
                sx: { typography: 'body2', color: '#ffffff', fontWeight: 600 },
              },
              secondary: {
                sx: { typography: 'caption', color: alpha('#ffffff', 0.5) },
              },
            }}
          />
        </MenuItem>
      ))}
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
              height: 340,
              maxWidth: 340,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              bgcolor: alpha('#0a0a0a', 0.98),
              border: `1px solid ${alpha('#ffffff', 0.14)}`,
              backdropFilter: 'blur(14px)',
              boxShadow: `0 16px 40px ${alpha('#000000', 0.65)}`,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1.5, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }}>
          <TextField
            autoFocus
            fullWidth
            value={searchCountry}
            onChange={(event) => onSearchCountry(event.target.value)}
            placeholder="Search country..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                bgcolor: alpha('#000000', 0.55),
                borderRadius: 0,
                minHeight: 44,
                '& fieldset': { border: `1px solid ${alpha('#ffffff', 0.24)}` },
                '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: 1 },
                '& input::placeholder': { color: alpha('#ffffff', 0.4), opacity: 1 },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: alpha('#ffffff', 0.45) }} />
                  </InputAdornment>
                ),
                endAdornment: searchCountry && (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => onSearchCountry('')}>
                      <Iconify width={16} icon="mingcute:close-line" sx={{ color: alpha('#ffffff', 0.55) }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ flex: '1 1 auto', overflowX: 'hidden' }}>
          {notFound ? (
            <SearchNotFound
              query={searchCountry}
              sx={{ px: 2, pt: 5, color: alpha('#ffffff', 0.7) }}
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
