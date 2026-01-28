import React, { useState, useEffect } from 'react';
import { DashboardItem, GroupModel, StreamModel } from '../types';
import StreamCard from './StreamCard';
import GroupCard from './GroupCard';
import { IconSettings, IconPlus, IconLogout, IconGrid, IconRefresh, IconFolder } from './Icons';

interface DashboardProps {
  models: DashboardItem[];
  onRemove: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onAdd: (username: string) => void;
  onReset: () => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onToggleClock: (id: string) => void;
  onResetClock: (id: string) => void;
  onUpdateTime: (id: string, newTimes: { clockIn: number | null; clockOut: number | null }) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  // Group props
  onCreateGroup: () => void;
  onUpdateGroup: (id: string, updates: Partial<GroupModel>) => void;
  onUngroup: (id: string) => void;
  onAddToGroup: (streamId: string, groupId: string) => void;
  onOpenGroup: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  models, 
  onRemove, 
  onUpdateName, 
  onAdd, 
  onReset, 
  onReorder, 
  onToggleClock, 
  onResetClock, 
  onUpdateTime, 
  onUpdateNotes,
  onCreateGroup,
  onUpdateGroup,
  onUngroup,
  onAddToGroup,
  onOpenGroup
}) => {
  const [cols, setCols] = useState(3);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Auto-adjust columns based on window width initially
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setCols(1);
      else if (width < 1280) setCols(2);
      else if (width < 1600) setCols(3);
      else setCols(4);
    };
    
    if (window.innerWidth < 768) setCols(1);
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModelName.trim()) {
      onAdd(newModelName.trim());
      setNewModelName('');
      setShowAddModal(false);
    }
  };
  
  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItemId || draggedItemId === targetId) return;

    // Determine types
    const draggedItem = models.find(m => m.id === draggedItemId);
    const targetItem = models.find(m => m.id === targetId);

    if (draggedItem && targetItem) {
        // If dropping a stream onto a group
        if (draggedItem.type === 'stream' && targetItem.type === 'group') {
            onAddToGroup(draggedItem.id, targetItem.id);
        } else {
            // Standard reorder
            onReorder(draggedItemId, targetId);
        }
    }
    
    setDraggedItemId(null);
  };
  
  const handleDragEnd = () => {
    setDraggedItemId(null);
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
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 p-1.5 rounded-lg">
             <IconGrid className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-100 hidden sm:block">StreamBitch</h1>
          <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-xs font-mono border border-gray-700">
            {models.length} Items
          </span>
        </div>

        <div className="flex items-center gap-4">
            {/* Grid Size Control */}
            <div className="hidden md:flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                <span className="text-xs text-gray-500 px-2 uppercase font-bold tracking-wider">Columns</span>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                    key={num}
                    onClick={() => setCols(num)}
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

            <div className="h-6 w-px bg-gray-800 mx-2 hidden md:block"></div>
            
             <button
                onClick={onCreateGroup}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700 shadow-sm"
                title="Create New Group"
            >
                <IconFolder className="w-4 h-4" />
                <span className="hidden sm:inline">New Group</span>
            </button>

            <button
                onClick={handleRefreshAll}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700 shadow-sm"
                title="Refresh All Streams"
            >
                <IconRefresh className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-600/10"
            >
                <IconPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Model</span>
            </button>

            <button
                onClick={onReset}
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10"
                title="End Session"
            >
                <IconLogout className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className={`grid ${gridClass} gap-4 pb-20`}>
          {models.map((item) => (
            <div 
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`transition-opacity ${draggedItemId === item.id ? 'opacity-30' : 'opacity-100'} ${item.type === 'group' && draggedItemId && draggedItemId !== item.id ? 'ring-2 ring-brand-500 rounded-lg' : ''}`}
            >
              {item.type === 'group' ? (
                <GroupCard 
                    group={item as GroupModel}
                    onUpdateGroup={onUpdateGroup}
                    onUngroup={onUngroup}
                    onOpen={onOpenGroup}
                />
              ) : (
                <StreamCard 
                    model={item as StreamModel} 
                    refreshKey={refreshKey}
                    onRemove={onRemove} 
                    onUpdateName={onUpdateName}
                    onToggleClock={onToggleClock}
                    onResetClock={onResetClock}
                    onUpdateTime={onUpdateTime}
                    onUpdateNotes={onUpdateNotes}
                />
              )}
            </div>
          ))}
          
          {/* Empty State Helper */}
          {models.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                <IconPlus className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">No streams active</p>
                <button onClick={() => setShowAddModal(true)} className="text-brand-500 hover:underline mt-2">Add a model</button>
             </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-850 rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Add New Model</h3>
            <form onSubmit={handleAddSubmit}>
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Username"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newModelName.trim()}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;