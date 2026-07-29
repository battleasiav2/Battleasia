import axios from 'src/utils/axios';

export const getMessagingSettingsApi = () => axios.get('api/v2/social/messaging-settings');

export const updateMessagingSettingsApi = (data: {
  builtinEnabled?: boolean;
  defaultProviderId?: string;
  allowUserChoice?: boolean;
  providers?: Array<{
    id: string;
    label: string;
    type: string;
    enabled: boolean;
    icon: string;
    color: string;
    url: string;
    openInNewTab: boolean;
  }>;
}) => axios.put('api/v2/social/messaging-settings', data);
