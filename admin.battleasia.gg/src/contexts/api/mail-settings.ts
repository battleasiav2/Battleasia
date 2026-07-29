import axios from 'src/utils/axios';

export const getMailSettingsApi = () => axios.get('api/v2/app-settings/mail-settings');

export const updateMailSettingsApi = (data: {
  enabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  secure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  fromName?: string;
  fromEmail?: string;
}) => axios.put('api/v2/app-settings/mail-settings', data);

export const sendTestMailApi = (to: string) =>
  axios.post('api/v2/app-settings/mail-settings/test', { to });
