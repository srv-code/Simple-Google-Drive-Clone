import authReducer from './auth/reducers';
import loadingReducer from './loader/reducers';
// import filesReducer from './loader/reducers';

const rootReducers = {
  auth: authReducer,
  loading: loadingReducer,
  // files: filesReducer,
};

export default rootReducers;
