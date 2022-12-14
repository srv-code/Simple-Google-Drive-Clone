import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  File,
  FileID,
  FileSortCriterion,
  FileSortOrder,
} from '../../models/api/files';
import { IState } from '../../models/reducers/state';
import {
  requestCreateNewFile,
  requestFiles,
  requestFileSorting,
  requestPasteDestinationDirectories,
} from '../../store/files/actions';
import HoverCard from '../hover-card';
import Loader from '../loader';
import './styles.css';

interface IProps {
  token: string;
}

interface IActionButton {
  id: string;
  onClick: () => void;
  icon: string;
  labelText: string;
  disabled?: boolean;
  size?: number;
}

type Directory = File | undefined;

type FileTemplateID = number;
type FileTemplateType = 'Plain' | 'Spreadsheet' | 'Document' | 'Presentation';
type NewFileTemplate = {
  id: FileTemplateID;
  name: string;
  extension?: string;
  type: FileTemplateType;
};

const newFileTemplates: NewFileTemplate[] = [
  {
    id: 1,
    name: 'Blank File',
    type: 'Plain',
  },
  {
    id: 2,
    name: 'Text File',
    extension: '.txt',
    type: 'Plain',
  },

  {
    id: 3,
    name: 'Microsoft Excel Sheet',
    extension: '.xlsx',
    type: 'Spreadsheet',
  },
  {
    id: 4,
    name: 'Microsoft Excel Sheet - Older version',
    extension: '.xls',
    type: 'Spreadsheet',
  },
  {
    id: 5,
    name: 'Apple Numbers Sheet',
    extension: '.numbers',
    type: 'Spreadsheet',
  },

  {
    id: 6,
    name: 'Microsoft Word Document',
    extension: '.docx',
    type: 'Document',
  },
  {
    id: 7,
    name: 'Microsoft Word Document - Older version',
    extension: '.doc',
    type: 'Document',
  },
  {
    id: 8,
    name: 'Apple Pages Document',
    extension: '.pages',
    type: 'Document',
  },

  {
    id: 9,
    name: 'Microsoft Presentation Document',
    extension: '.pptx',
    type: 'Presentation',
  },
  {
    id: 10,
    name: 'Microsoft Presentation Document - Older version',
    extension: '.ppt',
    type: 'Presentation',
  },
  {
    id: 11,
    name: 'Apple Keynote Document',
    extension: '.key',
    type: 'Presentation',
  },
];

interface ICopyDialogDetails {
  show: boolean;
  sourceDirectory?: File;
  operation?: 'move' | 'copy';
  title?: string;
  description?: string;
}

interface INewDialogDetails {
  show: boolean;
  error?: string;
}

interface IRenameDialogDetails {
  show: boolean;
  batchRenaming?: boolean;
  title?: string;
  description?: string;
  counts?: { dirs: number; files: number };
}

interface IDeleteDialogDetails {
  show: boolean;
  title?: string;
  description?: string;
}

interface IFileInfoDetails {
  show: boolean;
  name?: string;
  sizeInString?: string;
  title?: string;
  description?: string;
}

