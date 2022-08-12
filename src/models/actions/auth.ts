import { IAuthAPIResponse } from '../api/auth';

interface IAuthRequestAction {
  type: string;
  payload: {
    username: string;
    password: string;
  };
}

interface IAuthSuccessAction {
  type: string;
  payload: IAuthAPIResponse;
}

interface IAuthFailureAction {
  type: string;
  payload: string;
}

export type { IAuthRequestAction, IAuthSuccessAction, IAuthFailureAction };
