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
    return (
      <div className="ff-page-container">
        <div className="ff-card text-center">
          <p className="ff-secondary-text">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h1 className="ff-page-title">My Tasks</h1>
        <p className="ff-page-subtitle">Manage and complete your assigned tasks</p>
      </div>
      
      {newlyAssignedTask && (
        <div className="ff-card mb-6 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="ff-heading-medium text-blue-900">New Task Automatically Assigned!</h3>
              <p className="ff-secondary-text text-blue-700 mt-1">
                The next task in the sequence has been assigned to you. You can reassign it to another team member if needed.
              </p>
            </div>
            <button
              onClick={() => setNewlyAssignedTask(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="ff-card text-center">
          <p className="ff-secondary-text">Loading your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="ff-card text-center">
          <p className="ff-secondary-text">You don&apos;t have any tasks assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`ff-card ${
                newlyAssignedTask === task.id 
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' 
                  : ''
              }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="ff-card-title">{task.task.title || task.task.name || `Task ${task.task_id}`}</h3>
                    {newlyAssignedTask === task.id && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">New</span>
                    )}
                  </div>
                  <p className="ff-secondary-text mt-1">
                    Project: <Link href={`/projects/${task.project_phase.project.id}`} className="text-blue-600 hover:underline font-medium">
                      {task.project_phase.project.project_name}
                    </Link>
                  </p>
                  <p className="ff-secondary-text">
                    Phase: {task.project_phase.phase.name}
                  </p>
                  {task.task.description && (
                    <p className="mt-2 ff-body-text">{task.task.description}</p>
                  )}
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      task.status === "completed" ? "ff-status-completed" :
                      task.status === "in_progress" ? "ff-status-active" :
                      "ff-status-pending"
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
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Complete
                      </button>
                      
                      {!reassigning[task.id] ? (
                        <button
                          onClick={() => startReassign(task.id)}
                          className="ff-button-primary"
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
                            className="ff-button-primary"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setReassigning({ ...reassigning, [task.id]: false })}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
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
