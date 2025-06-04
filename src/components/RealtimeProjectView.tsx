"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useProjectRealtime, useCollaborativeEditing } from "@/hooks/useRealtimeUpdates";
import { useRealtime, PresenceIndicator, RealtimeStatusIndicator, NotificationBadge } from "@/contexts/RealtimeContext";
import PhaseAssigneeDropdown from "@/components/PhaseAssigneeDropdown";
import TaskAssigneeDropdown from "@/components/TaskAssigneeDropdown";

// Component for real-time task editing
function CollaborativeTaskCard({ 
  projectTask, 
  staffMembers, 
  onTaskUpdate 
}: { 
  projectTask: any, 
  staffMembers: Record<string, string>, 
  onTaskUpdate: () => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    otherUsers,
    startEditing,
    stopEditing,
    hasOtherEditors
  } = useCollaborativeEditing('task', projectTask.id?.toString());

  const handleEditStart = () => {
    setIsEditing(true);
    startEditing();
  };

  const handleEditEnd = () => {
    setIsEditing(false);
    stopEditing();
  };

  const updateTaskAssignee = async (assigneeId: string | number | null) => {
    const stringAssigneeId = assigneeId === null ? null : String(assigneeId);
    
    const { error } = await supabase
      .from("project_tasks")
      .update({ assigned_to: stringAssigneeId })
      .eq("id", projectTask.id);
    
    if (error) {
      console.error('Error updating task assignee:', error);
      alert('Failed to update task assignee: ' + error.message);
    } else {
      onTaskUpdate();
    }
  };

  return (
    <li className={`border rounded-md p-3 bg-white dark:bg-gray-800 shadow-sm relative ${
      hasOtherEditors ? 'ring-2 ring-blue-300' : ''
    }`}>
      {/* Show other users working on this task */}
      {hasOtherEditors && (
        <div className="absolute top-2 right-2">
          <PresenceIndicator 
            taskId={projectTask.id?.toString()} 
            showNames={true}
            className="text-xs"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-white font-medium">
            {projectTask.task?.name || projectTask.task?.title || `Task ${projectTask.task_id}`}
          </span>
          <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {projectTask.status}
          </span>
          {isEditing && (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              Editing...
            </span>
          )}
        </div>
      </div>
      
      {projectTask.task?.description ? (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {projectTask.task.description}
        </div>
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
          No description available
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 w-28">
          Task Assignee:
        </label>
        <div className="w-64">
          <TaskAssigneeDropdown
            value={projectTask.assigned_to || null}
            onChange={async (staffId) => {
              handleEditStart();
              await updateTaskAssignee(staffId);
              handleEditEnd();
            }}
            disabled={projectTask.status === 'completed'}
            onFocus={handleEditStart}
            onBlur={handleEditEnd}
          />
        </div>
        {projectTask.assigned_to && (
          <span className="text-xs text-gray-700 dark:text-gray-300 ml-2">
            Assigned to: {staffMembers[projectTask.assigned_to] || projectTask.assigned_to}
          </span>
        )}
      </div>

      {/* Show collaboration status */}
      {otherUsers.length > 0 && (
        <div className="mt-2 text-xs text-blue-600">
          {otherUsers.length === 1 
            ? `${otherUsers[0].userName} is also viewing this task`
            : `${otherUsers.length} others are viewing this task`
          }
        </div>
      )}
    </li>
  );
}

// Main component with real-time features
export default function RealtimeProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectPhases, setProjectPhases] = useState<any[]>([]);
  const [phaseTasks, setPhaseTasks] = useState<{ [phaseId: string]: any[] }>({});
  const [staffMembers, setStaffMembers] = useState<{ [id: string]: string }>({});

  // Real-time hooks
  const {
    isConnected,
    isProjectSubscribed,
    notifications,
    unreadCount,
    markAsRead,
    usersInProject,
    setActiveTask,
    projectNotifications
  } = useProjectRealtime(id as string);

  // Context for notifications and presence
  const { updatePresenceLocation } = useRealtime();

  // Fetch project data
  const fetchProject = async () => {
    if (!id) return;
    
    setLoading(true);
    console.log('Fetching project with ID:', id);
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    
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
  };

  // Fetch staff members
  const fetchStaffMembers = async () => {
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
  };

  // Fetch phases and tasks
  const fetchPhasesAndTasks = async () => {
    if (!id) return;
    
    try {
      console.log(`Fetching phases for project ${id}`);
      const { data: projectPhasesData, error: projectPhasesError } = await supabase
        .from("project_phases")
        .select("*, phases(*)")
        .eq("project_id", id);
      
      if (projectPhasesError) {
        console.error('Error fetching project phases:', projectPhasesError);
        setProjectPhases([]);
      } else {
        console.log(`Found ${projectPhasesData?.length || 0} phases for project ${id}`);
        setProjectPhases(projectPhasesData || []);
        
        // Fetch tasks for each phase
        const phaseTasksObj: { [phaseId: string]: any[] } = {};
        for (const phase of projectPhasesData || []) {
          const { data: projectTasksData, error: projectTasksError } = await supabase
            .from("project_tasks")
            .select(`
              *,
              tasks(*)
            `)
            .eq("project_phase_id", phase.id);
          
          if (projectTasksError) {
            console.error(`Error fetching project tasks for phase ${phase.id}:`, projectTasksError);
            phaseTasksObj[phase.id] = [];
          } else {
            phaseTasksObj[phase.id] = projectTasksData || [];
          }
        }
        setPhaseTasks(phaseTasksObj);
      }
    } catch (error) {
      console.error('Error in fetchPhasesAndTasks:', error);
    }
  };

  // Update phase assignee
  const updatePhaseAssignee = async (phaseId: string, assigneeId: string | null) => {
    if (!phaseId) return;
    
    const { error } = await supabase
      .from("project_phases")
      .update({ assigned_to: assigneeId })
      .eq("id", phaseId);
      
    if (error) {
      console.error('Error updating phase assignee:', error);
      alert('Failed to update phase assignee: ' + error.message);
    }
  };

  // Initialize data
  useEffect(() => {
    if (id) {
      fetchProject();
      fetchPhasesAndTasks();
      fetchStaffMembers();
      
      // Update presence to show user is viewing this project
      updatePresenceLocation({ projectId: id as string });
    }
  }, [id, updatePresenceLocation]);

  // Handle notifications
  useEffect(() => {
    if (projectNotifications.length > 0) {
      console.log('New project notifications:', projectNotifications);
      // Auto-refresh data when there are new notifications
      fetchPhasesAndTasks();
    }
  }, [projectNotifications]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-red-500">
        Project not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Header with real-time indicators */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {project.project_name || project.name || `Project #${project.id}`}
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Notification badge */}
          <div className="relative">
            <button 
              onClick={() => markAsRead()}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              title={`${unreadCount} unread notifications`}
            >
              🔔
              <NotificationBadge className="absolute -top-1 -right-1" />
            </button>
          </div>
          
          {/* Presence indicator */}
          <PresenceIndicator 
            projectId={id as string} 
            showNames={true}
            className="bg-blue-50 px-3 py-1 rounded-full"
          />
          
          {/* Connection status */}
          <RealtimeStatusIndicator className="text-sm" />
        </div>
      </div>

      {/* Real-time notifications banner */}
      {projectNotifications.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Recent Updates ({projectNotifications.length})
              </h3>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {projectNotifications.slice(0, 3).map((notification, index) => (
                  <div key={index} className="mb-1">
                    • {notification.type.replace('_', ' ')}: {notification.data?.taskTitle || 'Update'}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => markAsRead()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Mark all read
            </button>
          </div>
        </div>
      )}

      {/* Collaboration indicator */}
      {usersInProject.length > 0 && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              👥 {usersInProject.length} team member{usersInProject.length !== 1 ? 's' : ''} viewing this project:
            </span>
            <div className="flex gap-2">
              {usersInProject.map(user => (
                <span key={user.userId} className="text-sm text-green-700 dark:text-green-300">
                  {user.userName}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project details */}
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
        </div>
      </div>

      {/* Project workflow with real-time updates */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Project Workflow</h2>
          <div className="flex items-center gap-2">
            {isProjectSubscribed ? (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                ⚡ Live Updates
              </span>
            ) : (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                Static View
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View and manage project phases and tasks with real-time collaboration features.
        </p>
      </div>

      {/* Project phases */}
      {projectPhases.length === 0 ? (
        <div className="text-gray-500">No phases assigned to this project.</div>
      ) : (
        <div className="space-y-6">
          {projectPhases.map((projPhase: any) => (
            <div key={projPhase.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 relative">
              {/* Phase header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    {projPhase.phases?.name || projPhase.phase?.name || 'Unnamed Phase'}
                  </span>
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Status: {projPhase.status}
                  </span>
                </div>
                <PresenceIndicator 
                  projectId={id as string}
                  className="text-xs"
                />
              </div>

              <div className="mb-2 text-gray-600 dark:text-gray-300">
                {projPhase.phase?.description}
              </div>

              {/* Phase assignee */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 w-28">
                    Phase Assignee:
                  </label>
                  <div className="w-64">
                    <PhaseAssigneeDropdown
                      value={projPhase.assigned_to || null}
                      onChange={async (staffId) => {
                        const typedStaffId = staffId === null ? null : String(staffId);
                        await updatePhaseAssignee(projPhase.id, typedStaffId);
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

              {/* Tasks */}
              <div className="mb-4">
                <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tasks
                </h3>
                {!phaseTasks[projPhase.id] || phaseTasks[projPhase.id].length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                    <p className="text-sm">No tasks found for this phase.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {(phaseTasks[projPhase.id] || []).map((pt: any) => (
                      <CollaborativeTaskCard
                        key={pt.id}
                        projectTask={pt}
                        staffMembers={staffMembers}
                        onTaskUpdate={fetchPhasesAndTasks}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:underline"
        >
          ← Back to Projects
        </button>
      </div>
    </div>
  );
}