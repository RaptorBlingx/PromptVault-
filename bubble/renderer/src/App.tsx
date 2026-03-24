// ============================================
// PromptVault Bubble - Main App Component
// ============================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { apiClient, Prompt, Folder, ConnectionStatus } from './api';

// ----- Variable Extraction -----
function extractVariables(content: string): { name: string; defaultValue?: string }[] {
    const regex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g;
    const variables: { name: string; defaultValue?: string }[] = [];
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

function replaceVariables(content: string, values: Record<string, string>): string {
    return content.replace(/\{\{([^}:]+)(?::[^}]*)?\}\}/g, (_, name) => {
        const trimmedName = name.trim();
        return values[trimmedName] ?? `{{${trimmedName}}}`;
    });
}

// ----- Toast Component -----
interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'info';
    text: string;
}

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 2500);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <div className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{toast.text}</span>
        </div>
    );
};

// ----- Confirm Dialog Component -----
const ConfirmDialog: React.FC<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onConfirm, onCancel]);

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="confirm-btn cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm-btn danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

// ----- Filter Tabs -----
type FilterTab = 'all' | 'pinned' | 'favorites';

// ----- App Component -----
const App: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [serverUrl, setServerUrl] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Editor State
    const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
    const [editorData, setEditorData] = useState({ title: '', content: '', id: '' });

    // Variable modal
    const [variableModal, setVariableModal] = useState<{ open: boolean; prompt: Prompt | null }>({ open: false, prompt: null });
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; promptId: string | null }>({ open: false, promptId: null });

    // Toasts
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const toastIdRef = useRef(0);

    const addToast = useCallback((type: ToastMessage['type'], text: string) => {
        const id = ++toastIdRef.current;
        setToasts(prev => [...prev, { id, type, text }]);
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Initialize
    useEffect(() => {
        const init = async () => {
            await apiClient.initialize();
            setServerUrl(apiClient.getBaseUrl());
            loadData();
        };
        init();

        // Listen for settings open from tray
        if (window.electronAPI) {
            const cleanup = window.electronAPI.onOpenSettings(() => {
                setShowSettings(true);
                if (!isExpanded) {
                    handleExpand(true);
                }
            });
            return cleanup;
        }
    }, []);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (variableModal.open) {
                    setVariableModal({ open: false, prompt: null });
                } else if (confirmDialog.open) {
                    setConfirmDialog({ open: false, promptId: null });
                } else if (editorMode) {
                    setEditorMode(null);
                } else if (showSettings) {
                    setShowSettings(false);
                } else if (isExpanded) {
                    handleExpand(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded, variableModal.open, confirmDialog.open, editorMode, showSettings]);

    // Connection status
    useEffect(() => {
        const unsubscribe = apiClient.onConnectionStatusChange(setConnectionStatus);

        const interval = setInterval(() => {
            apiClient.checkConnection();
        }, 30000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [loadedPrompts, loadedFolders] = await Promise.all([
            apiClient.fetchPrompts(),
            apiClient.fetchFolders(),
        ]);
        setPrompts(loadedPrompts);
        setFolders(loadedFolders);
        setIsLoading(false);
    };

    const handleExpand = useCallback(async (expand: boolean) => {
        setIsExpanded(expand);
        if (window.electronAPI) {
            await window.electronAPI.toggleExpand(expand);
        }
        if (expand) {
            loadData();
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
            setActiveTab('all');
            setShowSettings(false);
            setEditorMode(null);
        }
    }, []);

    // ----- CRUD Logic -----
    const handleSavePrompt = async () => {
        if (!editorData.title.trim() || !editorData.content.trim()) {
            addToast('error', 'Title and content are required');
            return;
        }

        if (editorMode === 'create') {
            const newPrompt = {
                title: editorData.title,
                content: editorData.content,
                tags: [],
                isFavorite: false,
                isPinned: false,
                folderId: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                versions: []
            };
            const result = await apiClient.createPrompt(newPrompt);
            if (result) {
                addToast('success', 'Prompt created');
            } else {
                addToast('error', 'Failed to create prompt');
            }
        } else if (editorMode === 'edit' && editorData.id) {
            const result = await apiClient.updatePrompt(editorData.id, {
                title: editorData.title,
                content: editorData.content
            });
            if (result) {
                addToast('success', 'Prompt saved');
            } else {
                addToast('error', 'Failed to save prompt');
            }
        }

        setEditorMode(null);
        setEditorData({ title: '', content: '', id: '' });
        loadData();
    };

    const handleDeletePrompt = (id: string) => {
        setConfirmDialog({ open: true, promptId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.promptId) return;
        const ok = await apiClient.deletePrompt(confirmDialog.promptId);
        setConfirmDialog({ open: false, promptId: null });
        if (ok) {
            addToast('success', 'Prompt deleted');
            loadData();
        } else {
            addToast('error', 'Failed to delete prompt');
        }
    };

    const startCreate = () => {
        setEditorMode('create');
        setEditorData({ title: '', content: '', id: '' });
    };

    const startEdit = (prompt: Prompt) => {
        setEditorMode('edit');
        setEditorData({ title: prompt.title, content: prompt.content, id: prompt.id });
    };

    const handleTogglePin = async (prompt: Prompt) => {
        await apiClient.updatePrompt(prompt.id, { isPinned: !prompt.isPinned });
        loadData();
    };

    const handleToggleFavorite = async (prompt: Prompt) => {
        await apiClient.updatePrompt(prompt.id, { isFavorite: !prompt.isFavorite });
        loadData();
    };

    const handleCopy = useCallback(async (prompt: Prompt) => {
        const variables = extractVariables(prompt.content);

        if (variables.length > 0) {
            const initialValues: Record<string, string> = {};
            variables.forEach(v => {
                initialValues[v.name] = v.defaultValue || '';
            });
            setVariableValues(initialValues);
            setVariableModal({ open: true, prompt });
        } else {
            await copyToClipboard(prompt.content, prompt.id);
        }
    }, []);

    const copyToClipboard = async (text: string, promptId: string) => {
        try {
            if (window.electronAPI) {
                await window.electronAPI.copyToClipboard(text);
            } else {
                await navigator.clipboard.writeText(text);
            }
            setCopiedId(promptId);
            addToast('success', 'Copied to clipboard');
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            addToast('error', 'Failed to copy');
        }
    };

    const handleCopyWithVariables = async () => {
        if (!variableModal.prompt) return;
        const content = replaceVariables(variableModal.prompt.content, variableValues);
        await copyToClipboard(content, variableModal.prompt.id);
        setVariableModal({ open: false, prompt: null });
    };

    const handleOpenWebApp = () => {
        if (window.electronAPI) {
            window.electronAPI.openWebApp();
        }
    };

    const handleSaveSettings = () => {
        if (!serverUrl.trim()) {
            addToast('error', 'Server URL is required');
            return;
        }
        apiClient.setBaseUrl(serverUrl);
        setShowSettings(false);
        addToast('success', 'Settings saved');
        loadData();
    };

    // Filter prompts
    const filteredPrompts = useMemo(() => {
        let result = prompts;

        if (activeTab === 'pinned') {
            result = result.filter(p => p.isPinned);
        } else if (activeTab === 'favorites') {
            result = result.filter(p => p.isFavorite);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        return [...result].sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return b.updatedAt - a.updatedAt;
        });
    }, [prompts, searchQuery, activeTab]);

    const pinnedCount = useMemo(() => prompts.filter(p => p.isPinned).length, [prompts]);
    const favoritesCount = useMemo(() => prompts.filter(p => p.isFavorite).length, [prompts]);

    // ----- Bubble drag-vs-click handling -----
    const dragState = useRef<{ startX: number; startY: number; isDragging: boolean } | null>(null);
    const DRAG_THRESHOLD = 5;

    const handleBubbleMouseDown = useCallback((e: React.MouseEvent) => {
        dragState.current = { startX: e.screenX, startY: e.screenY, isDragging: false };

        const onMouseMove = (ev: MouseEvent) => {
            if (!dragState.current) return;
            const dx = ev.screenX - dragState.current.startX;
            const dy = ev.screenY - dragState.current.startY;
            if (!dragState.current.isDragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
                dragState.current.isDragging = true;
            }
            if (dragState.current.isDragging && window.electronAPI) {
                window.electronAPI.moveWindow({ x: ev.screenX - 30, y: ev.screenY - 30 });
            }
        };

        const onMouseUp = () => {
            if (dragState.current && !dragState.current.isDragging) {
                handleExpand(true);
            }
            dragState.current = null;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [handleExpand]);

    // ----- Render Bubble -----
    if (!isExpanded) {
        return (
            <div className="bubble-container">
                <button className="bubble-button" onMouseDown={handleBubbleMouseDown}>
                    <span className="bubble-icon">💬</span>
                </button>
            </div>
        );
    }

    // ----- Render Confirm Dialog -----
    const renderConfirmDialog = () => {
        if (!confirmDialog.open) return null;
        return (
            <ConfirmDialog
                message="Are you sure you want to delete this prompt? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, promptId: null })}
            />
        );
    };

    // ----- Render Toasts -----
    const renderToasts = () => {
        if (toasts.length === 0) return null;
        return (
            <div className="toast-container">
                {toasts.map(t => (
                    <Toast key={t.id} toast={t} onDismiss={dismissToast} />
                ))}
            </div>
        );
    };

    // ----- Render Editor -----
    if (editorMode) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">
                        {editorMode === 'create' ? '✨ New Prompt' : '✏️ Edit Prompt'}
                    </span>
                    <div className="panel-actions">
                        <button className="icon-btn" onClick={() => setEditorMode(null)}>✕</button>
                    </div>
                </div>
                <div className="editor-panel">
                    <input
                        className="editor-input title"
                        placeholder="Prompt Title"
                        value={editorData.title}
                        onChange={e => setEditorData(prev => ({ ...prev, title: e.target.value }))}
                        autoFocus
                    />
                    <textarea
                        className="editor-input content"
                        placeholder="Enter your prompt content... (use {{variable}} for dynamic fields)"
                        value={editorData.content}
                        onChange={e => setEditorData(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <div className="editor-footer">
                        <button className="cancel-btn" onClick={() => setEditorMode(null)}>Cancel</button>
                        <button className="save-btn" onClick={handleSavePrompt}>
                            {editorMode === 'create' ? 'Create Prompt' : 'Save Changes'}
                        </button>
                    </div>
                </div>
                {renderToasts()}
            </div>
        );
    }

    // ----- Render Variable Modal -----
    if (variableModal.open && variableModal.prompt) {
        const variables = extractVariables(variableModal.prompt.content);
        return (
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">📝 Fill Variables</span>
                    <div className="panel-actions">
                        <button className="icon-btn" onClick={() => setVariableModal({ open: false, prompt: null })}>✕</button>
                    </div>
                </div>
                <div className="settings-panel">
                    <div className="variable-prompt-title">{variableModal.prompt.title}</div>
                    {variables.map(v => (
                        <div key={v.name} className="settings-group">
                            <label className="settings-label">{v.name}</label>
                            <input
                                type="text"
                                className="settings-input"
                                value={variableValues[v.name] || ''}
                                onChange={e => setVariableValues(prev => ({ ...prev, [v.name]: e.target.value }))}
                                placeholder={v.defaultValue || `Enter ${v.name}...`}
                            />
                        </div>
                    ))}
                    <button className="save-btn" onClick={handleCopyWithVariables}>
                        📋 Copy with Variables
                    </button>
                </div>
                {renderToasts()}
            </div>
        );
    }

    // ----- Render Settings -----
    if (showSettings) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">⚙️ Settings</span>
                    <div className="panel-actions">
                        <button className="icon-btn" onClick={() => setShowSettings(false)}>✕</button>
                    </div>
                </div>
                <div className="settings-panel">
                    <div className="settings-group">
                        <label className="settings-label">Server URL</label>
                        <input
                            type="text"
                            className="settings-input"
                            value={serverUrl}
                            onChange={e => setServerUrl(e.target.value)}
                            placeholder="http://localhost:2529"
                        />
                        <span className="settings-hint">The URL of your PromptVault API server</span>
                    </div>
                    <div className="settings-group">
                        <label className="settings-label">Keyboard Shortcut</label>
                        <div className="shortcut-display">Ctrl + Shift + V</div>
                        <span className="settings-hint">Toggle the bubble from anywhere</span>
                    </div>
                    <button className="save-btn" onClick={handleSaveSettings}>Save Settings</button>
                </div>
                {renderToasts()}
            </div>
        );
    }

    // ----- Render Main Panel -----
    return (
        <div className="panel">
            {/* Header */}
            <div className="panel-header">
                <span className="panel-title">💬 PromptVault</span>
                <div className="panel-actions">
                    <button className="icon-btn" onClick={startCreate} title="New Prompt">➕</button>
                    <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">⚙️</button>
                    <button className="icon-btn" onClick={() => handleExpand(false)} title="Collapse">✕</button>
                </div>
            </div>

            {/* Search */}
            <div className="search-container">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="search-input"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All ({prompts.length})
                </button>
                <button
                    className={`filter-tab ${activeTab === 'pinned' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pinned')}
                >
                    📌 ({pinnedCount})
                </button>
                <button
                    className={`filter-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setActiveTab('favorites')}
                >
                    ⭐ ({favoritesCount})
                </button>
            </div>

            {/* Prompt List */}
            <div className="prompt-list">
                {isLoading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredPrompts.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>{searchQuery ? 'No matching prompts' : activeTab !== 'all' ? `No ${activeTab} prompts` : 'No prompts yet'}</p>
                        {activeTab === 'all' && !searchQuery && (
                            <button className="save-btn" style={{ marginTop: 10 }} onClick={startCreate}>Create First Prompt</button>
                        )}
                    </div>
                ) : (
                    filteredPrompts.map(prompt => (
                        <PromptItem
                            key={prompt.id}
                            prompt={prompt}
                            onCopy={handleCopy}
                            onEdit={startEdit}
                            onDelete={handleDeletePrompt}
                            onTogglePin={handleTogglePin}
                            onToggleFavorite={handleToggleFavorite}
                            isCopied={copiedId === prompt.id}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="panel-footer">
                <button className="open-web-btn" onClick={handleOpenWebApp}>🌐 Open Full App</button>
                <div className="connection-status">
                    <span className={`status-dot ${connectionStatus}`}></span>
                    <span>
                        {connectionStatus === 'connected' && 'Connected'}
                        {connectionStatus === 'disconnected' && 'Offline'}
                        {connectionStatus === 'checking' && 'Connecting...'}
                    </span>
                </div>
            </div>

            {renderConfirmDialog()}
            {renderToasts()}
        </div>
    );
};

// ----- Prompt Item Component -----
interface PromptItemProps {
    prompt: Prompt;
    onCopy: (prompt: Prompt) => void;
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    onTogglePin: (prompt: Prompt) => void;
    onToggleFavorite: (prompt: Prompt) => void;
    isCopied: boolean;
}

const PromptItem: React.FC<PromptItemProps> = ({ prompt, onCopy, onEdit, onDelete, onTogglePin, onToggleFavorite, isCopied }) => {
    const hasVariables = extractVariables(prompt.content).length > 0;

    return (
        <div className="prompt-item">
            <div className="prompt-info" onClick={() => onCopy(prompt)}>
                <div className="prompt-title">
                    {prompt.isPinned && <span className="badge pin">📌</span>}
                    {prompt.isFavorite && <span className="badge fav">⭐</span>}
                    {prompt.title}
                    {hasVariables && <span className="badge var">{'{ }'}</span>}
                </div>
                <div className="prompt-preview">
                    {prompt.content.slice(0, 80)}
                    {prompt.content.length > 80 ? '...' : ''}
                </div>
            </div>
            <div className="prompt-actions">
                <button
                    className={`action-btn ${prompt.isPinned ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onTogglePin(prompt); }}
                    title={prompt.isPinned ? 'Unpin' : 'Pin'}
                >
                    📌
                </button>
                <button
                    className={`action-btn ${prompt.isFavorite ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(prompt); }}
                    title={prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                    {prompt.isFavorite ? '⭐' : '☆'}
                </button>
                <button className="action-btn" onClick={(e) => { e.stopPropagation(); onEdit(prompt); }} title="Edit">
                    ✏️
                </button>
                <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }} title="Delete">
                    🗑️
                </button>
                <button
                    className={`copy-btn ${isCopied ? 'copied' : ''}`}
                    onClick={e => { e.stopPropagation(); onCopy(prompt); }}
                    title="Copy"
                >
                    {isCopied ? '✓' : '📋'}
                </button>
            </div>
        </div>
    );
};

export default App;
