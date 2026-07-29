import axios from 'src/utils/axios';

export const getLiveChatSettingsApi = () =>
  axios.get('api/v2/customer-support/live-chat-settings');

export const updateLiveChatSettingsApi = (data: {
  enabled?: boolean;
  agentName?: string;
  agentTitle?: string;
  agentAvatar?: string;
  logoUrl?: string;
  welcomeMessage?: string;
  socialLinks?: Array<{
    label: string;
    icon: string;
    color: string;
    href: string;
  }>;
}) => axios.put('api/v2/customer-support/live-chat-settings', data);
