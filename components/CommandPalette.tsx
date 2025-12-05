import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Prompt, Folder } from '../types';
import { Icons } from './Icon';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    prompts: Prompt[];
    folders: Folder[];
    onSelectPrompt: (id: string) => void;
    onCreatePrompt: () => void;
    onOpenSettings: () => void;
    onToggleTheme: () => void;
}

interface CommandItem {
    id: string;
    type: 'prompt' | 'action' | 'folder';
    label: string;
    description?: string;
    icon: keyof typeof Icons;
    shortcut?: string;
    action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    prompts,
    folders,
    onSelectPrompt,
    onCreatePrompt,
    onOpenSettings,
    onToggleTheme,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Build command items
    const getItems = useCallback((): CommandItem[] => {
        const items: CommandItem[] = [];

        // Actions come first
        const actions: CommandItem[] = [
            {
                id: 'new-prompt',
                type: 'action',
                label: 'New Prompt',
                description: 'Create a new prompt',
                icon: 'Plus',
                shortcut: '⌘N',
                action: () => { onCreatePrompt(); onClose(); },
            },
            {
                id: 'settings',
                type: 'action',
                label: 'Settings',
                description: 'Open settings',
                icon: 'Settings',
                shortcut: '⌘,',
                action: () => { onOpenSettings(); onClose(); },
            },
            {
                id: 'toggle-theme',
                type: 'action',
                label: 'Toggle Theme',
                description: 'Switch between light and dark mode',
                icon: 'Sun',
                shortcut: '⌘D',
                action: () => { onToggleTheme(); },
            },
        ];

        // Filter actions by query
        const q = query.toLowerCase();
        if (q) {
            items.push(...actions.filter(a =>
                a.label.toLowerCase().includes(q) ||
                a.description?.toLowerCase().includes(q)
            ));

            // Add matching prompts
            prompts
                .filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.content.toLowerCase().includes(q) ||
                    p.tags.some(t => t.toLowerCase().includes(q))
                )
                .slice(0, 8)
                .forEach(p => {
                    items.push({
                        id: `prompt-${p.id}`,
                        type: 'prompt',
                        label: p.title,
                        description: p.content.slice(0, 60) + (p.content.length > 60 ? '...' : ''),
                        icon: 'FileText',
                        action: () => { onSelectPrompt(p.id); onClose(); },
                    });
                });
        } else {
            // Show actions + recent prompts
            items.push(...actions);
            prompts.slice(0, 5).forEach(p => {
                items.push({
                    id: `prompt-${p.id}`,
                    type: 'prompt',
                    label: p.title,
                    description: 'Recent prompt',
                    icon: 'FileText',
                    action: () => { onSelectPrompt(p.id); onClose(); },
                });
            });
        }

        return items;
    }, [query, prompts, folders, onSelectPrompt, onCreatePrompt, onOpenSettings, onToggleTheme, onClose]);

    const items = getItems();

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, items.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && items[selectedIndex]) {
                e.preventDefault();
                items[selectedIndex].action();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, items, selectedIndex, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selected = listRef.current.querySelector('[data-selected="true"]');
            if (selected) {
                selected.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop animate-fade-in" onClick={onClose}>
            <div
                className="command-palette animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div style={{ position: 'relative' }}>
                    <Icons.Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: 'var(--space-5)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-tertiary)',
                        }}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-palette-input"
                        style={{ paddingLeft: 'calc(var(--space-5) + 28px)' }}
                        placeholder="Search prompts or type a command..."
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <kbd style={{
                        position: 'absolute',
                        right: 'var(--space-4)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}>
                        ESC
                    </kbd>
                </div>

                <div className="command-palette-results" ref={listRef}>
                    {items.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <p style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-tertiary)'
                            }}>
                                No results found for "{query}"
                            </p>
                        </div>
                    ) : (
                        items.map((item, index) => {
                            const IconComponent = Icons[item.icon];
                            return (
                                <div
                                    key={item.id}
                                    className="command-palette-item"
                                    data-selected={index === selectedIndex}
                                    onClick={item.action}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span className="command-palette-item-icon">
                                        <IconComponent size={18} />
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="command-palette-item-label truncate">
                                            {item.label}
                                        </div>
                                        {item.description && (
                                            <div
                                                className="truncate"
                                                style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--color-text-tertiary)'
                                                }}
                                            >
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                    {item.shortcut && (
                                        <kbd className="command-palette-item-shortcut">
                                            {item.shortcut}
                                        </kbd>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

// Global keyboard shortcut hook
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { isOpen, setIsOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
