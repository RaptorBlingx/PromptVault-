// ============================================
// PromptVault Shared - Utility Functions
// ============================================

import { Prompt, Folder, DEFAULT_FOLDER_COLORS } from './types';

/**
 * Generate a unique ID based on timestamp + random suffix.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * SHA-256 hash (works in both browser and React Native with expo-crypto).
 * This is a platform-agnostic signature — implementations inject the actual hasher.
 */
export type HashFunction = (input: string) => Promise<string>;

/**
 * Create a default prompt with sensible defaults.
 */
export function createDefaultPrompt(folderId: string | null = null): Prompt {
  const now = Date.now();
  return {
    id: generateId(),
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

/**
 * Create a default folder.
 */
export function createDefaultFolder(name: string): Folder {
  return {
    id: generateId(),
    name,
    icon: '📁',
    color: DEFAULT_FOLDER_COLORS[Math.floor(Math.random() * DEFAULT_FOLDER_COLORS.length)],
    createdAt: Date.now(),
  };
}

/**
 * Count words in a string.
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count characters in a string.
 */
export function countCharacters(text: string): number {
  return text.length;
}

/**
 * Format a timestamp as a relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
