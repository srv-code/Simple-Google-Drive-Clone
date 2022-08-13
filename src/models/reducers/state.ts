import { ILoadingState } from './loader';
import { IAuthState } from './auth';
import { IFilesState } from './files';

interface IState {
  loading: ILoadingState;
  auth: IAuthState;
  files: IFilesState;
}

export type { IState };
