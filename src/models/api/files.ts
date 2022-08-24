type FileID = number;

type File = {
  id: FileID;
  isDir: boolean;
  name: string;
  size?: number /* in bytes */;
  parentId?: FileID;
};

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
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
};
