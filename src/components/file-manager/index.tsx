import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { File, FileID } from '../../models/api/files';
import { IState } from '../../models/reducers/state';
import { requestFiles } from '../../store/files/actions';
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

const FileManager: React.FC<IProps> = props => {
  const [parentDirs, setParentDirs] = useState<(File | undefined)[]>([]);
  const [previewData, setPreviewData] = useState<File | null>();
  const [selectedItemIds, setSelectedItemIds] = useState<FileID[] | null>(null);

  const {
    loading: { isFetchingFiles },
    files: { files, error, lastFetchedOn },
  } = useSelector((state: IState) => state);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchDirectoryListing();
  }, [props.token]);

  useEffect(() => {
    if (selectedItemIds) setSelectedItemIds(null);
  }, [isFetchingFiles]);

  const onFileClick = (file?: File) => {
    console.log('clicked on', { file });

    if (!file || file.isDir) {
      if (previewData) setPreviewData(null);
      fetchDirectoryListing(file);
    } else setPreviewData(file);
  };

  const fetchDirectoryListing = (parent?: File) => {
    const parents = [...parentDirs];
    const index = parents.findIndex(dir =>
      parent ? parent.id === dir?.id : !dir
    );
    if (index !== -1) parents.splice(index + 1);
    else parents.push(parent);

    dispatch(requestFiles({ token: props.token, parentId: parent?.id }));
    setParentDirs(parents);
  };

  const onRefreshDirListing = () => {
    if (!isFetchingFiles)
      fetchDirectoryListing(parentDirs[parentDirs.length - 1]);
  };

  const switchFileSelection = () => {
    if (!isFetchingFiles) setSelectedItemIds(val => (val ? null : []));
  };

  const onDeleteFile = () => {
    console.log('Should delete files:', selectedItemIds);
    setSelectedItemIds(null);
  };

  const onFileCopyTo = (move?: boolean) => {
    console.log(`Should ${move ? 'move' : 'copy'} files:`, selectedItemIds);
    setSelectedItemIds(null);
  };

  const onDuplicateFile = () => {
    console.log('Should duplicate files:', selectedItemIds);
    setSelectedItemIds(null);
  };

  const onDownloadFile = () => {
    console.log('Should download files:', selectedItemIds);
    setSelectedItemIds(null);
  };

  const onGoToParentDir = () => {
    if (!isFetchingFiles)
      fetchDirectoryListing(parentDirs[parentDirs.length - 2]);
  };

  const renderLastFetchLabel = () => (
    <div id='last-fetch-text'>
      <span id='last-fetch-on-text'>Last fetched on:</span>
      <span>{lastFetchedOn?.toString() || <Loader />}</span>
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
                className='link'
                id='path-link-text'
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
        onClick={buttonProps.onClick}>
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
        disabled: Boolean(isFetchingFiles || !selectedItemIds?.length),
      },
      {
        id: 'move-button',
        onClick: () => onFileCopyTo(true),
        icon: require('../../assets/images/move.jpg'),
        labelText: 'Move To',
        disabled: Boolean(isFetchingFiles || !selectedItemIds?.length),
      },
      {
        id: 'copy-button',
        onClick: onFileCopyTo,
        icon: require('../../assets/images/copy.png'),
        labelText: 'Copy To',
        disabled: Boolean(isFetchingFiles || !selectedItemIds?.length),
      },
      {
        id: 'duplicate-button',
        onClick: onDuplicateFile,
        icon: require('../../assets/images/duplicate.png'),
        labelText: 'Duplicate',
        disabled: Boolean(isFetchingFiles || !selectedItemIds?.length),
        size: 18,
      },
      {
        id: 'download-button',
        onClick: onDuplicateFile,
        icon: require('../../assets/images/download.jpeg'),
        labelText: 'Download',
        disabled: Boolean(isFetchingFiles || !selectedItemIds?.length),
        size: 22,
      },
    ];

    return <div id='action-button-panel'>{buttons.map(renderButton)}</div>;
  };

  const renderErrorOrListPanel = () => {
    const renderErrorMessage = () => (
      <div id='error-reason-container'>
        <span id='error-reason-text'>Error: {error?.reason}</span>

        {error?.fileId && (
          <span id='error-file-id-text'>File ID: {error.fileId}</span>
        )}
      </div>
    );

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

    const renderParentDirLink = () => (
      <div id='parent-dir-container'>
        <img
          src={require('../../assets/images/parent-folder.png')}
          alt='go-to-parent-folder-icon'
          height={25}
          width={25}
        />
        <a className='link' href='#' onClick={onGoToParentDir}>
          ..
        </a>
      </div>
    );

    const renderFiles = () =>
      files?.map((file, index) => (
        <div key={index} id='file-container'>
          {selectedItemIds && (
            <input
              type='checkbox'
              checked={selectedItemIds?.includes(file.id)}
              onChange={() => {
                if (selectedItemIds) {
                  const ids = [...selectedItemIds];
                  const index = ids.findIndex(id => id === file.id);
                  if (index === -1) ids.push(file.id);
                  else ids.splice(index, 1);
                  setSelectedItemIds(ids);
                } else setSelectedItemIds([file.id]);
              }}
            />
          )}
          <img
            id='img-file-icon'
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

    const renderFileListing = () => (
      <div id='file-view-container'>
        <div id='file-list-container'>
          {isFetchingFiles ? (
            <div id='file-list-loader-container'>
              <Loader size='large' />
            </div>
          ) : (
            <div id='file-listing'>
              {parentDirs[parentDirs.length - 1] && renderParentDirLink()}

              {files?.length === 0 ? (
                <div id='empty-folder-text'>Empty folder</div>
              ) : (
                <div id='files'>{renderFiles()}</div>
              )}
            </div>
          )}
        </div>

        {previewData && renderFilePreviewPanel()}
      </div>
    );

    return (
      <div id='list-error-container'>
        {error ? renderErrorMessage() : renderFileListing()}
      </div>
    );
  };

  return (
    <div id='file-manager-container'>
      {renderLastFetchLabel()}
      {renderPathViewer()}
      {renderButtonPanel()}
      {renderErrorOrListPanel()}
    </div>
  );
};

export default FileManager;
