import React from 'react';
import { Prompt } from '../types';
import { Icons } from './Icon';

interface PromptCardProps {
  prompt: Prompt;
  isSelected: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  searchQuery?: string;
}

const Highlight: React.FC<{ text: string; query?: string }> = ({ text, query }) => {
  if (!query || !query.trim()) return <>{text}</>;
  
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-amber-200 text-gray-900 rounded-[1px] shadow-sm">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, isSelected, onClick, onToggleFavorite, searchQuery }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        group relative p-4 border-b border-gray-100 cursor-pointer transition-all duration-200
        hover:bg-gray-50
        ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={`font-semibold text-sm truncate pr-6 ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
          <Highlight text={prompt.title || 'Untitled Prompt'} query={searchQuery} />
        </h3>
        <button 
          onClick={onToggleFavorite}
          className={`
            absolute top-4 right-4 p-1 rounded-full transition-colors
            ${prompt.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100'}
          `}
        >
          <Icons.Star size={16} fill={prompt.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      
      <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8 leading-4 break-words">
        <Highlight text={prompt.content || 'No content...'} query={searchQuery} />
      </p>

      <div className="flex items-center gap-2 overflow-hidden">
        {prompt.tags.slice(0, 3).map(tag => (
          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
            <Highlight text={tag} query={searchQuery} />
          </span>
        ))}
        {prompt.tags.length > 3 && (
          <span className="text-[10px] text-gray-400">+{prompt.tags.length - 3}</span>
        )}
      </div>
      
      <div className="text-[10px] text-gray-400 mt-2 text-right">
        {new Date(prompt.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};