// core (MUI)
import {
  zhCN as zhCNCore,
} from '@mui/material/locale';
// date pickers (MUI)
import {
  enUS as enUSDate,
  zhCN as zhCNDate,
} from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  zhCN as zhCNDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB', // or 'US' for American English
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'bn',
    label: 'বাংলা',
    countryCode: 'BD', // Bangladesh flag
    adapterLocale: 'bn',
    numberFormat: { code: 'bn-BD', currency: 'BDT' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components }, // Fallback to English for MUI
    },
  },
  {
    value: 'zh',
    label: '中文',
    countryCode: 'CN', // China flag
    adapterLocale: 'zh-cn',
    numberFormat: { code: 'zh-CN', currency: 'CNY' },
    systemValue: {
      components: { ...zhCNCore.components, ...zhCNDate.components, ...zhCNDataGrid.components },
    },
  },
  {
    value: 'hi',
    label: 'हिन्दी',
    countryCode: 'IN', // India flag
    adapterLocale: 'hi',
    numberFormat: { code: 'hi-IN', currency: 'INR' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components }, // Fallback to English for MUI
    },
  },
  {
    value: 'ur',
    label: 'اردو',
    countryCode: 'PK', // Pakistan flag
    adapterLocale: 'ur',
    numberFormat: { code: 'ur-PK', currency: 'PKR' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components }, // Fallback to English for MUI
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
