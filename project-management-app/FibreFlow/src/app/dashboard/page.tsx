"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { format } from "date-fns";

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
  name?: string;
  project_name?: string;
  created_at?: string;
  customer_id?: string;
  start_date?: string;
  location_id?: string;
  province?: string;
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

  // Using format from date-fns for formatting dates
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd MMM yyyy');
  };

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
      .select("id, name, project_name, created_at, start_date, location_id, province, region")
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
        .select('id, name, project_name');

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return;
      }

      // 2. For each project, get current phase and pending tasks
      const summaries: ProjectSummary[] = [];

      for (const project of projects || []) {
        // Get project phases
        const { data: phases, error: phasesError } = await supabase
          .from('project_phases')
          .select('id, phase_id, status, phase:phases(name)')
          .eq('project_id', project.id);

        if (phasesError) {
          console.error(`Error fetching phases for project ${project.id}:`, phasesError);
          continue;
        }

        // Find the current phase (first non-completed phase)
        const currentPhase = phases?.find(p => p.status === 'in_progress' || p.status === 'active') || phases?.[0];
        // Safely access the phase name using type assertion
        const phaseName = currentPhase?.phase as unknown as { name: string } | null;
        const currentPhaseName = phaseName?.name || 'No active phase';

        // Get pending tasks for this project
        const phaseIds = phases?.map(p => p.id) || [];
        if (phaseIds.length === 0) continue;

        const { data: tasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select('id, task_id, status, assigned_to, created_at, updated_at, task:tasks(name, title)')
          .in('project_phase_id', phaseIds)
          .in('status', ['not_started', 'pending', 'in_progress']);

        if (tasksError) {
          console.error(`Error fetching tasks for project ${project.id}:`, tasksError);
          continue;
        }

        // Process tasks to get days assigned and assignee info
        const pendingTasks = tasks?.map(task => {
          // Calculate days since assignment
          const assignedDate = task.created_at ? new Date(task.created_at) : new Date();
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - assignedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Safely access task name/title
          const taskObj = task.task as { name?: string; title?: string } | undefined;
          const taskName = taskObj?.name || taskObj?.title || `Task #${task.task_id}`;

          return {
            id: task.id,
            name: taskName,
            assignee: task.assigned_to ? (staffMap[task.assigned_to] || 'Unknown') : 'Unassigned',
            days_assigned: diffDays,
            delay_reason: diffDays > 7 ? 'Requires follow-up' : undefined
          };
        }) || [];

        summaries.push({
          id: project.id,
          name: project.name || project.project_name || `Project #${project.id}`,
          current_phase: currentPhaseName,
          pending_tasks: pendingTasks
        });
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
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your projects and activities</p>
        </div>
      </div>

      {/* Task Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tasks Completed Today */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed Today</h3>
          <div className="mt-2">
            <span className="text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.completed_today}</span>
          </div>
        </div>

        {/* Most Outstanding Tasks */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Outstanding Tasks</h3>
          <div className="mt-2">
            {taskStats.most_outstanding ? (
              <>
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.most_outstanding.tasks_assigned}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assignee: {taskStats.most_outstanding.name}</p>
              </>
            ) : (
              <span className="text-3xl font-semibold text-gray-900 dark:text-white">0</span>
            )}
          </div>
        </div>

        {/* Most Completed Tasks */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Completed Tasks</h3>
          <div className="mt-2">
            {taskStats.most_completed ? (
              <>
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{taskStats.most_completed.tasks_completed}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assignee: {taskStats.most_completed.name}</p>
              </>
            ) : (
              <span className="text-3xl font-semibold text-gray-900 dark:text-white">0</span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const config = KPI_CONFIG[idx];
          if (!config) return null;
          
          const cardContent = (
            <>
              <div className="w-full">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-semibold text-gray-900 dark:text-white">{kpi.count}</span>
                </div>
              </div>
            </>
          );
          
          // All cards are now clickable - using Link instead of a
          return (
            <Link 
              key={kpi.label} 
              href={config.link || `/${config.table}`} 
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Project Summaries */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Summaries</h3>
          <Link href="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All Projects</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectSummaries.map(project => (
            <div key={project.id} className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
              <Link href={`/projects/${project.id}`} className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                {project.name}
              </Link>
              
              <div className="mt-3 flex items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Phase:</span>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                  {project.current_phase}
                </span>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pending Tasks</h4>
                {project.pending_tasks.length > 0 ? (
                  <ul className="space-y-3">
                    {project.pending_tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{task.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{task.days_assigned} days</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Assignee: {task.assignee}</span>
                          {task.delay_reason && (
                            <span className="text-xs text-red-500">{task.delay_reason}</span>
                          )}
                        </div>
                      </li>
                    ))}
                    {project.pending_tasks.length > 3 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                        +{project.pending_tasks.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No pending tasks</p>
                )}
              </div>
            </div>
          ))}
          
          {projectSummaries.length === 0 && (
            <div className="col-span-full p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-center">
              <p className="text-gray-500 dark:text-gray-400">No projects found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Link href="/projects" className="lg:col-span-2 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Project Progress</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Weekly</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md">Monthly</button>
            </div>
          </div>
          <div className="h-64 w-full flex items-end justify-between px-2">
            {/* Simulated chart bars */}
            <div className="flex flex-col items-center">
              <div className="h-32 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Jan</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-48 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Feb</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Mar</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-56 w-12 bg-gray-900 dark:bg-gray-100 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Apr</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-40 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">May</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Jun</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Jul</span>
            </div>
          </div>
        </Link>

        <Link href="/projects" className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-6">Project Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">65%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">25%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">10%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/projects" className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 block">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent Projects</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">View all</span>
          </div>
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No recent projects found</p>
              <span className="mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-md transition-colors inline-block">
                Create Project
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentProjects.map((proj) => (
                <div key={proj.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{proj.name || proj.project_name || `Project #${proj.id}`}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{proj.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">View</span>
                </div>
              ))}
            </div>
          )}
        </Link>

        <Link href="/stock_items" className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 block">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Stock Items</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">View all</span>
          </div>
          {recentStockMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No stock items found</p>
              <span className="mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-md transition-colors inline-block">
                Manage Stock Items
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentStockMovements.map((move) => (
                <div key={move.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{move.type || `Movement #${move.id}`}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{move.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {move.type === 'IN' ? 'Received' : 'Shipped'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}