import React, { useMemo, createContext } from 'react';

import * as authApi from './api/auth';
import * as feedApi from './api/feed';
import * as gamesApi from './api/games';
import * as usersApi from './api/users';
import * as customerSupportApi from './api/customer-support';
import * as filesApi from './api/files';
import * as shopApi from './api/shop';
import * as publicApi from './api/public';
import * as socialApi from './api/social';
import * as engagementApi from './api/engagement';
import type { ApiContextType } from './type';

const ApiContext = createContext<ApiContextType | null>(null);

 
export const ApiProvider = ({ children }: { children: React.ReactElement }) => {
  // Memoize API object with useMemo - prevent creating new object on every render
  const apiValue = useMemo(
    () => ({
      ...authApi,
      ...gamesApi,
      ...usersApi,
      ...feedApi,
      ...customerSupportApi,
      ...filesApi,
      ...shopApi,
      ...publicApi,
      ...socialApi,
      ...engagementApi,
    }),
    [] // Empty dependency array - create only once
  );

  return (
    <ApiContext.Provider value={apiValue}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;

