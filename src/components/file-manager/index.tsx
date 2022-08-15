import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { File } from '../../models/api/files';
import { IState } from '../../models/reducers/state';
import { requestFiles } from '../../store/files/actions';
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

  const renderLoader = (size: 'large' | 'medium' | 'small') => {
    const sizeValue =
      size === 'large' ? 40 : size === 'medium' ? 15 : size === 'small' ? 5 : 0;

    return (
      <img
        src={require('../../assets/images/loading.gif')}
        alt='Loading...'
        height={sizeValue}
        width={sizeValue}
      />
    );
  };

  const onRefreshDirListing = () => {
    fetchDirectoryListing(parentDirs[parentDirs.length - 1]);
  };

  const onGoToParentDir = () => {
    fetchDirectoryListing(parentDirs[parentDirs.length - 2]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: 'green',
        padding: '10px',
      }}>
      {/* action buttons */}
      <div>
        {/* <button
          disabled={isFetchingFiles}
          className='action-button'
          onClick={onRefreshDirListing}>
          Refresh
        </button> */}
        {/* <button
          disabled={isFetchingFiles}
          className='action-button'
          onClick={onGoToParentDir}>
          Go to parent
        </button> */}
      </div>

      {/* last fetched on label */}
      <div style={{ fontSize: '12px', marginTop: '10px' }}>
        <span style={{ marginRight: '10px' }}>Last fetched on:</span>
        <span>
          {lastFetchedOn ? lastFetchedOn.toString() : renderLoader('medium')}
        </span>
      </div>

      {/* path view */}
      <div
        style={{
          width: '100%',
          textAlign: 'left',
          marginTop: '5px',
          marginBottom: '5px',
          borderRadius: '2px',
          backgroundColor: 'coral',
        }}>
        <div
          style={{
            padding: '7px',
            display: 'flex',
            alignItems: 'center',
          }}>
          {parentDirs.map((dir, index, dirs) => {
            const isLastItem = dirs.length - 1 === index;

            return (
              <span key={index}>
                <a
                  href={isLastItem ? undefined : '#'}
                  className='link'
                  style={{
                    fontFamily: 'consolas',
                    fontSize: '12px',
                    backgroundColor: 'pink',
                    borderRadius: '10px',
                    padding: '1.5px 10px',
                  }}
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
            <div style={{ marginLeft: '5px' }}>{renderLoader('medium')}</div>
          )}
        </div>
      </div>

      <div
        style={{
          // backgroundColor: 'blue',
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
        }}>
        <div
          style={{
            // backgroundColor: 'gray',
            // alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            // marginBottom: '10px',
            // cursor: 'pointer',
          }}
          onClick={onRefreshDirListing}>
          <img
            src={require('../../assets/images/refresh.png')}
            alt='go-to-parent-folder-icon'
            height={20}
            width={20}
          />
          <a className='link' href='#' style={{ marginLeft: '2px' }}>
            Refresh
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: '18px',
          width: '100%',
          display: 'flex',
          flex: 1,
          // flexDirection: 'row',
          alignItems: 'center',
          // justifyContent: 'space-between',
          // backgroundColor: 'pink',
        }}>
        {/* error & file list view */}
        {error ? (
          /* error message */
          <div
            style={{
              backgroundColor: 'red',
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              flexDirection: 'column',
              color: 'white',
              padding: '10px',
            }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
              Error: {error?.reason}
            </span>

            {error?.fileId && (
              <span style={{ fontSize: '10px', marginTop: '5px' }}>
                File ID: {error.fileId}
              </span>
            )}
          </div>
        ) : (
          /* file list */
          <div
            style={{
              // backgroundColor: 'yellow',
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              // alignItems: 'center',
              // flexDirection: 'column',
              // color: 'white',
              // padding: '10px',
            }}>
            <div
              style={{
                display: 'flex',
                // width: '70%',
                flex: 0.75,
                // backgroundColor: 'red',
              }}>
              {isFetchingFiles ? (
                <div
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    flex: 1,
                    // backgroundColor: 'red',
                  }}>
                  {renderLoader('large')}
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  {parentDirs[parentDirs.length - 1] && (
                    <div
                      style={{
                        // backgroundColor: 'gray',
                        // alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '10px',
                        // cursor: 'pointer',
                      }}>
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
                  )}

                  {files?.length === 0 ? (
                    <div
                      style={{
                        // display: 'flex',
                        // flex: 1,
                        // alignSelf: 'center',
                        textAlign: 'center',
                        width: '100%',
                        fontSize: '25px',
                        color: 'darkgray',
                        // backgroundColor: 'blue',
                        marginBottom: '20px',
                      }}>
                      Empty folder
                    </div>
                  ) : (
                    <div
                      style={{
                        // textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        // alignItems: 'center',
                      }}>
                      {files?.map((file, index) => (
                        <div
                          key={index}
                          style={{
                            // backgroundColor: 'gray',
                            // alignSelf: 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px',
                            // cursor: 'pointer',
                          }}>
                          <img
                            src={require(`../../assets/images/${
                              file.isDir ? 'folder' : 'file'
                            }.png`)}
                            alt='file-folder-icon'
                            height={20}
                            width={20}
                            style={{ marginRight: '5px' }}
                          />
                          <a
                            className='link'
                            href='#'
                            onClick={() => onFileClick(file)}>
                            {file.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* file preview pane */}
            {previewData && (
              <div
                style={{
                  display: 'flex',
                  // alignItems: 'flex-start',
                  // alignContent: 'flex-start',
                  justifyContent: 'flex-end',
                  // alignSelf: 'flex-end',
                  flex: 0.24,
                  // backgroundColor: 'orange',
                }}>
                <table style={{ border: '1px solid black' }}>
                  <thead style={{}}>
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          backgroundColor: 'orange',
                          padding: '8px 0',
                          fontWeight: 'bold',
                          fontSize: '18px',
                        }}>
                        File Preview
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className='left-aligned'>Name</td>
                      <td className='right-aligned'>{previewData.name}</td>
                    </tr>
                    <tr>
                      <td className='left-aligned'>Size</td>
                      <td className='right-aligned'>{previewData.size}</td>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
