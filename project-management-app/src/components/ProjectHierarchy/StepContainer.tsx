"use client";
import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiBox, FiCheckCircle, FiClock, FiAlertCircle, FiPause } from 'react-icons/fi';
import { StepHierarchy } from '@/lib/rpcFunctions';
import TaskCard from './TaskCard';

interface StepContainerProps {
  step: StepHierarchy;
  phaseId: string;
  projectId: string;
  isLast?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

/**
 * StepContainer displays a single step with expandable tasks
 * 
 * Features:
 * - Step status indicators
 * - Collapsible/expandable task list
 * - Task progress tracking
 * - Visual connection to parent phase
 */
export const StepContainer: React.FC<StepContainerProps> = ({ 
  step, 
  phaseId,
  projectId,
  isLast = false,
  isExpanded = false,
  onToggle 
}) => {
  const [internalExpanded, setInternalExpanded] = useState(isExpanded);
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const expanded = onToggle ? isExpanded : internalExpanded;

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' };
      case 'in_progress':
        return { icon: FiClock, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' };
      case 'blocked':
        return { icon: FiAlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' };
      case 'on_hold':
        return { icon: FiPause, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800' };
      default:
        return { icon: FiBox, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20', borderColor: 'border-gray-200 dark:border-gray-700' };
    }
  };

  // Calculate step progress (based on completed tasks)
  const calculateProgress = () => {
    if (!step.tasks || step.tasks.length === 0) return 0;
    const completedTasks = step.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / step.tasks.length) * 100);
  };

  const statusInfo = getStatusInfo(step.status);
  const StatusIcon = statusInfo.icon;
  const progress = calculateProgress();

  return (
    <div className="relative">
      {/* Connecting line to parent phase (visual hierarchy) */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      )}
      
      <div className={`relative border ${statusInfo.borderColor} rounded-lg ${statusInfo.bgColor} ml-4`}>
        {/* Step Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={handleToggle}
        >
          <div className="flex items-center min-w-0 flex-1">
            {/* Expand/Collapse Icon */}
            <button className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
              {expanded ? (
                <FiChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <FiChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>

            {/* Status Icon */}
            <StatusIcon className={`h-4 w-4 ${statusInfo.color} mr-2 flex-shrink-0`} />

            {/* Step Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {step.name}
                </h5>
              </div>
              
              {/* Progress and Task Count */}
              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{step.tasks?.length || 0} tasks</span>
                {progress > 0 && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{progress}% complete</span>
                  </>
                )}
                <span className="mx-1">•</span>
                <span>Step {step.order_index + 1}</span>
              </div>
            </div>
          </div>

          {/* Mini Progress Bar */}
          {progress > 0 && (
            <div className="ml-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Expandable Tasks Content */}
        {expanded && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {step.tasks && step.tasks.length > 0 ? (
              <div className="p-3 space-y-2">
                {step.tasks
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      stepId={step.id}
                      phaseId={phaseId}
                      projectId={projectId}
                    />
                  ))}
              </div>
            ) : (
              <div className="p-3 text-center">
                <div className="text-gray-400 mb-2">
                  <FiBox className="mx-auto h-6 w-6" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No tasks defined for this step
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Tasks will be added when work begins
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepContainer;