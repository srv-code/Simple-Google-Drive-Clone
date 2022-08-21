import { IFilesFetchError } from '../actions/files';
import { File, FileID } from '../api/files';

interface IFilesState {
  token?: string;
  directoryListing: {
    parentId?: FileID;
    lastFetchedOn?: Date;
    files: File[];
    error?: IFilesFetchError;
  };
  pasteDestinationListing: {
    sourceDirectoryId?: FileID;
    parentId?: FileID;
    files: File[];
    error?: IFilesFetchError;
  };
}

export type { IFilesState };
