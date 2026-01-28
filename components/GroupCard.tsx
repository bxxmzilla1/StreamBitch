import React, { useState, useRef, useEffect } from 'react';
import { GroupModel } from '../types';
import { IconFolder, IconGripVertical, IconTrash, IconEdit, IconCheck, IconPalette, IconGrid } from './Icons';

interface GroupCardProps {
  group: GroupModel;
  onUpdateGroup: (id: string, updates: Partial<GroupModel>) => void;
  onUngroup: (id: string) => void;
  onOpen: (id: string) => void;
}

const COLORS = [
  '#f47425', // Brand Orange
  '#ef4444', // Red
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
];

const PREVIEW_COLS_OPTIONS = [1, 2, 3];

const MiniStream: React.FC<{ username: string, width: number }> = ({ username, width }) => {
  const BASE_W = 850;
  const BASE_H = 528;
  // Calculate scale to fit the target width
  const scale = width / BASE_W;
  const height = BASE_H * scale;

  return (
    <div 
      className="relative bg-black rounded overflow-hidden border border-gray-800 shadow-sm"
      style={{ width, height }}
    >
      <iframe 
        src={`https://cbxyz.com/in/?tour=SHBY&campaign=HeIZW&track=embed&room=${username}`}
        className="absolute top-0 left-0 origin-top-left"
        style={{
           width: BASE_W,
           height: BASE_H,
           transform: `scale(${scale})`
        }}
        tabIndex={-1}
        title={`Preview of ${username}`}
      />
      {/* Gradient Overlay for Text Visibility */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1 pt-4 pointer-events-none">
        <p className="text-[10px] text-gray-100 text-center font-semibold truncate drop-shadow-md tracking-wide">
            {username}
        </p>
      </div>
    </div>
  );
};

const GroupCard: React.FC<GroupCardProps> = ({ group, onUpdateGroup, onUngroup, onOpen }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGridPicker, setShowGridPicker] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Maintain aspect ratio consistent with StreamCard (850/528)
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const scale = width / 850;
        const height = scale * 528;
        setContainerWidth(width);
        setContainerHeight(height);
      }
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateGroup(group.id, { name: editName.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setEditName(group.name);
      setIsEditing(false);
    }
  };
  
  // Calculate item width for the grid
  // Width - Padding(0.75rem*2 = 24px) - Gap(0.5rem = 8px) / 2
  const padding = 16; // p-2 * 2 sides
  const gap = 8; // gap-2
  const cols = group.previewCols || 2;
  const itemWidth = containerWidth > 0 ? (containerWidth - padding - (gap * (cols - 1))) / cols : 0;

  const gridClass = `grid gap-2 grid-cols-${cols}`;
  // Tailwind doesn't strictly support dynamic classes like that without safelisting, 
  // so we use inline styles for the grid or explicit class maps if needed, 
  // but let's stick to standard classes if possible.
  // Actually, for dynamic cols in React with Tailwind, it's safer to map:
  const gridColsClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
  }[cols] || 'grid-cols-2';

  return (
    <div 
      className="bg-gray-850 rounded-lg overflow-hidden border shadow-xl flex flex-col w-full hover:border-gray-600 transition-colors duration-300 relative group-card"
      style={{ borderColor: group.color, borderTopWidth: '4px' }}
    >
      {/* Header */}
      <div className="bg-gray-900/50 px-3 py-2 flex items-center justify-between border-b border-gray-700/50 h-10 shrink-0">
        <div className="flex-1 flex items-center mr-2 overflow-hidden">
          <div className="cursor-grab text-gray-600 hover:text-gray-400 mr-2">
            <IconGripVertical className="w-5 h-5" />
          </div>
          <IconFolder className="w-4 h-4 mr-2" style={{ color: group.color }} />
          
          {isEditing ? (
            <div className="flex items-center flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-gray-800 text-white text-sm px-2 py-0.5 rounded w-full border border-brand-500 outline-none"
              />
              <button onClick={handleSaveName} className="ml-1 text-green-400 hover:text-green-300">
                <IconCheck className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              className="text-sm font-bold text-gray-100 truncate cursor-pointer hover:text-white transition-colors flex items-center gap-2 group"
              onClick={() => setIsEditing(true)}
              title="Click to rename group"
            >
              {group.name}
              <IconEdit className="w-3 h-3 opacity-0 group-hover:opacity-50 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 relative">
          {/* Grid Layout Picker */}
          <div className="relative">
             <button
                onClick={() => {
                    setShowGridPicker(!showGridPicker);
                    setShowColorPicker(false);
                }}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Change Preview Layout"
             >
                <IconGrid className="w-4 h-4" />
             </button>
             {showGridPicker && (
                <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-20 flex flex-col gap-1 animate-fade-in min-w-[100px]">
                    <span className="text-[10px] text-gray-500 font-bold uppercase px-1">Columns</span>
                    <div className="flex gap-1">
                        {PREVIEW_COLS_OPTIONS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    onUpdateGroup(group.id, { previewCols: c });
                                    setShowGridPicker(false);
                                }}
                                className={`flex-1 py-1 rounded text-xs font-bold border ${group.previewCols === c || (!group.previewCols && c === 2) ? 'bg-brand-600 text-white border-brand-500' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
             )}
          </div>

          {/* Color Picker */}
          <div className="relative">
            <button
                onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowGridPicker(false);
                }}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Change Color"
            >
                <IconPalette className="w-4 h-4" />
            </button>
            
            {showColorPicker && (
                <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-20 flex gap-1 animate-fade-in w-max">
                {COLORS.map((c) => (
                    <button
                    key={c}
                    onClick={() => {
                        onUpdateGroup(group.id, { color: c });
                        setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${group.color === c ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                    />
                ))}
                </div>
            )}
          </div>

          <button
            onClick={() => onUngroup(group.id)}
            className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
            title="Ungroup (Keep items)"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: Preview Grid */}
      <div 
        ref={containerRef}
        className="relative w-full bg-gray-900"
        style={{ height: containerHeight ? `${containerHeight}px` : 'auto' }}
      >
         {containerHeight === 0 && <div style={{ paddingBottom: '62.1176%' }} />}
         
         <div className="absolute inset-0 overflow-y-auto p-2 custom-scrollbar">
            {group.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                    <IconFolder className="w-8 h-8 opacity-20" />
                    <span className="text-xs italic">Empty Group</span>
                </div>
            ) : (
                <div className={`grid gap-2 ${gridColsClass}`}>
                    {group.items.map(item => (
                        <MiniStream 
                            key={item.id} 
                            username={item.username} 
                            width={itemWidth} 
                        />
                    ))}
                </div>
            )}
         </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-gray-900 border-t border-gray-800">
        <button
          onClick={() => onOpen(group.id)}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-1.5 rounded text-xs font-semibold transition-colors border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2 group-hover:border-brand-500/30"
        >
          <IconFolder className="w-3 h-3" />
          Open Full View ({group.items.length})
        </button>
      </div>
    </div>
  );
};

export default GroupCard;