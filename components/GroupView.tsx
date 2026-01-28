import React, { useState, useEffect } from 'react';
import { GroupModel, StreamModel } from '../types';
import StreamCard from './StreamCard';
import { IconFolder, IconX } from './Icons';

interface GroupViewProps {
  group: GroupModel;
  onClose: () => void;
  // Stream handlers within group
  onRemove: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onToggleClock: (id: string) => void;
  onResetClock: (id: string) => void;
  onUpdateTime: (id: string, newTimes: { clockIn: number | null; clockOut: number | null }) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateGroup: (id: string, updates: Partial<GroupModel>) => void;
}

const GroupView: React.FC<GroupViewProps> = ({ 
  group, 
  onClose,
  onRemove,
  onUpdateName,
  onToggleClock,
  onResetClock,
  onUpdateTime,
  onUpdateNotes,
  onUpdateGroup
}) => {
  const [cols, setCols] = useState(group.expandedCols || 3);

  // Auto-adjust columns if not set, similar to Dashboard
  useEffect(() => {
    if (!group.expandedCols) {
        const width = window.innerWidth;
        if (width < 768) setCols(1);
        else if (width < 1280) setCols(2);
        else if (width < 1600) setCols(3);
        else setCols(4);
    }
  }, []);

  const handleSetCols = (num: number) => {
    setCols(num);
    onUpdateGroup(group.id, { expandedCols: num });
  };

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6',
  }[cols] || 'grid-cols-3';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950/95 backdrop-blur-sm animate-fade-in">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <img src="/icon48.png" alt="StreamBitch Logo" className="w-8 h-8 rounded-lg" />
                <div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
                    <IconFolder className="w-6 h-6" style={{ color: group.color }} />
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {group.name}
                </h2>
                <span className="text-sm text-gray-400">{group.items.length} streams</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
             {/* Grid Size Control */}
             <div className="hidden md:flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                <span className="text-xs text-gray-500 px-2 uppercase font-bold tracking-wider">View</span>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                    key={num}
                    onClick={() => handleSetCols(num)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    cols === num 
                        ? 'bg-brand-600 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    {num}
                </button>
                ))}
            </div>

            <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                title="Close Group View"
            >
                <IconX className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {group.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <IconFolder className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">This group is empty.</p>
                <p className="text-sm">Drag streams into this group on the main dashboard.</p>
            </div>
        ) : (
            <div className={`grid ${gridClass} gap-4`}>
                {group.items.map((item) => (
                    <StreamCard
                        key={item.id}
                        model={item}
                        onRemove={onRemove}
                        onUpdateName={onUpdateName}
                        onToggleClock={onToggleClock}
                        onResetClock={onResetClock}
                        onUpdateTime={onUpdateTime}
                        onUpdateNotes={onUpdateNotes}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default GroupView;