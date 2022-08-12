import {
  LOGIN_FAILED,
  LOGIN_REQUEST,
  LOGIN_RESPONSE,
  LOG_OUT,
} from './action-types';
import {
  LOGIN_DISABLE_LOADER,
  LOGIN_ENABLE_LOADER,
} from '../loader/action-types';
import {
  IAuthFailureAction,
  IAuthRequestAction,
  IAuthSuccessAction,
} from '../../models/actions/auth';
import { IAuthAPIResponse } from '../../models/api/auth';

const requestLogin = (
  username: string,
  password: string
): IAuthRequestAction => ({
  type: LOGIN_REQUEST,
  payload: { username, password },
});

const onLoginFailure = (reason: string): IAuthFailureAction => ({
  type: LOGIN_FAILED,
  payload: reason,
});

const onLoginSuccess = (response: IAuthAPIResponse): IAuthSuccessAction => ({
  type: LOGIN_RESPONSE,
  payload: response,
});

const enableLoader = () => ({
  type: LOGIN_ENABLE_LOADER,
});

const disableLoader = () => ({
  type: LOGIN_DISABLE_LOADER,
});

const logOut = () => ({
  type: LOG_OUT,
});

export {
  requestLogin,
  onLoginFailure,
  onLoginSuccess,
  enableLoader,
  disableLoader,
  logOut,
};
