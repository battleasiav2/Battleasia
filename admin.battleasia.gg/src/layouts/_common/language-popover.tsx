import { useCallback } from 'react';
import { m } from 'framer-motion';
// @mui
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// components
import { FlagIcon } from 'src/components/flag-icon';
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    countryCode: 'GB',
  },
  {
    label: 'French',
    value: 'fr',
    countryCode: 'FR',
  },
  {
    label: 'Vietnamese',
    value: 'vi',
    countryCode: 'VN',
  },
  {
    label: 'Chinese',
    value: 'cn',
    countryCode: 'CN',
  },
  {
    label: 'Arabic',
    value: 'ar',
    countryCode: 'SA',
  },
];

export default function LanguagePopover() {
  const popover = usePopover();

  const currentLang = allLangs[0];

  const handleChangeLang = useCallback(() => {
    popover.onClose();
  }, [popover]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          ...(popover.open && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        <FlagIcon code={currentLang.countryCode} sx={{ width: 28, height: 20, borderRadius: 0.65 }} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 160 }}>
        {allLangs.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang.value}
            onClick={handleChangeLang}
          >
            <FlagIcon code={option.countryCode} sx={{ mr: 1, width: 28, height: 20, borderRadius: 0.65 }} />

            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
