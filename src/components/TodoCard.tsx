import React, { useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import type { TodoTask } from '../utils/gemini';

interface TodoCardProps {
  tasks: TodoTask[];
}

export const TodoCard: React.FC<TodoCardProps> = ({ tasks }) => {
  const [completedIds, setCompletedIds] = useState<Record<number, boolean>>({});

  const toggleTask = (index: number) => {
    setCompletedIds(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const totalTasks = tasks.length;
  const completedCount = Object.values(completedIds).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="todo-list-container fade-in">
      {/* Progress tracker */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={24} style={{ color: 'var(--color-copper)' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Daily Completion Progress</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Completed {completedCount} of {totalTasks} tasks
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-copper)' }}>
            {progressPercent}%
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No tasks scheduled for today.
        </div>
      ) : (
        tasks.map((task, idx) => {
          const isDone = !!completedIds[idx];
          return (
            <div 
              key={idx} 
              className={`todo-item glass-panel ${task.type} ${isDone ? 'completed' : ''}`}
            >
              <div 
                className={`todo-checkbox ${isDone ? 'checked' : ''}`}
                onClick={() => toggleTask(idx)}
              >
                {isDone && <Check size={14} />}
              </div>
              
              <div className="todo-time">
                {task.time}
              </div>
              
              <div className="todo-text">
                {task.task}
              </div>

              <div className={`todo-tag ${task.type}`}>
                {task.type}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
