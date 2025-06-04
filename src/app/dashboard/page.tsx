"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
// import { format } from "date-fns";

const KPI_CONFIG = [
  { label: "Projects", table: "projects", link: "/projects" },
  { label: "Contacts", table: "contacts", link: "/contacts" },
  { label: "Contractors", table: "contractors", link: "/contractors" },
  { label: "Stock Items", table: "stock_items", link: "/stock_items" },
  { label: "Locations", table: "locations", link: "/locations" },
  { label: "Customers", table: "customers", link: "/customers" },
];

type KPI = {
  label: string;
  count: number;
};

type Project = {
  id: string;
  project_name?: string;
  created_at?: string;
  customer_id?: string;
  start_date?: string;
  location_id?: string;
  region?: string;
  current_phase?: string;
};

type StockMovement = {
  id: string;
  type?: string;
  created_at?: string;
};

type StaffMember = {
  id: string;
  name: string;
  tasks_assigned: number;
  tasks_completed: number;
};

type TaskStats = {
  completed_today: number;
  most_outstanding: StaffMember | null;
  most_completed: StaffMember | null;
};

type ProjectSummary = {
  id: string;
  name: string;
  current_phase: string;
  pending_tasks: Array<{
    id: number;
    name: string;
    assignee: string;
    days_assigned: number;
    delay_reason?: string;
  }>;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentStockMovements, setRecentStockMovements] = useState<StockMovement[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    completed_today: 0,
    most_outstanding: null,
    most_completed: null
  });
  const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>([]);
  const [staffMembers, setStaffMembers] = useState<{[id: string]: string}>({});

  // formatDate helper function available if needed
  // const formatDate = (date: string | undefined) => {
  //   if (!date) return 'N/A';
  //   return format(new Date(date), 'dd MMM yyyy');
  // };

  async function fetchKPIs() {
    const results = await Promise.all(
      KPI_CONFIG.map(async ({ label, table }) => {
        const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
        return { label, count: count || 0 };
      })
    );
    setKpis(results);
  }

  async function fetchRecentProjects() {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, project_name, created_at, start_date, location_id, region")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentProjects(projects || []);
  }

  async function fetchRecentStockMovements() {
    try {
      const { data: stockMovements } = await supabase
        .from("stock_items")
        .select("id, created_at, name")
        .order("created_at", { ascending: false })
        .limit(5);
      
      // Transform the data to match expected structure
      const formattedData = stockMovements?.map(item => ({
        id: item.id,
        created_at: item.created_at,
        type: item.name ? 'IN' : 'Unknown'
      })) || [];
      
      setRecentStockMovements(formattedData);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      setRecentStockMovements([]);
    }
  }

  async function fetchStaffMembers() {
    try {
      const { data: staff, error } = await supabase
        .from('staff')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching staff members:', error);
        return;
      }

      // Create a map of staff IDs to names
      const staffMap: {[id: string]: string} = {};
      staff?.forEach(member => {
        staffMap[member.id] = member.name;
      });
      setStaffMembers(staffMap);
    } catch (error) {
      console.error('Error in fetchStaffMembers:', error);
    }
  }

  async function fetchTaskStats(staffMap: {[id: string]: string}) {
    try {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Count tasks completed today
      const { count: completedToday, error: completedError } = await supabase
        .from('project_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('updated_at', `${today}T00:00:00`)
        .lte('updated_at', `${today}T23:59:59`);
      
      if (completedError) {
        console.error('Error fetching completed tasks:', completedError);
      }

      // 2. Get staff with most outstanding tasks
      const { data: tasksByAssignee, error: assigneeError } = await supabase
        .from('project_tasks')
        .select('assigned_to, status')
        .not('assigned_to', 'is', null)
        .in('status', ['not_started', 'pending', 'in_progress']);

      if (assigneeError) {
        console.error('Error fetching tasks by assignee:', assigneeError);
      }

      // 3. Get staff with most completed tasks
      const { data: completedByAssignee, error: completedByError } = await supabase
        .from('project_tasks')
        .select('assigned_to')
        .not('assigned_to', 'is', null)
        .eq('status', 'completed');

      if (completedByError) {
        console.error('Error fetching completed tasks by assignee:', completedByError);
      }

      // Process the data to find who has most outstanding and most completed tasks
      const outstandingCounts: {[key: string]: number} = {};
      const completedCounts: {[key: string]: number} = {};

      tasksByAssignee?.forEach(task => {
        const assignee = task.assigned_to as string;
        outstandingCounts[assignee] = (outstandingCounts[assignee] || 0) + 1;
      });

      completedByAssignee?.forEach(task => {
        const assignee = task.assigned_to as string;
        completedCounts[assignee] = (completedCounts[assignee] || 0) + 1;
      });

      // Find the staff with most outstanding tasks
      let mostOutstandingId = '';
      let mostOutstandingCount = 0;
      Object.entries(outstandingCounts).forEach(([id, count]) => {
        if (count > mostOutstandingCount) {
          mostOutstandingId = id;
          mostOutstandingCount = count;
        }
      });

      // Find the staff with most completed tasks
      let mostCompletedId = '';
      let mostCompletedCount = 0;
      Object.entries(completedCounts).forEach(([id, count]) => {
        if (count > mostCompletedCount) {
          mostCompletedId = id;
          mostCompletedCount = count;
        }
      });

      // Update task stats
      setTaskStats({
        completed_today: completedToday || 0,
        most_outstanding: mostOutstandingId && staffMap[mostOutstandingId] ? {
          id: mostOutstandingId,
          name: staffMap[mostOutstandingId],
          tasks_assigned: mostOutstandingCount,
          tasks_completed: completedCounts[mostOutstandingId] || 0
        } : null,
        most_completed: mostCompletedId && staffMap[mostCompletedId] ? {
          id: mostCompletedId,
          name: staffMap[mostCompletedId],
          tasks_completed: mostCompletedCount,
          tasks_assigned: outstandingCounts[mostCompletedId] || 0
        } : null
      });
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  }

  async function fetchProjectSummaries(staffMap: {[id: string]: string}) {
    try {
      // 1. Get all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, project_name');

      if (projectsError) {
        console.error('Error fetching projects:', {
          message: projectsError.message,
          details: projectsError.details,
          hint: projectsError.hint,
          code: projectsError.code
        });
        return;
      }

      // 2. For each project, get current phase and pending tasks
      const summaries: ProjectSummary[] = [];

      for (const project of projects || []) {
        try {
          // Get project phases
          const { data: phases, error: phasesError } = await supabase
            .from('project_phases')
            .select('id, phase_id, status, phase:phases(name)')
            .eq('project_id', project.id);

          if (phasesError) {
            console.error(`Error fetching phases for project ${project.id}:`, {
              message: phasesError.message,
              details: phasesError.details,
              hint: phasesError.hint,
              code: phasesError.code
            });
            continue;
          }

          // Find the current phase (first non-completed phase)
          const currentPhase = phases?.find(p => p.status === 'in_progress' || p.status === 'active') || phases?.[0];
          // Safely access the phase name using type assertion
          const phaseName = currentPhase?.phase as unknown as { name: string } | null;
          const currentPhaseName = phaseName?.name || 'No active phase';

          // Get pending tasks for this project
          const phaseIds = phases?.map(p => p.id) || [];
          if (phaseIds.length === 0) {
            console.log(`No phases found for project ${project.id}, skipping task fetch`);
            // Still add the project summary without tasks
            summaries.push({
              id: project.id,
              name: project.project_name || 'Unnamed Project',
              current_phase: 'No active phase',
              pending_tasks: []
            });
            continue;
          }

          const { data: tasks, error: tasksError } = await supabase
            .from('project_tasks')
            .select('id, task_id, status, assigned_to, created_at, updated_at')
            .in('project_phase_id', phaseIds)
            .in('status', ['not_started', 'pending', 'in_progress']);

          if (tasksError) {
            console.error(`Error fetching tasks for project ${project.id}:`, {
              message: tasksError.message,
              details: tasksError.details,
              hint: tasksError.hint,
              code: tasksError.code
            });
            continue;
          }

          // Process tasks to get days assigned and assignee info
          const pendingTasks = tasks?.map(task => {
            // Calculate days since assignment
            const assignedDate = task.created_at ? new Date(task.created_at) : new Date();
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - assignedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              id: task.id,
              name: `Task #${task.task_id || task.id}`,
              assignee: task.assigned_to ? (staffMap[task.assigned_to] || 'Unknown') : 'Unassigned',
              days_assigned: diffDays,
              delay_reason: diffDays > 7 ? 'Requires follow-up' : undefined
            };
          }) || [];

          summaries.push({
            id: project.id,
            name: project.project_name || `Project #${project.id}`,
            current_phase: currentPhaseName,
            pending_tasks: pendingTasks
          });
        } catch (projectError) {
          console.error(`Error processing project ${project.id}:`, projectError);
          // Add project with minimal info on error
          summaries.push({
            id: project.id,
            name: project.project_name || `Project #${project.id}`,
            current_phase: 'Error loading phase',
            pending_tasks: []
          });
        }
      }

      setProjectSummaries(summaries);
    } catch (error) {
      console.error('Error fetching project summaries:', error);
    }
  }

  useEffect(() => {
    fetchKPIs();
    fetchRecentProjects();
    fetchRecentStockMovements();
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    // Re-fetch task stats and project summaries when staff members are loaded
    if (Object.keys(staffMembers).length > 0) {
      fetchTaskStats(staffMembers);
      fetchProjectSummaries(staffMembers);
    }
  }, [staffMembers]);

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h1 className="ff-page-title">Dashboard</h1>
        <p className="ff-page-subtitle">Overview of your projects and activities</p>
      </div>

      {/* Task Statistics Cards */}
      <section className="ff-section">
        <h2 className="ff-section-title">Task Statistics</h2>
        <div className="ff-grid-cards">
          {/* Tasks Completed Today */}
          <div className="ff-card-stats">
            <h3 className="ff-stat-label">Tasks Completed Today</h3>
            <div className="ff-stat-value">{taskStats.completed_today}</div>
          </div>

          {/* Most Outstanding Tasks */}
          <div className="ff-card-stats">
            <h3 className="ff-stat-label">Most Outstanding Tasks</h3>
            {taskStats.most_outstanding ? (
              <>
                <div className="ff-stat-value">{taskStats.most_outstanding.tasks_assigned}</div>
                <p className="ff-muted-text mt-1">Assignee: {taskStats.most_outstanding.name}</p>
              </>
            ) : (
              <div className="ff-stat-value">0</div>
            )}
          </div>

          {/* Most Completed Tasks */}
          <div className="ff-card-stats">
            <h3 className="ff-stat-label">Most Completed Tasks</h3>
            {taskStats.most_completed ? (
              <>
                <div className="ff-stat-value">{taskStats.most_completed.tasks_completed}</div>
                <p className="ff-muted-text mt-1">Assignee: {taskStats.most_completed.name}</p>
              </>
            ) : (
              <div className="ff-stat-value">0</div>
            )}
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="ff-section">
        <h2 className="ff-section-title">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => {
            const config = KPI_CONFIG[idx];
            if (!config) return null;
            
            const cardContent = (
              <>
                <div className="w-full">
                  <h3 className="ff-stat-label">{kpi.label}</h3>
                  <div className="ff-stat-value">{kpi.count}</div>
                </div>
              </>
            );
            
            // All cards are now clickable - using Link instead of a
            return (
              <Link 
                key={kpi.label} 
                href={config.link || `/${config.table}`} 
                className="ff-card cursor-pointer"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Project Summaries */}
      <section className="ff-section">
        <div className="flex justify-between items-center mb-6">
          <h2 className="ff-section-title mb-0">Project Summaries</h2>
          <Link href="/projects" className="ff-secondary-text hover:underline">View All Projects</Link>
        </div>
        
        <div className="ff-grid-cards">
          {projectSummaries.map(project => (
            <div key={project.id} className="ff-card">
              <Link href={`/projects/${project.id}`} className="ff-card-title hover:text-blue-600">
                {project.name}
              </Link>
              
              <div className="mt-3 flex items-center">
                <span className="ff-muted-text">Current Phase:</span>
                <span className="ml-2 ff-status-planning">
                  {project.current_phase}
                </span>
              </div>
              
              <div className="mt-4">
                <h4 className="ff-secondary-text font-medium mb-2">Pending Tasks</h4>
                {project.pending_tasks.length > 0 ? (
                  <ul className="space-y-3">
                    {project.pending_tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="text-sm">
                        <div className="flex justify-between">
                          <span className="ff-body-text font-medium">{task.name}</span>
                          <span className="ff-muted-text">{task.days_assigned} days</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="ff-muted-text">Assignee: {task.assignee}</span>
                          {task.delay_reason && (
                            <span className="text-xs text-red-500">{task.delay_reason}</span>
                          )}
                        </div>
                      </li>
                    ))}
                    {project.pending_tasks.length > 3 && (
                      <li className="ff-muted-text italic">
                        +{project.pending_tasks.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="ff-secondary-text">No pending tasks</p>
                )}
              </div>
            </div>
          ))}
          
          {projectSummaries.length === 0 && (
            <div className="col-span-full ff-card text-center">
              <p className="ff-secondary-text">No projects found</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="ff-section">
        <h2 className="ff-section-title">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/projects" className="ff-card cursor-pointer block">
            <div className="flex justify-between items-center mb-4">
              <h3 className="ff-card-title">Recent Projects</h3>
              <span className="ff-secondary-text">View all</span>
            </div>
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="ff-secondary-text">No recent projects found</p>
                <button className="mt-3 ff-button-primary">
                  Create Project
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentProjects.map((proj) => (
                  <div key={proj.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="ff-body-text font-medium">{proj.project_name || `Project #${proj.id}`}</h4>
                      <p className="ff-muted-text">{proj.created_at?.slice(0, 10)}</p>
                    </div>
                    <span className="ff-muted-text">View</span>
                  </div>
                ))}
              </div>
            )}
          </Link>

          <Link href="/stock_items" className="ff-card cursor-pointer block">
            <div className="flex justify-between items-center mb-4">
              <h3 className="ff-card-title">Stock Items</h3>
              <span className="ff-secondary-text">View all</span>
            </div>
            {recentStockMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="ff-secondary-text">No stock items found</p>
                <button className="mt-3 ff-button-primary">
                  Manage Stock Items
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentStockMovements.map((move) => (
                  <div key={move.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="ff-body-text font-medium">{move.type || `Movement #${move.id}`}</h4>
                      <p className="ff-muted-text">{move.created_at?.slice(0, 10)}</p>
                    </div>
                    <span className="ff-status-active">
                      {move.type === 'IN' ? 'Received' : 'Shipped'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Link>
        </div>
      </section>
    </div>
  );
}