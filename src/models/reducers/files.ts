import { IFilesFetchError } from '../actions/files';
import { File, FileID, FileSortCriterion, FileSortOrder } from '../api/files';

interface IFilesState {
  token?: string;
  directoryListing: {
    files: File[];
    parentId?: FileID;
    lastFetchedOn?: Date;
    error?: IFilesFetchError;
    sorting: {
      order: FileSortOrder;
      by: FileSortCriterion;
    };
  };
  pasteDestinationListing: {
    files: File[];
    parentId?: FileID;
    sourceDirectoryId?: FileID;
    error?: IFilesFetchError;
  };
  newFileRequest?: {
    isDir: boolean;
    fileName: string;
    fileParentId?: FileID;
    error?: IFilesFetchError;
  };
}

export type { IFilesState };
