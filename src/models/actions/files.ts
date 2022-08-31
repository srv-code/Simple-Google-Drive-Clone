import {
  File,
  FileID,
  FileSortCriterion,
  FileSortOrder,
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

interface IFileSortRequestPayload {
  token: string;
  files: File[];
  parentId?: FileID;
  sorting: {
    order: FileSortOrder;
    by: FileSortCriterion;
  };
}

interface IFileSortRequestAction {
  type: string;
  payload: IFileSortRequestPayload;
}

export type {
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
  IFileSortRequestPayload,
  IFileSortRequestAction,
};
