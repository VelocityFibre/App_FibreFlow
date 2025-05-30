"use client";
import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiClock, FiCheckCircle, FiAlertCircle, FiPause } from 'react-icons/fi';
import { PhaseHierarchy } from '@/lib/rpcFunctions';
import StepContainer from './StepContainer';

interface PhaseAccordionProps {
  phase: PhaseHierarchy;
  projectId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

/**
 * PhaseAccordion displays a single phase with expandable steps
 * 
 * Features:
 * - Phase status indicators with colors
 * - Collapsible/expandable phase content
 * - Step containers within each phase
 * - Progress tracking
 * - Phase type badges (planning, ip, wip, handover, hoc, fac)
 */
export const PhaseAccordion: React.FC<PhaseAccordionProps> = ({ 
  phase, 
  projectId,
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
        return { icon: FiCheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' };
      case 'in_progress':
        return { icon: FiClock, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'blocked':
        return { icon: FiAlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' };
      case 'on_hold':
        return { icon: FiPause, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
      default:
        return { icon: FiClock, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20' };
    }
  };

  // Get phase type badge color
  const getPhaseTypeBadge = (phaseType: string) => {
    const typeColors = {
      planning: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      ip: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      wip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      handover: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      hoc: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      fac: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
    };
    
    return typeColors[phaseType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Calculate phase progress (based on completed steps)
  const calculateProgress = () => {
    if (!phase.steps || phase.steps.length === 0) return 0;
    const completedSteps = phase.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / phase.steps.length) * 100);
  };

  const statusInfo = getStatusInfo(phase.status);
  const StatusIcon = statusInfo.icon;
  const progress = calculateProgress();

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${statusInfo.bgColor}`}>
      {/* Phase Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center min-w-0 flex-1">
          {/* Expand/Collapse Icon */}
          <button className="mr-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            {expanded ? (
              <FiChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <FiChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Status Icon */}
          <StatusIcon className={`h-5 w-5 ${statusInfo.color} mr-3 flex-shrink-0`} />

          {/* Phase Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {phase.name}
              </h4>
              
              {/* Phase Type Badge */}
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseTypeBadge(phase.phase_type)}`}>
                {phase.phase_type?.toUpperCase()}
              </span>
            </div>
            
            {/* Progress and Step Count */}
            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{phase.steps?.length || 0} steps</span>
              {progress > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <span>{progress}% complete</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span>Order: {phase.order_index}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="ml-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Expandable Steps Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {phase.steps && phase.steps.length > 0 ? (
            <div className="p-4 space-y-3">
              {phase.steps
                .sort((a, b) => a.order_index - b.order_index)
                .map((step, index) => (
                  <StepContainer 
                    key={step.id} 
                    step={step}
                    phaseId={phase.id}
                    projectId={projectId}
                    isLast={index === phase.steps.length - 1}
                  />
                ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="text-gray-400 mb-2">
                <FiClock className="mx-auto h-8 w-8" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No steps defined for this phase
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Steps will be added when the phase structure is created
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhaseAccordion;