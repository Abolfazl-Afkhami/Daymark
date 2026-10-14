'use client';

import { useState } from 'react';
import { Check, Plus, AlertCircle } from 'lucide-react';
import { toggleTaskAction, addTaskAction } from '@/application/actions/project-actions';

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
}

export function TaskChecklist({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: TaskItem[];
}) {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleToggle = async (taskId: string, currentStatus: string) => {
    await toggleTaskAction(taskId, projectId, currentStatus);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fd = new FormData();
    fd.append('projectId', projectId);
    fd.append('title', newTitle.trim());
    fd.append('priority', priority);

    await addTaskAction(fd);
    setNewTitle('');
  };

  return (
    <div className="space-y-4">
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          placeholder="افزودن تسک جدید برای این پروژه..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-2 py-2 rounded-lg border border-border-subtle bg-canvas text-xs focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="LOW">کم</option>
          <option value="MEDIUM">متوسط</option>
          <option value="HIGH">بالا</option>
          <option value="CRITICAL">فوری</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:opacity-95 transition-opacity flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن</span>
        </button>
      </form>

      {/* Task List */}
      <div className="divide-y divide-border-subtle">
        {tasks.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">
            تسکی برای این پروژه ثبت نشده است. از فرم بالا تسک جدید اضافه کنید.
          </p>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                className="py-2.5 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id, task.status)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-status-complete text-white'
                        : 'border border-border-subtle hover:border-status-complete text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={`text-sm ${
                      isDone ? 'line-through text-text-muted' : 'text-text-main font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {task.priority === 'CRITICAL' && (
                    <span className="text-status-missed font-bold">فوری</span>
                  )}
                  {task.priority === 'HIGH' && (
                    <span className="text-amber-500 font-semibold">مهم</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
