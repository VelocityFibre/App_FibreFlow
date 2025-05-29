"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import TaskAssigneeDropdown from "@/components/TaskAssigneeDropdown";
import Link from "next/link";

interface Task {
  id: string;
  task_id: number;
  project_phase_id: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  due_date?: string | null;
  task: {
    id: number;
    name?: string;
    title?: string;
    description?: string;
  };
  project_phase: {
    id: string;
    project_id: string;
    phase_id: string;
    status: string;
    phase: {
      id: string;
      name: string;
    };
    project: {
      id: string;
      project_name: string;
      customer_id?: string;
    };
  };
}

interface Staff {
  id: string;
  name: string;
  email?: string;
}

interface Project {
  id: string;
  project_name: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Filter states
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all tasks with related data
      const { data: tasksData, error: tasksError } = await supabase
        .from("project_tasks")
        .select(`
          *,
          task:task_id(*),
          project_phase:project_phase_id(
            *,
            phase:phase_id(*),
            project:project_id(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        return;
      }

      // Fetch staff members
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("*")
        .order("name");

      if (staffError) {
        console.error("Error fetching staff:", staffError);
      } else {
        setStaff(staffData || []);
      }

      // Extract unique projects from tasks
      const uniqueProjects = new Map<string, Project>();
      tasksData?.forEach(task => {
        if (task.project_phase?.project) {
          uniqueProjects.set(
            task.project_phase.project.id,
            task.project_phase.project
          );
        }
      });
      setProjects(Array.from(uniqueProjects.values()));

      setTasks(tasksData || []);
      setFilteredTasks(tasksData || []);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters
  useEffect(() => {
    let filtered = [...tasks];

    // Filter by assignee
    if (selectedAssignee) {
      if (selectedAssignee === "unassigned") {
        filtered = filtered.filter(task => !task.assigned_to);
      } else {
        filtered = filtered.filter(task => task.assigned_to === selectedAssignee);
      }
    }

    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter(
        task => task.project_phase?.project?.id === selectedProject
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filter by search term (task name or project name)
    if (searchTerm) {
      filtered = filtered.filter(task => {
        const taskName = task.task?.name || task.task?.title || "";
        const projectName = task.project_phase?.project?.project_name || "";
        const phaseName = task.project_phase?.phase?.name || "";
        
        return (
          taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phaseName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedAssignee, selectedProject, selectedStatus, searchTerm]);

  async function updateTaskAssignee(taskId: string, newAssigneeId: string | number | null) {
    try {
      const { error } = await supabase
        .from("project_tasks")
        .update({ assigned_to: newAssigneeId })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task assignee:", error);
        alert("Failed to update task assignee");
        return;
      }

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("project_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task status:", error);
        alert("Failed to update task status");
        return;
      }

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }

  // Get unique statuses
  const statuses = ["not_started", "pending", "in_progress", "completed"];

  // Get staff member name by ID
  const getStaffName = (staffId: string | null) => {
    if (!staffId) return "Unassigned";
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.name || staffId;
  };

  // Group tasks by assignee
  const tasksByAssignee = filteredTasks.reduce((acc, task) => {
    const assigneeId = task.assigned_to || "unassigned";
    if (!acc[assigneeId]) {
      acc[assigneeId] = [];
    }
    acc[assigneeId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Tasks Management</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Total Tasks</h3>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredTasks.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Completed</h3>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {filteredTasks.filter(t => t.status === "completed").length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">In Progress</h3>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {filteredTasks.filter(t => t.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Not Started</h3>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {filteredTasks.filter(t => t.status === "not_started" || t.status === "pending").length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg text-gray-600 dark:text-gray-300">No tasks found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group by Assignee View */}
          {Object.entries(tasksByAssignee).map(([assigneeId, assigneeTasks]) => (
            <div key={assigneeId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                {getStaffName(assigneeId === "unassigned" ? null : assigneeId)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({assigneeTasks.length} tasks)
                </span>
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Phase
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {assigneeTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {task.task?.name || task.task?.title || `Task ${task.task_id}`}
                            </p>
                            {task.task?.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {task.task.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/projects/${task.project_phase?.project?.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {task.project_phase?.project?.project_name || "Unknown"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {task.project_phase?.phase?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>
                                {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-48">
                            <TaskAssigneeDropdown
                              value={task.assigned_to}
                              onChange={(value) => updateTaskAssignee(task.id, value)}
                              label="Select Assignee"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/projects/${task.project_phase?.project?.id}`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Project
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}