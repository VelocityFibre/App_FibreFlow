"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProjectHierarchyTree } from "@/components/hierarchy/ProjectHierarchyTree";
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
  phases?: {
    name: string;
    description?: string;
    order_no?: number;
  };
  [key: string]: unknown;
}

interface Task {
  id: number;
  name?: string;  // Changed from title to name to match database
  title?: string; // Keep title for backward compatibility
  description?: string;
  phase_id?: string;
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
  const [staffMembers, setStaffMembers] = useState<{ [id: string]: string }>({});

  // Wrapper function to handle ProjectTask updates with correct typing
  async function updateProjectTaskWrapper(id: number, updates: { assigned_to?: string | number | null }) {
    const updatedData: { assigned_to?: string | null } = {};
    
    // Convert assigned_to to string since database expects TEXT
    if (updates.assigned_to !== undefined) {
      updatedData.assigned_to = updates.assigned_to === null ? null : String(updates.assigned_to);
    }
    
    const { error } = await supabase.from("project_tasks").update(updatedData).eq("id", id);
    
    if (error) {
      console.error('Error updating task assignee:', error);
      alert('Failed to update task assignee: ' + error.message);
    }
  }

  async function updatePhaseAssignee(id: string, assigneeId: string | null) {
    if (!id) return;
    await supabase.from("project_phases").update({ assigned_to: assigneeId }).eq("id", id);
  }

  async function updateTaskAssignee(id: number | string, assigneeId: string | number | null) {
    if (!id) return;
    // Convert assigneeId to string since the database expects TEXT
    const stringAssigneeId = assigneeId === null ? null : String(assigneeId);
    
    const { error } = await supabase.from("project_tasks").update({ assigned_to: stringAssigneeId }).eq("id", id);
    
    if (error) {
      console.error('Error updating task assignee:', error);
      alert('Failed to update task assignee: ' + error.message);
    }
  }

