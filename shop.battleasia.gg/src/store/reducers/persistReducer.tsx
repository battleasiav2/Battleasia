import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const stripTokenTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: { token?: string }) => ({
    ...outboundState,
    token: '',
  }),
  { whitelist: ['auth'] }
);

// Separate from main app (`battleasia`) so same-domain `/store` deploy
// does not inherit main-site login and skip shop sign-in.
const persistConfig = {
  key: 'battleasia-shop',
  storage,
  whitelist: ['auth'],
  transforms: [stripTokenTransform],
};

const persist = (reducers: any) => persistReducer(persistConfig, reducers);

export default persist;
