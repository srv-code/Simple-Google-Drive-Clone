type FileID = number;

type File = {
  id: FileID;
  isDir: boolean;
  name: string;
  size?: number /* in bytes */;
  parentId?: FileID;
};

type FileSortCriterion = 'NAME' | 'SIZE';
type FileSortOrder = 'ASCENDING' | 'DESCENDING';

interface IFilesAPIResponse {
  files: File[];
  parentId?: FileID;
  lastFetchedOn: Date;
}

interface IPasteDestinationDirectoriesAPIResponse {
  files: File[];
  parentId?: FileID;
}

export type {
  FileID,
  File,
  FileSortOrder,
  FileSortCriterion,
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
};
