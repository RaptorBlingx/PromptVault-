import { Prompt, Folder, createDefaultPrompt, createDefaultFolder } from '../types';

const PROMPTS_KEY = 'promptvault-prompts';
const FOLDERS_KEY = 'promptvault-folders';
const VERSION_KEY = 'promptvault-version';
const CURRENT_VERSION = 2;

// ----- Data Migration -----

interface LegacyPrompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

function migrateToV2(legacyPrompts: LegacyPrompt[]): Prompt[] {
  return legacyPrompts.map(p => ({
    ...p,
    isPinned: false,
    folderId: null,
    versions: [],
  }));
}

function runMigrations(): void {
  const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '1', 10);

  if (storedVersion < 2) {
    const raw = localStorage.getItem(PROMPTS_KEY);
    if (raw) {
      try {
        const legacyPrompts = JSON.parse(raw) as LegacyPrompt[];
        const migratedPrompts = migrateToV2(legacyPrompts);
        localStorage.setItem(PROMPTS_KEY, JSON.stringify(migratedPrompts));
      } catch (e) {
        console.error('Migration failed:', e);
      }
    }
  }

  localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
}

// ----- Prompts -----

export function loadPrompts(): Prompt[] {
  runMigrations();

  const raw = localStorage.getItem(PROMPTS_KEY);
  if (!raw) return [];

  try {
    const prompts = JSON.parse(raw) as Prompt[];
    // Ensure all prompts have required fields
    return prompts.map(p => ({
      ...createDefaultPrompt(),
      ...p,
    }));
  } catch (e) {
    console.error('Failed to parse prompts:', e);
    return [];
  }
}

export function savePrompts(prompts: Prompt[]): void {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
}

// ----- Folders -----

export function loadFolders(): Folder[] {
  const raw = localStorage.getItem(FOLDERS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Folder[];
  } catch (e) {
    console.error('Failed to parse folders:', e);
    return [];
  }
}

export function saveFolders(folders: Folder[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

// ----- Export / Import -----

export interface ExportData {
  version: number;
  exportedAt: number;
  prompts: Prompt[];
  folders: Folder[];
}

export function exportData(prompts: Prompt[], folders: Folder[]): string {
  const data: ExportData = {
    version: CURRENT_VERSION,
    exportedAt: Date.now(),
    prompts,
    folders,
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): { prompts: Prompt[]; folders: Folder[] } | null {
  try {
    const data = JSON.parse(jsonString);

    // Handle legacy format (just array of prompts)
    if (Array.isArray(data)) {
      return {
        prompts: migrateToV2(data),
        folders: [],
      };
    }

    // Handle new format
    if (data.prompts && Array.isArray(data.prompts)) {
      const prompts = data.version < 2
        ? migrateToV2(data.prompts)
        : data.prompts;

      return {
        prompts,
        folders: data.folders || [],
      };
    }

    return null;
  } catch (e) {
    console.error('Import failed:', e);
    return null;
  }
}

// ----- Import from Markdown -----

export function importFromMarkdown(filename: string, content: string): Prompt {
  const title = filename.replace(/\.md$/i, '');
  const now = Date.now();

  return {
    id: now.toString(),
    title,
    content,
    tags: [],
    isFavorite: false,
    isPinned: false,
    folderId: null,
    createdAt: now,
    updatedAt: now,
    versions: [],
  };
}

// ----- Utility -----

export function duplicatePrompt(prompt: Prompt): Prompt {
  const now = Date.now();
  return {
    ...prompt,
    id: now.toString(),
    title: `${prompt.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    versions: [],
  };
}

export function createPromptVersion(prompt: Prompt): Prompt {
  const version = {
    id: Date.now().toString(),
    title: prompt.title,
    content: prompt.content,
    savedAt: Date.now(),
  };

  // Keep only last 5 versions
  const versions = [version, ...prompt.versions].slice(0, 5);

  return {
    ...prompt,
    versions,
  };
}
