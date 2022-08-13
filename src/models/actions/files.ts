import { FileID, IFilesAPIResponse } from '../api/files';

interface IFilesFetchRequestPayload {
  token: string;
  parentId?: FileID;
}

interface IFilesFetchRequestAction {
  type: string;
  payload: IFilesFetchRequestPayload;
}

interface IFilesFetchSuccessAction {
  type: string;
  payload: IFilesAPIResponse;
}

interface IFilesFetchError {
  reason: string;
  fileId?: FileID;
}

interface IFilesFetchFailureAction {
  type: string;
  payload: IFilesFetchError;
}

export type {
  IFilesFetchRequestPayload,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IFilesFetchError,
  IFilesFetchFailureAction,
};
