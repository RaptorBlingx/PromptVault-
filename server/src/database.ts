// ============================================
// PromptVault API - Database Layer
// ============================================

import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file location - can be overridden by environment variable
const DB_PATH = process.env.PROMPTVAULT_DB_PATH || path.join(__dirname, '../../data/promptvault.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db: DatabaseType = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ----- Schema Definitions -----

const SCHEMA_VERSION = 3;

function initializeSchema(): void {
    // Create version table
    db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);

    // Create prompts table
    db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'New Prompt',
      content TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      isFavorite INTEGER NOT NULL DEFAULT 0,
      isPinned INTEGER NOT NULL DEFAULT 0,
      folderId TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      versions TEXT NOT NULL DEFAULT '[]',
      deletedAt INTEGER DEFAULT NULL,
      FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL
    );
  `);

    // Create folders table
    db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '📁',
      color TEXT NOT NULL DEFAULT '#3B82F6',
      createdAt INTEGER NOT NULL,
      deletedAt INTEGER DEFAULT NULL
    );
  `);

    // Create indexes
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_prompts_folderId ON prompts(folderId);
    CREATE INDEX IF NOT EXISTS idx_prompts_isPinned ON prompts(isPinned);
    CREATE INDEX IF NOT EXISTS idx_prompts_isFavorite ON prompts(isFavorite);
    CREATE INDEX IF NOT EXISTS idx_prompts_updatedAt ON prompts(updatedAt);
    CREATE INDEX IF NOT EXISTS idx_prompts_deletedAt ON prompts(deletedAt);
    CREATE INDEX IF NOT EXISTS idx_folders_deletedAt ON folders(deletedAt);
  `);

    // Migrate from v2 → v3: add deletedAt columns if missing
    const currentVersion = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as { version: number } | undefined;
    if (currentVersion && currentVersion.version < 3) {
        try { db.exec('ALTER TABLE prompts ADD COLUMN deletedAt INTEGER DEFAULT NULL'); } catch (_) { /* column already exists */ }
        try { db.exec('ALTER TABLE folders ADD COLUMN deletedAt INTEGER DEFAULT NULL'); } catch (_) { /* column already exists */ }
        db.prepare('UPDATE schema_version SET version = ?').run(SCHEMA_VERSION);
    }

    if (!currentVersion) {
        db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
    }
}

// Initialize schema on module load
initializeSchema();

// ----- Type Definitions -----

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

// ----- Database Row Types -----

interface PromptRow {
    id: string;
    title: string;
    content: string;
    tags: string;
    isFavorite: number;
    isPinned: number;
    folderId: string | null;
    createdAt: number;
    updatedAt: number;
    versions: string;
}

interface FolderRow {
    id: string;
    name: string;
    icon: string;
    color: string;
    createdAt: number;
}

// ----- Prompt Operations -----

export function getAllPrompts(): Prompt[] {
    const stmt = db.prepare('SELECT * FROM prompts WHERE deletedAt IS NULL ORDER BY updatedAt DESC');
    const rows = stmt.all() as PromptRow[];
    return rows.map(rowToPrompt);
}

export function getPromptById(id: string): Prompt | null {
    const stmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
    const row = stmt.get(id) as PromptRow | undefined;
    return row ? rowToPrompt(row) : null;
}

export function createPrompt(prompt: Prompt): Prompt {
    const stmt = db.prepare(`
    INSERT INTO prompts (id, title, content, tags, isFavorite, isPinned, folderId, createdAt, updatedAt, versions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        prompt.id,
        prompt.title,
        prompt.content,
        JSON.stringify(prompt.tags),
        prompt.isFavorite ? 1 : 0,
        prompt.isPinned ? 1 : 0,
        prompt.folderId,
        prompt.createdAt,
        prompt.updatedAt,
        JSON.stringify(prompt.versions)
    );

    return prompt;
}

export function updatePrompt(id: string, updates: Partial<Prompt>): Prompt | null {
    const existing = getPromptById(id);
    if (!existing) return null;

    const updated: Prompt = {
        ...existing,
        ...updates,
        id, // Ensure ID cannot be changed
        updatedAt: Date.now(),
    };

    const stmt = db.prepare(`
    UPDATE prompts
    SET title = ?, content = ?, tags = ?, isFavorite = ?, isPinned = ?, folderId = ?, updatedAt = ?, versions = ?
    WHERE id = ?
  `);

    stmt.run(
        updated.title,
        updated.content,
        JSON.stringify(updated.tags),
        updated.isFavorite ? 1 : 0,
        updated.isPinned ? 1 : 0,
        updated.folderId,
        updated.updatedAt,
        JSON.stringify(updated.versions),
        id
    );

    return updated;
}

export function deletePrompt(id: string): boolean {
    // Soft delete: set deletedAt timestamp
    const stmt = db.prepare('UPDATE prompts SET deletedAt = ?, updatedAt = ? WHERE id = ? AND deletedAt IS NULL');
    const now = Date.now();
    const result = stmt.run(now, now, id);
    return result.changes > 0;
}

// ----- Folder Operations -----

export function getAllFolders(): Folder[] {
    const stmt = db.prepare('SELECT * FROM folders WHERE deletedAt IS NULL ORDER BY createdAt ASC');
    const rows = stmt.all() as FolderRow[];
    return rows.map(rowToFolder);
}

