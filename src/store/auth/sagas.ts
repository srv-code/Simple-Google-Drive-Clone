import { put, delay } from 'redux-saga/effects';
import { IAuthRequestAction } from '../../models/actions/auth';
import {
  disableLoader,
  enableLoader,
  onLoginFailure,
  onLoginSuccess,
} from './actions';

function* loginAsync({ payload: { username, password } }: IAuthRequestAction) {
  try {
    yield put(enableLoader());
    /* NOTE: How to call API */
    // const response = yield call(loginUser, username, password);

    yield delay(2000); /* NOTE: Emulating network latency */

    /* NOTE: Mock API response */
    const response =
      username === 'admin' && password === 'Admin@123'
        ? { success: true, user: { token: 'Xgs3a34uyd234nf6kg' } }
        : { success: false, reason: 'Invalid credentials' };

    if (!response.success) throw new Error(response.reason);

    yield put(onLoginSuccess(response.user!));

    /* NOTE: no need to call navigate as this is handled by redux store with SwitchNavigator */
    // yield call(navigate(screenNames.home));
  } catch (error: any) {
    yield put(onLoginFailure(error.message));
  } finally {
    yield put(disableLoader());
  }
}

export { loginAsync };
