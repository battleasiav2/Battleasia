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
import * as dashboardApi from './api/dashboard';

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
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
