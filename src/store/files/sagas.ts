import { put, delay } from 'redux-saga/effects';
import {
  ICreateNewFileRequestAction,
  IFilesFetchRequestAction,
  IFileSortRequestAction,
  IPasteDestinationDirectoriesFetchRequestAction,
} from '../../models/actions/files';
import FileManager from '../../utils/file-manager';
import {
  disableLoader,
  enableLoader,
  onFilesFetchSuccess,
  onFilesFetchFailure,
  onPasteDestinationDirectoriesFetchSuccess,
  onPasteDestinationDirectoriesFetchFailure,
  onCreateNewFileSucceeded,
  onCreateNewFileFailure,
  onFileSortingSucceeded,
  onFileSortingFailure,
} from './actions';

/* For sample use only */

const fileManager = new FileManager();
const DELAY_INTERVAL_IN_MS = 200;

function* filesFetchAsync({
  payload: { token, parentId },
}: IFilesFetchRequestAction) {
  try {
    /* To access redux state */
    // //@ts-ignore
    // const state = yield select((state: IState) => state);
    // console.log('saga', { state });

    yield put(enableLoader('listing'));
    /* NOTE: How to call API */
    // const response = yield call(loginUser, username, password);

    yield delay(DELAY_INTERVAL_IN_MS); /* NOTE: Emulating network latency */

    /* NOTE: Mock API response */
    const response = fileManager.fetchDirList(token!, parentId);

    if (response.success) yield put(onFilesFetchSuccess(response.data!));
    else yield put(onFilesFetchFailure(response.error!));
  } catch (error: any) {
    console.error('filesFetchAsync', error);
    yield put(onFilesFetchFailure({ reason: 'Unknown' }));
  } finally {
    yield put(disableLoader('listing'));
  }
}

function* sortFilesAsync({
  payload: {
    token,
    files,
    parentId,
    sorting: { order, by },
  },
}: IFileSortRequestAction) {
  try {
    yield put(enableLoader('listing'));

    const response = fileManager.sortDirList(
      token!,
      files,
      by,
      order,
      parentId
    );

    if (response.success) yield put(onFileSortingSucceeded(response.data!));
    else yield put(onFileSortingFailure(response.error!));
  } catch (error: any) {
    console.error('sortFilesAsync', error);
    yield put(onFileSortingFailure({ reason: 'Unknown' }));
  } finally {
    yield put(disableLoader('listing'));
  }
}

function* pasteDestinationDirectoriesFetchAsync({
  payload: { token, parentId },
}: IPasteDestinationDirectoriesFetchRequestAction) {
  try {
    yield put(enableLoader('pasting'));
    /* NOTE: How to call API */
    // const response = yield call(loginUser, username, password);

    yield delay(DELAY_INTERVAL_IN_MS); /* NOTE: Emulating network latency */

    /* NOTE: Mock API response */
    const response = fileManager.fetchDirs(token!, parentId);

    if (response.success)
      yield put(onPasteDestinationDirectoriesFetchSuccess(response.data!));
    else yield put(onPasteDestinationDirectoriesFetchFailure(response.error!));
  } catch (error: any) {
    console.error('pasteDestinationDirectoriesFetchAsync', error);
    yield put(onPasteDestinationDirectoriesFetchFailure({ reason: 'Unknown' }));
  } finally {
    yield put(disableLoader('pasting'));
  }
}

function* createNewFileAsync({
  payload: { token, fileName, isDir, fileParentId },
}: ICreateNewFileRequestAction) {
  try {
    yield put(enableLoader('listing'));
    /* NOTE: How to call API */
    // const response = yield call(loginUser, username, password);

    yield delay(DELAY_INTERVAL_IN_MS); /* NOTE: Emulating network latency */

    /* NOTE: Mock API response */
    const response = fileManager.createNewFile(
      token!,
      isDir,
      fileName,
      fileParentId
    );

    if (response.success) yield put(onCreateNewFileSucceeded(response.data!));
    else yield put(onCreateNewFileFailure(response.error!));
  } catch (error: any) {
    console.error('createNewFileAsync', error);
    yield put(onCreateNewFileFailure({ reason: 'Unknown' }));
  } finally {
    yield put(disableLoader('listing'));
  }
}

export {
  filesFetchAsync,
  sortFilesAsync,
  pasteDestinationDirectoriesFetchAsync,
  createNewFileAsync,
};
