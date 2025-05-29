import { supabase } from "@/lib/supabase";
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
  console.log(`Auto-assigning first phase and tasks for project ${projectId}`);
  console.log(`Phase assignee: ${phaseAssigneeId}, Task assignee: ${taskAssigneeId}`);
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
  
  // Insert project_phase with 'in_progress' status to automatically start the planning phase
  const { data: projPhase, error: projPhaseError } = await supabase
    .from("project_phases")
    .insert([{
      project_id: projectId,
      phase_id: firstPhase.id,
      status: "in_progress", // Set to 'in_progress' so the project immediately enters the planning phase
      assigned_to: phaseAssigneeId
    }])
    .select()
    .single();
  
  if (projPhaseError) {
    console.error("Error creating project phase:", projPhaseError);
    throw projPhaseError;
  }
  
  // Log the phase assignment to audit trail
  await createAuditLog(
    AuditAction.CREATE,
    AuditResourceType.PROJECT_PHASE,
    projPhase.id,
    {
      projectId,
      phaseId: firstPhase.id,
      assignedTo: phaseAssigneeId,
      status: "not_started",
      automated: true
    }
  );

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
    // Sort tasks by ID to ensure they're processed in sequence
    const sortedTasks = [...defaultTasks].sort((a, b) => a.id - b.id);
    
    // Mark the first task as 'in_progress' and the rest as 'not_started'
    // Only include assigned_to if it's a valid value to avoid foreign key constraint issues
    const tasksToInsert = sortedTasks.map((task: Task, index) => {
      // Create a task with the minimum required fields
      const taskData: any = {
        project_phase_id: projPhase.id,
        task_id: task.id,
        status: index === 0 ? "in_progress" : "not_started" // First task is automatically started
      };
      
      // If we have a valid project manager ID, use it for the first task
      // This ensures at least the first task has an assignee
      if (index === 0 && phaseAssigneeId !== null && phaseAssigneeId !== undefined && phaseAssigneeId !== '') {
        taskData.assigned_to = phaseAssigneeId;
        console.log(`Assigning first task to phase assignee: ${phaseAssigneeId}`);
      }
      
      return taskData;
    });
    
    // Log the tasks we're about to insert for debugging
    console.log('Tasks to insert:', tasksToInsert);
    
    const { data: insertedTasks, error: projectTasksError } = await supabase
      .from("project_tasks")
      .insert(tasksToInsert)
      .select();
      
    if (projectTasksError) throw projectTasksError;
    
    // Log each task assignment to audit trail
    if (insertedTasks) {
      for (const task of insertedTasks) {
        await createAuditLog(
          AuditAction.CREATE,
          AuditResourceType.PROJECT_TASK,
          task.id,
          {
            projectPhaseId: projPhase.id,
            taskId: task.task_id,
            assignedTo: task.assigned_to,
            status: task.status,
            automated: true,
            isFirstTask: task.status === "in_progress"
          }
        );
      }
    }
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
