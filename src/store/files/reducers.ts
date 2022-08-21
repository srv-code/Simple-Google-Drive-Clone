import { createReducer } from '../../utils/redux';
import produce from 'immer';
import {
  FILES_FETCH_REQUEST,
  FILES_FETCH_RESPONSE,
  FILES_FETCH_FAILED,
  PASTE_DESTINATION_DIRECTORIES_FETCH_REQUEST,
  PASTE_DESTINATION_DIRECTORIES_FETCH_RESPONSE,
  PASTE_DESTINATION_DIRECTORIES_FETCH_FAILED,
} from '../files/action-types';
import { IFilesState } from '../../models/reducers/files';
import {
  IFilesFetchFailureAction,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IPasteDestinationDirectoriesFetchFailureAction,
  IPasteDestinationDirectoriesFetchRequestAction,
  IPasteDestinationDirectoriesFetchSuccessAction,
} from '../../models/actions/files';

const initialState: IFilesState = {
  directoryListing: { files: [] },
  pasteDestinationListing: { files: [] },
};

const filesReducer = createReducer(initialState, {
  /* Fetch files */
  [FILES_FETCH_REQUEST]: (
    state: IFilesState,
    { payload: { token, parentId } }: IFilesFetchRequestAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.parentId = parentId;
      draft.token = token;
    }),

  [FILES_FETCH_RESPONSE]: (
    state: IFilesState,
    { payload: { files, parentId, lastFetchedOn } }: IFilesFetchSuccessAction
  ): IFilesState =>
    produce(state, draft => {
      draft.directoryListing.files = files;
      draft.directoryListing.parentId = parentId;
      draft.directoryListing.lastFetchedOn = lastFetchedOn;
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
    { payload }: IPasteDestinationDirectoriesFetchFailureAction
  ): IFilesState =>
    produce(state, draft => {
      draft.pasteDestinationListing.error = payload;
    }),
});

export default filesReducer;
