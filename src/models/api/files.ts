type FileID = number;

type File = {
  id: FileID;
  isDir: boolean;
  name: string;
  size?: string;
  parentId?: FileID;
};

interface IFilesAPIResponse {
  files: File[];
  parentId?: FileID;
  lastFetchedOn: Date;
}

export type { FileID, File, IFilesAPIResponse };
