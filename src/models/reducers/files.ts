import { IFilesFetchError } from '../actions/files';
import { File, FileID } from '../api/files';

interface IFilesState {
  lastFetchedOn?: Date;
  files: File[];
  token?: string;
  parentId?: FileID;
  error?: IFilesFetchError;
}

export type { IFilesState };
