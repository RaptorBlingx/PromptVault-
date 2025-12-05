// ============================================
// PromptVault v2.0 - Type Definitions
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

// ----- Utility Functions -----

/**
 * Extract variables from prompt content.
 * Matches {{variableName}} or {{variableName:defaultValue}}
 */
export function extractVariables(content: string): PromptVariable[] {
  const regex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g;
  const variables: PromptVariable[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        defaultValue: match[2]?.trim(),
      });
    }
  }

  return variables;
}

/**
 * Replace variables in content with provided values.
 */
export function replaceVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{\{([^}:]+)(?::[^}]*)?\}\}/g, (_, name) => {
    const trimmedName = name.trim();
    return values[trimmedName] ?? `{{${trimmedName}}}`;
  });
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

export function createDefaultPrompt(folderId: string | null = null): Prompt {
  const now = Date.now();
  return {
    id: now.toString(),
    title: 'New Prompt',
    content: '',
    tags: [],
    isFavorite: false,
    isPinned: false,
    folderId,
    createdAt: now,
    updatedAt: now,
    versions: [],
  };
}

export function createDefaultFolder(name: string): Folder {
  return {
    id: Date.now().toString(),
    name,
    icon: '📁',
    color: DEFAULT_FOLDER_COLORS[Math.floor(Math.random() * DEFAULT_FOLDER_COLORS.length)],
    createdAt: Date.now(),
  };
}