  async function fetchStaffMembers() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching staff members:', error);
      } else if (data) {
        const staffMap: { [id: string]: string } = {};
        data.forEach(staff => {
          staffMap[staff.id] = staff.name;
        });
        setStaffMembers(staffMap);
      }
    } catch (error) {
      console.error('Error in fetchStaffMembers:', error);
    }
  }

  async function fetchPhasesAndTasks() {
    if (!id) return;
    try {
      // Get master phases
      const phasesData = await getPhases();
      setPhases(phasesData);
      
      // Get project phases with more detailed logging
      console.log(`Fetching phases for project ${id}`);
      const { data: projectPhasesData, error: projectPhasesError } = await supabase
        .from("project_phases")
        .select("*, phases(*)")
        .eq("project_id", id);
      
      if (projectPhasesError) {
        console.error('Error fetching project phases:', projectPhasesError);
        setProjectPhases([]);
      } else {
        console.log(`Found ${projectPhasesData?.length || 0} phases for project ${id}:`, projectPhasesData);
        setProjectPhases(projectPhasesData as ProjectPhase[]);
      }
      
      // For each project phase, get its tasks with improved error handling
      const phaseTasksObj: { [phaseId: string]: ProjectTask[] } = {};
      for (const phase of (projectPhasesData as ProjectPhase[]) || []) {
        console.log(`Fetching tasks for phase ${phase.id}`);
        
        // Get project tasks for this phase
        const { data: projectTasksData, error: projectTasksError } = await supabase
          .from("project_tasks")
          .select("*")
          .eq("project_phase_id", phase.id);
        
        if (projectTasksError) {
          console.error(`Error fetching project tasks for phase ${phase.id}:`, projectTasksError);
          phaseTasksObj[phase.id] = []; // Initialize with empty array to avoid undefined errors
          continue;
        }
        
        console.log(`Found ${projectTasksData?.length || 0} tasks for phase ${phase.id}:`, projectTasksData);
        
        // For each project task, get the associated task details
        const enhancedTasks = [];
        for (const projectTask of projectTasksData || []) {
          console.log(`Fetching details for task ID ${projectTask.task_id}`);
          
          try {
            // Log the task_id to debug
            console.log('Task ID to fetch:', projectTask.task_id, typeof projectTask.task_id);
            
            // First try to get the task directly
            const { data: taskData, error: taskError } = await supabase
              .from("tasks")
              .select("*")
              .eq("id", projectTask.task_id);
            
            console.log('Task query result:', { taskData, taskError });
            
            if (taskError || !taskData || taskData.length === 0) {
              // If that fails, try to fetch all tasks and find the matching one
              console.log('First query failed, trying to fetch all tasks');
              const { data: allTasksData, error: allTasksError } = await supabase
                .from("tasks")
                .select("*");
              
              console.log('All tasks query result:', { 
                count: allTasksData?.length || 0, 
                error: allTasksError,
                sample: allTasksData?.slice(0, 3) || []
              });
              
              if (allTasksError || !allTasksData || allTasksData.length === 0) {
                console.error('Could not fetch any tasks:', allTasksError);
                enhancedTasks.push({
                  ...projectTask,
                  task: { name: `Task ${projectTask.task_id}`, description: "Task details not available" }
                });
              } else {
                // Find the task with matching ID
                const matchingTask = allTasksData.find(t => String(t.id) === String(projectTask.task_id));
                
                if (matchingTask) {
                  console.log('Found matching task:', matchingTask);
                  console.log('Matching task fields:', Object.keys(matchingTask));
                  enhancedTasks.push({
                    ...projectTask,
                    task: matchingTask
                  });
                } else {
                  console.error(`Task ID ${projectTask.task_id} not found in ${allTasksData.length} tasks`);
                  enhancedTasks.push({
                    ...projectTask,
                    task: { name: `Task ${projectTask.task_id}`, description: "Task not found in database" }
                  });
                }
              }
            } else {
              console.log(`Found details for task ID ${projectTask.task_id}:`, taskData[0]);
              console.log('Task fields:', Object.keys(taskData[0]));
              enhancedTasks.push({
                ...projectTask,
                task: taskData[0]
              });
            }
          } catch (error) {
            console.error(`Exception when fetching task ID ${projectTask.task_id}:`, error);
            enhancedTasks.push({
              ...projectTask,
              task: { name: `Task ${projectTask.task_id}`, description: "Error fetching task details" }
            });
          }
        }
        
        console.log(`Enhanced tasks for phase ${phase.id}:`, enhancedTasks);
        phaseTasksObj[phase.id] = enhancedTasks as ProjectTask[];
      }
      setPhaseTasks(phaseTasksObj);
      // Get all tasks
      try {
        const { data: allTasksData, error: allTasksError } = await supabase
          .from("tasks")
          .select("*");
        
        if (allTasksError) {
          console.error('Error fetching all tasks:', JSON.stringify(allTasksError));
          setAllTasks([]);
        } else {
          console.log('Successfully fetched all tasks:', allTasksData?.length || 0);
          setAllTasks(allTasksData || []);
        }
      } catch (taskError) {
        console.error('Exception when fetching all tasks:', taskError);
        setAllTasks([]);
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
      fetchStaffMembers();
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
      {/* --- NEW 4-LEVEL HIERARCHY SECTION --- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Project Hierarchy</h2>
          <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded">
            NEW: 4-Level Structure
          </span>
        </div>
        <ProjectHierarchyTree projectId={id as string} />
      </div>

      {/* --- LEGACY PHASED WORKFLOW SECTION (Keep for comparison) --- */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Legacy Project Workflow</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View and manage the current project phases and tasks below. You can reassign tasks to different team members if you have admin privileges.
        </p>
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
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">{projPhase.phases?.name || projPhase.phase?.name || 'Unnamed Phase'}</span>
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Status: {projPhase.status}</span>
                </div>
              </div>
              <div className="mb-2 text-gray-600 dark:text-gray-300">{projPhase.phase?.description}</div>
              {/* Phase Assignee */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 w-28">Phase Assignee:</label>
                  <div className="w-64">
                    <PhaseAssigneeDropdown
                      value={projPhase.assigned_to || null}
                      onChange={async (staffId) => {
                        // Ensure staffId is properly typed as string | null
                        const typedStaffId = staffId === null ? null : String(staffId);
                        await updateProjectPhase(projPhase.id, { assigned_to: typedStaffId });
                        await fetchPhasesAndTasks();
                      }}
                      disabled={projPhase.status === 'completed'}
                    />
                  </div>
                  {projPhase.assigned_to && projPhase.assigned_to !== 'NaN' && (
                    <span className="text-xs text-gray-700 dark:text-gray-300 ml-2">
                      Assigned to: {staffMembers[projPhase.assigned_to] || 'Unknown'}
                    </span>
                  )}
                </div>
              </div>
              {/* Phase Status Information */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tasks and phases are managed by administrators. Contact your project manager to request changes to the project structure.
                </p>
              </div>
              {/* List Tasks for this Phase */}
              <div className="mb-4">
                <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</h3>
                {!phaseTasks[projPhase.id] || phaseTasks[projPhase.id].length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                    <p className="text-sm">No tasks found for this phase. Try creating a new project to automatically generate tasks.</p>
                    <button 
                      onClick={async () => {
                        try {
                          // Manually create a default task for this phase
                          const { data: defaultTask } = await supabase
                            .from('tasks')
                            .select('*')
                            .limit(1)
                            .single();
                            
                          if (defaultTask) {
                            const { error } = await supabase
                              .from('project_tasks')
                              .insert([
                                {
                                  project_phase_id: projPhase.id,
                                  task_id: defaultTask.id,
                                  status: 'in_progress'
                                }
                              ]);
                              
                            if (error) {
                              console.error('Error creating task:', error);
                              alert('Failed to create task: ' + error.message);
                            } else {
                              alert('Task created successfully!');
                              fetchPhasesAndTasks(); // Refresh the data
                            }
                          } else {
                            alert('No default tasks found in the system.');
                          }
                        } catch (err) {
                          console.error('Error:', err);
                          alert('An error occurred while creating the task.');
                        }
                      }}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
                    >
                      Create Default Task
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {(phaseTasks[projPhase.id] || []).map((pt: ProjectTask) => (
                      <li key={pt.id} className="border rounded-md p-3 bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {pt.task?.name || pt.task?.title || `Task ${pt.task_id}`}
                            </span>
                            <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{pt.status}</span>
                          </div>
                        </div>
                        
                        {pt.task?.description ? (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{pt.task.description}</div>
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">No description available</div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 w-28">Task Assignee:</label>
                          <div className="w-64">
                            <TaskAssigneeDropdown
                              value={pt.assigned_to || null}
                              onChange={async (staffId) => {
                                // Pass staffId directly - updateProjectTaskWrapper will handle the conversion
                                await updateProjectTaskWrapper(pt.id, { assigned_to: staffId });
                                await fetchPhasesAndTasks();
                              }}
                              disabled={pt.status === 'completed'}
                            />
                          </div>
                          {pt.assigned_to && (
                            <span className="text-xs text-gray-700 dark:text-gray-300 ml-2">
                              Assigned to: {staffMembers[pt.assigned_to] || pt.assigned_to}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <Link href="/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
      </div>
    </div>
  );
}

