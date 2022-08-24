import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { File, FileID } from '../../models/api/files';
import { IState } from '../../models/reducers/state';
import {
  requestFiles,
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
  onSelect?: (directory: Directory) => void;
  onCancel?: () => void;
}

interface INewDialogDetails {
  show: boolean;
  onSelect?: () => void;
  onCancel?: () => void;
}

interface IRenameDialogDetails {
  show: boolean;
  batchRenaming?: boolean;
  title?: string;
  description?: string;
  counts?: { dirs: number; files: number };
  onOK?: () => void;
  onCancel?: () => void;
}

interface IDeleteDialogDetails {
  show: boolean;
  title?: string;
  description?: string;
  onOK?: () => void;
  onCancel?: () => void;
}

const FileManager: React.FC<IProps> = props => {
  const [parentDirs, setParentDirs] = useState<Directory[]>([]);
  const [copyDialogParentDirs, setCopyDialogParentDirs] = useState<Directory[]>(
    []
  );
  const [newDialogDetails, setNewDialogDetails] = useState<INewDialogDetails>({
    show: false,
  });
  const [selectedFileTemplateId, setSelectedFileTemplateId] = useState<
    FileTemplateID | undefined
  >();
  const [selectedFileTemplateType, setSelectedFileTemplateType] = useState<
    FileTemplateType | undefined
  >();
  const [renameDialogDetails, setRenameDialogDetails] =
    useState<IRenameDialogDetails>({ show: false });
  const [previewData, setPreviewData] = useState<File | null>();
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
    // setCopyDialogProps({ show: false });
  }, [isFetchingFiles]);

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
        if (previewData) setPreviewData(null);
        fetchDirectoryListing('listing', file);
      } else setPreviewData(file);
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

  const showNewDialog = () => {
    setSelectedFileIds(null);

    setNewDialogDetails({
      show: true,
      onSelect: () => {
        // dispatch create new file
        setNewDialogDetails({ show: false });
      },
      onCancel: () => {
        setNewDialogDetails({ show: false });
      },
    });
  };

  const switchFileSelection = () => {
    setSelectedFileIds(val => (val ? null : []));
  };

  const onRenameFiles = () => {
    const { dirCount: dirs, fileCount: files } = getSelectedFileFolderCount();

    // building dialog title & description
    let batchRenaming = selectedFileIds!.length > 1,
      title = '',
      description = 'Renaming ';

    if (batchRenaming) {
      title = 'Batch ' + title;
      description = 'Batch ' + description;
    }

    if (files) {
      title += 'File';
      description += `${files} Files`;
    }
    if (files && dirs) {
      title += ' & ';
      description += ' & ';
    }
    if (dirs) {
      title += 'Folder';
      description += `${dirs} Folders`;
    }
    title += ' Rename';

    // extracting base file name and extension
    let fileBaseName = '',
      folderBaseName = '',
      fileExtension = '';
    if (files) {
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
    if (dirs) {
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
      counts: { dirs, files },
      onOK: () => {
        setSelectedFileIds(null);
        setRenameDialogDetails({ show: false });
        // dispatch renaming API
      },
      onCancel: () => {
        setSelectedFileIds(null);
        setRenameDialogDetails({ show: false });
      },
    });
  };

  const onDeleteFile = () => {
    const { dirCount, fileCount } = getSelectedFileFolderCount();

    // building dialog title & description
    let title = '',
      description = 'Delete ';

    if (fileCount) {
      title += 'File';
      description += `${fileCount} Files`;
    }
    if (fileCount && dirCount) {
      title += ' & ';
      description += ' & ';
    }
    if (dirCount) {
      title += 'Folder';
      description += `${dirCount} Folders`;
    }
    title += ' Delete';
    description += '?';

    setDeleteDialogDetails({
      show: true,
      title,
      description,
      onOK: () => {
        setSelectedFileIds(null);
        setDeleteDialogDetails({ show: false });
        // dispatch delete API
      },
      onCancel: () => {
        setSelectedFileIds(null);
        setDeleteDialogDetails({ show: false });
      },
    });
  };

  const getSelectedFileFolderCount = () => {
    let fileCount = 0,
      dirCount = 0;
    directoryListing.files.forEach(file => {
      if (selectedFileIds?.includes(file.id)) {
        if (file.isDir) dirCount++;
        else fileCount++;
      }
    });
    return { fileCount, dirCount };
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
        const { dirCount, fileCount } = getSelectedFileFolderCount();
        if (dirCount) retval += ` ${dirCount} directories`;
        if (dirCount && fileCount) retval += ' and';
        if (fileCount) retval += ` ${fileCount} files`;
        // retval += '?';
        return retval;
      })(),
      onSelect: (directory: Directory) => {
        console.log(
          `Should ${move ? 'move' : 'copy'} files:`,
          selectedFileIds,
          'to directory:',
          directory
        );
        setSelectedFileIds(null);
        setCopyDialogDetails({ show: false });
      },
      onCancel: () => {
        console.log(
          `Cancelled ${move ? 'moving' : 'copying'} files:`,
          selectedFileIds
        );
        setSelectedFileIds(null);
        setCopyDialogDetails({ show: false });
      },
    });
  };

  const onDuplicateFile = () => {
    console.log('Should duplicate files:', selectedFileIds);
    setSelectedFileIds(null);
  };

  const onDownloadFile = () => {
    console.log('Should download files:', selectedFileIds);
    setSelectedFileIds(null);
  };

  const onShowInfo = () => {
    console.log('Should show info for files:', selectedFileIds);
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
      {
        id: 'download-button',
        onClick: onDuplicateFile,
        icon: require('../../assets/images/download.jpeg'),
        labelText: 'Download',
        disabled: Boolean(isFetchingFiles || !selectedFileIds?.length),
        size: 22,
      },
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
              <td className='right-aligned'>{previewData!.name}</td>
            </tr>
            <tr>
              <td className='left-aligned'>Size</td>
              <td className='right-aligned'>{previewData!.size}</td>
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

        {previewData && renderFilePreviewPanel()}
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
      <HoverCard
        show={copyDialogDetails.show}
        onDismiss={copyDialogDetails.onCancel!}>
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
              copyDialogDetails.onSelect?.(
                copyDialogParentDirs[copyDialogParentDirs.length - 1]
              )
            }>
            Select Folder
          </button>
          <button
            className='confirm-button'
            onClick={copyDialogDetails.onCancel}>
            Cancel
          </button>
        </div>
      </HoverCard>
    );
  };

  const renderNewFileDialog = () => (
    <HoverCard
      show={newDialogDetails.show}
      onDismiss={newDialogDetails?.onCancel!}>
      <div className='column'>
        <span id='hover-title'>New File</span>
      </div>
      <div id='hover-dir-browser-container'>
        <span id='hover-small-text'>Select a new file template</span>
        <div id='hover-dir-browser'>
          <table id='new-file-table'>
            <tbody>
              <tr>
                <td>
                  <span className='table-attr-text'>Template</span>
                </td>
                <td>
                  <select
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
                    value={selectedFileTemplateId}
                    onChange={event =>
                      setSelectedFileTemplateId(
                        +event.target.value as FileTemplateID
                      )
                    }>
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
                    {newFileTemplates.find(
                      template => template.id === selectedFileTemplateId
                    )?.extension || 'None'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id='confirm-button-container'>
        <button
          disabled={!selectedFileTemplateId}
          className='confirm-button'
          onClick={() => newDialogDetails.onSelect?.()}>
          Select Template
        </button>
        <button className='confirm-button' onClick={newDialogDetails.onCancel}>
          Cancel
        </button>
      </div>
    </HoverCard>
  );

  const renderRenameDialog = () => (
    <HoverCard
      show={renameDialogDetails.show}
      onDismiss={renameDialogDetails?.onCancel!}>
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
          onClick={() => renameDialogDetails.onOK?.()}>
          Rename
        </button>
        <button
          className='confirm-button'
          onClick={renameDialogDetails.onCancel}>
          Cancel
        </button>
      </div>
    </HoverCard>
  );

  const renderDeleteDialog = () => (
    <HoverCard
      show={deleteDialogDetails.show}
      onDismiss={deleteDialogDetails?.onCancel!}>
      <div className='column'>
        <span id='hover-title'>{deleteDialogDetails.title}</span>
        <span id='hover-text'>{deleteDialogDetails.description}</span>
      </div>

      <div id='confirm-button-container'>
        <button
          className='confirm-button'
          onClick={() => deleteDialogDetails.onOK?.()}>
          Delete
        </button>
        <button
          className='confirm-button'
          onClick={deleteDialogDetails.onCancel}>
          Cancel
        </button>
      </div>
    </HoverCard>
  );

  return (
    <>
      {renderCopyDialog()}
      {renderNewFileDialog()}
      {renderRenameDialog()}
      {renderDeleteDialog()}

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
