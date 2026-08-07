// Slim locales — avoid pulling @mui/x-data-grid into every page (TBT).
// Date-picker locales load only via LocalizationProvider when needed.

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: { components: {} },
  },
  {
    value: 'bn',
    label: 'বাংলা',
    countryCode: 'BD',
    adapterLocale: 'bn',
    numberFormat: { code: 'bn-BD', currency: 'BDT' },
    systemValue: { components: {} },
  },
  {
    value: 'zh',
    label: '中文',
    countryCode: 'CN',
    adapterLocale: 'zh-cn',
    numberFormat: { code: 'zh-CN', currency: 'CNY' },
    systemValue: { components: {} },
  },
  {
    value: 'hi',
    label: 'हिन्दी',
    countryCode: 'IN',
    adapterLocale: 'hi',
    numberFormat: { code: 'hi-IN', currency: 'INR' },
    systemValue: { components: {} },
  },
  {
    value: 'ur',
    label: 'اردو',
    countryCode: 'PK',
    adapterLocale: 'ur',
    numberFormat: { code: 'ur-PK', currency: 'PKR' },
    systemValue: { components: {} },
  },
];
