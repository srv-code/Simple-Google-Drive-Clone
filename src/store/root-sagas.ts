import { all, takeLatest } from 'redux-saga/effects';
import { LOGIN_REQUEST } from './auth/action-types';
import { loginAsync } from './auth/sagas';
import {
  CREATE_NEW_FILE_REQUEST,
  FILES_FETCH_REQUEST,
  PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
} from './files/action-types';
import {
  createNewFileAsync,
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
    takeLatest(CREATE_NEW_FILE_REQUEST, createNewFileAsync),
  ]);
}

export default rootSagas;
