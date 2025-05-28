"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  getPhases,
  addProjectPhase,
  updateProjectPhase,
  addProjectTask
} from "@/lib/projectPhaseUtils";
import PhaseAssigneeDropdown from "@/components/PhaseAssigneeDropdown";
import TaskAssigneeDropdown from "@/components/TaskAssigneeDropdown";

// --- TypeScript interfaces ---
interface Project {
  id: string;
  name?: string;
  project_name?: string; // Add project_name field to match database schema
  customer_id?: string;
  created_at?: string;
  start_date?: string;
  location_id?: string;
  province?: string;
  region?: string;
}

interface Location {
  id: string;
  location_name: string;
}

interface Phase {
  id: string;
  name: string;
  description?: string;
}

interface ProjectPhase {
  id: string;
  phase_id: string;
  status: string;
  assigned_to?: string | null;
  phase?: Phase;
  [key: string]: unknown;
}

interface Task {
  id: number;
  title: string;
}

interface ProjectTask {
  id: number;
  project_phase_id: string;
  task_id: number;
  status: string;
  assigned_to?: string | null;
  task?: Task;
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  // Phase workflow state
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectPhases, setProjectPhases] = useState<ProjectPhase[]>([]);
  const [phaseTasks, setPhaseTasks] = useState<{ [phaseId: string]: ProjectTask[] }>({});
  const [phaseAddLoading, setPhaseAddLoading] = useState(false);
  const [taskAddLoading, setTaskAddLoading] = useState<{ [phaseId: string]: boolean }>({});
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<number|null>(null);

  // Wrapper function to handle ProjectTask updates with correct typing
  async function updateProjectTaskWrapper(id: number, updates: { assigned_to?: string | number | null }) {
    const updatedData: { assigned_to?: string | null } = {};
    
    // Convert assigned_to to string if it's a number
    if (updates.assigned_to !== undefined) {
      updatedData.assigned_to = updates.assigned_to === null ? null : String(updates.assigned_to);
    }
    
    await supabase.from("project_tasks").update(updatedData).eq("id", id);
  }

  async function fetchPhasesAndTasks() {
    if (!id) return;
    try {
      // Get master phases
      const phasesData = await getPhases();
      setPhases(phasesData);
      // Get project phases
      const { data: projectPhasesData, error: projectPhasesError } = await supabase
        .from("project_phases")
        .select("*, phases(*)")
        .eq("project_id", id);
      if (projectPhasesError) {
        console.error('Error fetching project phases:', projectPhasesError);
        setProjectPhases([]);
      } else {
        setProjectPhases(projectPhasesData as ProjectPhase[]);
      }
      // For each project phase, get its tasks
      const phaseTasksObj: { [phaseId: string]: ProjectTask[] } = {};
      for (const phase of (projectPhasesData as ProjectPhase[]) || []) {
        const { data: tasksData, error: tasksError } = await supabase
          .from("project_tasks")
          .select("*")
          .eq("project_phase_id", phase.id);
        if (!tasksError && tasksData) {
          phaseTasksObj[phase.id] = tasksData as ProjectTask[];
        }
      }
      setPhaseTasks(phaseTasksObj);
      // Get all tasks
      const { data: allTasksData, error: allTasksError } = await supabase
        .from("tasks")
        .select("*");
      if (allTasksError) {
        console.error('Error fetching all tasks:', allTasksError);
        setAllTasks([]);
      } else {
        setAllTasks(allTasksData || []);
      }
    } catch (error: unknown) {
      console.error('Error in fetchPhasesAndTasks:', error);
      let msg = '';
      if (typeof error === 'object' && error && 'message' in error) {
        msg = (error as { message?: string }).message || '';
      } else {
        msg = JSON.stringify(error);
      }
      alert('Error loading phases/tasks: ' + msg);
    }
  }

  async function fetchProject() {
    setLoading(true);
    console.log('Fetching project with ID:', id);
    // Fix: Use the correct table name 'projects' instead of 'new_projects'
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
      return;
    }
    if (data && data.location_id) {
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("id", data.location_id)
        .single();
      if (locationError) {
        console.error('Error fetching location:', locationError);
      } else {
        setLocation(locationData);
      }
    }
    setProject(data);
    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchPhasesAndTasks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return (<div className="p-8">Loading...</div>);
  if (!project) return (<div className="p-8 text-red-500">Project not found.</div>);

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-4">{project.project_name || project.name || `Project #${project.id}`}</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer ID</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{project.customer_id || 'Not assigned'}</p>
              <p className="mt-1 text-gray-900 dark:text-white">{project.customer_id || 'Not assigned'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{project.created_at?.slice(0,10) || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{project.start_date || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
              <p className="mt-1 text-gray-900 dark:text-white">
                {location ? location.location_name : (project.location_id || 'Not assigned')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Province</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{project.province || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Region</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{project.region || 'Not specified'}</p>
            </div>
          </div>
        </div>
        {/* --- PHASED WORKFLOW SECTION --- */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Project Workflow</h2>
          {/* Add Phase to Project */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Phase to Project</label>
            <div className="flex gap-2">
              <select
                value={selectedPhaseId}
                onChange={e => setSelectedPhaseId(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">Select Phase</option>
                {phases.map((phase: Phase) => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                disabled={!selectedPhaseId || phaseAddLoading}
                onClick={async () => {
                  setPhaseAddLoading(true);
                  try {
                    if (typeof id !== 'string' || typeof selectedPhaseId !== 'string' || !id || !selectedPhaseId) {
                      alert('Invalid project or phase selection.');
                      setPhaseAddLoading(false);
                      return;
                    }
                    await addProjectPhase(id, selectedPhaseId);
                    setSelectedPhaseId("");
                    await fetchPhasesAndTasks();
                  } catch (err: unknown) {
                    console.error('Error adding project phase:', err);
                    let errMsg = '';
                    if (typeof err === 'object' && err && 'message' in err) {
                      errMsg = (err as { message?: string }).message || '';
                    } else {
                      errMsg = JSON.stringify(err);
                    }
                    alert('Error adding phase: ' + errMsg);
                  } finally {
                    setPhaseAddLoading(false);
                  }
              }}
            >Add Phase</button>
          </div>
        </div>
        {/* List Project Phases */}
        {projectPhases.length === 0 ? (
          <div className="text-gray-500">No phases assigned to this project.</div>
        ) : (
          <div className="space-y-6">
            {projectPhases.map((projPhase: ProjectPhase) => (
              <div key={projPhase.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">{projPhase.phase?.name || 'Unnamed Phase'}</span>
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{projPhase.status}</span>
                  </div>
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-300">{projPhase.phase?.description}</div>
                {/* Phase Assignee */}
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Phase Assignee:</label>
                  <PhaseAssigneeDropdown
                    value={projPhase.assigned_to || null}
                    onChange={async (staffId) => {
                      await updateProjectPhase(projPhase.id, { assigned_to: staffId });
                      await fetchPhasesAndTasks();
                    }}
                    disabled={projPhase.status === 'completed'}
                  />
                  {projPhase.assigned_to && <span className="text-xs text-gray-700 dark:text-gray-300">Assigned</span>}
                </div>
                {/* Add Task to Phase */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Assign Task to Phase</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={selectedTaskId || ""}
                      onChange={e => setSelectedTaskId(Number(e.target.value))}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="">Select Task</option>
                      {allTasks.filter((t: Task) => !(phaseTasks[projPhase.id]||[]).some((pt: ProjectTask) => pt.task_id === t.id)).map((task: Task) => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
                      disabled={!selectedTaskId || taskAddLoading[projPhase.id]}
                      onClick={async () => {
                        if (!selectedTaskId) return;
                        setTaskAddLoading((prev: { [phaseId: string]: boolean }) => ({ ...prev, [projPhase.id]: true }));
                        try {
                          await addProjectTask(projPhase.id, selectedTaskId);
                          setSelectedTaskId(null);
                          await fetchPhasesAndTasks();
                        } catch (err: unknown) {
                          console.error('Error adding task:', err);
                          let errMsg = '';
                          if (err instanceof Error) {
                            errMsg = err.message;
                          } else {
                            errMsg = JSON.stringify(err);
                          }
                          alert('Error adding task: ' + errMsg);
                        } finally {
                          setTaskAddLoading((prev: { [phaseId: string]: boolean }) => ({ ...prev, [projPhase.id]: false }));
                        }
                      }}
                    >Add Task</button>
                  </div>
                </div>
                {/* List Tasks for this Phase */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tasks</label>
                  {(phaseTasks[projPhase.id] || []).length === 0 ? (
                    <div className="text-gray-400 text-xs">No tasks assigned to this phase.</div>
                  ) : (
                    <ul>
                      {(phaseTasks[projPhase.id] || []).map((pt: ProjectTask) => (
                        <li key={pt.id} className="mb-1 flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white">{pt.task?.title || `Task #${pt.task_id}`}</span>
                          <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{pt.status}</span>
                          <TaskAssigneeDropdown
                            value={pt.assigned_to || null}
                            onChange={async (staffId) => {
                              await updateProjectTaskWrapper(pt.id, { assigned_to: staffId });
                              await fetchPhasesAndTasks();
                            }}
                            disabled={pt.status === 'completed'}
                          />
                          {pt.assigned_to && <span className="text-xs text-gray-700 dark:text-gray-300">Assigned</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8">
        <Link href="/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
      </div>
    </div>
  );
}

