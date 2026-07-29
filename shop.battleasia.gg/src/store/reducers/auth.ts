import { createSlice } from '@reduxjs/toolkit';

import type { UserProfile, InitialLoginContextProps } from '../types/auth';

// ----------------------------------------------------------------------

const initialUser: UserProfile = {
  _id: '',
  email: '',
  username: '',
  referral: '',
  avatar: '',
  isPremium: false,
};

const initialState: InitialLoginContextProps = {
  isInitialized: true,
  isLoggedIn: false,
  code: '',
  token: '',
  balance: 0,
  user: initialUser,
};

// ----------------------------------------------------------------------

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAction(state, action) {
      const { user, session, balance } = action.payload;
      const balanceValue = balance.balance || 0;
      state.user = { ...initialUser, ...user, balance: balanceValue };
      state.token = session?.accessToken || '';
      state.balance = balanceValue;
      state.isLoggedIn = true;
      state.isInitialized = true;
    },

    userAction(state, action) {
      state.user = { ...state.user, ...action.payload };
    },

    balanceAction(state, action) {
      state.balance = action.payload;
      if (state.user) {
        state.user.balance = action.payload;
      }
    },

    logoutAction(state) {
      state.token = '';
      state.balance = 0;
      state.user = initialUser;
      state.isLoggedIn = false;
      state.isInitialized = true;
    },
  },
});

// ----------------------------------------------------------------------

export default auth.reducer;

export const { loginAction, logoutAction, userAction, balanceAction } =
  auth.actions;

