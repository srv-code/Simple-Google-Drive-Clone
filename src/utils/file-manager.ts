import {
  File,
  FileID,
  FileSortCriterion,
  FileSortOrder,
  IFilesAPIResponse,
  IPasteDestinationDirectoriesAPIResponse,
} from '../models/api/files';
import { IFilesFetchError } from '../models/actions/files';

class FileManager {
  fileList: File[] = [
    {
      id: 100,
      isDir: true,
      name: 'Pictures',
    },
    {
      id: 200,
      isDir: true,
      name: 'Videos',
    },
    {
      id: 300,
      isDir: true,
      name: 'Documents',
    },
    {
      id: 400,
      isDir: false,
      size: 10,
      name: '.DS_Store',
    },

    {
      id: 101,
      isDir: true,
      name: 'Family',
      parentId: 100,
    },
    {
      id: 102,
      isDir: true,
      name: 'College',
      parentId: 100,
    },

    {
      id: 103,
      isDir: false,
      size: 120 * 1024, // 120KB
      name: 'family-001.jpg',
      parentId: 101,
    },
    {
      id: 104,
      isDir: false,
      size: 147 * 1024, // 147KB
      name: 'family-002.jpg',
      parentId: 101,
    },

    {
      id: 105,
      isDir: false,
      size: 231 * 1024, // 231KB
      name: 'college-001.jpg',
      parentId: 102,
    },
    {
      id: 106,
      isDir: false,
      size: 170 * 1024, // 170KB
      name: 'college-002.jpg',
      parentId: 102,
    },
    {
      id: 107,
      isDir: false,
      size: 266 * 1024, // 266KB
      name: 'college-002.jpg',
      parentId: 102,
    },

    {
      id: 108,
      isDir: false,
      size: 34.1 * Math.pow(1024, 2), // 34.1MB
      name: 'vid-001.mp4',
      parentId: 200,
    },
    {
      id: 109,
      isDir: false,
      size: 13.45 * Math.pow(1024, 2), // 13.45MB
      name: 'vid-002.mp4',
      parentId: 200,
    },

    {
      id: 110,
      isDir: false,
      size: 13.45 * 1024, // 13.45KB
      name: 'employees.xlsx',
      parentId: 300,
    },
    {
      id: 111,
      isDir: false,
      size: 13 * 1024, // 13.45KB
      name: 'a.xlsx',
      parentId: 300,
    },
  ];

  newId: number =
    this.fileList.reduce((id, file) => {
      const _id = file.id || 0;
      return _id > id ? _id : id;
    }, 0) + 1;

  _sort(
    files: File[],
    by: FileSortCriterion = 'NAME',
    order: FileSortOrder = 'ASCENDING'
  ): File[] {
    const compareStrings = (x: string, y: string) =>
      x === y ? 0 : x > y ? 1 : -1;

    const compareFiles = (f1: File, f2: File) => {
      if (by === 'NAME')
        return order === 'ASCENDING'
          ? compareStrings(f1.name, f2.name)
          : compareStrings(f2.name, f1.name);

      if (by === 'SIZE')
        return order === 'ASCENDING'
          ? (f1.size ?? 0) - (f2.size ?? 0)
          : (f2.size ?? 0) - (f1.size ?? 0);

      return compareStrings(f1.name, f2.name); /* default sorting */
    };

    const _dirs: File[] = [];
    const _files: File[] = [];

    files.forEach(f => {
      if (f.isDir) _dirs.push(f);
      else _files.push(f);
    });

    /* To always keep folders over files in any kind of sorting */
    return [..._dirs.sort(compareFiles), ..._files.sort(compareFiles)];
  }

  createNewFile(
    token: string,
    isDir: boolean,
    name: string,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IFilesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    this.fileList.push({
      id: this.newId++,
      isDir,
      name,
      parentId,
      size: isDir ? undefined : 12.3 * 1024,
    });

    return {
      success: true,
      data: {
        parentId,
        files: this._sort(this.fileList.filter(f => f.parentId === parentId)),
        lastFetchedOn: new Date(),
      },
    };
  }

  fetchDirs(
    token: string,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IPasteDestinationDirectoriesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    // if (parentId === 101)
    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    return {
      success: true,
      data: {
        parentId,
        files: this._sort(
          this.fileList.filter(f => f.parentId === parentId && f.isDir)
        ),
      },
    };
  }

  fetchDirList(
    token: string,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IFilesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    // if (parentId === 101)
    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    return {
      success: true,
      data: {
        parentId,
        files: this._sort(this.fileList.filter(f => f.parentId === parentId)),
        lastFetchedOn: new Date(),
      },
    };
  }

  sortDirList(
    token: string,
    files: File[],
    by: FileSortCriterion,
    order: FileSortOrder,
    parentId?: FileID
  ): {
    success: boolean;
    data?: IFilesAPIResponse;
    error?: IFilesFetchError;
  } {
    if (token !== 'Xgs3a34uyd234nf6kg')
      return {
        success: false,
        error: { reason: 'Unauthorized user' },
      };

    // if (parentId === 101)
    if (parentId && !this.fileList.some(f => f.id === parentId))
      return {
        success: false,
        error: {
          reason: 'Invalid parent file',
          fileId: parentId,
        },
      };

    return {
      success: true,
      data: {
        parentId,
        files: this._sort(files, by, order),
        lastFetchedOn: new Date(),
      },
    };
  }
}

export default FileManager;
