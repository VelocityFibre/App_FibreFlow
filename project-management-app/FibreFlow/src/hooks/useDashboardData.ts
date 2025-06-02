import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { FeatureFlag, isFeatureEnabled } from '@/lib/feature-flags';
import { shouldUseReactQuery } from '@/lib/react-query';

// Types based on the current dashboard implementation
export type KPI = {
  label: string;
  count: number;
};

export type Project = {
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

export type StockMovement = {
  id: string;
  type?: string;
  created_at?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  tasks_assigned: number;
  tasks_completed: number;
};

export type TaskStats = {
  completed_today: number;
  most_outstanding: StaffMember | null;
  most_completed: StaffMember | null;
};

export type ProjectSummary = {
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

// KPI configuration from the dashboard
const KPI_CONFIG = [
  { label: "Projects", table: "projects", link: "/projects" },
  { label: "Contacts", table: "contacts", link: "/contacts" },
  { label: "Contractors", table: "contractors", link: "/contractors" },
  { label: "Stock Items", table: "stock_items", link: "/stock_items" },
  { label: "Locations", table: "locations", link: "/locations" },
  { label: "Customers", table: "customers", link: "/customers" },
];

// Optimized function to fetch KPIs
async function fetchKPIs(): Promise<KPI[]> {
  const results = await Promise.all(
    KPI_CONFIG.map(async ({ label, table }) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error(`Error fetching KPI for ${label}:`, error);
        throw error;
      }
      
      return { label, count: count || 0 };
    })
  );
  
  return results;
}

// Optimized function to fetch recent projects
async function fetchRecentProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, project_name, created_at, start_date, location_id, province, region")
    .order("created_at", { ascending: false })
    .limit(5);
  
  if (error) {
    console.error("Error fetching recent projects:", error);
    throw error;
  }
  
  return data || [];
}

// Optimized function to fetch recent stock movements
async function fetchRecentStockMovements(): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from("stock_items")
    .select("id, created_at, name")
    .order("created_at", { ascending: false })
    .limit(5);
  
  if (error) {
    console.error("Error fetching stock movements:", error);
    throw error;
  }
  
  // Transform the data to match expected structure
  const formattedData = data?.map(item => ({
    id: item.id,
    created_at: item.created_at,
    type: item.name ? 'IN' : 'Unknown'
  })) || [];
  
  return formattedData;
}

// Optimized function to fetch staff members
async function fetchStaffMembers(): Promise<{[id: string]: string}> {
  const { data, error } = await supabase
    .from('staff')
    .select('id, name');
  
  if (error) {
    console.error('Error fetching staff members:', error);
    throw error;
  }
  
  // Create a map of staff IDs to names
  const staffMap: {[id: string]: string} = {};
  data?.forEach(member => {
    staffMap[member.id] = member.name;
  });
  
  return staffMap;
}

// Optimized function to fetch task stats
async function fetchTaskStats(staffMap: {[id: string]: string}): Promise<TaskStats> {
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
    throw completedError;
  }
  
  // 2. Get staff with most outstanding tasks
  const { data: tasksByAssignee, error: assigneeError } = await supabase
    .from('project_tasks')
    .select('assigned_to, status')
    .not('assigned_to', 'is', null)
    .in('status', ['not_started', 'pending', 'in_progress']);
  
  if (assigneeError) {
    console.error('Error fetching tasks by assignee:', assigneeError);
    throw assigneeError;
  }
  
  // 3. Get staff with most completed tasks
  const { data: completedByAssignee, error: completedByError } = await supabase
    .from('project_tasks')
    .select('assigned_to')
    .not('assigned_to', 'is', null)
    .eq('status', 'completed');
  
  if (completedByError) {
    console.error('Error fetching completed tasks by assignee:', completedByError);
    throw completedByError;
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
  
  return {
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
  };
}

