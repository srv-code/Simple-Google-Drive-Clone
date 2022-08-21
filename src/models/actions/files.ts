import {
  FileID,
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
} from '../api/files';

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

interface IPasteDestinationDirectoriesFetchRequestPayload {
  token: string;
  parentId?: FileID;
  sourceDirectoryId?: FileID;
}

interface IPasteDestinationDirectoriesFetchRequestAction {
  type: string;
  payload: IPasteDestinationDirectoriesFetchRequestPayload;
}

interface IPasteDestinationDirectoriesFetchSuccessAction {
  type: string;
  payload: IPasteDestinationDirectoriesAPIResponse;
}

interface IPasteDestinationDirectoriesFetchFailureAction
  extends IFilesFetchFailureAction {}

export type {
  IFilesFetchRequestPayload,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IFilesFetchError,
  IFilesFetchFailureAction,
  IPasteDestinationDirectoriesFetchRequestPayload,
  IPasteDestinationDirectoriesFetchRequestAction,
  IPasteDestinationDirectoriesFetchFailureAction,
  IPasteDestinationDirectoriesFetchSuccessAction,
};
