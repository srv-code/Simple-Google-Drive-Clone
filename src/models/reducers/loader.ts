interface ILoadingState {
  isLoggingIn: boolean;
  isFetchingNotifications: boolean;
  isFetchingFiles: boolean;
  isFetchingDirectories: boolean;
}

export type { ILoadingState };
