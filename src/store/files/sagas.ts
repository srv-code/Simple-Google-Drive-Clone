import { put, delay } from 'redux-saga/effects';
import {
  ICreateNewFileRequestAction,
  IFilesFetchError,
  IFilesFetchRequestAction,
  IPasteDestinationDirectoriesFetchRequestAction,
} from '../../models/actions/files';
import {
  File,
  FileID,
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
} from '../../models/api/files';
import { IFilesState } from '../../models/reducers/files';
import {
  disableLoader,
  enableLoader,
  onFilesFetchSuccess,
  onFilesFetchFailure,
  onPasteDestinationDirectoriesFetchSuccess,
  onPasteDestinationDirectoriesFetchFailure,
  onCreateNewFileSucceeded,
  onCreateNewFileFailure,
} from './actions';

/* For sample use only */
class FileManager {
  fileList: File[] = [
    {
      id: 100,
      isDir: true,
      name: 'Pictures',
    },
    {
      id: 200,
      isDir: true,
      name: 'Videos',
    },
    {
      id: 300,
      isDir: true,
      name: 'Documents',
    },
    {
      id: 400,
      isDir: false,
      size: 10,
      name: '.DS_Store',
    },

    {
      id: 101,
      isDir: true,
      name: 'Family',
      parentId: 100,
    },
    {
      id: 102,
      isDir: true,
      name: 'College',
      parentId: 100,
    },

    {
      id: 103,
      isDir: false,
      size: 120 * 1024, // 120KB
      name: 'family-001.jpg',
      parentId: 101,
    },
    {
      id: 104,
      isDir: false,
      size: 147 * 1024, // 147KB
      name: 'family-002.jpg',
      parentId: 101,
    },

    {
      id: 105,
      isDir: false,
      size: 231 * 1024, // 231KB
      name: 'college-001.jpg',
      parentId: 102,
    },
    {
      id: 106,
      isDir: false,
      size: 170 * 1024, // 170KB
      name: 'college-002.jpg',
      parentId: 102,
    },
    {
      id: 107,
      isDir: false,
      size: 266 * 1024, // 266KB
      name: 'college-002.jpg',
      parentId: 102,
    },

    {
      id: 108,
      isDir: false,
      size: 34.1 * Math.pow(1024, 2), // 34.1MB
      name: 'vid-001.mp4',
      parentId: 200,
    },
    {
      id: 109,
      isDir: false,
      size: 13.45 * Math.pow(1024, 2), // 13.45MB
      name: 'vid-002.mp4',
      parentId: 200,
    },

    {
      id: 110,
      isDir: false,
      size: 13.45 * 1024, // 13.45KB
      name: 'employees.xlsx',
      parentId: 300,
    },
    {
      id: 111,
      isDir: false,
      size: 13 * 1024, // 13.45KB
      name: 'a.xlsx',
      parentId: 300,
    },
  ];

  newId: number =
    this.fileList.reduce((id, file) => {
      const _id = file.id || 0;
      console.log({ id, file, _id });
      return _id > id ? _id : id;
    }, 0) + 1;

  createNewFile(
    token: string,
    isDir: boolean,
    name: string,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IFilesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    this.fileList.push({
      id: this.newId++,
      isDir,
      name,
      parentId,
      size: isDir ? undefined : 12.3 * 1024,
    });

    return {
      success: true,
      data: {
        parentId,
        files: this.fileList.filter(f => f.parentId === parentId),
        lastFetchedOn: new Date(),
      },
    };
  }

  fetchDirs(
    token: string,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IPasteDestinationDirectoriesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    // if (parentId === 101)
    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    return {
      success: true,
      data: {
        parentId,
        files: this.fileList.filter(f => f.parentId === parentId && f.isDir),
      },
    };
  }

  fetchDirList(
    token: string,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IFilesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    // if (parentId === 101)
    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    return {
      success: true,
      data: {
        parentId,
        files: this.fileList.filter(f => f.parentId === parentId),
        lastFetchedOn: new Date(),
      },
    };
  }
}

const fileManager = new FileManager();
const DELAY_INTERVAL_IN_MS = 200;

function* filesFetchAsync({
  payload: { token, parentId },
}: IFilesFetchRequestAction) {
  try {
    yield put(enableLoader('listing'));
    /* NOTE: How to call API */
    // const response = yield call(loginUser, username, password);

    yield delay(DELAY_INTERVAL_IN_MS); /* NOTE: Emulating network latency */

    /* NOTE: Mock API response */
    const response = fileManager.fetchDirList(token!, parentId);

    if (response.success) yield put(onFilesFetchSuccess(response.data!));
    else yield put(onFilesFetchFailure(response.error!));
  } catch (error: any) {
    yield put(onFilesFetchFailure({ reason: 'Unknown' }));
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
    yield put(onCreateNewFileFailure({ reason: 'Unknown' }));
  } finally {
    yield put(disableLoader('listing'));
  }
}

export {
  filesFetchAsync,
  pasteDestinationDirectoriesFetchAsync,
  createNewFileAsync,
};
