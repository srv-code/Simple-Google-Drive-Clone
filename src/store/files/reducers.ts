import { createReducer } from '../../utils/redux';
import produce from 'immer';
import {
  FILES_FETCH_REQUEST,
  FILES_FETCH_RESPONSE,
  FILES_FETCH_FAILED,
  PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
  PASTE_DESTINATION_DIRECTORIES_FETCH_RESPONSE,
  PASTE_DESTINATION_DIRECTORIES_FETCH_FAILED,
  CREATE_NEW_FILE_REQUEST,
  CREATE_NEW_FILE_FAILED,
  CREATE_NEW_FILE_SUCCEDED,
  SORT_FILES_REQUEST,
  SORT_FILES_FAILED,
  SORT_FILES_SUCCEDED,
} from '../files/action-types';
import { IFilesState } from '../../models/reducers/files';
import {
  ICreateNewFileRequestAction,
  IFilesFetchFailureAction,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IFileSortRequestAction,
  IPasteDestinationDirectoriesFetchRequestAction,
  IPasteDestinationDirectoriesFetchSuccessAction,
} from '../../models/actions/files';

const initialState: IFilesState = {
  directoryListing: { files: [], sorting: { by: 'NAME', order: 'ASCENDING' } },
  pasteDestinationListing: { files: [] },
};

const filesReducer = createReducer(initialState, {
  /* Fetch files */
  [FILES_FETCH_REQUEST]: (
    state: IFilesState,
    { payload: { token, parentId } }: IFilesFetchRequestAction
  ): IFilesState =>
    produce(state, draft => {
      draft.token = token;
      draft.directoryListing.parentId = parentId;
    }),

  [FILES_FETCH_RESPONSE]: (
    state: IFilesState,
    { payload: { files, parentId, lastFetchedOn } }: IFilesFetchSuccessAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.files = files;
      draft.directoryListing.parentId = parentId;
      draft.directoryListing.lastFetchedOn = lastFetchedOn;
      draft.directoryListing.error = undefined;
    }),

  [FILES_FETCH_FAILED]: (
    state: IFilesState,
    { payload }: IFilesFetchFailureAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.error = payload;
    }),

  /* Fetch paste destination directories */
  [PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST]: (
    state: IFilesState,
    {
      payload: { token, parentId, sourceDirectoryId },
    }: IPasteDestinationDirectoriesFetchRequestAction
  ): IFilesState =>
    produce(state, draft => {
      draft.token = token;
      draft.pasteDestinationListing.parentId = parentId;
      draft.pasteDestinationListing.sourceDirectoryId = sourceDirectoryId;
    }),

  [PASTE_DESTINATION_DIRECTORIES_FETCH_RESPONSE]: (
    state: IFilesState,
    {
      payload: { files, parentId },
    }: IPasteDestinationDirectoriesFetchSuccessAction
  ): IFilesState =>
    produce(state, draft => {
      draft.pasteDestinationListing.files = files;
      draft.pasteDestinationListing.parentId = parentId;
    }),

  [PASTE_DESTINATION_DIRECTORIES_FETCH_FAILED]: (
    state: IFilesState,
    { payload }: IFilesFetchFailureAction
  ): IFilesState =>
    produce(state, draft => {
      draft.pasteDestinationListing.error = payload;
    }),

  /* New file creation */
  [CREATE_NEW_FILE_REQUEST]: (
    state: IFilesState,
    {
      payload: { token, fileName, isDir, fileParentId },
    }: ICreateNewFileRequestAction
  ): IFilesState =>
    produce(state, draft => {
      draft.token = token;
      draft.newFileRequest = { fileName, isDir, fileParentId };
    }),

  [CREATE_NEW_FILE_SUCCEDED]: (
    state: IFilesState,
    { payload: { files, parentId, lastFetchedOn } }: IFilesFetchSuccessAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.files = files;
      draft.directoryListing.parentId = parentId;
      draft.directoryListing.lastFetchedOn = lastFetchedOn;
      draft.newFileRequest = undefined;
    }),

  [CREATE_NEW_FILE_FAILED]: (
    state: IFilesState,
    { payload }: IFilesFetchFailureAction
  ): IFilesState =>
    produce(state, draft => {
      draft.newFileRequest!.error = payload;
    }),

  /* Sort files */
  [SORT_FILES_REQUEST]: (
    state: IFilesState,
    { payload }: IFileSortRequestAction
  ): IFilesState =>
    produce(state, draft => {
      draft.token = payload.token;
      draft.directoryListing.files = payload.files;
      draft.directoryListing.parentId = payload.parentId;
      draft.directoryListing.sorting = payload.sorting;
    }),

  [SORT_FILES_FAILED]: (
    state: IFilesState,
    { payload }: IFilesFetchFailureAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.error = payload;
    }),

  [SORT_FILES_SUCCEDED]: (
    state: IFilesState,
    { payload: { files, parentId, lastFetchedOn } }: IFilesFetchSuccessAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.files = files;
      draft.directoryListing.parentId = parentId;
      draft.directoryListing.lastFetchedOn = lastFetchedOn;
    }),
});

export default filesReducer;