// Hook that works with or without React Query based on feature flag
export function useDashboardData() {
  // States for traditional approach
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentStockMovements, setRecentStockMovements] = useState<StockMovement[]>([]);
  const [staffMembers, setStaffMembers] = useState<{[id: string]: string}>({});
  const [taskStats, setTaskStats] = useState<TaskStats>({
    completed_today: 0,
    most_outstanding: null,
    most_completed: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if we should use optimized queries
  const useOptimizedQueries = isFeatureEnabled(FeatureFlag.OPTIMIZED_PROJECT_QUERIES);
  
  // Only use React Query if both flags are enabled
  const useReactQueryForDashboard = shouldUseReactQuery() && useOptimizedQueries;
  
  // React Query implementations
  const kpisQuery = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: fetchKPIs,
    enabled: useReactQueryForDashboard,
  });
  
  const projectsQuery = useQuery({
    queryKey: ['dashboard', 'recentProjects'],
    queryFn: fetchRecentProjects,
    enabled: useReactQueryForDashboard,
  });
  
  const stockMovementsQuery = useQuery({
    queryKey: ['dashboard', 'recentStockMovements'],
    queryFn: fetchRecentStockMovements,
    enabled: useReactQueryForDashboard,
  });
  
  const staffMembersQuery = useQuery({
    queryKey: ['dashboard', 'staffMembers'],
    queryFn: fetchStaffMembers,
    enabled: useReactQueryForDashboard,
  });
  
  const taskStatsQuery = useQuery({
    queryKey: ['dashboard', 'taskStats', staffMembersQuery.data],
    queryFn: () => fetchTaskStats(staffMembersQuery.data || {}),
    enabled: useReactQueryForDashboard && !!staffMembersQuery.data,
  });
  
  // Traditional fetch implementation
  useEffect(() => {
    if (!useReactQueryForDashboard) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch all data in parallel
          const [kpisData, projectsData, stockMovementsData, staffMembersData] = await Promise.all([
            fetchKPIs(),
            fetchRecentProjects(),
            fetchRecentStockMovements(),
            fetchStaffMembers(),
          ]);
          
          setKpis(kpisData);
          setRecentProjects(projectsData);
          setRecentStockMovements(stockMovementsData);
          setStaffMembers(staffMembersData);
          
          // Fetch task stats after staff members are loaded
          const taskStatsData = await fetchTaskStats(staffMembersData);
          setTaskStats(taskStatsData);
          
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [useReactQueryForDashboard]);
  
  // Return a unified interface regardless of which implementation is used
  if (useReactQueryForDashboard) {
    const isQueryLoading = 
      kpisQuery.isLoading || 
      projectsQuery.isLoading || 
      stockMovementsQuery.isLoading || 
      staffMembersQuery.isLoading || 
      taskStatsQuery.isLoading;
    
    const queryError = 
      kpisQuery.error || 
      projectsQuery.error || 
      stockMovementsQuery.error || 
      staffMembersQuery.error || 
      taskStatsQuery.error;
    
    return {
      kpis: kpisQuery.data || [],
      recentProjects: projectsQuery.data || [],
      recentStockMovements: stockMovementsQuery.data || [],
      staffMembers: staffMembersQuery.data || {},
      taskStats: taskStatsQuery.data || {
        completed_today: 0,
        most_outstanding: null,
        most_completed: null
      },
      isLoading: isQueryLoading,
      error: queryError instanceof Error ? queryError : null,
      refetch: async () => {
        await Promise.all([
          kpisQuery.refetch(),
          projectsQuery.refetch(),
          stockMovementsQuery.refetch(),
          staffMembersQuery.refetch(),
        ]);
        if (staffMembersQuery.data) {
          await taskStatsQuery.refetch();
        }
      },
    };
  }
  
  return {
    kpis,
    recentProjects,
    recentStockMovements,
    staffMembers,
    taskStats,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const [kpisData, projectsData, stockMovementsData, staffMembersData] = await Promise.all([
          fetchKPIs(),
          fetchRecentProjects(),
          fetchRecentStockMovements(),
          fetchStaffMembers(),
        ]);
        
        setKpis(kpisData);
        setRecentProjects(projectsData);
        setRecentStockMovements(stockMovementsData);
        setStaffMembers(staffMembersData);
        
        const taskStatsData = await fetchTaskStats(staffMembersData);
        setTaskStats(taskStatsData);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
  };
}
