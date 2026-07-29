import React, { createContext } from 'react';
import { ApiContextType } from './type';
import * as authApi from './api/auth';
import * as usersApi from './api/users';
import * as filesApi from './api/files';
import * as gamesApi from './api/games';
import * as paymentsApi from './api/payments';
import * as notificationsApi from './api/notifications';
import * as feedApi from './api/feed';
import * as customerSupportApi from './api/customer-support';
import * as shopApi from './api/shop';
import * as liveChatApi from './api/live-chat';
import * as messagingSettingsApi from './api/messaging-settings';
import * as profileSocialSettingsApi from './api/profile-social-settings';
import * as socialModerationApi from './api/social-moderation';
import * as dashboardApi from './api/dashboard';
import * as mailSettingsApi from './api/mail-settings';
import * as appDownloadApi from './api/app-download';

const ApiContext = createContext<ApiContextType | null>(null);
/* eslint-disable */
export const ApiProvider = ({ children }: { children: React.ReactElement }) => {
  return (
    <ApiContext.Provider
      value={{
        ...authApi,
        ...usersApi,
        ...filesApi,
        ...gamesApi,
        ...paymentsApi,
        ...notificationsApi,
        ...feedApi,
        ...customerSupportApi,
        ...shopApi,
        ...dashboardApi,
        ...liveChatApi,
        ...messagingSettingsApi,
        ...profileSocialSettingsApi,
        ...socialModerationApi,
        ...mailSettingsApi,
        ...appDownloadApi,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
