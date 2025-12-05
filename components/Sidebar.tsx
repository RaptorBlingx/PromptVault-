import React, { useState } from 'react';
import { ViewState, Folder } from '../types';
import { Icons } from './Icon';
import { ThemeToggle } from './ThemeProvider';

interface SidebarProps {
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
  totalPrompts: number;
  favoritesCount: number;
  pinnedCount: number;
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenCommandPalette: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onChangeView,
  totalPrompts,
  favoritesCount,
  pinnedCount,
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onOpenCommandPalette,
}) => {
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ folder: Folder; x: number; y: number } | null>(null);

  const handleFolderContextMenu = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault();
    setContextMenu({ folder, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const NavItem: React.FC<{
    icon: keyof typeof Icons;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
    color?: string;
  }> = ({ icon, label, count, isActive, onClick, color }) => {
    const IconComponent = Icons[icon];
    return (
      <button
        onClick={onClick}
        className="btn"
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          padding: 'var(--space-2) var(--space-3)',
          background: isActive ? 'var(--color-accent-bg)' : 'transparent',
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          fontWeight: isActive ? 500 : 400,
          borderRadius: 'var(--radius-md)',
          transition: 'all var(--transition-fast)',
        }}
      >
        <IconComponent size={18} style={{ color: color || 'inherit' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            background: 'var(--color-bg-tertiary)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        width: '260px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
      }}
      onClick={closeContextMenu}
    >
      {/* Logo */}
      <div style={{
        padding: 'var(--space-4) var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
          }}>
            P
          </div>
          <div>
            <h1 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              PromptVault
            </h1>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              margin: 0,
            }}>
              Pro Edition
            </p>
          </div>
        </div>
      </div>

      {/* Search Trigger */}
      <div style={{ padding: 'var(--space-3) var(--space-3)' }}>
        <button
          onClick={onOpenCommandPalette}
          className="btn btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <Icons.Search size={16} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
          <kbd style={{ fontSize: '10px' }}>⌘K</kbd>
        </button>
      </div>

      {/* New Prompt Button */}
      <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
        <button
          onClick={() => onChangeView('CREATE')}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: 'var(--space-3)',
          }}
        >
          <Icons.Plus size={18} />
          New Prompt
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-2) var(--space-3)',
      }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-2)',
            padding: '0 var(--space-3)',
          }}>
            Library
          </p>

          <NavItem
            icon="Inbox"
            label="All Prompts"
            count={totalPrompts}
            isActive={activeView === 'LIST' && !selectedFolderId}
            onClick={() => { onSelectFolder(null); onChangeView('LIST'); }}
          />
          <NavItem
            icon="Pin"
            label="Pinned"
            count={pinnedCount}
            isActive={false}
            onClick={() => onChangeView('LIST')}
          />
          <NavItem
            icon="Star"
            label="Favorites"
            count={favoritesCount}
            isActive={false}
            onClick={() => onChangeView('LIST')}
            color="#f59e0b"
          />
        </div>

        {/* Folders */}
        <div>
          <button
            onClick={() => setFoldersExpanded(!foldersExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)',
              padding: '0 var(--space-3)',
            }}
          >
            {foldersExpanded ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
            Folders
            <button
              onClick={(e) => { e.stopPropagation(); onCreateFolder(); }}
              className="btn btn-ghost btn-icon"
              style={{ marginLeft: 'auto', padding: 4 }}
            >
              <Icons.Plus size={14} />
            </button>
          </button>

          {foldersExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {folders.length === 0 ? (
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  padding: 'var(--space-3)',
                  textAlign: 'center',
                }}>
                  No folders yet
                </p>
              ) : (
                folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => { onSelectFolder(folder.id); onChangeView('LIST'); }}
                    onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                    className="btn"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 'var(--space-2) var(--space-3)',
                      background: selectedFolderId === folder.id ? 'var(--color-accent-bg)' : 'transparent',
                      color: selectedFolderId === folder.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontWeight: selectedFolderId === folder.id ? 500 : 400,
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span style={{ marginRight: 'var(--space-2)' }}>{folder.icon}</span>
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div style={{
        padding: 'var(--space-3)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <ThemeToggle />
        <button
          onClick={() => onChangeView('SETTINGS')}
          className="btn btn-ghost btn-icon"
        >
          <Icons.Settings size={18} />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--space-1)',
            zIndex: 100,
            minWidth: 160,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { onEditFolder(contextMenu.folder); closeContextMenu(); }}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: 'var(--space-2) var(--space-3)',
            }}
          >
            <Icons.Edit2 size={14} />
            Rename
          </button>
          <button
            onClick={() => { onDeleteFolder(contextMenu.folder.id); closeContextMenu(); }}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: 'var(--space-2) var(--space-3)',
              color: 'var(--color-error)',
            }}
          >
            <Icons.Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </aside>
  );
};
