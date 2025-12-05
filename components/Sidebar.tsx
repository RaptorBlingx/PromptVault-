import React from 'react';
import { Icons } from './Icon';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
  totalPrompts: number;
  favoritesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, totalPrompts, favoritesCount }) => {
  const NavItem = ({ view, icon: Icon, label, count }: { view: ViewState; icon: any; label: string; count?: number }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`
        w-full flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 group
        ${activeView === view ? 'bg-gray-200 text-gray-900 font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={activeView === view ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'} />
        <span className="text-sm">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${activeView === view ? 'bg-white' : 'bg-gray-100'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2 text-gray-800">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-1.5 rounded-lg shadow-lg">
          <Icons.Layout size={20} />
        </div>
        <h1 className="font-bold text-lg tracking-tight">PromptVault</h1>
      </div>

      <button
        onClick={() => onChangeView('CREATE')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm mb-6 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <Icons.Plus size={18} />
        <span>New Prompt</span>
      </button>

      <div className="space-y-1 flex-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Library</div>
        <NavItem view="LIST" icon={Icons.Layout} label="All Prompts" count={totalPrompts} />
        <NavItem view="LIST" icon={Icons.Star} label="Favorites" count={favoritesCount} /> {/* Logic for filter handled in parent */}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <NavItem view="SETTINGS" icon={Icons.Settings} label="Settings" />
      </div>
    </div>
  );
};
