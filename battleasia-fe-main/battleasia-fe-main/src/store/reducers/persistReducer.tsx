import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// ----------------------------------------------------------------------

const stripTokenTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: { token?: string }) => ({
    ...outboundState,
    token: '',
  }),
  { whitelist: ['auth'] }
);

const persistConfig = {
  key: 'battleasia',
  storage,
  whitelist: ['auth'],
  transforms: [stripTokenTransform],
  throttle: 1000,
  serialize: true,
  writeFailHandler: (err: Error) => {
    console.error('Redux persist write failed:', err);
  },
};

// ----------------------------------------------------------------------

const persist = (reducers: any) => persistReducer(persistConfig, reducers);

// ----------------------------------------------------------------------

export default persist;
