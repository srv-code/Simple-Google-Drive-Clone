import {
  FileID,
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
} from '../api/files';

interface ISetTokenAction {
  type: string;
  payload: { token: string };
}

interface IResetTokenAction {
  type: string;
}

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

interface ICreateNewFileRequestPayload {
  token: string;
  isDir: boolean;
  fileName: string;
  fileParentId?: FileID;
}

interface ICreateNewFileRequestAction {
  type: string;
  payload: ICreateNewFileRequestPayload;
}

interface NoPayloadAction {
  type: string;
}

export type {
  ISetTokenAction,
  IResetTokenAction,
  IFilesFetchRequestPayload,
  IFilesFetchRequestAction,
  IFilesFetchSuccessAction,
  IFilesFetchError,
  IFilesFetchFailureAction,
  IPasteDestinationDirectoriesFetchRequestPayload,
  IPasteDestinationDirectoriesFetchRequestAction,
  IPasteDestinationDirectoriesFetchSuccessAction,
  ICreateNewFileRequestAction,
  ICreateNewFileRequestPayload,
  NoPayloadAction,
};
