import { all, takeLatest } from 'redux-saga/effects';
import { LOGIN_REQUEST } from './auth/action-types';
import { loginAsync } from './auth/sagas';
import { FILES_FETCH_REQUEST } from './files/action-types';
import { filesFetchAsync } from './files/sagas';

function* rootSagas() {
  yield all([
    takeLatest(LOGIN_REQUEST, loginAsync),
    takeLatest(FILES_FETCH_REQUEST, filesFetchAsync),
  ]);
}

export default rootSagas;
