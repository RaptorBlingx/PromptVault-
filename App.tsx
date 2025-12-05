import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { DetailView } from './components/DetailView';
import { PromptCard } from './components/PromptCard';
import { ToastContainer } from './components/Toast';
import { Icons } from './components/Icon';
import { Prompt, ViewState, ToastNotification, SortOption } from './types';
import { loadPrompts, savePrompts } from './services/storageService';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activeView, setActiveView] = useState<ViewState>('LIST');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NEWEST);

  // Load initial data
  useEffect(() => {
    const loaded = loadPrompts();
    setPrompts(loaded);
  }, []);

  // Persist on change
  useEffect(() => {
    savePrompts(prompts);
  }, [prompts]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleCreatePrompt = () => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: 'New Prompt',
      content: '',
      tags: [],
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPrompts([newPrompt, ...prompts]);
    setSelectedPromptId(newPrompt.id);
    setIsEditing(true);
    setActiveView('LIST'); // Switch back to list view with the new item selected
  };

  const handleUpdatePrompt = (updated: Prompt) => {
    setPrompts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePrompt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
      if (selectedPromptId === id) setSelectedPromptId(null);
      addToast('Prompt deleted', 'info');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    addToast('Copied to clipboard!', 'success');
  };

  // Filter & Sort Logic
  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortOption === SortOption.NEWEST) return b.updatedAt - a.updatedAt;
      if (sortOption === SortOption.OLDEST) return a.updatedAt - b.updatedAt;
      if (sortOption === SortOption.AZ) return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [prompts, searchQuery, sortOption]);

  const displayedPrompts = useMemo(() => {
     // If user clicked "Favorites" in sidebar, we might filter here
     // But for simplicity, let's just use the search/sort filtered list
     // In a real app, Sidebar would pass a filter type, not just ViewState
     // Let's assume ViewState 'LIST' shows all, but we can add a filter prop later.
     // For now, if we want to support 'Favorites' view:
     return filteredPrompts; 
  }, [filteredPrompts]);
  
  const selectedPrompt = useMemo(() => 
    prompts.find(p => p.id === selectedPromptId) || null
  , [prompts, selectedPromptId]);

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onChangeView={(view) => {
          if (view === 'CREATE') {
            handleCreatePrompt();
          } else {
            setActiveView(view);
          }
        }} 
        totalPrompts={prompts.length}
        favoritesCount={prompts.filter(p => p.isFavorite).length}
      />

      {/* Main List Column */}
      <div className={`w-80 border-r border-gray-200 bg-white flex flex-col ${activeView === 'SETTINGS' ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Icons.Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
          </div>
          <div className="flex justify-between items-center mt-3 px-1">
             <span className="text-xs font-semibold text-gray-400 uppercase">{displayedPrompts.length} Prompts</span>
             <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-xs border-none bg-transparent text-gray-500 font-medium focus:ring-0 cursor-pointer hover:text-gray-800"
             >
               <option value={SortOption.NEWEST}>Newest</option>
               <option value={SortOption.OLDEST}>Oldest</option>
               <option value={SortOption.AZ}>A-Z</option>
             </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          {displayedPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm p-6 text-center">
              <p>No prompts found.</p>
              <button onClick={handleCreatePrompt} className="text-blue-500 hover:underline mt-2">Create one?</button>
            </div>
          ) : (
            displayedPrompts.map(prompt => (
              <PromptCard 
                key={prompt.id}
                prompt={prompt}
                isSelected={selectedPromptId === prompt.id}
                onClick={() => {
                  setSelectedPromptId(prompt.id);
                  setIsEditing(false);
                }}
                onToggleFavorite={(e) => handleToggleFavorite(e, prompt.id)}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail / Edit View */}
      {activeView === 'SETTINGS' ? (
        <div className="flex-1 p-10 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
             <div className="mb-4">
                <h3 className="font-semibold mb-2">Data Management</h3>
                <p className="text-sm text-gray-500 mb-4">Export your prompts to JSON or clear local storage.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href",     dataStr);
                      downloadAnchorNode.setAttribute("download", "prompt_vault_backup.json");
                      document.body.appendChild(downloadAnchorNode); // required for firefox
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Export JSON
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Clear all data? This cannot be undone.')) {
                        setPrompts([]);
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm hover:bg-red-100"
                  >
                    Clear All Data
                  </button>
                </div>
             </div>
             <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-gray-500">PromptVault v1.0.0 (Web Edition)</p>
                <p className="text-xs text-gray-400 mt-1">Built with React, Tailwind, and Gemini API.</p>
             </div>
          </div>
        </div>
      ) : (
        <DetailView 
          prompt={selectedPrompt}
          onEdit={handleUpdatePrompt}
          onDelete={handleDeletePrompt}
          onCopy={handleCopy}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onNotify={addToast}
        />
      )}

      <ToastContainer notifications={toasts} removeNotification={removeToast} />
    </div>
  );
};

export default App;