const FileManager: React.FC<IProps> = props => {
  const [parentDirs, setParentDirs] = useState<Directory[]>([]);
  const [copyDialogParentDirs, setCopyDialogParentDirs] = useState<Directory[]>(
    []
  );
  const [newDialogDetails, setNewDialogDetails] = useState<INewDialogDetails>({
    show: false,
  });
  const [newFileType, setNewFileType] = useState<'FILE' | 'FOLDER' | null>(
    null
  );
  const [newFileBaseName, setNewFileBaseName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [selectedFileTemplateId, setSelectedFileTemplateId] = useState<
    FileTemplateID | undefined
  >();
  const [selectedFileTemplateType, setSelectedFileTemplateType] = useState<
    FileTemplateType | undefined
  >();
  const [renameDialogDetails, setRenameDialogDetails] =
    useState<IRenameDialogDetails>({ show: false });
  const [previewDetails, setPreviewDetails] = useState<File | null>(null);
  const [fileInfoDetails, setFileInfoDetails] = useState<IFileInfoDetails>({
    show: false,
  });
  const [selectedFileIds, setSelectedFileIds] = useState<FileID[] | null>(null);
  const [copyDialogDetails, setCopyDialogDetails] =
    useState<ICopyDialogDetails>({ show: false });
  const [baseNameForRenaming, setBaseNameForRenaming] = useState({
    forFiles: '',
    forFolder: '',
  });
  const [fileExtensionForRenaming, setFileExtensionForRenaming] = useState({
    original: '',
    new: '',
    includeOriginal: false,
  });
  const [deleteDialogDetails, setDeleteDialogDetails] =
    useState<IDeleteDialogDetails>({ show: false });
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState<FileSortOrder>('ASCENDING');
  const [sortBy, setSortBy] = useState<FileSortCriterion>('NAME');

  const {
    loading: { isFetchingFiles, isFetchingDirectories },
    files: { directoryListing, pasteDestinationListing },
  } = useSelector((state: IState) => state);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchDirectoryListing('listing', undefined);
  }, [props.token]);

  useEffect(() => {
    if (selectedFileIds && !copyDialogDetails.show) setSelectedFileIds(null);
    // setCopyDialogDetails({ show: false });
  }, [isFetchingFiles]);

  const getSizeToString = (bytes: number): string => {
    const levels = ['B', 'KB', 'MB', 'GB'];
    let i;
    for (i = 0; i < levels.length && bytes >= 1024; i++) bytes /= 1024;
    const truncated = Math.trunc(bytes);

    return `${truncated === bytes ? truncated : bytes.toFixed(2)} ${levels[i]}`;
  };

  const onSelectFile = (file: File) => {
    if (selectedFileIds) {
      const ids = [...selectedFileIds];
      const index = ids.findIndex(id => id === file.id);
      if (index === -1) ids.push(file.id);
      else ids.splice(index, 1);
      setSelectedFileIds(ids);
    } else setSelectedFileIds([file.id]);
  };

  const onFileClick = (file?: File) => {
    if (selectedFileIds) onSelectFile(file!);
    else {
      if (!file || file.isDir) {
        if (previewDetails) setPreviewDetails(null);
        fetchDirectoryListing('listing', file);
      } else setPreviewDetails(file);
    }
  };

  const fetchDirectoryListing = (
    mode: 'listing' | 'pasting',
    parent: Directory
  ) => {
    const parents = [
      ...(mode === 'listing' ? parentDirs : copyDialogParentDirs),
    ];
    const index = parents.findIndex(dir =>
      parent ? parent.id === dir?.id : !dir
    );
    if (index !== -1) parents.splice(index + 1);
    else parents.push(parent);

    if (mode === 'listing') {
      dispatch(requestFiles({ token: props.token, parentId: parent?.id }));
      setParentDirs(parents);
    } else {
      dispatch(
        requestPasteDestinationDirectories({
          token: props.token,
          parentId: parent?.id,
          sourceDirectoryId: pasteDestinationListing.sourceDirectoryId,
        })
      );
      setCopyDialogParentDirs(parents);
    }
  };

  const onRefreshDirListing = () => {
    fetchDirectoryListing('listing', parentDirs[parentDirs.length - 1]);
  };

  const onCreatingNewFile = (name: string, isDir: boolean) => {
    if (directoryListing.files.some(f => f.name === name)) {
      setNewDialogDetails({
        show: true,
        error: 'Already an entry with same name is present',
      });
    } else {
      dispatch(
        requestCreateNewFile({
          token: props.token,
          isDir,
          fileName: name,
          fileParentId: directoryListing.parentId,
        })
      );

      setNewDialogDetails({ show: false });
    }
  };

  const onCancelCreatingNewFile = () => {
    setNewDialogDetails({ show: false });
  };

  const showNewDialog = () => {
    setSelectedFileIds(null);
    setNewFileBaseName('');
    setNewFolderName('');
    setNewFileType(null);

    setNewDialogDetails({ show: true });
  };

  const switchFileSelection = () => {
    setSelectedFileIds(val => (val ? null : []));
  };

  const onRenameFiles = () => {
    const { dirs, files } = getSelectedFilesAndFolders();

    // building dialog title & description
    let batchRenaming = selectedFileIds!.length > 1,
      title = '',
      description = 'Renaming ';

    if (batchRenaming) {
      title = 'Batch ' + title;
      description = 'Batch ' + description;
    }

    if (files.length) {
      title += 'File';
      description += `${files.length} Files`;
    }
    if (files.length && dirs.length) {
      title += ' & ';
      description += ' & ';
    }
    if (dirs.length) {
      title += 'Folder';
      description += `${dirs.length} Folders`;
    }
    title += ' Rename';

    // extracting base file name and extension
    let fileBaseName = '',
      folderBaseName = '',
      fileExtension = '';
    if (files.length) {
      const fileName =
        directoryListing.files.find(
          f => !f.isDir && selectedFileIds?.includes(f.id)
        )?.name || '';
      const dotIndex = fileName.lastIndexOf('.');
      if (dotIndex === -1) {
        fileBaseName = fileName;
      } else {
        fileBaseName = fileName.substring(0, dotIndex);
        fileExtension = fileName.substring(dotIndex + 1);
      }
    }
    if (dirs.length) {
      folderBaseName =
        directoryListing.files.find(
          f => f.isDir && selectedFileIds?.includes(f.id)
        )?.name || '';
    }

    setBaseNameForRenaming({
      forFiles: fileBaseName,
      forFolder: folderBaseName,
    });

    setFileExtensionForRenaming({
      new: fileExtension,
      original: fileExtension,
      includeOriginal: false,
    });

    setRenameDialogDetails({
      show: true,
      batchRenaming,
      title,
      description,
      counts: { dirs: dirs.length, files: files.length },
    });
  };

  const onRenamingFiles = () => {
    setSelectedFileIds(null);
    setRenameDialogDetails({ show: false });
    // dispatch renaming API
  };

  const onCancelRenamingFiles = () => {
    setSelectedFileIds(null);
    setRenameDialogDetails({ show: false });
  };

  const onDeleteFile = () => {
    const { dirs, files } = getSelectedFilesAndFolders();

    // building dialog title & description
    let title = '',
      description = 'Delete ';

    if (files.length) {
      title += 'File';
      description += `${files.length} Files`;
    }
    if (files.length && dirs.length) {
      title += ' & ';
      description += ' & ';
    }
    if (dirs.length) {
      title += 'Folder';
      description += `${dirs.length} Folders`;
    }
    title += ' Delete';
    description += '?';

    setDeleteDialogDetails({
      show: true,
      title,
      description,
    });
  };

  const onDeletingFiles = () => {
    setSelectedFileIds(null);
    setDeleteDialogDetails({ show: false });
    // dispatch delete API
  };

  const onCancelDeletingFiles = () => {
    setSelectedFileIds(null);
    setDeleteDialogDetails({ show: false });
  };

  const getSelectedFilesAndFolders = () => {
    const files: File[] = [];
    const dirs: File[] = [];
    directoryListing.files.forEach(file => {
      if (selectedFileIds?.includes(file.id)) {
        if (file.isDir) dirs.push(file);
        else files.push(file);
      }
    });
    return { files, dirs };
  };

  const onFileCopyTo = (move: boolean) => {
    const sourceDirectory = parentDirs[parentDirs.length - 1];

    dispatch(
      requestPasteDestinationDirectories({
        token: props.token,
        parentId: sourceDirectory?.id,
        sourceDirectoryId: sourceDirectory?.id,
      })
    );

    setCopyDialogParentDirs(parentDirs);

    setCopyDialogDetails({
      show: true,
      operation: move ? 'move' : 'copy',
      sourceDirectory,
      title: `File ${move ? 'Move' : 'Copy'}`,
      description: (() => {
        let retval = move ? 'Moving' : 'Copying';
        const { dirs, files } = getSelectedFilesAndFolders();
        if (dirs.length) retval += ` ${dirs.length} directories`;
        if (dirs.length && files.length) retval += ' and';
        if (files.length) retval += ` ${files.length} files`;
        // retval += '?';
        return retval;
      })(),
    });
  };

  const onCopyingFiles = (directory: Directory) => {
    console.log(
      `Should ${
        copyDialogDetails.operation === 'move' ? 'move' : 'copy'
      } files:`,
      selectedFileIds,
      'to directory:',
      directory
    );
    setSelectedFileIds(null);
    setCopyDialogDetails({ show: false });
  };

  const onCancelCopyingFiles = () => {
    console.log(
      `Cancelled ${
        copyDialogDetails.operation === 'move' ? 'moving' : 'copying'
      } files:`,
      selectedFileIds
    );
    setSelectedFileIds(null);
    setCopyDialogDetails({ show: false });
  };

  const onDuplicateFile = () => {
    console.log('Should duplicate files:', selectedFileIds);

    // const newFileNameMapping = {};
    // const { dirs, files } = getSelectedFilesAndFolders();
    // const selectedFiles = [...dirs, ...files]
    // selectedFiles.forEach(f=>{
    //   const nameMap = {originalFile:  }
    //   const sameNameFile = f.

    //   // newFileNames.push()
    // })

    setSelectedFileIds(null);
    // dispatch duplicate file API with new names
  };

  const onSortingFile = () => {
    if (
      sortBy !== directoryListing.sorting.by ||
      sortOrder !== directoryListing.sorting.order
    )
      dispatch(
        requestFileSorting({
          token: props.token,
          files: directoryListing.files,
          parentId: directoryListing.parentId,
          sorting: {
            order: sortOrder,
            by: sortBy,
          },
        })
      );
    setShowSortDialog(false);
  };

  const onCancelSortingFile = () => {
    /* Reverting back to the previous setting */
    setSortBy(directoryListing.sorting.by);
    setSortOrder(directoryListing.sorting.order);

    setShowSortDialog(false);
  };

  const onSortFiles = () => {
    setSelectedFileIds(null);
    setShowSortDialog(true);
  };

  const onDismissInfoPanel = () => {
    setSelectedFileIds(null);
    setFileInfoDetails({ show: false });
  };

  const onShowInfo = () => {
    const { dirs, files } = getSelectedFilesAndFolders();
    let names: string[] = [];
    let title: string = '';
    let description: string = '';
    let sizes: number = 0;
    [...dirs, ...files].forEach(f => {
      names.push(f.name);
      sizes += f.size ?? 0;
    });
    if (files.length) {
      title += 'File';
      description += `${files.length} Files`;
    }
    if (files.length && dirs.length) {
      title += ' & ';
      description += ' & ';
    }
    if (dirs.length) {
      title += 'Folder';
      description += `${dirs.length} Folders`;
    }
    title += ' Information';
    const sizeInString = files.length ? getSizeToString(sizes) : undefined;

    setFileInfoDetails({
      show: true,
      name: names.join(', '),
      sizeInString,
      title,
      description,
    });
  };

  const onGoToParentDir = (mode: 'listing' | 'pasting') => {
    if (mode === 'listing') {
      if (!isFetchingFiles)
        fetchDirectoryListing(mode, parentDirs[parentDirs.length - 2]);
    } else {
      if (!isFetchingDirectories)
        fetchDirectoryListing(
          mode,
          copyDialogParentDirs[copyDialogParentDirs.length - 2]
        );
    }
  };

  const renderLastFetchLabel = () => (
    <div id='last-fetch-text'>
      <span id='last-fetch-on-text'>Last fetched on:</span>
      <span>{directoryListing.lastFetchedOn?.toString() || <Loader />}</span>
    </div>
  );

  const renderPathViewer = () => (
    <div id='path-viewer-container'>
      <div id='path-links-container'>
        {parentDirs.map((dir, index, dirs) => {
          const isLastItem = dirs.length - 1 === index;

          return (
            <span key={index}>
              <a
                href={isLastItem ? undefined : '#'}
                className='link path-link-text'
                style={
                  isFetchingFiles
                    ? { color: 'gray', cursor: 'default' }
                    : undefined
                }
                onClick={() => {
                  if (!isLastItem) onFileClick(dir);
                }}>
                {dir?.name ?? '/'}
              </a>
              {!isLastItem && <span id='right-chevron'>{'>'}</span>}
            </span>
          );
        })}
        {isFetchingFiles && (
          <div id='path-viewer-loader-container'>
            <Loader />
          </div>
        )}
      </div>
    </div>
  );

  const renderButtonPanel = () => {
    const renderButton = (buttonProps: IActionButton, index: number) => (
      <div
        key={`${buttonProps.id} + ${index}`}
        id={buttonProps.id}
        className='action-button'
        onClick={() => {
          if (!buttonProps.disabled) buttonProps.onClick();
        }}>
        <img
          style={{ visibility: buttonProps.disabled ? 'hidden' : 'visible' }}
          src={buttonProps.icon}
          alt={buttonProps.id}
          height={buttonProps.size || 15}
          width={buttonProps.size || 15}
        />
        <a
          className='link action-button-text'
          href='#'
          style={
            buttonProps.disabled
              ? { color: 'gray', cursor: 'default' }
              : undefined
          }>
          {buttonProps.labelText}
        </a>
      </div>
    );

    const buttons: IActionButton[] = [
      {
        id: 'refresh-button',
        onClick: onRefreshDirListing,
        icon: require('../../assets/images/refresh.png'),
        labelText: 'Refresh',
        disabled: isFetchingFiles,
      },
      {
        id: 'new-button',
        onClick: showNewDialog,
        icon: require('../../assets/images/new.png'),
        labelText: 'New',
        disabled: isFetchingFiles,
      },
      {
        id: 'sort-button',
        onClick: onSortFiles,
        icon: require('../../assets/images/sort.png'),
        labelText: 'Sort',
        disabled: isFetchingFiles,
        size: 17,
      },
      {
        id: 'select-button',
        onClick: switchFileSelection,
        icon: require('../../assets/images/select.png'),
        labelText: 'Select',
        disabled: isFetchingFiles,
      },
      {
        id: 'rename-button',
        onClick: onRenameFiles,
        icon: require('../../assets/images/rename.png'),
        labelText: 'Rename',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
        size: 20,
      },
      {
        id: 'delete-button',
        onClick: onDeleteFile,
        icon: require('../../assets/images/delete.png'),
        labelText: 'Delete',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
      },
      {
        id: 'move-button',
        onClick: () => onFileCopyTo(true),
        icon: require('../../assets/images/move.jpg'),
        labelText: 'Move To',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
      },
      {
        id: 'copy-button',
        onClick: () => onFileCopyTo(false),
        icon: require('../../assets/images/copy.png'),
        labelText: 'Copy To',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
      },
      {
        id: 'duplicate-button',
        onClick: onDuplicateFile,
        icon: require('../../assets/images/duplicate.png'),
        labelText: 'Duplicate',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
        size: 18,
      },
      // {
      //   id: 'download-button',
      //   onClick: onDownloadFile,
      //   icon: require('../../assets/images/download.jpeg'),
      //   labelText: 'Download',
      //   disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
      //   size: 22,
      // },
      {
        id: 'info-button',
        onClick: onShowInfo,
        icon: require('../../assets/images/info.png'),
        labelText: 'Show Info',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
      },
    ];

    return <div id='action-button-panel'>{buttons.map(renderButton)}</div>;
  };

  const renderParentDirLink = (mode: 'listing' | 'pasting') => (
    <div id='parent-dir-container'>
      <img
        src={require('../../assets/images/parent-folder.png')}
        alt='go-to-parent-folder-icon'
        height={25}
        width={25}
      />
      <a className='link' href='#' onClick={() => onGoToParentDir(mode)}>
        ..
      </a>
    </div>
  );

  const renderErrorMessage = (mode: 'listing' | 'pasting') => {
    const error = (
      mode === 'listing' ? directoryListing : pasteDestinationListing
    ).error;

    return (
      <div id='error-reason-container'>
        <span id='error-reason-text'>Error: {error?.reason}</span>

        {directoryListing.error?.fileId && (
          <span id='error-file-id-text'>File ID: {error?.fileId}</span>
        )}
      </div>
    );
  };

  const renderErrorOrListPanel = () => {
    const renderFilePreviewPanel = () => (
      <div id='file-preview-container'>
        <table id='file-preview-table'>
          <thead>
            <tr>
              <td colSpan={2} id='file-preview-text'>
                File Preview
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='left-aligned'>Name</td>
              <td className='right-aligned'>{previewDetails!.name}</td>
            </tr>
            <tr>
              <td className='left-aligned'>Size</td>
              <td className='right-aligned'>
                {getSizeToString(previewDetails!.size!)}
              </td>
            </tr>
            <tr>
              <td className='left-aligned'>Containing Folder</td>
              <td className='right-aligned'>
                {/* {parentDirs.find(d => d?.id === previewData.parentId)?.name || '/'} */}
                {parentDirs[parentDirs.length - 1]?.name || '/'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    const renderFiles = () =>
      directoryListing.files.map((file, index) => (
        <div key={index} className='file-container'>
          {selectedFileIds && (
            <input
              type='checkbox'
              checked={selectedFileIds?.includes(file.id)}
              onChange={() => onSelectFile(file)}
            />
          )}
          <img
            className='img-file-icon'
            src={require(`../../assets/images/${
              file.isDir ? 'folder' : 'file'
            }.png`)}
            alt='file-folder-icon'
            height={20}
            width={20}
          />
          <a className='link' href='#' onClick={() => onFileClick(file)}>
            {file.name}
          </a>
        </div>
      ));

    const renderSelectAllCheckbox = () => {
      const allSelected = directoryListing.files.every(file =>
        selectedFileIds?.includes(file.id)
      );

      const onClick = () =>
        setSelectedFileIds(
          allSelected ? [] : directoryListing.files.map(f => f.id)
        );

      return (
        <div className='file-container'>
          <input type='checkbox' checked={allSelected} onChange={onClick} />
          <img
            className='img-file-icon'
            src={require('../../assets/images/select.png')}
            alt='file-folder-icon'
            height={20}
            width={20}
          />
          <a className='link' href='#' onClick={onClick}>
            Select All
          </a>
        </div>
      );
    };

    const renderFileListing = () => (
      <div id='file-view-container'>
        <div id='file-list-container'>
          {isFetchingFiles ? (
            <div id='file-list-loader-container'>
              <Loader size='large' />
            </div>
          ) : (
            <div id='file-listing'>
              {parentDirs[parentDirs.length - 1] &&
                renderParentDirLink('listing')}

              {directoryListing.files?.length === 0 ? (
                <div id='empty-folder-text'>Empty folder</div>
              ) : (
                <div id='files'>
                  {selectedFileIds && renderSelectAllCheckbox()}
                  {renderFiles()}
                </div>
              )}
            </div>
          )}
        </div>

        {previewDetails && renderFilePreviewPanel()}
      </div>
    );

    return (
      <div id='list-error-container'>
        {directoryListing.error
          ? renderErrorMessage('listing')
          : renderFileListing()}
      </div>
    );
  };

  const renderCopyDialog = () => {
    const renderDialogPathViewer = (
      dir: Directory,
      index: number,
      dirs: Directory[]
    ) => {
      const isLastItem = dirs.length - 1 === index;

      return (
        <span key={index}>
          <a
            href={isLastItem ? undefined : '#'}
            className='link path-link-text'
            style={
              isFetchingDirectories
                ? { color: 'gray', cursor: 'default' }
                : undefined
            }
            onClick={() => {
              if (!isLastItem) fetchDirectoryListing('pasting', dir);
            }}>
            {dir?.name ?? '/'}
          </a>
          {!isLastItem && <span id='right-chevron'>{'>'}</span>}
        </span>
      );
    };

    const renderDialogDirList = () => {
      const renderDirs = () =>
        pasteDestinationListing.files.map((dir, index) => (
          <div key={index} className='file-container'>
            <img
              className='img-file-icon'
              src={require('../../assets/images/folder.png')}
              alt='file-folder-icon'
              height={20}
              width={20}
            />
            <a
              className='link full-width'
              href='#'
              onClick={() => fetchDirectoryListing('pasting', dir)}>
              {dir.name}
            </a>
          </div>
        ));

      return (
        <div id='file-view-container'>
          {isFetchingDirectories ? (
            <div id='file-list-loader-container'>
              <Loader size='large' />
            </div>
          ) : (
            <div id='file-listing'>
              {copyDialogParentDirs[copyDialogParentDirs.length - 1] &&
                renderParentDirLink('pasting')}

              {pasteDestinationListing.files?.length === 0 ? (
                <div id='empty-folder-text'>Empty folder</div>
              ) : (
                <div id='files'>{renderDirs()}</div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <HoverCard show={copyDialogDetails.show} onDismiss={onCancelCopyingFiles}>
        <div className='column'>
          <span id='hover-title'>{copyDialogDetails?.title}</span>
          <span id='hover-text'>{copyDialogDetails?.description}</span>
        </div>
        <div id='hover-dir-browser-container'>
          <span id='hover-small-text'>
            Select a folder to {copyDialogDetails?.operation}:
          </span>
          <div id='hover-dir-browser'>
            <div id='copy-dialog-path-viewer'>
              {copyDialogParentDirs.map(renderDialogPathViewer)}
              {isFetchingDirectories && (
                <div id='path-viewer-loader-container'>
                  <Loader />
                </div>
              )}
            </div>

            {pasteDestinationListing.error ? (
              renderErrorMessage('pasting')
            ) : (
              <div id='dialog-dir-list'>{renderDialogDirList()}</div>
            )}
          </div>
        </div>

        <div id='confirm-button-container'>
          <button
            disabled={
              !!pasteDestinationListing.error ||
              pasteDestinationListing.sourceDirectoryId ===
                copyDialogParentDirs[copyDialogParentDirs.length - 1]?.id
            }
            className='confirm-button'
            onClick={() =>
              onCopyingFiles(
                copyDialogParentDirs[copyDialogParentDirs.length - 1]
              )
            }>
            Select Folder
          </button>
          <button className='confirm-button' onClick={onCancelCopyingFiles}>
            Cancel
          </button>
        </div>
      </HoverCard>
    );
  };

  const renderNewFileDialog = () => {
    const extension = {
      value: newFileTemplates.find(
        template => template.id === selectedFileTemplateId
      )?.extension,
      forDisplay: '',
    };
    extension.forDisplay = extension.value || 'None';

    return (
      <HoverCard
        show={newDialogDetails.show}
        onDismiss={onCancelCreatingNewFile}>
        <div className='column'>
          <span id='hover-title'>Create New</span>
        </div>
        <div
          id='hover-dir-browser-container'
          style={
            newFileType !== 'FOLDER'
              ? {
                  backgroundColor: 'lightgray',
                  color: 'gray',
                }
              : undefined
          }>
          <div className='new-type-radio'>
            <input
              type='radio'
              name='create-new-type'
              value='Folder'
              checked={newFileType === 'FOLDER'}
              onChange={() => setNewFileType('FOLDER')}
            />
            <span className='hover-new-type-text'>Folder</span>
          </div>
          <div id='hover-dir-browser'>
            <table id='new-file-table'>
              <tbody>
                <tr>
                  <td>
                    <span className='table-attr-text'>Name</span>
                  </td>
                  <td>
                    <input
                      disabled={newFileType !== 'FOLDER'}
                      autoFocus={newFileType === 'FOLDER'}
                      type='text'
                      value={newFolderName}
                      onChange={event => setNewFolderName(event.target.value)}
                    />
                  </td>
                </tr>
                {newDialogDetails.error && (
                  <tr>
                    <td colSpan={2} className='dialog-error'>
                      <span>Error: {newDialogDetails.error}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          id='hover-dir-browser-container'
          style={
            newFileType !== 'FILE'
              ? {
                  backgroundColor: 'lightgray',
                  color: 'gray',
                }
              : undefined
          }>
          <div className='new-type-radio'>
            <input
              type='radio'
              name='create-new-type'
              value='File'
              checked={newFileType === 'FILE'}
              onChange={() => setNewFileType('FILE')}
            />
            <span className='hover-new-type-text'>File</span>
          </div>
          <div id='hover-dir-browser'>
            <table id='new-file-table'>
              <tbody>
                <tr>
                  <td>
                    <span className='table-attr-text'>Base Name</span>
                  </td>
                  <td>
                    <input
                      disabled={newFileType !== 'FILE'}
                      autoFocus={newFileType === 'FILE'}
                      type='text'
                      value={newFileBaseName}
                      onChange={event => setNewFileBaseName(event.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className='table-attr-text'>Template</span>
                  </td>

                  <td>
                    <select
                      disabled={newFileType !== 'FILE'}
                      value={selectedFileTemplateType}
                      onChange={event =>
                        setSelectedFileTemplateType(
                          event.target.value as FileTemplateType
                        )
                      }>
                      <option>-- Select --</option>
                      {newFileTemplates
                        .reduce(
                          (
                            uniques: FileTemplateType[],
                            temp: NewFileTemplate
                          ) => {
                            if (!uniques.includes(temp.type))
                              uniques.push(temp.type);
                            return uniques;
                          },
                          []
                        )
                        .map((type, index) => (
                          <option key={`${type}-${index}`} value={type}>
                            {type}
                          </option>
                        ))}
                    </select>
                  </td>
                  {/* <td>selectedFileTemplateType={selectedFileTemplateType}</td> */}
                </tr>
                <tr>
                  <td>
                    <span className='table-attr-text'>File Type</span>
                  </td>
                  <td>
                    <select
                      disabled={newFileType !== 'FILE'}
                      value={selectedFileTemplateId}
                      onChange={event =>
                        setSelectedFileTemplateId(
                          +event.target.value as FileTemplateID
                        )
                      }>
                      <option>-- Select --</option>
                      {newFileTemplates
                        .filter(
                          template => template.type === selectedFileTemplateType
                        )
                        .map((template, index) => (
                          <option
                            key={`${template.id}-${index}`}
                            value={template.id}>
                            {template.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  {/* <td>selectedFileTemplateId={selectedFileTemplateId}</td> */}
                </tr>
                <tr>
                  <td>
                    <span className='table-attr-text'>File Extension</span>
                  </td>
                  <td>
                    <span className='file-ext-text'>
                      {extension.forDisplay}
                    </span>
                  </td>
                </tr>
                {newDialogDetails.error && (
                  <tr>
                    <td colSpan={2} className='dialog-error'>
                      <span>Error: {newDialogDetails.error}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div id='confirm-button-container'>
          <button
            disabled={(() => {
              if (newFileType === 'FILE')
                return !newFileBaseName || !selectedFileTemplateId;
              if (newFileType === 'FOLDER') return !newFolderName.trim();
              return true;
            })()}
            className='confirm-button'
            onClick={() =>
              onCreatingNewFile(
                newFileType === 'FILE'
                  ? `${newFileBaseName}${extension.value ?? ''}`
                  : newFolderName.trim(),
                newFileType === 'FOLDER'
              )
            }>
            Create
          </button>
          <button className='confirm-button' onClick={onCancelCreatingNewFile}>
            Cancel
          </button>
        </div>
      </HoverCard>
    );
  };

  const renderSortDialog = () => (
    <HoverCard show={showSortDialog} onDismiss={onCancelSortingFile}>
      <div className='column'>
        <span id='hover-title'>{'Sort Files & Folders'}</span>
      </div>
      <div id='hover-dir-browser-container'>
        <span id='hover-small-text'>Select sorting criteria:</span>
        <div id='hover-dir-browser'>
          <table>
            <tbody>
              <tr>
                <td>Order</td>
                <td className='row-order'>
                  <div className='radio-sort-criterion'>
                    <input
                      type='radio'
                      name='sort-order'
                      checked={sortOrder === 'ASCENDING'}
                      onChange={() => setSortOrder('ASCENDING')}
                    />
                    <span className='hover-new-type-text'>Ascending</span>
                  </div>

                  <div className='radio-sort-criterion'>
                    <input
                      type='radio'
                      name='sort-order'
                      checked={sortOrder === 'DESCENDING'}
                      onChange={() => setSortOrder('DESCENDING')}
                    />
                    <span className='hover-new-type-text'>Descending</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td>Attribute</td>
                <td className='row-order'>
                  <div className='radio-sort-criterion'>
                    <input
                      type='radio'
                      name='sort-by'
                      checked={sortBy === 'NAME'}
                      onChange={() => setSortBy('NAME')}
                    />
                    <span className='hover-new-type-text'>Name</span>
                  </div>

                  <div className='radio-sort-criterion'>
                    <input
                      type='radio'
                      name='sort-by'
                      checked={sortBy === 'SIZE'}
                      onChange={() => setSortBy('SIZE')}
                    />
                    <span className='hover-new-type-text'>Size</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id='confirm-button-container'>
        <button className='confirm-button' onClick={onSortingFile}>
          Sort
        </button>
        <button className='confirm-button' onClick={onCancelSortingFile}>
          Cancel
        </button>
      </div>
    </HoverCard>
  );

  const renderRenameDialog = () => (
    <HoverCard
      show={renameDialogDetails.show}
      onDismiss={onCancelRenamingFiles}>
      <div className='column'>
        <span id='hover-title'>{renameDialogDetails.title}</span>
        <span id='hover-text'>{renameDialogDetails.description}</span>
      </div>
      <div id='hover-dir-browser-container'>
        <span id='hover-small-text'>Select a method of renaming</span>
        <div id='hover-dir-browser'>
          <table>
            <tbody>
              <tr id='row-rename-both'>
                <td className='row-rename'>
                  <table
                    style={{
                      display: renameDialogDetails.counts?.files
                        ? 'flex'
                        : 'none',
                    }}>
                    <tbody>
                      <tr>
                        <th colSpan={2}>For Files</th>
                      </tr>

                      <tr>
                        <td>Base name</td>
                        <td>
                          <input
                            type='text'
                            value={baseNameForRenaming.forFiles}
                            onChange={event =>
                              setBaseNameForRenaming({
                                ...baseNameForRenaming,
                                forFiles: event.target.value,
                              })
                            }
                          />
                        </td>
                      </tr>

                      <tr>
                        <td>Extension</td>
                        <td>
                          <input
                            type='text'
                            value={fileExtensionForRenaming.new}
                            onChange={event =>
                              setFileExtensionForRenaming({
                                ...fileExtensionForRenaming,
                                new: event.target.value,
                              })
                            }
                          />
                        </td>
                      </tr>

                      <tr>
                        <td>Include previous?</td>
                        <td>
                          <input
                            type='checkbox'
                            checked={fileExtensionForRenaming.includeOriginal}
                            onChange={event =>
                              setFileExtensionForRenaming({
                                ...fileExtensionForRenaming,
                                includeOriginal: event.target.checked,
                              })
                            }
                          />
                        </td>
                      </tr>

                      <tr>
                        <td>Preview</td>
                        <td>
                          <span className='file-ext-text'>
                            {`${baseNameForRenaming.forFiles}${
                              renameDialogDetails.batchRenaming ? ' (1)' : ''
                            }.${
                              fileExtensionForRenaming.includeOriginal &&
                              fileExtensionForRenaming.original !==
                                fileExtensionForRenaming.new
                                ? fileExtensionForRenaming.original + '.'
                                : ''
                            }${fileExtensionForRenaming.new}`}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <td className='row-rename'>
                  <table
                    style={{
                      display: renameDialogDetails.counts?.dirs
                        ? 'flex'
                        : 'none',
                    }}>
                    <tbody>
                      <tr>
                        <th colSpan={2}>For Folders</th>
                      </tr>
                      <tr>
                        <td>Base name</td>
                        <td>
                          <input
                            type='text'
                            value={baseNameForRenaming.forFolder}
                            onChange={event =>
                              setBaseNameForRenaming({
                                ...baseNameForRenaming,
                                forFolder: event.target.value,
                              })
                            }
                          />
                        </td>
                      </tr>

                      <tr>
                        <td>Preview</td>
                        <td>
                          <span className='file-ext-text'>
                            {`${baseNameForRenaming.forFolder}${
                              renameDialogDetails.batchRenaming ? ' (1)' : ''
                            }`}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id='confirm-button-container'>
        <button
          disabled={Boolean(
            (renameDialogDetails.counts?.files &&
              !baseNameForRenaming.forFiles) ||
              (renameDialogDetails.counts?.dirs &&
                !baseNameForRenaming.forFolder)
          )}
          className='confirm-button'
          onClick={onRenamingFiles}>
          Rename
        </button>
        <button className='confirm-button' onClick={onCancelRenamingFiles}>
          Cancel
        </button>
      </div>
    </HoverCard>
  );

  const renderDeleteDialog = () => (
    <HoverCard
      show={deleteDialogDetails.show}
      onDismiss={onCancelDeletingFiles}>
      <div className='column'>
        <span id='hover-title'>{deleteDialogDetails.title}</span>
        <span id='hover-text'>{deleteDialogDetails.description}</span>
      </div>

      <div id='confirm-button-container'>
        <button className='confirm-button' onClick={onDeletingFiles}>
          Delete
        </button>
        <button className='confirm-button' onClick={onCancelDeletingFiles}>
          Cancel
        </button>
      </div>
    </HoverCard>
  );

  const renderFileInfoDialog = () => (
    <HoverCard show={fileInfoDetails.show} onDismiss={onDismissInfoPanel}>
      <div className='column'>
        <span id='hover-title'>{fileInfoDetails.title}</span>
      </div>

      <div id='hover-dir-browser'>
        <table>
          <tbody style={{ textAlign: 'left' }}>
            <tr>
              <td className='table-attr-text'>Name</td>
              <td>{fileInfoDetails.name}</td>
            </tr>
            {fileInfoDetails.sizeInString && (
              <tr>
                <td className='table-attr-text'>Size</td>
                <td>{fileInfoDetails.sizeInString}</td>
              </tr>
            )}
            <tr>
              <td className='table-attr-text'>Description</td>
              <td>{fileInfoDetails.description}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id='confirm-button-container'>
        <button className='file-info-ok-button' onClick={onDismissInfoPanel}>
          OK
        </button>
      </div>
    </HoverCard>
  );

  return (
    <>
      {renderNewFileDialog()}
      {renderCopyDialog()}
      {renderRenameDialog()}
      {renderDeleteDialog()}
      {renderFileInfoDialog()}
      {renderSortDialog()}

      <div id='file-manager-container'>
        {renderLastFetchLabel()}
        {renderPathViewer()}
        {renderButtonPanel()}
        {renderErrorOrListPanel()}
      </div>
    </>
  );
};

export default FileManager;
