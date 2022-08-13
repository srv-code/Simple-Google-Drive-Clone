import {
  FILES_FETCH_REQUEST,
  FILES_FETCH_RESPONSE,
  FILES_FETCH_FAILED,
} from './action-types';
import {
  FILES_ENABLE_LOADER,
  FILES_DISABLE_LOADER,
} from '../loader/action-types';
import {
  IFilesFetchFailureAction,
  IFilesFetchError,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IFilesFetchRequestPayload,
} from '../../models/actions/files';
import { IFilesAPIResponse } from '../../models/api/files';

const requestFiles = (
  payload: IFilesFetchRequestPayload
): IFilesFetchRequestAction => ({
  type: FILES_FETCH_REQUEST,
  payload,
});

const onFilesFetchFailure = (
  response: IFilesFetchError
): IFilesFetchFailureAction => ({
  type: FILES_FETCH_FAILED,
  payload: response,
});

const onFilesFetchSuccess = (
  response: IFilesAPIResponse
): IFilesFetchSuccessAction => ({
  type: FILES_FETCH_RESPONSE,
  payload: response,
});

const enableLoader = () => ({
  type: FILES_ENABLE_LOADER,
});

const disableLoader = () => ({
  type: FILES_DISABLE_LOADER,
});

export {
  requestFiles,
  onFilesFetchFailure,
  onFilesFetchSuccess,
  enableLoader,
  disableLoader,
};
