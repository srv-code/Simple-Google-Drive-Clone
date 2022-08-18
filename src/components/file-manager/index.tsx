import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { File } from '../../models/api/files';
import { IState } from '../../models/reducers/state';
import { requestFiles } from '../../store/files/actions';
import Loader from '../loader';
import './styles.css';

interface IProps {
  token: string;
}

const FileManager: React.FC<IProps> = props => {
  const [parentDirs, setParentDirs] = useState<(File | undefined)[]>([]);
  const [previewData, setPreviewData] = useState<File | null>();

  const {
    loading: { isFetchingFiles },
    files: { files, error, lastFetchedOn },
  } = useSelector((state: IState) => state);

  const dispatch = useDispatch();

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

  useEffect(() => {
    fetchDirectoryListing();
  }, [props.token]);

  const onRefreshDirListing = () => {
    if (!isFetchingFiles)
      fetchDirectoryListing(parentDirs[parentDirs.length - 1]);
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

  const renderButtonPanel = () => (
    <div id='button-panel'>
      <div id='refresh-button' onClick={onRefreshDirListing}>
        <img
          style={{ visibility: isFetchingFiles ? 'hidden' : 'visible' }}
          src={require('../../assets/images/refresh.png')}
          alt='go-to-parent-folder-icon'
          height={20}
          width={20}
        />
        <a
          className='link'
          href='#'
          id='refresh-button-text'
          style={
            isFetchingFiles ? { color: 'gray', cursor: 'default' } : undefined
          }>
          Refresh
        </a>
      </div>
    </div>
  );

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
