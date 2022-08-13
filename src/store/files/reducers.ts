import { createReducer } from '../../utils/redux';
import {
  FILES_FETCH_REQUEST,
  FILES_FETCH_RESPONSE,
  FILES_FETCH_FAILED,
} from '../files/action-types';
import { IFilesState } from '../../models/reducers/files';
import {
  IFilesFetchFailureAction,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
} from '../../models/actions/files';

const initialState: IFilesState = {
  files: [],
};

const filesReducer = createReducer(initialState, {
  [FILES_FETCH_REQUEST]: (
    state: IFilesState,
    { payload: { token, parentId } }: IFilesFetchRequestAction
  ): IFilesState => ({ ...state, token, parentId }),

  [FILES_FETCH_RESPONSE]: (
    state: IFilesState,
    { payload: { files, parentId, lastFetchedOn } }: IFilesFetchSuccessAction
  ): IFilesState => ({ files, parentId, lastFetchedOn }),

  [FILES_FETCH_FAILED]: (
    state: IFilesState,
    { payload }: IFilesFetchFailureAction
  ): IFilesState => ({ ...state, error: payload }),
});

export default filesReducer;
