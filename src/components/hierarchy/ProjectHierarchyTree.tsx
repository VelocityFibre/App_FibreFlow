'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreVertical, Calendar, Users, Clock } from 'lucide-react';
import { useProjectHierarchy, type Phase, type Step, type Task } from '@/hooks/useProjectHierarchy';

interface ProjectHierarchyTreeProps {
  projectId: string;
}

export function ProjectHierarchyTree({ projectId }: ProjectHierarchyTreeProps) {
  const { data: hierarchy, isLoading, error } = useProjectHierarchy(projectId);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading project hierarchy...</span>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if this is a setup error
    const errorData = (error as any).data;
    if (errorData?.setupRequired) {
      return (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-center">
            <p className="font-medium text-yellow-700 dark:text-yellow-300">Database Setup Required</p>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{errorData.details}</p>
            <div className="mt-4">
              <a 
                href="/auto-setup" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Go to Database Setup
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-destructive text-center">
          <p className="font-medium">Failed to load project hierarchy</p>
          <p className="text-sm mt-1">{error.message}</p>
          <p className="text-xs mt-2 text-gray-500">
            If you haven't set up the database yet, please go to <a href="/auto-setup" className="text-blue-600 hover:underline">Database Setup</a>
          </p>
        </div>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-muted-foreground text-center">
          <p>No project hierarchy found</p>
        </div>
      </div>
    );
  }

  // Check if the project has no phases assigned
  if (hierarchy.phases.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center">
          <p className="font-medium text-gray-700 dark:text-gray-300">No Phases Assigned</p>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
            This project doesn't have any phases assigned yet. The 4-level hierarchy will appear here once phases are added.
          </p>
          <p className="text-xs mt-4 text-gray-500 dark:text-gray-400">
            Note: Make sure you've run the database setup to create the standard fiber project phases.
          </p>
          <div className="mt-4">
            <a 
              href="/auto-setup" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Check Database Setup
            </a>
          </div>
        </div>
      </div>
    );
  }

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getStepProgress = (step: Step) => {
    if (!step.tasks.length) return 0;
    const completedTasks = step.tasks.filter(task => task.status === 'complete').length;
    return Math.round((completedTasks / step.tasks.length) * 100);
  };

  const getPhaseProgress = (phase: Phase) => {
    const allTasks = phase.steps.flatMap(step => step.tasks);
    if (!allTasks.length) return 0;
    const completedTasks = allTasks.filter(task => task.status === 'complete').length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Project Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">{hierarchy.project.name}</h1>
            {hierarchy.project.description && (
              <p className="text-muted-foreground mt-1">{hierarchy.project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {hierarchy.project.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(hierarchy.project.start_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{hierarchy.phases.length} phases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="p-6">
        <div className="space-y-3">
          {hierarchy.phases.map((phase) => {
            const isPhaseExpanded = expandedPhases.has(phase.id);
            const phaseProgress = getPhaseProgress(phase);

            return (
              <div key={phase.id} className="border border-border rounded-lg overflow-hidden">
                {/* Phase Header */}
                <div 
                  className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => togglePhase(phase.id)}
                >
                  <button className="mr-3 p-1 hover:bg-muted rounded">
                    {isPhaseExpanded ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-card-foreground">{phase.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-muted-foreground">
                          {phase.steps.length} steps
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${phaseProgress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{phaseProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="ml-2 p-1 hover:bg-muted rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Steps */}
                {isPhaseExpanded && (
                  <div className="bg-muted/20 px-4 pb-4">
                    <div className="pl-8 space-y-2">
                      {phase.steps.map((step) => {
                        const isStepExpanded = expandedSteps.has(step.id);
                        const stepProgress = getStepProgress(step);

                        return (
                          <div key={step.id} className="border border-border/50 rounded-lg bg-card">
                            {/* Step Header */}
                            <div 
                              className="flex items-center p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                              onClick={() => toggleStep(step.id)}
                            >
                              <button className="mr-2 p-0.5">
                                {isStepExpanded ? 
                                  <ChevronDown className="w-3 h-3" /> : 
                                  <ChevronRight className="w-3 h-3" />
                                }
                              </button>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium">{step.name}</span>
                                    {step.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-muted-foreground">
                                      {step.tasks.length} tasks
                                    </span>
                                    
                                    <div className="flex items-center gap-1">
                                      <div className="w-12 bg-muted rounded-full h-1.5">
                                        <div 
                                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${stepProgress}%` }}
                                        />
                                      </div>
                                      <span className="font-medium">{stepProgress}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Tasks */}
                            {isStepExpanded && (
                              <div className="px-3 pb-3">
                                <div className="pl-6 space-y-1">
                                  {step.tasks.map((task) => (
                                    <div 
                                      key={task.id} 
                                      className="flex items-center justify-between p-2 text-xs hover:bg-muted/20 rounded transition-colors"
                                    >
                                      <div className="flex-1">
                                        <span className="font-medium">{task.title}</span>
                                        {task.description && (
                                          <p className="text-muted-foreground mt-0.5">{task.description}</p>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 ml-2">
                                        {task.estimated_hours && (
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{task.estimated_hours}h</span>
                                          </div>
                                        )}
                                        
                                        <span className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(task.status)}`}>
                                          {task.status.replace('_', ' ')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {step.tasks.length === 0 && (
                                    <div className="text-muted-foreground text-center py-2">
                                      No tasks in this step
                                    </div>
                                  )}
                                </div>

                                {/* Add Task Button */}
                                <div className="mt-2 pl-6">
                                  <button className="w-full p-2 border border-dashed border-border hover:border-primary hover:bg-muted/30 rounded text-xs transition-colors">
                                    <Plus className="w-3 h-3 inline mr-1" />
                                    Add Task
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Step Button */}
                      <button className="w-full p-3 border border-dashed border-border hover:border-primary hover:bg-muted/30 rounded text-sm transition-colors">
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add Step
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}