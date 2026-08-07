import 'dayjs/locale/en';
import 'dayjs/locale/bn';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/hi';
import 'dayjs/locale/ur';

import dayjs from 'dayjs';
import { useEffect, type ReactNode } from 'react';

import { useTranslate } from './use-locales';

// ----------------------------------------------------------------------
// App-wide: only sync dayjs locale (no @mui/x-date-pickers on critical path).
// Screens that need DatePicker should wrap with DatePickerLocalization locally.

type Props = {
  children: ReactNode;
};

export function LocalizationProvider({ children }: Props) {
  const { currentLang } = useTranslate();

  useEffect(() => {
    dayjs.locale(currentLang.adapterLocale);
  }, [currentLang.adapterLocale]);

  return children;
}
