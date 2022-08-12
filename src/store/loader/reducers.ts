import { createReducer } from '../../utils/redux';
import { ILoadingState } from '../../models/reducers/loader';
import {
  LOGIN_DISABLE_LOADER,
  LOGIN_ENABLE_LOADER,
  NOTIF_ENABLE_LOADER,
  NOTIF_DISABLE_LOADER,
} from './action-types';

const initialState: ILoadingState = {
  isLoggingIn: false,
  isFetchingNotifications: false,
};

const loaderReducer = createReducer(initialState, {
  [LOGIN_ENABLE_LOADER]: (state: ILoadingState) => ({
    ...state,
    isLoggingIn: true,
  }),
  [LOGIN_DISABLE_LOADER]: (state: ILoadingState) => ({
    ...state,
    isLoggingIn: false,
  }),

  [NOTIF_ENABLE_LOADER]: (state: ILoadingState) => ({
    ...state,
    isFetchingNotifications: true,
  }),
  [NOTIF_DISABLE_LOADER]: (state: ILoadingState) => ({
    ...state,
    isFetchingNotifications: false,
  }),
});

export default loaderReducer;
