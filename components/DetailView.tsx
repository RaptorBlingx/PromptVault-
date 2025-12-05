import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';
import { Icons } from './Icon';
import { optimizePromptContent } from '../services/geminiService';

interface DetailViewProps {
  prompt: Prompt | null;
  onEdit: (updatedPrompt: Prompt) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onNotify: (msg: string, type: 'success'|'error'|'info') => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ 
  prompt, 
  onEdit, 
  onDelete, 
  onCopy, 
  isEditing,
  setIsEditing,
  onNotify
}) => {
  const [formData, setFormData] = useState<Partial<Prompt>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (prompt) {
      setFormData({ ...prompt });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: [],
        isFavorite: false,
      });
    }
    setTagInput('');
  }, [prompt]);

  if (!prompt && !isEditing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 h-full bg-white select-none">
        <Icons.Layout size={64} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a prompt to view details</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      onNotify('Title and Content are required', 'error');
      return;
    }
    
    const updatedPrompt: Prompt = {
      ...prompt!, 
      ...formData as Prompt,
      updatedAt: Date.now(),
      id: prompt?.id || Date.now().toString() // Fallback if creating new here
    };
    
    onEdit(updatedPrompt);
    setIsEditing(false);
    onNotify('Prompt saved successfully', 'success');
  };

  const handleOptimize = async () => {
    if (!formData.content) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizePromptContent(formData.content);
      setFormData(prev => ({ ...prev, content: optimized }));
      onNotify('Prompt optimized by Gemini!', 'success');
    } catch (e) {
      onNotify('Failed to optimize prompt. Check API key.', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  if (isEditing) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Prompt Title"
            className="text-2xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 w-full bg-transparent"
          />
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Icons.Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Tags Input */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
               <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  {formData.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500"><Icons.X size={12}/></button>
                    </span>
                  ))}
                  <input 
                    className="flex-1 outline-none min-w-[120px] text-sm bg-transparent"
                    placeholder="Type tag & hit Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
               </div>
            </div>

            {/* Main Content Area */}
            <div className="relative">
              <label className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prompt Content</span>
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  <Icons.Wand2 size={12} />
                  {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
                </button>
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your prompt here..."
                className="w-full h-[50vh] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none font-mono text-sm leading-relaxed text-gray-900 bg-white"
              />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // READ ONLY VIEW
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
       {/* Toolbar */}
       <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
         <h2 className="text-2xl font-bold text-gray-900 truncate max-w-2xl">{prompt?.title}</h2>
         <div className="flex items-center gap-2">
           <button
             onClick={() => {
                if(prompt?.content) onCopy(prompt.content);
             }}
             className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
             title="Copy to Clipboard"
           >
             <Icons.Copy size={20} />
           </button>
           <button
             onClick={() => setIsEditing(true)}
             className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
             title="Edit"
           >
             <Icons.Edit2 size={20} />
           </button>
           <button
             onClick={() => prompt && onDelete(prompt.id)}
             className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
             title="Delete"
           >
             <Icons.Trash2 size={20} />
           </button>
         </div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto p-8">
         <div className="max-w-4xl mx-auto">
            {prompt?.tags && prompt.tags.length > 0 && (
              <div className="flex gap-2 mb-6">
                {prompt.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm relative group">
              <button 
                onClick={() => prompt?.content && onCopy(prompt.content)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-50 border border-gray-200 shadow-sm rounded-md hover:text-blue-600"
              >
                <Icons.Copy size={16}/>
              </button>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed font-normal">
                {prompt?.content}
              </pre>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
              <span>Created: {new Date(prompt!.createdAt).toLocaleString()}</span>
              <span>Last Edited: {new Date(prompt!.updatedAt).toLocaleString()}</span>
            </div>
         </div>
       </div>
    </div>
  );
};