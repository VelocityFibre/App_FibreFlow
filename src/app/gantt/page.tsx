"use client";
import { useState, useEffect } from "react";

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

  // Demo data for fiber installation project
  const phases: Phase[] = [
    {
      name: "Planning & Design",
      color: "bg-blue-500",
      tasks: [
        {
          id: "1",
          name: "Site Survey & Assessment",
          startDate: new Date(2024, 5, 1),
          endDate: new Date(2024, 5, 7),
          progress: 100,
          assignee: "John D.",
          phase: "Planning & Design"
        },
        {
          id: "2", 
          name: "Network Design & Planning",
          startDate: new Date(2024, 5, 5),
          endDate: new Date(2024, 5, 15),
          progress: 85,
          assignee: "Sarah M.",
          phase: "Planning & Design"
        },
        {
          id: "3",
          name: "Permits & Approvals",
          startDate: new Date(2024, 5, 10),
          endDate: new Date(2024, 5, 25),
          progress: 60,
          assignee: "Mike R.",
          phase: "Planning & Design"
        }
      ]
    },
    {
      name: "Infrastructure",
      color: "bg-orange-500", 
      tasks: [
        {
          id: "4",
          name: "Fiber Cable Installation",
          startDate: new Date(2024, 5, 20),
          endDate: new Date(2024, 6, 10),
          progress: 30,
          assignee: "Tech Team A",
          phase: "Infrastructure",
          dependencies: ["2"]
        },
        {
          id: "5",
          name: "Equipment Installation",
          startDate: new Date(2024, 6, 5),
          endDate: new Date(2024, 6, 20),
          progress: 10,
          assignee: "Tech Team B", 
          phase: "Infrastructure",
          dependencies: ["4"]
        }
      ]
    },
    {
      name: "Testing & Commissioning",
      color: "bg-green-500",
      tasks: [
        {
          id: "6",
          name: "Network Testing",
          startDate: new Date(2024, 6, 15),
          endDate: new Date(2024, 6, 25),
          progress: 0,
          assignee: "QA Team",
          phase: "Testing & Commissioning",
          dependencies: ["5"]
        },
        {
          id: "7",
          name: "Customer Activation",
          startDate: new Date(2024, 6, 25),
          endDate: new Date(2024, 7, 5),
          progress: 0,
          assignee: "Support Team",
          phase: "Testing & Commissioning",
          dependencies: ["6"]
        }
      ]
    }
  ];

  // Generate timeline (next 3 months)
  const generateTimeline = () => {
    const timeline = [];
    const start = new Date(2024, 5, 1); // June 1, 2024
    const end = new Date(2024, 7, 31); // August 31, 2024
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      timeline.push(new Date(d));
    }
    return timeline;
  };

  const timeline = generateTimeline();

  // Calculate task bar position and width
  const getTaskBarStyle = (task: GanttTask) => {
    const timelineStart = new Date(2024, 5, 1);
    const timelineEnd = new Date(2024, 7, 31);
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const taskStartDays = Math.ceil((task.startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (taskStartDays / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-600";
    if (progress >= 50) return "bg-yellow-500";
    if (progress > 0) return "bg-blue-500";
    return "bg-gray-300";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          Fiber Installation Project - Gantt Chart
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Project timeline and task dependencies
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Not Started</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b bg-gray-50">
          <div className="w-80 p-4 border-r font-medium text-gray-900">Tasks</div>
          <div className="flex-1 flex">
            {timeline.map((date, index) => (
              <div key={index} className="flex-1 p-2 border-r text-center text-sm font-medium text-gray-600 min-w-[100px]">
                {formatDate(date)}
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Rows */}
        {phases.map((phase, phaseIndex) => (
          <div key={phaseIndex}>
            {/* Phase Header */}
            <div className="flex bg-gray-100 border-b">
              <div className="w-80 p-3 border-r">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${phase.color}`}></div>
                  <span className="font-medium text-gray-900">{phase.name}</span>
                </div>
              </div>
              <div className="flex-1 relative">
                {/* Phase timeline background */}
                <div className="h-full flex">
                  {timeline.map((_, index) => (
                    <div key={index} className="flex-1 border-r border-gray-200 min-w-[100px]"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase Tasks */}
            {phase.tasks.map((task, taskIndex) => (
              <div key={task.id} className="flex border-b hover:bg-gray-50 transition-colors">
                <div className="w-80 p-4 border-r">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{task.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </div>
                    {task.assignee && (
                      <div className="text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {task.assignee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 relative p-2">
                  {/* Timeline grid */}
                  <div className="absolute inset-0 flex">
                    {timeline.map((_, index) => (
                      <div key={index} className="flex-1 border-r border-gray-100 min-w-[100px]"></div>
                    ))}
                  </div>
                  
                  {/* Task bar */}
                  <div 
                    className="absolute top-2 h-6 rounded cursor-pointer hover:shadow-md transition-shadow"
                    style={getTaskBarStyle(task)}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                  >
                    <div className={`h-full rounded flex items-center justify-between px-2 ${getProgressColor(task.progress)}`}>
                      <span className="text-white text-xs font-medium truncate">
                        {task.progress}%
                      </span>
                    </div>
                    {/* Progress overlay */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-700 rounded opacity-30"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>

                  {/* Current date indicator */}
                  {phaseIndex === 0 && taskIndex === 0 && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: '25%' }}>
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tasks</h3>
          <div className="text-2xl font-light text-gray-900">
            {phases.reduce((acc, phase) => acc + phase.tasks.length, 0)}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
          <div className="text-2xl font-light text-green-600">
            {phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.progress === 100).length, 0)}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">In Progress</h3>
          <div className="text-2xl font-light text-yellow-600">
            {phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.progress > 0 && t.progress < 100).length, 0)}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Progress</h3>
          <div className="text-2xl font-light text-gray-900">
            {Math.round(phases.reduce((acc, phase) => acc + phase.tasks.reduce((sum, task) => sum + task.progress, 0), 0) / phases.reduce((acc, phase) => acc + phase.tasks.length, 0))}%
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Task Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <div className="text-gray-900">{selectedTask.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="text-gray-900">{formatDate(selectedTask.startDate)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <div className="text-gray-900">{formatDate(selectedTask.endDate)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(selectedTask.progress)}`}
                        style={{ width: `${selectedTask.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedTask.progress}%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <div className="text-gray-900">{selectedTask.assignee || "Unassigned"}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                <div className="text-gray-900">{selectedTask.phase}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <div className="text-gray-900">
                  {Math.ceil((selectedTask.endDate.getTime() - selectedTask.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t mt-6">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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