import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduledTask } from '../types';
import { cn } from '../lib/utils';

interface TaskSchedulerProps {
  onClose: () => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({ onClose }) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newRecurring, setNewRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('hushh_kai_tasks') || '[]');
    setTasks(savedTasks);
  }, []);

  const saveTasks = (updatedTasks: ScheduledTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('hushh_kai_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTitle || !newDate || !newTime) return;

    const task: ScheduledTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      dateTime: `${newDate}T${newTime}`,
      recurring: newRecurring,
      status: 'pending',
      timestamp: new Date(`${newDate}T${newTime}`).getTime()
    };

    const updated = [...tasks, task];
    saveTasks(updated);
    setIsAdding(false);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewRecurring('none');
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const toggleStatus = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { ...t, status: newStatus as any };
      }
      return t;
    });
    saveTasks(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-x-6 top-20 bottom-24 z-[70] bg-surface-container-highest/95 backdrop-blur-xl p-6 rounded-3xl border border-primary/30 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">event_upcoming</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-background text-lg">Scheduled Tasks</h4>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Personal Agenda</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "p-2 rounded-full transition-all",
              isAdding ? "bg-red-400/20 text-red-400" : "bg-primary/20 text-primary"
            )}
          >
            <span className="material-symbols-outlined">{isAdding ? 'close' : 'add'}</span>
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div 
              key="add-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Task Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Sync with Luthier Team"
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-background focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-background focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Time</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-background focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recurrence</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['none', 'daily', 'weekly', 'monthly'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setNewRecurring(r as any)}
                      className={cn(
                        "py-2 rounded-lg text-[10px] font-bold uppercase transition-all border",
                        newRecurring === r 
                          ? "bg-primary/20 border-primary text-primary" 
                          : "bg-surface-container-highest border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/30"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={addTask}
                disabled={!newTitle || !newDate || !newTime}
                className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95"
              >
                Schedule Task
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="task-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-12">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-4">calendar_today</span>
                  <p className="text-sm text-on-surface-variant">No tasks scheduled yet.</p>
                  <p className="text-[10px] text-on-surface-variant/60 mt-2 uppercase tracking-tighter">Click the '+' button or ask Kai to schedule something</p>
                </div>
              ) : (
                tasks.sort((a, b) => a.timestamp - b.timestamp).map((task) => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all group",
                      task.status === 'completed' 
                        ? "bg-surface-container-low/40 border-outline-variant/10 opacity-60" 
                        : "bg-surface-container-low border-outline-variant/20 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button 
                          onClick={() => toggleStatus(task.id)}
                          className={cn(
                            "mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                            task.status === 'completed' 
                              ? "bg-primary border-primary text-black" 
                              : "border-outline-variant hover:border-primary"
                          )}
                        >
                          {task.status === 'completed' && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                        </button>
                        <div className="flex-1">
                          <h5 className={cn(
                            "text-sm font-bold mb-1",
                            task.status === 'completed' ? "line-through text-on-surface-variant" : "text-on-background"
                          )}>
                            {task.title}
                          </h5>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-primary">
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {new Date(task.dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {task.recurring !== 'none' && (
                              <div className="flex items-center gap-1 text-[10px] text-secondary">
                                <span className="material-symbols-outlined text-[12px]">repeat</span>
                                {task.recurring}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-outline-variant/10">
        <p className="text-[9px] text-center text-on-surface-variant/40 uppercase tracking-[0.2em]">
          Tasks are synchronized with your local data vault
        </p>
      </div>
    </motion.div>
  );
};
