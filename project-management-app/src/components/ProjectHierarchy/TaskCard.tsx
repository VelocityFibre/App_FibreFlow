"use client";
import React from 'react';
import { FiUser, FiCalendar, FiFlag, FiCheckCircle, FiClock, FiAlertCircle, FiPause, FiX, FiUsers } from 'react-icons/fi';
import { TaskHierarchy } from '@/lib/rpcFunctions';

interface TaskCardProps {
  task: TaskHierarchy;
  stepId: string;
  phaseId: string;
  projectId: string;
  isDraggable?: boolean;
  onTaskUpdate?: (taskId: string, updates: Partial<TaskHierarchy>) => void;
}

/**
 * TaskCard displays a single task with all its details
 * 
 * Features:
 * - Task status indicators with colors
 * - Assignee information with avatars
 * - Due date and priority indicators
 * - Progress tracking
 * - Dependencies visualization
 * - Quick action buttons
 */
export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  stepId,
  phaseId,
  projectId,
  isDraggable = false,
  onTaskUpdate 
}) => {
  
  // Get status icon, color, and styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: FiCheckCircle, 
          color: 'text-green-600 dark:text-green-400', 
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'in_progress':
        return { 
          icon: FiClock, 
          color: 'text-blue-600 dark:text-blue-400', 
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'blocked':
        return { 
          icon: FiAlertCircle, 
          color: 'text-red-600 dark:text-red-400', 
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'cancelled':
        return { 
          icon: FiX, 
          color: 'text-gray-600 dark:text-gray-400', 
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-700'
        };
      default: // not_started
        return { 
          icon: FiPause, 
          color: 'text-gray-500 dark:text-gray-400', 
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  // Get priority styling
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' };
      case 'medium':
        return { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' };
      case 'low':
        return { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' };
      default:
        return { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-900/30' };
    }
  };

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if task is overdue
  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div 
      className={`
        relative border ${statusInfo.borderColor} rounded-lg ${statusInfo.bgColor}
        hover:shadow-sm transition-all duration-200
        ${isDraggable ? 'cursor-move' : ''}
        ${task.status === 'cancelled' ? 'opacity-60' : ''}
      `}
    >
      {/* Task Header */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          {/* Task Info */}
          <div className="flex items-start min-w-0 flex-1">
            {/* Status Icon */}
            <StatusIcon className={`h-4 w-4 ${statusInfo.color} mr-2 mt-0.5 flex-shrink-0`} />
            
            {/* Task Content */}
            <div className="min-w-0 flex-1">
              {/* Title and Priority */}
              <div className="flex items-center mb-1">
                <h6 className={`text-sm font-medium ${task.status === 'cancelled' ? 'line-through' : ''} text-gray-900 dark:text-white truncate`}>
                  {task.title}
                </h6>
                
                {/* Priority Badge */}
                {task.priority && task.priority !== 'normal' && (
                  <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}>
                    <FiFlag className="h-2.5 w-2.5 mr-1" />
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Task Meta Information */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {/* Assignee */}
                {task.assignee_info && (
                  <div className="flex items-center">
                    <FiUser className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-20">{task.assignee_info.name}</span>
                  </div>
                )}
                
                {/* Secondary Assignee */}
                {task.secondary_assignee_info && (
                  <div className="flex items-center">
                    <FiUsers className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-20">{task.secondary_assignee_info.name}</span>
                  </div>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <div className={`flex items-center ${overdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                    <FiCalendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(task.due_date)}</span>
                    {overdue && <span className="ml-1 text-red-600 dark:text-red-400">⚠</span>}
                  </div>
                )}

                {/* Progress */}
                {task.progress_percentage > 0 && (
                  <div className="flex items-center">
                    <span>{task.progress_percentage}%</span>
                  </div>
                )}

                {/* Order indicator */}
                <div className="text-gray-400">
                  #{task.order_index + 1}
                </div>
              </div>

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Depends on:</span>
                    <div className="mt-1 space-y-1">
                      {task.dependencies.map((dep) => (
                        <div key={dep.id} className="text-xs text-blue-600 dark:text-blue-400">
                          • {dep.depends_on_task_title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ml-2 flex flex-col space-y-1">
            {/* Status Toggle Button */}
            {task.status !== 'cancelled' && (
              <button
                onClick={() => {
                  const newStatus = task.status === 'completed' ? 'not_started' : 'completed';
                  onTaskUpdate?.(task.id, { status: newStatus });
                }}
                className={`
                  p-1 rounded transition-colors text-xs
                  ${task.status === 'completed' 
                    ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' 
                    : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                  }
                `}
                title={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
              >
                <FiCheckCircle className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {task.progress_percentage > 0 && task.progress_percentage < 100 && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${task.progress_percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;