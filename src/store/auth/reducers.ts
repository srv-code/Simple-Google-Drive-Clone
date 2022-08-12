import { createReducer } from '../../utils/redux';
import {
  LOGIN_FAILED,
  LOGIN_REQUEST,
  LOGIN_RESPONSE,
  LOG_OUT,
} from '../auth/action-types';
import { IAuthState } from '../../models/reducers/auth';
import {
  IAuthFailureAction,
  IAuthRequestAction,
  IAuthSuccessAction,
} from '../../models/actions/auth';

const initialState: IAuthState = {
  isLoggedIn: false,
};

const authReducer = createReducer(initialState, {
  [LOGIN_REQUEST]: (
    state: IAuthState,
    { payload: { username, password } }: IAuthRequestAction
  ) => ({ username, password }),

  [LOGIN_RESPONSE]: (
    state: IAuthState,
    { payload: { token } }: IAuthSuccessAction
  ) => ({ isLoggedIn: true, token }),

  [LOGIN_FAILED]: (state: IAuthState, { payload }: IAuthFailureAction) => ({
    isLoggedIn: false,
    error: payload,
  }),

  [LOG_OUT]: (state: IAuthState) => ({ isLoggedIn: false }),
});

export default authReducer;
