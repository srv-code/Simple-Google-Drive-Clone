import { createReducer } from '../../utils/redux';
import { ILoadingState } from '../../models/reducers/loader';
import {
  LOGIN_DISABLE_LOADER,
  LOGIN_ENABLE_LOADER,
  NOTIF_ENABLE_LOADER,
  NOTIF_DISABLE_LOADER,
  FILES_ENABLE_LOADER,
  FILES_DISABLE_LOADER,
  DIRECTORIES_ENABLE_LOADER,
  DIRECTORIES_DISABLE_LOADER,
} from './action-types';

const initialState: ILoadingState = {
  isLoggingIn: false,
  isFetchingNotifications: false,
  isFetchingFiles: false,
  isFetchingDirectories: false,
};

const loaderReducer = createReducer(initialState, {
  [LOGIN_ENABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isLoggingIn: true,
  }),
  [LOGIN_DISABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isLoggingIn: false,
  }),

  [NOTIF_ENABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isFetchingNotifications: true,
  }),
  [NOTIF_DISABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isFetchingNotifications: false,
  }),

  [FILES_ENABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isFetchingFiles: true,
  }),
  [FILES_DISABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isFetchingFiles: false,
  }),

  [DIRECTORIES_ENABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isFetchingDirectories: true,
  }),
  [DIRECTORIES_DISABLE_LOADER]: (state: ILoadingState): ILoadingState => ({
    ...state,
    isFetchingDirectories: false,
  }),
});

export default loaderReducer;
