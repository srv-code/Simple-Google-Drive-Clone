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

interface ICopyDialogProps {
  show: boolean;
  sourceDirectory?: File;
  operation?: 'move' | 'copy';
  title?: string;
  text?: string;
  onSelect?: (directory: Directory) => void;
  onCancel?: () => void;
}

type Directory = File | undefined;

const FileManager: React.FC<IProps> = props => {
  const [parentDirs, setParentDirs] = useState<Directory[]>([]);
  const [copyDialogParentDirs, setCopyDialogParentDirs] = useState<Directory[]>(
    []
  );

  const [previewData, setPreviewData] = useState<File | null>();
  const [selectedFileIds, setSelectedFileIds] = useState<FileID[] | null>(null);
  const [copyDialogProps, setCopyDialogProps] = useState<ICopyDialogProps>({
    show: false,
  });

  const {
    loading: { isFetchingFiles, isFetchingDirectories },
    files: { directoryListing, pasteDestinationListing },
  } = useSelector((state: IState) => state);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchDirectoryListing('listing', undefined);
  }, [props.token]);

  useEffect(() => {
    if (selectedFileIds && !copyDialogProps.show) setSelectedFileIds(null);
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
    if (!isFetchingFiles)
      fetchDirectoryListing('listing', parentDirs[parentDirs.length - 1]);
  };

  const switchFileSelection = () => {
    if (!isFetchingFiles) setSelectedFileIds(val => (val ? null : []));
  };

  const onDeleteFile = () => {
    console.log('Should delete files:', selectedFileIds);
    setSelectedFileIds(null);
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

    setCopyDialogProps({
      show: true,
      operation: move ? 'move' : 'copy',
      sourceDirectory,
      title: `File ${move ? 'Move' : 'Copy'}`,
      text: (() => {
        let retval = move ? 'Moving' : 'Copying';
        let fileCount = 0,
          dirCount = 0;
        directoryListing.files.forEach(file => {
          if (file.isDir) dirCount++;
          else fileCount++;
        });
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
        setCopyDialogProps({ show: false });
      },
      onCancel: () => {
        console.log(
          `Cancelled ${move ? 'moving' : 'copying'} files:`,
          selectedFileIds
        );
        setSelectedFileIds(null);
        setCopyDialogProps({ show: false });
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
        id: 'select-button',
        onClick: switchFileSelection,
        icon: require('../../assets/images/select.png'),
        labelText: 'Select',
        disabled: isFetchingFiles,
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

  const renderHoverCard = () => {
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
              <Loader />
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
        show={copyDialogProps.show}
        onDismiss={copyDialogProps?.onCancel!}>
        <div className='column'>
          <span id='hover-title'>{copyDialogProps?.title}</span>
          <span id='hover-text'>{copyDialogProps?.text}</span>
        </div>
        <div id='hover-dir-browser-container'>
          <span id='hover-small-text'>
            Select a folder to {copyDialogProps?.operation}:
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
              copyDialogProps.onSelect?.(
                copyDialogParentDirs[copyDialogParentDirs.length - 1]
              )
            }>
            Select Folder
          </button>
          <button className='confirm-button' onClick={copyDialogProps.onCancel}>
            Cancel
          </button>
        </div>
      </HoverCard>
    );
  };

  return (
    <>
      {renderHoverCard()}

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
