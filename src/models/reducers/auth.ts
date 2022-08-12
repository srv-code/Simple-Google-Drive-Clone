interface IAuthState {
  isLoggedIn: boolean;
  token?: string;
  username?: string;
  password?: string;
  error?: string;
}

export type { IAuthState };
