import { ILoadingState } from './loader';
import { IAuthState } from './auth';

interface IState {
  auth: IAuthState;
  loading: ILoadingState;
}

export type { IState };
