'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreVertical, Calendar, Users, Clock } from 'lucide-react';
import { useProjectHierarchy, useUpdateTaskStatus, type Phase, type Step, type Task } from '@/hooks/useProjectHierarchy';

interface ProjectHierarchyTreeProps {
  projectId: string;
}

export function ProjectHierarchyTree({ projectId }: ProjectHierarchyTreeProps) {
  const { data: hierarchy, isLoading, error } = useProjectHierarchy(projectId);
  const updateTaskStatus = useUpdateTaskStatus();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [localTaskStatuses, setLocalTaskStatuses] = useState<Record<string, string>>({});

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

  // Create demo data if no hierarchy is found
  const demoHierarchy = hierarchy || {
    project: {
      id: projectId,
      name: "Demo Fiber Installation Project",
      description: "Demonstration project showing clickable status badges",
      status: "active",
      start_date: "2024-01-15",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    phases: [
      {
        id: "phase-1",
        name: "Site Survey & Planning",
        description: "Initial site assessment and project planning",
        order_index: 1,
        is_standard: true,
        project_phase_id: "pp-1",
        steps: [
          {
            id: "step-1",
            name: "Site Assessment",
            description: "Evaluate site conditions and requirements",
            order_index: 1,
            phase_id: "phase-1",
            tasks: [
              {
                id: "task-1",
                title: "Conduct site survey",
                description: "Physical inspection of installation site",
                status: "pending" as const,
                order_index: 1,
                step_id: "step-1",
                estimated_hours: 4,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: "task-2",
                title: "Document requirements",
                description: "Record technical and regulatory requirements",
                status: "complete" as const,
                order_index: 2,
                step_id: "step-1",
                estimated_hours: 2,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]
          }
        ]
      },
      {
        id: "phase-2",
        name: "Installation",
        description: "Fiber optic cable installation and setup",
        order_index: 2,
        is_standard: true,
        project_phase_id: "pp-2",
        steps: [
          {
            id: "step-2",
            name: "Cable Installation",
            description: "Install fiber optic cables",
            order_index: 1,
            phase_id: "phase-2",
            tasks: [
              {
                id: "task-3",
                title: "Install main trunk cable",
                description: "Run primary fiber trunk line",
                status: "pending" as const,
                order_index: 1,
                step_id: "step-2",
                estimated_hours: 8,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: "task-4",
                title: "Install drop cables",
                description: "Connect individual service drops",
                status: "pending" as const,
                order_index: 2,
                step_id: "step-2",
                estimated_hours: 6,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]
          }
        ]
      }
    ]
  };

  if (!hierarchy) {
    console.log("Using demo data for ProjectHierarchyTree");
  }

  // Check if the project has no phases assigned
  if (demoHierarchy.phases.length === 0) {
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepProgress = (step: Step) => {
    if (!step.tasks.length) return 0;
    const completedTasks = step.tasks.filter(task => getEffectiveTaskStatus(task) === 'complete').length;
    return Math.round((completedTasks / step.tasks.length) * 100);
  };

  const getPhaseProgress = (phase: Phase) => {
    const allTasks = phase.steps.flatMap(step => step.tasks);
    if (!allTasks.length) return 0;
    const completedTasks = allTasks.filter(task => getEffectiveTaskStatus(task) === 'complete').length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  const handleStatusClick = (task: Task, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Get current status (check local override first, then original)
    const currentStatus = localTaskStatuses[task.id] || task.status;
    
    // Toggle between pending and complete
    const newStatus = currentStatus === 'complete' ? 'pending' : 'complete';
    
    // Update local state for demo purposes
    setLocalTaskStatuses(prev => ({
      ...prev,
      [task.id]: newStatus
    }));
    
    console.log(`Demo: Updated task "${task.title}" from "${currentStatus}" to "${newStatus}"`);
  };

  // Helper function to get the effective task status (local override or original)
  const getEffectiveTaskStatus = (task: Task) => {
    return localTaskStatuses[task.id] || task.status;
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Project Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">{demoHierarchy.project.name}</h1>
            {demoHierarchy.project.description && (
              <p className="text-muted-foreground mt-1">{demoHierarchy.project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {demoHierarchy.project.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(demoHierarchy.project.start_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{demoHierarchy.phases.length} phases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="p-6">
        <div className="space-y-3">
          {demoHierarchy.phases.map((phase) => {
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
                                        
                                        <button 
                                          className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(getEffectiveTaskStatus(task))} hover:opacity-80 transition-opacity cursor-pointer`}
                                          onClick={(e) => handleStatusClick(task, e)}
                                          title={`Click to toggle between pending and completed`}
                                        >
                                          {getEffectiveTaskStatus(task).replace('_', ' ')}
                                        </button>
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