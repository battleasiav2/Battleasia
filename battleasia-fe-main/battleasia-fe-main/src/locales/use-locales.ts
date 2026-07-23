import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-hot-toast';

import { allLangs } from './all-langs';
import { fallbackLng, changeLangMessages as messages } from './locales-config';

import type { LanguageValue } from './locales-config';

// ----------------------------------------------------------------------

export function useTranslate(ns?: string) {
  const { t, i18n } = useTranslation(ns);

  const fallback = allLangs.filter((lang) => lang.value === fallbackLng)[0];

  const currentLang = allLangs.find((lang) => lang.value === i18n.resolvedLanguage);

  const onChangeLang = useCallback(
    async (newLang: LanguageValue) => {
      try {
        const currentMessages = messages[newLang] || messages.en;

        // Show loading toast
        const toastId = toast.loading(currentMessages.loading);

        // Change the language and wait for it to complete
        await i18n.changeLanguage(newLang);

        // Update dayjs locale for the new language
        const newLangConfig = allLangs.find((lang) => lang.value === newLang);
        if (newLangConfig) {
          dayjs.locale(newLangConfig.adapterLocale);
        }

        // Show success toast
        toast.success(currentMessages.success, { id: toastId });
      } catch (error) {
        console.error(error);
        const currentMessages = messages[newLang] || messages.en;
        toast.error(currentMessages.error);
      }
    },
    [i18n]
  );

  return {
    t,
    i18n,
    onChangeLang,
    currentLang: currentLang ?? fallback,
  };
}
