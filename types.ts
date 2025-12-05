export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ViewState = 'LIST' | 'CREATE' | 'EDIT' | 'SETTINGS';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export enum SortOption {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  AZ = 'AZ',
}
