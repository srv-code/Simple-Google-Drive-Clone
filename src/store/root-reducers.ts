import loadingReducer from './loader/reducers';
import authReducer from './auth/reducers';
import filesReducer from './files/reducers';

const rootReducers = {
  auth: authReducer,
  loading: loadingReducer,
  files: filesReducer,
};

export default rootReducers;
