import {
  FILES_FETCH_REQUEST,
  FILES_FETCH_RESPONSE,
  FILES_FETCH_FAILED,
  PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
  PASTE_DESTINATION_DIRECTORIES_FETCH_RESPONSE,
  PASTE_DESTINATION_DIRECTORIES_FETCH_FAILED,
} from './action-types';
import {
  FILES_ENABLE_LOADER,
  FILES_DISABLE_LOADER,
  DIRECTORIES_ENABLE_LOADER,
  DIRECTORIES_DISABLE_LOADER,
} from '../loader/action-types';
import {
  IFilesFetchFailureAction,
  IFilesFetchError,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IFilesFetchRequestPayload,
  IPasteDestinationDirectoriesFetchRequestPayload,
  IPasteDestinationDirectoriesFetchRequestAction,
  IPasteDestinationDirectoriesFetchSuccessAction,
  IPasteDestinationDirectoriesFetchFailureAction,
} from '../../models/actions/files';
import {
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
} from '../../models/api/files';

/* Fetch files */
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

/* Fetch paste destination directories */
const requestPasteDestinationDirectories = (
  payload: IPasteDestinationDirectoriesFetchRequestPayload
): IPasteDestinationDirectoriesFetchRequestAction => ({
  type: PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
  payload,
});

const onPasteDestinationDirectoriesFetchFailure = (
  response: IFilesFetchError
): IPasteDestinationDirectoriesFetchFailureAction => ({
  type: PASTE_DESTINATION_DIRECTORIES_FETCH_FAILED,
  payload: response,
});

const onPasteDestinationDirectoriesFetchSuccess = (
  response: IPasteDestinationDirectoriesAPIResponse
): IPasteDestinationDirectoriesFetchSuccessAction => ({
  type: PASTE_DESTINATION_DIRECTORIES_FETCH_RESPONSE,
  payload: response,
});

const enableLoader = (type: 'listing' | 'pasting') => ({
  type: type === 'listing' ? FILES_ENABLE_LOADER : DIRECTORIES_ENABLE_LOADER,
});

const disableLoader = (type: 'listing' | 'pasting') => ({
  type: type === 'listing' ? FILES_DISABLE_LOADER : DIRECTORIES_DISABLE_LOADER,
});

export {
  requestFiles,
  onFilesFetchFailure,
  onFilesFetchSuccess,
  requestPasteDestinationDirectories,
  onPasteDestinationDirectoriesFetchFailure,
  onPasteDestinationDirectoriesFetchSuccess,
  enableLoader,
  disableLoader,
};
