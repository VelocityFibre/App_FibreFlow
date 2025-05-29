"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";
import ProjectAssigneeDropdown from "@/components/ProjectAssigneeDropdown";
import Link from "next/link";

interface Task {
  id: string;
  task_id: number;
  project_phase_id: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  task: {
    id: number;
    title: string;
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
    };
  };
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState<Record<string, boolean>>({});
  const [newAssignees, setNewAssignees] = useState<Record<string, string | null>>({});
  const [newlyAssignedTask, setNewlyAssignedTask] = useState<string | null>(null);

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Get all tasks assigned to the current user
      const { data, error } = await supabase
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
        .eq("assigned_to", currentUser)
        .order("created_at");

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // In a real app, this would come from authentication
    // For now, we'll simulate by getting the first staff member
    async function getFirstStaffMember() {
      const { data } = await supabase.from("staff").select("id").limit(1);
      if (data && data.length > 0) {
        setCurrentUser(data[0].id);
      }
    }
    
    getFirstStaffMember();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMyTasks();
    }
  }, [currentUser, fetchMyTasks]);

  function startReassign(taskId: string) {
    setReassigning({ ...reassigning, [taskId]: true });
    // Initialize with current assignee
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setNewAssignees({ ...newAssignees, [taskId]: task.assigned_to });
    }
  }

  async function completeTask(taskId: string) {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Update the task status to completed
      const { error } = await supabase
        .from("project_tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (error) {
        console.error("Error completing task:", error);
        alert("Failed to complete task");
        return;
      }

      // Log the task completion to audit trail
      await createAuditLog(
        AuditAction.UPDATE,
        AuditResourceType.PROJECT_TASK,
        taskId,
        {
          status: "completed",
          completedBy: currentUser
        }
      );

      // Find the next task in sequence for this phase
      console.log("Looking for next task in phase:", task.project_phase_id);
      console.log("Current task_id:", task.task_id);
      
      // First, let's see what tasks exist in this phase
      const { data: allPhaseTasks } = await supabase
        .from("project_tasks")
        .select("*, task:task_id(*)")
        .eq("project_phase_id", task.project_phase_id)
        .order("task_id");
      
      console.log("All tasks in phase:", allPhaseTasks);
      
      // Find unstarted or pending tasks in the same phase
      const { data: nextTasks, error: nextTaskError } = await supabase
        .from("project_tasks")
        .select("*, task:task_id(*)")
        .eq("project_phase_id", task.project_phase_id)
        .in("status", ["not_started", "pending"]) // Check for both possible initial statuses
        .order("task_id")
        .limit(1);

      console.log("Next tasks found:", nextTasks);
      
      if (nextTaskError) {
        console.error("Error finding next task:", nextTaskError);
      } else if (nextTasks && nextTasks.length > 0) {
        // Automatically start the next task and assign it to the same user
        const nextTask = nextTasks[0];
        const { error: updateError } = await supabase
          .from("project_tasks")
          .update({ 
            status: "in_progress",
            assigned_to: currentUser // Assign to the same person who completed the previous task
          })
          .eq("id", nextTask.id);

        if (updateError) {
          console.error("Error starting next task:", updateError);
        } else {
          // Log the automatic task progression
          await createAuditLog(
            AuditAction.UPDATE,
            AuditResourceType.PROJECT_TASK,
            nextTask.id,
            {
              status: "in_progress",
              assigned_to: currentUser,
              automaticProgression: true,
              previousTaskId: taskId
            }
          );

          // Set the newly assigned task to highlight it
          setNewlyAssignedTask(nextTask.id);
        }
      } else {
        console.log("No next task found in phase");
        // Check if this was the last task in the phase
        const remainingTasks = allPhaseTasks?.filter(t => 
          t.id !== task.id && 
          t.status !== "completed"
        );
        
        if (!remainingTasks || remainingTasks.length === 0) {
          // All tasks in this phase are completed
          alert("Congratulations! You've completed all tasks in this phase.");
        }
      }

      // Refresh the task list
      fetchMyTasks();
    } catch (error) {
      console.error("Unexpected error completing task:", error);
      alert("An unexpected error occurred");
    }
  }

  async function reassignTask(taskId: string) {
    try {
      const newAssignee = newAssignees[taskId];
      
      // Update the task assignee
      const { error } = await supabase
        .from("project_tasks")
        .update({ assigned_to: newAssignee })
        .eq("id", taskId);

      if (error) {
        console.error("Error reassigning task:", error);
        alert("Failed to reassign task");
        return;
      }

      // Log the reassignment to audit trail
      await createAuditLog(
        AuditAction.UPDATE,
        AuditResourceType.PROJECT_TASK,
        taskId,
        {
          assignedTo: newAssignee,
          reassignedBy: currentUser
        }
      );

      // Reset UI state
      setReassigning({ ...reassigning, [taskId]: false });
      
      // Refresh the task list
      fetchMyTasks();
    } catch (error) {
      console.error("Unexpected error reassigning task:", error);
      alert("An unexpected error occurred");
    }
  }

  if (!currentUser) {
    return <div className="p-6">Loading user information...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      
      {newlyAssignedTask && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">New Task Automatically Assigned!</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                The next task in the sequence has been assigned to you. You can reassign it to another team member if needed.
              </p>
            </div>
            <button
              onClick={() => setNewlyAssignedTask(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg text-gray-600 dark:text-gray-300">You don&apos;t have any tasks assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`shadow-md rounded-lg p-6 border ${
                newlyAssignedTask === task.id 
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{task.task.title || task.task.name || `Task ${task.task_id}`}</h3>
                    {newlyAssignedTask === task.id && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">New</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Project: <Link href={`/projects/${task.project_phase.project.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {task.project_phase.project.project_name}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phase: {task.project_phase.phase.name}
                  </p>
                  {task.task.description && (
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{task.task.description}</p>
                  )}
                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      task.status === "completed" ? "bg-green-100 text-green-800" :
                      task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {task.status === "not_started" ? "Not Started" :
                       task.status === "in_progress" ? "In Progress" :
                       "Completed"}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {task.status !== "completed" && (
                    <>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Complete
                      </button>
                      
                      {!reassigning[task.id] ? (
                        <button
                          onClick={() => startReassign(task.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Reassign
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-40">
                            <ProjectAssigneeDropdown
                              value={newAssignees[task.id]}
                              onChange={(value) => setNewAssignees({ ...newAssignees, [task.id]: value })}
                              label=""
                            />
                          </div>
                          <button
                            onClick={() => reassignTask(task.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setReassigning({ ...reassigning, [task.id]: false })}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
