import { combineReducers } from 'redux';

import authReducer from './auth';
import notificationsReducer from './notifications';

// ----------------------------------------------------------------------

const reducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
});

// ----------------------------------------------------------------------

export default reducer;

