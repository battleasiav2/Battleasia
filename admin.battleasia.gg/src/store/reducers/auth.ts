import { createSlice } from '@reduxjs/toolkit';
import { InitialAuthContextProps } from '../type';

const initialUser = {
  _id: '',
  email: '',
  username: '',
  status: true,
  avatar: '',
  balance: 0,
  createdAt: new Date(),
};

const initialState: InitialAuthContextProps = {
  isInitialized: true,
  isLoggedIn: false,
  token: '',
  balance: 0,
  user: initialUser,
};

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAction(state, action: any) {
      const { balance, user, session } = action.payload!;
      state.user = user;
      state.token = session.accessToken;
      // state.balance = balance.balance;
      state.balance = 0;
      state.isLoggedIn = true;
      state.isInitialized = true;
    },

    userAction(state, action: any) {
      state.user = action.payload;
    },

    balanceAction(state, action: { payload: number }) {
      state.balance = action.payload;
    },

    logoutAction(state) {
      state.token = '';
      state.balance = 0;
      state.user = initialUser;
      state.isLoggedIn = false;
      state.isInitialized = true;
      state = { ...state };
      if (
        window.location.pathname.toString().indexOf('blackjack') !== -1 ||
        window.location.pathname.toString().indexOf('roulette') !== -1
      ) {
        window.location.reload();
      }
    },

  },
});

export default auth.reducer;

export const {
  loginAction, logoutAction, userAction, balanceAction,
} = auth.actions;