export function getFolderById(id: string): Folder | null {
    const stmt = db.prepare('SELECT * FROM folders WHERE id = ?');
    const row = stmt.get(id) as FolderRow | undefined;
    return row ? rowToFolder(row) : null;
}

export function createFolder(folder: Folder): Folder {
    const stmt = db.prepare(`
    INSERT INTO folders (id, name, icon, color, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

    stmt.run(folder.id, folder.name, folder.icon, folder.color, folder.createdAt);
    return folder;
}

export function updateFolder(id: string, updates: Partial<Folder>): Folder | null {
    const existing = getFolderById(id);
    if (!existing) return null;

    const updated: Folder = {
        ...existing,
        ...updates,
        id, // Ensure ID cannot be changed
    };

    const stmt = db.prepare(`
    UPDATE folders
    SET name = ?, icon = ?, color = ?
    WHERE id = ?
  `);

    stmt.run(updated.name, updated.icon, updated.color, id);
    return updated;
}

export function deleteFolder(id: string): boolean {
    // Soft delete: set deletedAt timestamp
    const stmt = db.prepare('UPDATE folders SET deletedAt = ? WHERE id = ? AND deletedAt IS NULL');
    const now = Date.now();
    const result = stmt.run(now, id);
    // Also unlink prompts from this folder
    db.prepare('UPDATE prompts SET folderId = NULL, updatedAt = ? WHERE folderId = ?').run(now, id);
    return result.changes > 0;
}

// ----- Bulk Operations -----

export function importData(prompts: Prompt[], folders: Folder[]): void {
    const transaction = db.transaction(() => {
        // Clear existing data
        db.prepare('DELETE FROM prompts').run();
        db.prepare('DELETE FROM folders').run();

        // Import folders first (for foreign key constraints)
        for (const folder of folders) {
            createFolder(folder);
        }

        // Import prompts
        for (const prompt of prompts) {
            createPrompt(prompt);
        }
    });

    transaction();
}

export function exportData(): { prompts: Prompt[]; folders: Folder[] } {
    return {
        prompts: getAllPrompts(),
        folders: getAllFolders(),
    };
}

// ----- Helper Functions -----

function rowToPrompt(row: PromptRow): Prompt {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        tags: JSON.parse(row.tags),
        isFavorite: row.isFavorite === 1,
        isPinned: row.isPinned === 1,
        folderId: row.folderId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        versions: JSON.parse(row.versions),
    };
}

function rowToFolder(row: FolderRow): Folder {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        createdAt: row.createdAt,
    };
}

// ----- Stats & Utilities -----

// ----- Delta Sync: Get Changes Since Timestamp -----

export interface SyncChange {
    prompts: {
        created: Prompt[];
        updated: Prompt[];
        deleted: { id: string; deletedAt: number }[];
    };
    folders: {
        created: Folder[];
        updated: Folder[];
        deleted: { id: string; deletedAt: number }[];
    };
    serverTime: number;
}

export function getChangesSince(since: number): SyncChange {
    const serverTime = Date.now();

    // Get changed prompts (active ones modified after 'since')
    const changedPrompts = db.prepare(
        'SELECT * FROM prompts WHERE updatedAt > ? AND deletedAt IS NULL'
    ).all(since) as PromptRow[];

    // Get deleted prompts since timestamp
    const deletedPrompts = db.prepare(
        'SELECT id, deletedAt FROM prompts WHERE deletedAt IS NOT NULL AND deletedAt > ?'
    ).all(since) as { id: string; deletedAt: number }[];

    // Get changed folders (active ones modified after 'since')
    const changedFolders = db.prepare(
        'SELECT * FROM folders WHERE createdAt > ? AND deletedAt IS NULL'
    ).all(since) as FolderRow[];

    // Get deleted folders since timestamp
    const deletedFolders = db.prepare(
        'SELECT id, deletedAt FROM folders WHERE deletedAt IS NOT NULL AND deletedAt > ?'
    ).all(since) as { id: string; deletedAt: number }[];

    // Separate created vs updated (created = createdAt > since, updated = createdAt <= since)
    const createdPrompts = changedPrompts.filter(p => p.createdAt > since).map(rowToPrompt);
    const updatedPrompts = changedPrompts.filter(p => p.createdAt <= since).map(rowToPrompt);
    const createdFolders = changedFolders.filter(f => f.createdAt > since).map(rowToFolder);
    const updatedFolders = changedFolders.filter(f => f.createdAt <= since).map(rowToFolder);

    return {
        prompts: {
            created: createdPrompts,
            updated: updatedPrompts,
            deleted: deletedPrompts,
        },
        folders: {
            created: createdFolders,
            updated: updatedFolders,
            deleted: deletedFolders,
        },
        serverTime,
    };
}

export function getStats(): { promptCount: number; folderCount: number } {
    const promptCount = (db.prepare('SELECT COUNT(*) as count FROM prompts').get() as { count: number }).count;
    const folderCount = (db.prepare('SELECT COUNT(*) as count FROM folders').get() as { count: number }).count;
    return { promptCount, folderCount };
}

export function closeDatabase(): void {
    db.close();
}

export default db;
