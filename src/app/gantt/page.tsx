"use client";
import { useState, useEffect } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee?: string;
  phase: string;
  dependencies?: string[];
}

interface Phase {
  name: string;
  color: string;
  tasks: GanttTask[];
}

export default function GanttPage() {
  const [currentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("demo-1");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Demo data for testing
  const demoProjects = [
    { id: "demo-1", name: "Fiber Installation - Downtown District", project_name: "Fiber Installation - Downtown District" },
    { id: "demo-2", name: "Network Upgrade - Suburban Areas", project_name: "Network Upgrade - Suburban Areas" },
    { id: "demo-3", name: "Equipment Maintenance - City Center", project_name: "Equipment Maintenance - City Center" },
    { id: "demo-4", name: "5G Tower Installation - Business Park", project_name: "5G Tower Installation - Business Park" }
  ];

  const demoTasks = selectedProjectId === "demo-1" ? [
    { id: 1, name: "Site Survey & Assessment", status: "completed", assigned_to: "John Davis", created_at: "2024-01-01", days_assigned: 5 },
    { id: 2, name: "Network Design & Planning", status: "completed", assigned_to: "Sarah Mitchell", created_at: "2024-01-03", days_assigned: 10 },
    { id: 3, name: "Permits & Approvals", status: "in_progress", assigned_to: "Mike Rodriguez", created_at: "2024-01-08", days_assigned: 15 },
    { id: 4, name: "Fiber Cable Installation", status: "in_progress", assigned_to: "Tech Team Alpha", created_at: "2024-01-15", days_assigned: 20 },
    { id: 5, name: "Equipment Installation", status: "pending", assigned_to: "Tech Team Beta", created_at: "2024-01-25", days_assigned: 12 },
    { id: 6, name: "Network Testing", status: "not_started", assigned_to: "QA Team", created_at: "2024-02-01", days_assigned: 8 },
    { id: 7, name: "Customer Activation", status: "not_started", assigned_to: "Support Team", created_at: "2024-02-05", days_assigned: 6 }
  ] : selectedProjectId === "demo-2" ? [
    { id: 8, name: "Infrastructure Assessment", status: "completed", assigned_to: "Alex Thompson", created_at: "2024-01-10", days_assigned: 7 },
    { id: 9, name: "Equipment Procurement", status: "in_progress", assigned_to: "Procurement Team", created_at: "2024-01-15", days_assigned: 14 },
    { id: 10, name: "Installation Planning", status: "pending", assigned_to: "Planning Team", created_at: "2024-01-20", days_assigned: 10 }
  ] : [];

  // Use demo data instead of real API calls
  const projects = demoProjects;
  const tasks = demoTasks;
  const projectsLoading = false;
  const tasksLoading = false;

  // Convert database tasks to gantt format
  const convertTasksToPhases = (dbTasks: any[]): Phase[] => {
    if (!dbTasks.length) return [];

    // Group tasks by status to create phases
    const phaseMap: { [key: string]: GanttTask[] } = {};
    const phaseColors: { [key: string]: string } = {
      "not_started": "bg-gray-500",
      "in_progress": "bg-blue-500", 
      "pending": "bg-yellow-500",
      "completed": "bg-green-500"
    };

    dbTasks.forEach((task, index) => {
      const phase = task.status || "not_started";
      const startDate = task.created_at ? new Date(task.created_at) : new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (task.days_assigned || 7)); // Default 7 days if no days_assigned

      const ganttTask: GanttTask = {
        id: task.id.toString(),
        name: task.name,
        startDate: startDate,
        endDate: endDate,
        progress: task.status === "completed" ? 100 : task.status === "in_progress" ? 50 : 0,
        assignee: task.assigned_to || "Unassigned",
        phase: phase.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
      };

      if (!phaseMap[phase]) {
        phaseMap[phase] = [];
      }
      phaseMap[phase].push(ganttTask);
    });

    // Convert to phases array
    return Object.entries(phaseMap).map(([phaseName, tasks]) => ({
      name: phaseName.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
      color: phaseColors[phaseName] || "bg-gray-500",
      tasks: tasks
    }));
  };

  const phases: Phase[] = selectedProjectId ? convertTasksToPhases(tasks) : [];

  // Generate timeline based on tasks or default range
  const generateTimeline = () => {
    const timeline = [];
    let start: Date, end: Date;

    if (phases.length > 0) {
      // Find earliest start date and latest end date from tasks
      const allTasks = phases.flatMap(phase => phase.tasks);
      const startDates = allTasks.map(task => task.startDate);
      const endDates = allTasks.map(task => task.endDate);
      
      start = new Date(Math.min(...startDates.map(d => d.getTime())));
      end = new Date(Math.max(...endDates.map(d => d.getTime())));
      
      // Add some padding
      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() + 7);
    } else {
      // Default timeline (current month + 2 months)
      start = new Date();
      start.setDate(1);
      end = new Date(start);
      end.setMonth(end.getMonth() + 3);
    }
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      timeline.push(new Date(d));
    }
    return timeline;
  };

  const timeline = generateTimeline();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProjectDropdown && !(event.target as Element).closest('.project-selector')) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

  // Calculate task bar position and width
  const getTaskBarStyle = (task: GanttTask) => {
    if (timeline.length === 0) return { left: '0%', width: '10%' };
    
    const timelineStart = timeline[0];
    const timelineEnd = timeline[timeline.length - 1];
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const taskStartDays = Math.ceil((task.startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = Math.max(0, (taskStartDays / totalDays) * 100);
    const width = Math.min(100 - left, (taskDuration / totalDays) * 100);
    
    return { left: `${left}%`, width: `${Math.max(2, width)}%` };
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress > 0) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="ff-page-container">
      {/* Page Header */}
      <div className="ff-page-header">
        <h1 className="ff-page-title">Project Timeline</h1>
        <p className="ff-page-subtitle">Visualize project progress with interactive Gantt charts</p>
      </div>

      {/* Project Selection Section */}
      <section className="ff-section">
        <div className="relative project-selector">
          <label className="ff-label mb-4 block">Project Selection</label>
          <div className="relative max-w-full">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full ff-card text-left flex items-center justify-between p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className={`w-4 h-4 rounded-full ${
                  selectedProjectId === "demo-1" ? 'bg-green-500' :
                  selectedProjectId === "demo-2" ? 'bg-blue-500' :
                  selectedProjectId === "demo-3" ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-2xl font-light text-foreground mb-2">
                    {selectedProjectId ? 
                      projects.find(p => p.id === selectedProjectId)?.name || 'Select Project' : 
                      'Select Project'
                    }
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-lg">
                    {selectedProjectId ? (
                      <>
                        <span className="inline-flex px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                          Timeline Active
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium">{phases.reduce((acc, phase) => acc + phase.tasks.length, 0)} tasks</span>
                        <span className="text-muted-foreground">•</span>
                        <span>✓ Project selected - timeline loading below</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex px-3 py-1 text-sm rounded-full font-medium bg-gray-100 text-gray-800">
                          No Selection
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span>Choose a project to visualize</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${showProjectDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left p-8 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                      project.id === selectedProjectId ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${
                        project.id === "demo-1" ? 'bg-green-500' :
                        project.id === "demo-2" ? 'bg-blue-500' :
                        project.id === "demo-3" ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-xl font-light text-foreground mb-2">
                          {project.name || project.project_name || `Project ${project.id}`}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-4">
                          <span className="inline-flex px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                            Gantt Project
                          </span>
                          <span>•</span>
                          <span>Timeline Visualization</span>
                          <span>•</span>
                          <span>Task Management</span>
                        </div>
                      </div>
                      {project.id === selectedProjectId && (
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Legend Section */}
      {selectedProjectId && (
        <section className="ff-section">
          <div className="ff-card p-6">
            <div className="flex items-center gap-8">
              <span className="ff-label">Status Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ff-secondary-text">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="ff-secondary-text">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="ff-secondary-text">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="ff-secondary-text">Not Started</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gantt Chart Section */}
      <section className="ff-section">
        <div className="ff-table-container">
          {!selectedProjectId ? (
            <div className="p-16 text-center">
              <div className="text-gray-300 mb-6">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">Select a Project</h3>
              <p className="text-gray-600 max-w-md mx-auto">Choose a project from the dropdown above to visualize its timeline and track task progress.</p>
            </div>
          ) : tasksLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-6"></div>
              <p className="text-gray-600">Loading project timeline...</p>
            </div>
          ) : phases.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-gray-300 mb-6">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">No Tasks Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">This project doesn't have any tasks yet. Add some tasks to see them visualized here.</p>
            </div>
          ) : (
            <>
              {/* Timeline Header */}
              <div className="flex ff-table-header">
                <div className="w-80 ff-table-header-cell">Task Details</div>
                <div className="flex-1 flex">
                  {timeline.map((date, index) => (
                    <div key={index} className="flex-1 py-4 px-3 text-center text-sm font-medium text-gray-600 border-r border-gray-100 min-w-[100px]">
                      {formatDate(date)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gantt Rows */}
              {phases.map((phase, phaseIndex) => (
                <div key={phaseIndex}>
                  {/* Phase Header */}
                  <div className="flex bg-gray-50 border-b border-gray-100">
                    <div className="w-80 p-4 border-r border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${phase.color.replace('bg-', 'bg-')}`}></div>
                        <span className="ff-heading-medium text-base">{phase.name}</span>
                        <span className="ff-muted-text">({phase.tasks.length} tasks)</span>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      {/* Phase timeline background */}
                      <div className="h-full flex">
                        {timeline.map((_, index) => (
                          <div key={index} className="flex-1 border-r border-gray-100 min-w-[100px]"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Phase Tasks */}
                  {phase.tasks.map((task, taskIndex) => (
                    <div key={task.id} className="ff-table-row flex">
                      <div className="w-80 p-4 border-r border-gray-100">
                        <div className="space-y-2">
                          <div className="ff-body-text font-medium">{task.name}</div>
                          <div className="ff-secondary-text">
                            {formatDate(task.startDate)} - {formatDate(task.endDate)}
                          </div>
                          {task.assignee && (
                            <div>
                              <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                {task.assignee}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 relative p-3">
                        {/* Timeline grid */}
                        <div className="absolute inset-0 flex">
                          {timeline.map((_, index) => (
                            <div key={index} className="flex-1 border-r border-gray-50 min-w-[100px]"></div>
                          ))}
                        </div>
                        
                        {/* Task bar */}
                        <div 
                          className="absolute top-3 h-8 rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200 group"
                          style={getTaskBarStyle(task)}
                          onClick={() => {
                            setSelectedTask(task);
                            setShowModal(true);
                          }}
                        >
                          <div className={`h-full rounded-lg flex items-center justify-between px-3 text-white text-xs font-medium shadow-sm ${getProgressColor(task.progress)} group-hover:shadow-md`}>
                            <span className="truncate">{task.progress}%</span>
                          </div>
                          {/* Progress overlay */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-white rounded-lg opacity-20"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>

                        {/* Current date indicator */}
                        {phaseIndex === 0 && taskIndex === 0 && (
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10" style={{ left: '25%' }}>
                            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Project Summary */}
      {selectedProjectId && phases.length > 0 && (
        <section className="ff-section">
          <h2 className="ff-section-title">Project Overview</h2>
          <div className="ff-grid-stats">
            <div className="ff-card-stats">
              <div className="ff-stat-label">Total Tasks</div>
              <div className="ff-stat-value">
                {phases.reduce((acc, phase) => acc + phase.tasks.length, 0)}
              </div>
            </div>
            <div className="ff-card-stats">
              <div className="ff-stat-label">Completed</div>
              <div className="ff-stat-value text-green-600">
                {phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.progress === 100).length, 0)}
              </div>
            </div>
            <div className="ff-card-stats">
              <div className="ff-stat-label">In Progress</div>
              <div className="ff-stat-value text-blue-600">
                {phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.progress > 0 && t.progress < 100).length, 0)}
              </div>
            </div>
            <div className="ff-card-stats">
              <div className="ff-stat-label">Overall Progress</div>
              <div className="ff-stat-value">
                {phases.length > 0 ? Math.round(phases.reduce((acc, phase) => acc + phase.tasks.reduce((sum, task) => sum + task.progress, 0), 0) / phases.reduce((acc, phase) => acc + phase.tasks.length, 0)) || 0 : 0}%
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-100">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="ff-heading-large">
                Task Details
              </h2>
              <p className="ff-secondary-text mt-2">Review task information and progress</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="ff-label">Task Name</label>
                <div className="ff-body-text font-medium">{selectedTask.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="ff-label">Start Date</label>
                  <div className="ff-body-text">{formatDate(selectedTask.startDate)}</div>
                </div>
                <div>
                  <label className="ff-label">End Date</label>
                  <div className="ff-body-text">{formatDate(selectedTask.endDate)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="ff-label">Progress</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="ff-body-text font-medium">{selectedTask.progress}%</span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        selectedTask.progress === 100 ? 'bg-green-100 text-green-700' :
                        selectedTask.progress >= 50 ? 'bg-blue-100 text-blue-700' :
                        selectedTask.progress > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedTask.progress === 100 ? 'Complete' :
                         selectedTask.progress >= 50 ? 'In Progress' :
                         selectedTask.progress > 0 ? 'Started' : 'Not Started'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(selectedTask.progress)}`}
                        style={{ width: `${selectedTask.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="ff-label">Assignee</label>
                  <div className="ff-body-text">{selectedTask.assignee || "Unassigned"}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="ff-label">Phase</label>
                  <div className="ff-body-text">{selectedTask.phase}</div>
                </div>
                <div>
                  <label className="ff-label">Duration</label>
                  <div className="ff-body-text">
                    {Math.ceil((selectedTask.endDate.getTime() - selectedTask.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
              <button
                className="ff-button-primary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}