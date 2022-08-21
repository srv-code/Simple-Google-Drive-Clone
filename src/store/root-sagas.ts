import { all, takeLatest } from 'redux-saga/effects';
import { LOGIN_REQUEST } from './auth/action-types';
import { loginAsync } from './auth/sagas';
import {
  FILES_FETCH_REQUEST,
  PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
} from './files/action-types';
import {
  filesFetchAsync,
  pasteDestinationDirectoriesFetchAsync,
} from './files/sagas';

function* rootSagas() {
  yield all([
    takeLatest(LOGIN_REQUEST, loginAsync),
    takeLatest(FILES_FETCH_REQUEST, filesFetchAsync),
    takeLatest(
      PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
      pasteDestinationDirectoriesFetchAsync
    ),
  ]);
}

export default rootSagas;
