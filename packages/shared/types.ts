// ============================================
// PromptVault Shared - Type Definitions
// ============================================

// ----- Core Entities -----

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  versions: PromptVersion[];
}

export interface PromptVersion {
  id: string;
  content: string;
  title: string;
  savedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
}

// ----- UI State -----

export type ViewState = 'LIST' | 'CREATE' | 'EDIT' | 'SETTINGS';

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  defaultFolderId: string | null;
  showWordCount: boolean;
}

// ----- Toast Notifications -----

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ----- Enums -----

export enum SortOption {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  AZ = 'AZ',
  PINNED = 'PINNED',
}

// ----- Variable System -----

export interface PromptVariable {
  name: string;
  defaultValue?: string;
}

// ----- Sync Types -----

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export type RecordSyncStatus = 'synced' | 'created' | 'updated' | 'deleted';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  pendingChanges: number;
  error: string | null;
}

// ----- Default Values -----

export const DEFAULT_FOLDER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export const DEFAULT_FOLDER_ICONS = [
  '📁', '📂', '🗂️', '💼', '📚', '🎯', '⚡', '🔥', '💡', '🚀',
];

export const MAX_VERSIONS = 5;
