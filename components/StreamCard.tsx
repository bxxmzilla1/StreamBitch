import React, { useState, useRef, useEffect } from 'react';
import { StreamModel } from '../types';
import { IconTrash, IconEdit, IconCheck, IconGripVertical, IconClock, IconX, IconNote, IconRefresh } from './Icons';

interface StreamCardProps {
  model: StreamModel;
  refreshKey?: number;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onToggleClock: (id: string) => void;
  onResetClock: (id: string) => void;
  onUpdateTime: (id: string, newTimes: { clockIn: number | null; clockOut: number | null }) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

const formatDuration = (ms: number) => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const formatTimestampForInput = (timestamp: number | null): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Adjust for local timezone offset to display correct local time in input
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
};


const StreamCard: React.FC<StreamCardProps> = ({ model, refreshKey, onRemove, onUpdateName, onToggleClock, onResetClock, onUpdateTime, onUpdateNotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(model.displayName || model.username);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTimes, setEditedTimes] = useState({ clockIn: '', clockOut: '' });
  
  // Notes state
  const [showNotes, setShowNotes] = useState(false);
  const [noteValue, setNoteValue] = useState(model.notes || '');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale: 1, height: 0 });

  const isClockedIn = model.clockInTime && !model.clockOutTime;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Sync internal note state if model updates externally
  useEffect(() => {
    setNoteValue(model.notes || '');
  }, [model.notes]);

  useEffect(() => {
    let timerInterval: number | undefined;

    if (isClockedIn) {
      const initialDuration = Date.now() - (model.clockInTime || 0);
      setElapsedTime(formatDuration(initialDuration));
      timerInterval = window.setInterval(() => {
        const duration = Date.now() - (model.clockInTime || 0);
        setElapsedTime(formatDuration(duration));
      }, 1000);
    } else if (model.clockInTime && model.clockOutTime) {
      const duration = model.clockOutTime - model.clockInTime;
      setElapsedTime(formatDuration(duration));
    } else {
      setElapsedTime('00:00:00');
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [model.clockInTime, model.clockOutTime, isClockedIn]);

  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const currentWidth = containerRef.current.offsetWidth;
        const scale = currentWidth / 850;
        const height = scale * 528;
        setLayout({ scale, height });
      }
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSaveName = () => {
    if (editValue.trim()) {
      onUpdateName(model.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setEditValue(model.displayName || model.username);
      setIsEditing(false);
    }
  };
  
  const handleEditTimeClick = () => {
    setEditedTimes({
        clockIn: formatTimestampForInput(model.clockInTime),
        clockOut: formatTimestampForInput(model.clockOutTime),
    });
    setIsEditingTime(true);
  };

  const handleSaveTime = (e: React.FormEvent) => {
    e.preventDefault();
    const newClockIn = editedTimes.clockIn ? new Date(editedTimes.clockIn).getTime() : null;
    let newClockOut = editedTimes.clockOut ? new Date(editedTimes.clockOut).getTime() : null;

    if (newClockIn && newClockOut && newClockOut < newClockIn) {
      alert("Clock out time cannot be before clock in time.");
      return;
    }
    
    // If clock out is cleared, it means we are clocking back in
    if(newClockIn && !newClockOut){
        // Ensure that a running timer doesn't have a future clock out time.
    }

    onUpdateTime(model.id, { clockIn: newClockIn, clockOut: newClockOut });
    setIsEditingTime(false);
  };
  
  const handleNotesBlur = () => {
      onUpdateNotes(model.id, noteValue);
  };

  const iframeSrc = `https://cbxyz.com/in/?tour=SHBY&campaign=HeIZW&track=embed&room=${model.username}`;

  return (
    <div className="bg-gray-850 rounded-lg overflow-hidden border border-gray-700 shadow-xl flex flex-col w-full hover:border-brand-500/50 transition-colors duration-300">
      {/* Header Bar */}
      <div className="bg-gray-900/50 px-3 py-2 flex items-center justify-between border-b border-gray-700/50 h-10 shrink-0">
        <div className="flex-1 flex items-center mr-2 overflow-hidden">
            <div className="cursor-grab text-gray-600 hover:text-gray-400 mr-2">
                <IconGripVertical className="w-5 h-5" />
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shrink-0 animate-pulse"></div>
            
            {isEditing ? (
            <div className="flex items-center flex-1">
                <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 text-white text-sm px-2 py-0.5 rounded w-full border border-brand-500 outline-none"
                />
                <button 
                  onClick={handleSaveName}
                  className="ml-1 text-green-400 hover:text-green-300 p-1"
                >
                  <IconCheck className="w-4 h-4" />
                </button>
            </div>
            ) : (
            <div 
                className="text-sm font-semibold text-gray-200 truncate cursor-pointer hover:text-brand-500 transition-colors flex items-center gap-2 group"
                onClick={() => setIsEditing(true)}
                title="Click to rename"
            >
                {model.displayName || model.username}
                <IconEdit className="w-3 h-3 opacity-0 group-hover:opacity-50" />
            </div>
            )}
        </div>

        <div className="flex items-center gap-1">
            <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center gap-1 transition-colors p-1 rounded hover:bg-gray-700 ${showNotes ? 'text-brand-500 bg-gray-800' : 'text-gray-400 hover:text-brand-500'}`}
                title="Toggle Notes"
            >
                <IconNote className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-gray-700 mx-1"></div>

            {model.clockInTime && (
                <button
                    onClick={() => onResetClock(model.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                    title="Reset Timer"
                >
                    <IconRefresh className="w-4 h-4" />
                </button>
            )}

            <button
                onClick={() => onToggleClock(model.id)}
                className={`flex items-center gap-1 text-gray-400 hover:text-brand-500 transition-colors p-1 rounded hover:bg-brand-500/10 ${isClockedIn ? 'text-green-400' : ''}`}
                title={isClockedIn ? "Clock Out" : "Clock In"}
            >
                <IconClock className="w-4 h-4" />
            </button>
            <button
            onClick={() => onRemove(model.id)}
            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
            title="Remove Container"
            >
            <IconTrash className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Responsive Iframe Container */}
      <div 
        ref={containerRef}
        className="relative w-full bg-black overflow-hidden"
        style={{ height: layout.height ? `${layout.height}px` : 'auto' }}
      >
        {layout.height === 0 && (
          <div style={{ paddingBottom: '62.1176%' }} />
        )}
        <iframe
          key={refreshKey}
          src={iframeSrc}
          className="absolute top-0 left-0 border-none origin-top-left"
          style={{
            width: '850px',
            height: '528px',
            transform: `scale(${layout.scale})`,
          }}
          scrolling="no"
          title={`Stream of ${model.username}`}
        ></iframe>
      </div>
      
      {/* Footer / Timer Bar */}
      {model.clockInTime && (
        <div className={`border-t border-gray-700/50 ${isClockedIn ? 'bg-green-500/10' : 'bg-gray-900/50'}`}>
            {!isEditingTime ? (
                <div 
                  onClick={handleEditTimeClick}
                  className={`px-3 py-1 text-center text-sm font-mono cursor-pointer ${isClockedIn ? 'text-green-300' : 'text-gray-400'}`}
                  title="Click to edit time"
                >
                    Session Time: {elapsedTime}
                </div>
            ) : (
                <form onSubmit={handleSaveTime} className="p-2 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`clock-in-${model.id}`} className="font-bold text-gray-400 w-16 shrink-0">Clock In:</label>
                    <input
                      id={`clock-in-${model.id}`}
                      type="datetime-local"
                      style={{colorScheme: 'dark'}}
                      className="bg-gray-900 border border-gray-700 rounded p-1 text-white w-full text-xs"
                      value={editedTimes.clockIn}
                      onChange={e => setEditedTimes(prev => ({ ...prev, clockIn: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`clock-out-${model.id}`} className="font-bold text-gray-400 w-16 shrink-0">Clock Out:</label>
                    <input
                      id={`clock-out-${model.id}`}
                      type="datetime-local"
                      style={{colorScheme: 'dark'}}
                      className="bg-gray-900 border border-gray-700 rounded p-1 text-white w-full text-xs"
                      value={editedTimes.clockOut}
                      onChange={e => setEditedTimes(prev => ({ ...prev, clockOut: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-1 pt-1">
                    <button type="button" onClick={() => setIsEditingTime(false)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700" title="Cancel">
                      <IconX className="w-4 h-4" />
                    </button>
                    <button type="submit" className="text-green-400 hover:text-white p-1 rounded hover:bg-green-500/50" title="Save">
                      <IconCheck className="w-4 h-4" />
                    </button>
                  </div>
                </form>
            )}
        </div>
      )}
      
      {/* Notes Section */}
      {showNotes && (
        <div className="border-t border-gray-700/50 bg-gray-900 p-2">
            <textarea
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes here..."
                className="w-full bg-gray-800 text-gray-300 text-sm p-2 rounded border border-gray-700 outline-none focus:border-brand-500 resize-y min-h-[80px]"
            />
        </div>
      )}
    </div>
  );
};

export default StreamCard;