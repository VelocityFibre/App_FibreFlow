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

interface StaffMember {
  id: string;
  name: string;
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [reassigning, setReassigning] = useState<Record<string, boolean>>({});
  const [newAssignees, setNewAssignees] = useState<Record<string, string | null>>({});
  const [newlyAssignedTask, setNewlyAssignedTask] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Get tasks assigned to the selected staff member (or current user if none selected)
      const targetUserId = selectedStaffId || currentUser;
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
        .eq("assigned_to", targetUserId)
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
  }, [currentUser, selectedStaffId]);

  useEffect(() => {
    // Load staff members and set current user
    async function loadStaffAndUser() {
      // Get all staff members for the dropdown
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, name")
        .order("name");
      
      if (staffData) {
        setStaffMembers(staffData);
        // Set first staff member as current user (demo)
        if (staffData.length > 0) {
          setCurrentUser(staffData[0].id);
          setSelectedStaffId(staffData[0].id); // Default to current user
        }
      }
    }
    
    loadStaffAndUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser, selectedStaffId, fetchTasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown && !(event.target as Element).closest('.user-selector')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);


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
      fetchTasks();
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
      fetchTasks();
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
      {/* Clean Page Header */}
      <div className="ff-page-header">
        <h1 className="ff-page-title">My Tasks</h1>
        <p className="ff-page-subtitle">Manage and complete your assigned tasks across all projects</p>
      </div>

      {/* User Selection Section */}
      <section className="ff-section">
        <div className="relative user-selector">
          <label className="ff-label mb-4 block">View Tasks For</label>
          <div className="relative max-w-full">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-full ff-card text-left flex items-center justify-between p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className={`w-4 h-4 rounded-full ${
                  selectedStaffId === currentUser ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-2xl font-light text-foreground mb-2">
                    👤 {staffMembers.find(s => s.id === selectedStaffId)?.name || 'Loading...'} 
                    {selectedStaffId === currentUser ? ' (You)' : ''}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-lg">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      selectedStaffId === currentUser ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedStaffId === currentUser ? 'Your Tasks' : 'Team Member'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned</span>
                    <span className="text-muted-foreground">•</span>
                    <span>Task Management</span>
                  </div>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => {
                      setSelectedStaffId(staff.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left p-8 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                      staff.id === selectedStaffId ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${
                        staff.id === currentUser ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-xl font-light text-foreground mb-2">
                          {staff.id === currentUser ? '👤' : '👥'} {staff.name}
                          {staff.id === currentUser ? ' (You)' : ''}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-4">
                          <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                            staff.id === currentUser ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {staff.id === currentUser ? 'Your Tasks' : 'Team Member'}
                          </span>
                          <span>•</span>
                          <span>Staff Member</span>
                          <span>•</span>
                          <span>Task Assignment</span>
                        </div>
                      </div>
                      {staff.id === selectedStaffId && (
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

      
      {/* Tasks Section */}
      <div className="ff-section">

        {newlyAssignedTask && (
          <div className="ff-card mb-8 bg-blue-50 border-blue-200">
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
          <div className="ff-card text-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-4"></div>
            <p className="ff-secondary-text">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="ff-card text-center p-12">
            <div className="text-gray-300 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-2">No Tasks Assigned</h3>
            <p className="ff-secondary-text max-w-md mx-auto">
              {selectedStaffId === currentUser 
                ? "You don't have any tasks assigned to you at the moment." 
                : "This team member doesn't have any tasks assigned to them."}
            </p>
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="ff-card-title">{task.task.title || task.task.name || `Task ${task.task_id}`}</h3>
                    {newlyAssignedTask === task.id && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">New</span>
                    )}
                    <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      task.status === "completed" ? "ff-status-completed" :
                      task.status === "in_progress" ? "ff-status-active" :
                      "ff-status-pending"
                    }`}>
                      {task.status === "not_started" ? "Not Started" :
                       task.status === "in_progress" ? "In Progress" :
                       "Completed"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <p className="ff-secondary-text">
                      <strong>Project:</strong> <Link href={`/projects/${task.project_phase.project.id}`} className="text-blue-600 hover:underline font-medium">
                        {task.project_phase.project.project_name}
                      </Link>
                    </p>
                    <p className="ff-secondary-text">
                      <strong>Phase:</strong> {task.project_phase.phase.name}
                    </p>
                  </div>

                  {task.task.description && (
                    <div className="ff-body-text p-3 bg-gray-50 rounded-lg mb-4">
                      {task.task.description}
                    </div>
                  )}
                </div>

                {task.status !== "completed" && (
                  <div className="flex gap-3 ml-6">
                    <button
                      onClick={() => completeTask(task.id)}
                      className="ff-button-primary bg-green-500 hover:bg-green-600"
                    >
                      ✓ Complete
                    </button>
                    
                    {!reassigning[task.id] ? (
                      <button
                        onClick={() => startReassign(task.id)}
                        className="ff-button-primary"
                      >
                        Reassign
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-48">
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
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ff-body-text"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
