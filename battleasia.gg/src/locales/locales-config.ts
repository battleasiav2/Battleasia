// ----------------------------------------------------------------------

export const fallbackLng = 'en';
export const languages = ['en', 'bn', 'zh', 'hi', 'ur'];
export const defaultNS = 'common';

export type LanguageValue = (typeof languages)[number];

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages: Record<
  LanguageValue,
  { success: string; error: string; loading: string }
> = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  bn: {
    success: 'ভাষা পরিবর্তন করা হয়েছে!',
    error: 'ভাষা পরিবর্তনে ত্রুটি!',
    loading: 'লোড হচ্ছে...',
  },
  zh: {
    success: '语言已更改！',
    error: '更改语言时出错！',
    loading: '加载中...',
  },
  hi: {
    success: 'भाषा बदल दी गई है!',
    error: 'भाषा बदलने में त्रुटि!',
    loading: 'लोड हो रहा है...',
  },
  ur: {
    success: 'زبان تبدیل کر دی گئی ہے!',
    error: 'زبان تبدیل کرنے میں خرابی!',
    loading: 'لوڈ ہو رہا ہے...',
  },
};
