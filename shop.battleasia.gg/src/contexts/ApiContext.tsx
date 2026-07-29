import React, { createContext } from 'react';

import * as authApi from './api/auth';
import * as shopApi from './api/shop';
import type { ApiContextType } from './type';

const ApiContext = createContext<ApiContextType | null>(null);
/* eslint-disable */
export const ApiProvider = ({ children }: { children: React.ReactElement }) => {
  return (
    <ApiContext.Provider
      value={{
        ...authApi,
        ...shopApi,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;

