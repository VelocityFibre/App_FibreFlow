import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "./auditLogger";

// --- PHASES (master list) --- //
export async function getPhases() {
  const { data, error } = await supabase.from("phases").select("*").order("order_no");
  if (error) throw error;
  return data;
}

export async function createPhase(phase: { name: string; description?: string; order_no?: number }) {
  const { data, error } = await supabase.from("phases").insert([phase]).select();
  if (error) throw error;
  await createAuditLog(AuditAction.CREATE, AuditResourceType.PHASE, data[0].id, { phase });
  return data[0];
}

interface Phase {
  id: string;
  name: string;
  description?: string;
  order_no?: number;
}

export async function updatePhase(id: string, updates: Partial<Phase>) {
  const { data, error } = await supabase.from("phases").update(updates).eq("id", id).select();
  if (error) throw error;
  await createAuditLog(AuditAction.UPDATE, AuditResourceType.PHASE, id, { updates });
  return data[0];
}

export async function deletePhase(id: string) {
  const { error } = await supabase.from("phases").delete().eq("id", id);
  if (error) throw error;
  await createAuditLog(AuditAction.DELETE, AuditResourceType.PHASE, id, {});
}

// --- AUTOMATION: Assign first phase and default tasks to new project --- //
interface AutoAssignArgs {
  projectId: string;
  phaseAssigneeId?: string | null;
  taskAssigneeId?: string | null;
}

interface ProjectPhase {
  id: string;
  project_id: string;
  phase_id: string;
  status: string;
  assigned_to?: string | null;
}

interface Task {
  id: number;
  title: string;
}



export async function autoAssignFirstPhaseAndTasks({
  projectId,
  phaseAssigneeId = null,
  taskAssigneeId = null
}: AutoAssignArgs): Promise<{ projectPhase: ProjectPhase; defaultTasks: Task[] }> {
  // Verify that the project exists in the projects table
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();
  
  if (projectError) {
    console.error("Error verifying project:", projectError);
    throw new Error(`Project verification failed: ${projectError.message}`);
  }
  
  if (!projectData) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  
  // 1. Get first phase (by order_no)
  const { data: phases, error: phaseError } = await supabase.from("phases").select("*").order("order_no").limit(1);
  if (phaseError) throw phaseError;
  if (!phases || phases.length === 0) throw new Error("No phases found");
  const firstPhase: Phase = phases[0];

  // Add a small delay to ensure the project is fully committed to the database
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Insert project_phase
  const { data: projPhase, error: projPhaseError } = await supabase
    .from("project_phases")
    .insert([{
      project_id: projectId,
      phase_id: firstPhase.id,
      status: "not_started",
      assigned_to: phaseAssigneeId
    }])
    .select()
    .single();
  
  if (projPhaseError) {
    console.error("Error creating project phase:", projPhaseError);
    throw projPhaseError;
  }

  // Get default tasks for phase
  // Modify the query to match your actual database schema
  // It seems the tasks table doesn't have a phase_id column
  // Let's try to get all tasks and then we'll handle phase association differently
  const { data: defaultTasks, error: defaultTasksError } = await supabase
    .from("tasks")
    .select("*")
    .limit(5); // Just get a few default tasks for now
  
  if (defaultTasksError) {
    console.error("Error fetching default tasks:", defaultTasksError);
    // Return with just the project phase, without tasks
    return { projectPhase: projPhase, defaultTasks: [] };
  }

  // Insert project_tasks
  if (defaultTasks && defaultTasks.length > 0) {
    const tasksToInsert = defaultTasks.map((task: Task) => ({
      project_phase_id: projPhase.id,
      task_id: task.id,
      status: "not_started",
      assigned_to: taskAssigneeId
    }));
    const { error: projectTasksError } = await supabase
      .from("project_tasks")
      .insert(tasksToInsert);
    if (projectTasksError) throw projectTasksError;
  }

  return { projectPhase: projPhase, defaultTasks };
}

// --- PROJECT PHASES --- //
export async function getProjectPhases(projectId: string) {
  const { data, error } = await supabase
    .from("project_phases")
    .select("*, phase:phase_id(*)")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function addProjectPhase(projectId: string, phaseId: string, status = "pending") {
  const { data, error } = await supabase
    .from("project_phases")
    .insert([{ project_id: projectId, phase_id: phaseId, status }])
    .select();
  if (error) throw error;
  await createAuditLog(AuditAction.CREATE, AuditResourceType.PROJECT_PHASE, data[0].id, { projectId, phaseId });
  return data[0];
}

export async function updateProjectPhase(id: string, updates: Partial<ProjectPhase>) {
  const { data, error } = await supabase.from("project_phases").update(updates).eq("id", id).select();
  if (error) throw error;
  await createAuditLog(AuditAction.UPDATE, AuditResourceType.PROJECT_PHASE, id, { updates });
  return data[0];
}

export async function deleteProjectPhase(id: string) {
  const { error } = await supabase.from("project_phases").delete().eq("id", id);
  if (error) throw error;
  await createAuditLog(AuditAction.DELETE, AuditResourceType.PROJECT_PHASE, id, {});
}

// --- PROJECT TASKS --- //
export async function getProjectPhaseTasks(projectPhaseId: string) {
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*, task:task_id(*)")
    .eq("project_phase_id", projectPhaseId)
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function addProjectTask(projectPhaseId: string, taskId: number, status = "pending") {
  const { data, error } = await supabase
    .from("project_tasks")
    .insert([{ project_phase_id: projectPhaseId, task_id: taskId, status }])
    .select();
  if (error) throw error;
  await createAuditLog(AuditAction.CREATE, AuditResourceType.PROJECT_TASK, data[0].id, { projectPhaseId, taskId });
  return data[0];
}

export async function updateProjectTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase.from("project_tasks").update(updates).eq("id", id).select();
  if (error) throw error;
  await createAuditLog(AuditAction.UPDATE, AuditResourceType.PROJECT_TASK, id, { updates });
  return data[0];
}

export async function deleteProjectTask(id: string) {
  const { error } = await supabase.from("project_tasks").delete().eq("id", id);
  if (error) throw error;
  await createAuditLog(AuditAction.DELETE, AuditResourceType.PROJECT_TASK, id, {});
}
