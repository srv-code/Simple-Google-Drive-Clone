import { put, delay } from 'redux-saga/effects';
import {
  IFilesFetchError,
  IFilesFetchRequestAction,
} from '../../models/actions/files';
import { File, FileID, IFilesAPIResponse } from '../../models/api/files';
import {
  disableLoader,
  enableLoader,
  onFilesFetchSuccess,
  onFilesFetchFailure,
} from './actions';

/* For sample use only */
class FileManager {
  fileList: File[] = [
    {
      id: 100,
      isDir: true,
      name: 'Pictures',
      parentId: undefined,
    },
    {
      id: 200,
      isDir: true,
      name: 'Videos',
      parentId: undefined,
    },
    {
      id: 300,
      isDir: true,
      name: 'Documents',
      parentId: undefined,
    },
    {
      id: 400,
      isDir: false,
      size: '10B',
      name: '.DS_Store',
      parentId: undefined,
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
      size: '120KB',
      name: 'family-001.jpg',
      parentId: 101,
    },
    {
      id: 104,
      isDir: false,
      size: '147KB',
      name: 'family-002.jpg',
      parentId: 101,
    },

    {
      id: 105,
      isDir: false,
      size: '231KB',
      name: 'college-001.jpg',
      parentId: 102,
    },
    {
      id: 106,
      isDir: false,
      size: '170KB',
      name: 'college-002.jpg',
      parentId: 102,
    },
    {
      id: 107,
      isDir: false,
      size: '266KB',
      name: 'college-002.jpg',
      parentId: 102,
    },

    {
      id: 108,
      isDir: false,
      size: '34.1MB',
      name: 'vid-001.jpg',
      parentId: 200,
    },
    {
      id: 109,
      isDir: false,
      size: '13.45MB',
      name: 'vid-002.jpg',
      parentId: 200,
    },
  ];

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

function* filesFetchAsync({
  payload: { token, parentId },
}: IFilesFetchRequestAction) {
  try {
    yield put(enableLoader());
    /* NOTE: How to call API */
    // const response = yield call(loginUser, username, password);

    yield delay(1000); /* NOTE: Emulating network latency */

    /* NOTE: Mock API response */
    const response = fileManager.fetchDirList(token, parentId);

    if (response.success) yield put(onFilesFetchSuccess(response.data!));
    else yield put(onFilesFetchFailure(response.error!));
  } catch (error: any) {
    yield put(onFilesFetchFailure({ reason: 'Unknown' }));
  } finally {
    yield put(disableLoader());
  }
}

export { filesFetchAsync };
