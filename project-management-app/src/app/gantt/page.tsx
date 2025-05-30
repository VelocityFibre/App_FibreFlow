"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ModuleOverviewLayout from '@/components/ModuleOverviewLayout';
import ActionButton from '@/components/ActionButton';
import { FiCalendar, FiFilter, FiZoomIn, FiZoomOut } from 'react-icons/fi';

interface Project {
  id: string;
  project_name: string;
  start_date: string;
  end_date?: string;
  progress?: number;
}

interface Task {
  id: string;
  task_name: string;
  project_id: string;
  start_date: string;
  end_date: string;
  status: string;
  assignee?: string;
}

export default function GanttPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('start_date');

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else {
        setProjects(projectsData || []);
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('start_date');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(tasksData || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate date range for the timeline
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (viewMode) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        endDate.setDate(today.getDate() + 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        endDate.setMonth(today.getMonth() + 2);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        endDate.setMonth(today.getMonth() + 6);
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Generate timeline headers
  const generateTimelineHeaders = () => {
    const headers = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (viewMode === 'week') {
        headers.push({
          label: currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          date: new Date(currentDate)
        });
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (viewMode === 'month') {
        headers.push({
          label: currentDate.toLocaleDateString('en-US', { week: 'numeric', month: 'short' }),
          date: new Date(currentDate)
        });
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        headers.push({
          label: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date: new Date(currentDate)
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return headers;
  };

  const timelineHeaders = generateTimelineHeaders();

  // Calculate bar position and width
  const calculateBarPosition = (itemStartDate: string, itemEndDate: string) => {
    const start = new Date(itemStartDate);
    const end = new Date(itemEndDate);
    
    const startOffset = Math.max(0, (start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const filteredProjects = selectedProject === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedProject);

  return (
    <ModuleOverviewLayout
      title="Timeline View"
      description="Schedule and track project milestones with ease"
      actions={
        <div className="flex space-x-3">
          <ActionButton 
            label="Export Timeline" 
            variant="outline" 
            onClick={() => {}} 
          />
          <ActionButton 
            label="Add Milestone" 
            variant="primary" 
            onClick={() => {}} 
          />
        </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Controls */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <FiCalendar className="h-4 w-4 text-gray-500" />
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'week' | 'month' | 'quarter')}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="week">Week View</option>
                  <option value="month">Month View</option>
                  <option value="quarter">Quarter View</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FiZoomOut className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <FiZoomIn className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Loading timeline...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a project to see it in the timeline view.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Timeline Header */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  <div className="w-64 flex-shrink-0 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Project / Task
                  </div>
                  <div className="flex-1 relative">
                    <div className="flex">
                      {timelineHeaders.map((header, index) => (
                        <div
                          key={index}
                          className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400"
                        >
                          {header.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Project Rows */}
                {filteredProjects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const hasValidDates = project.start_date && project.end_date;

                  return (
                    <div key={project.id} className="mb-4">
                      {/* Project Row */}
                      <div className="flex items-center mb-2">
                        <div className="w-64 flex-shrink-0 font-medium text-sm text-gray-900 dark:text-white">
                          {project.project_name}
                        </div>
                        <div className="flex-1 relative h-8">
                          {hasValidDates && (
                            <div
                              className="absolute h-6 bg-blue-500 dark:bg-blue-600 rounded"
                              style={calculateBarPosition(project.start_date, project.end_date!)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Task Rows */}
                      {projectTasks.map(task => (
                        <div key={task.id} className="flex items-center mb-1 ml-4">
                          <div className="w-60 flex-shrink-0 text-sm text-gray-600 dark:text-gray-400">
                            • {task.task_name}
                          </div>
                          <div className="flex-1 relative h-6">
                            {task.start_date && task.end_date && (
                              <div
                                className={`absolute h-4 rounded ${
                                  task.status === 'completed'
                                    ? 'bg-green-500 dark:bg-green-600'
                                    : task.status === 'in_progress'
                                    ? 'bg-yellow-500 dark:bg-yellow-600'
                                    : 'bg-gray-400 dark:bg-gray-600'
                                }`}
                                style={calculateBarPosition(task.start_date, task.end_date)}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Project</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Not Started</span>
            </div>
          </div>
        </div>
      </div>
    </ModuleOverviewLayout>
  );
}