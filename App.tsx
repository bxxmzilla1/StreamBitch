import React, { useState, useEffect } from 'react';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import GroupView from './components/GroupView';
import { StreamModel, GroupModel, DashboardItem } from './types';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [models, setModels] = useState<DashboardItem[]>([]);
  const [isSetup, setIsSetup] = useState(false);
  const [savedHistory, setSavedHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  // Load session or history on mount
  useEffect(() => {
    // Attempt to load full session first
    const savedModels = localStorage.getItem('streamwall_models');
    if (savedModels) {
      try {
        const parsed = JSON.parse(savedModels);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Backward compatibility: Add type='stream' if missing and ensure proper structure
          const migrated: DashboardItem[] = parsed.map((item: any) => {
             if (item.items) return { ...item, type: 'group' };
             return { ...item, type: 'stream' };
          });
          setModels(migrated);
          setIsSetup(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to load models", e);
      }
    }

    // Fallback to loading username history for the setup screen
    const savedUsernames = localStorage.getItem('streamwall_history');
    if (savedUsernames) {
      try {
        const parsed = JSON.parse(savedUsernames);
        if (Array.isArray(parsed)) {
          setSavedHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save session state whenever models change
  useEffect(() => {
    if (isSetup && models.length > 0) {
      localStorage.setItem('streamwall_models', JSON.stringify(models));
      
      // Also save username history for the setup screen
      // Extract usernames from both top-level streams and groups
      const usernames: string[] = [];
      models.forEach(item => {
        if (item.type === 'stream') {
            usernames.push((item as StreamModel).username);
        } else if (item.type === 'group') {
            (item as GroupModel).items.forEach(sub => usernames.push(sub.username));
        }
      });
      localStorage.setItem('streamwall_history', JSON.stringify(usernames));
    } else if (isSetup && models.length === 0) {
      // Clear storage if the last model is removed
      localStorage.removeItem('streamwall_models');
    }
  }, [models, isSetup]);

  const handleStart = (usernames: string[]) => {
    const newModels: StreamModel[] = usernames.map(username => ({
      id: generateId(),
      type: 'stream',
      username,
      displayName: username, 
      clockInTime: null,
      clockOutTime: null,
      notes: '',
    }));
    setModels(newModels);
    setIsSetup(true);
  };

  const handleAddOne = (username: string) => {
    const newModel: StreamModel = {
      id: generateId(),
      type: 'stream',
      username,
      displayName: username,
      clockInTime: null,
      clockOutTime: null,
      notes: '',
    };
    setModels(prev => [...prev, newModel]);
  };

  // Helper to map recursively (or just two levels for now) to update items
  const updateStreamInList = (items: DashboardItem[], id: string, updater: (s: StreamModel) => StreamModel): DashboardItem[] => {
    return items.map(item => {
        if (item.type === 'stream' && item.id === id) {
            return updater(item as StreamModel);
        } else if (item.type === 'group') {
            const group = item as GroupModel;
            const updatedItems = group.items.map(sub => {
                if (sub.id === id) return updater(sub);
                return sub;
            });
            return { ...group, items: updatedItems };
        }
        return item;
    });
  };

  const handleRemove = (id: string) => {
    setModels(prev => {
        // 1. Check if it is a top-level item (stream or group)
        const isTopLevel = prev.some(m => m.id === id);
        if (isTopLevel) {
            // Delete completely
            return prev.filter(m => m.id !== id);
        }
        
        // 2. Check if it is inside a group
        let extractedItem: StreamModel | undefined;
        
        const newModels = prev.map(item => {
            if (item.type === 'group') {
                const found = item.items.find(sub => sub.id === id);
                if (found) {
                    extractedItem = found;
                    // Remove from group
                    return { ...item, items: item.items.filter(sub => sub.id !== id) };
                }
            }
            return item;
        });

        // If it was found in a group, add it back to the top level
        if (extractedItem) {
            return [...newModels, extractedItem];
        }

        return newModels;
    });
  };

  const handleUpdateName = (id: string, newName: string) => {
    setModels(prev => updateStreamInList(prev, id, (m) => ({ ...m, displayName: newName })));
  };
  
  const handleUpdateNotes = (id: string, notes: string) => {
    setModels(prev => updateStreamInList(prev, id, (m) => ({ ...m, notes })));
  };

  const handleToggleClock = (id: string) => {
    setModels(prev => updateStreamInList(prev, id, (m) => {
        const isClockedIn = m.clockInTime && !m.clockOutTime;
        if (isClockedIn) {
          return { ...m, clockOutTime: Date.now() };
        } else {
          return { ...m, clockInTime: Date.now(), clockOutTime: null };
        }
    }));
  };
  
  const handleResetClock = (id: string) => {
    setModels(prev => updateStreamInList(prev, id, (m) => ({ ...m, clockInTime: null, clockOutTime: null })));
  };
  
  const handleUpdateTime = (id: string, newTimes: { clockIn: number | null, clockOut: number | null }) => {
    setModels(prev => updateStreamInList(prev, id, (m) => ({ ...m, clockInTime: newTimes.clockIn, clockOutTime: newTimes.clockOut })));
  };

  const handleReorder = (draggedId: string, targetId: string) => {
    setModels(prevModels => {
      const draggedIndex = prevModels.findIndex(m => m.id === draggedId);
      const targetIndex = prevModels.findIndex(m => m.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return prevModels;
      }
      
      const newModels = [...prevModels];
      const [draggedItem] = newModels.splice(draggedIndex, 1);
      newModels.splice(targetIndex, 0, draggedItem);
      
      return newModels;
    });
  };

  // Group Handlers

  const handleCreateGroup = () => {
    const newGroup: GroupModel = {
        id: generateId(),
        type: 'group',
        name: 'New Group',
        color: '#f47425',
        items: [],
        previewCols: 2,
        expandedCols: 3
    };
    setModels(prev => [newGroup, ...prev]);
  };

  const handleUpdateGroup = (id: string, updates: Partial<GroupModel>) => {
    setModels(prev => prev.map(item => {
        if (item.type === 'group' && item.id === id) {
            return { ...item, ...updates } as GroupModel;
        }
        return item;
    }));
  };

  const handleUngroup = (id: string) => {
    setModels(prev => {
        const groupIndex = prev.findIndex(item => item.id === id);
        if (groupIndex === -1) return prev;
        
        const group = prev[groupIndex] as GroupModel;
        const newModels = [...prev];
        // Remove group
        newModels.splice(groupIndex, 1);
        // Add items to end
        return [...newModels, ...group.items];
    });
  };

  const handleAddToGroup = (streamId: string, groupId: string) => {
    setModels(prev => {
        // Find stream at top level
        const stream = prev.find(item => item.id === streamId && item.type === 'stream') as StreamModel | undefined;
        if (!stream) return prev; // Stream not found at top level (maybe already nested?)
        
        // Remove stream from top level and add to group
        return prev.map(item => {
            if (item.id === groupId && item.type === 'group') {
                return { ...item, items: [...item.items, stream] };
            }
            return item;
        }).filter(item => item.id !== streamId);
    });
  };

  const handleReset = () => {
    setIsSetup(false);
    setModels([]);
    localStorage.removeItem('streamwall_models');
  };

  const openGroup = models.find(m => m.id === openGroupId && m.type === 'group') as GroupModel | undefined;

  // Render a loading state to prevent flash of setup screen
  if (isLoading) {
    return <div className="bg-gray-950 h-screen w-screen"></div>;
  }

  return (
    <>
      {!isSetup ? (
        <Setup onStart={handleStart} savedModels={savedHistory} />
      ) : (
        <>
            <Dashboard 
                models={models}
                onRemove={handleRemove}
                onUpdateName={handleUpdateName}
                onAdd={handleAddOne}
                onReset={handleReset}
                onReorder={handleReorder}
                onToggleClock={handleToggleClock}
                onResetClock={handleResetClock}
                onUpdateTime={handleUpdateTime}
                onUpdateNotes={handleUpdateNotes}
                onCreateGroup={handleCreateGroup}
                onUpdateGroup={handleUpdateGroup}
                onUngroup={handleUngroup}
                onAddToGroup={handleAddToGroup}
                onOpenGroup={setOpenGroupId}
            />
            {openGroup && (
                <GroupView 
                    group={openGroup} 
                    onClose={() => setOpenGroupId(null)}
                    onRemove={handleRemove}
                    onUpdateName={handleUpdateName}
                    onToggleClock={handleToggleClock}
                    onResetClock={handleResetClock}
                    onUpdateTime={handleUpdateTime}
                    onUpdateNotes={handleUpdateNotes}
                    onUpdateGroup={handleUpdateGroup}
                />
            )}
        </>
      )}
    </>
  );
};

export default App;