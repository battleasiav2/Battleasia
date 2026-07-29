import { persistStore } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import type {
  TypedUseSelectorHook} from 'react-redux';
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
} from 'react-redux';

import rootReducer from './reducers';
import persistReducer from './reducers/persistReducer';

// ----------------------------------------------------------------------

const store = configureStore({
  reducer: persistReducer(rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
});

// ----------------------------------------------------------------------

const persister = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

const { dispatch } = store;

const useDispatch = () => useAppDispatch<AppDispatch>();

const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;

// ----------------------------------------------------------------------

export { store, dispatch, persister, useSelector, useDispatch };

