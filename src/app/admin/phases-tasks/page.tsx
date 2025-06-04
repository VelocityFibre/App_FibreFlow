"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";

interface Phase {
  id: string;
  name: string;
  description?: string;
  order_no: number;
}

interface Task {
  id: number; // ID is required in the database
  title: string;
  description?: string;
  phase_id?: string;
  status?: 'planning' | 'submitted' | 'completed';
}

export default function PhasesTasksAdmin() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<string>("");
  
  // Phase form state
  const [newPhase, setNewPhase] = useState<{
    name: string;
    description: string;
    order_no: number;
  }>({
    name: "",
    description: "",
    order_no: 0
  });
  
  // Task form state
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: ""
  });
  
  useEffect(() => {
    fetchPhasesAndTasks();
  }, []);
  
  async function fetchPhasesAndTasks() {
    setLoading(true);
    try {
      // Fetch phases
      const { data: phasesData, error: phasesError } = await supabase
        .from("phases")
        .select("*")
        .order("order_no");
      
      if (phasesError) {
        console.error("Error fetching phases:", phasesError);
      } else {
        setPhases(phasesData || []);
      }
      
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*");
      
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
      } else {
        setTasks(tasksData || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleAddPhase(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!newPhase.name) {
        alert("Phase name is required");
        return;
      }
      
      const { data, error } = await supabase
        .from("phases")
        .insert([{
          name: newPhase.name,
          description: newPhase.description || null,
          order_no: newPhase.order_no || phases.length + 1
        }])
        .select();
      
      if (error) {
        console.error("Error adding phase:", error);
        alert(`Failed to add phase: ${error.message}`);
        return;
      }
      
      // Create audit log
      await createAuditLog(
        AuditAction.CREATE,
        AuditResourceType.PHASE,
        data[0].id,
        { name: data[0].name }
      );
      
      // Reset form and refresh data
      setNewPhase({ name: "", description: "", order_no: phases.length + 1 });
      fetchPhasesAndTasks();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  }
  
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!newTask.title) {
        alert("Task title is required");
        return;
      }
      
      // Log what we're about to insert for debugging
      console.log("Creating task with data:", {
        title: newTask.title,
        description: newTask.description || null,
        status: 'planning',
        notes: ''
      });
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          title: newTask.title,
          description: newTask.description || null,
          status: 'planning',
          notes: ''
        }])
        .select();
      
      if (error) {
        console.error("Error adding task:", error);
        alert(`Failed to add task: ${error.message}`);
        return;
      }
      
      console.log("Task created successfully:", data);
      
      // Create audit log
      await createAuditLog(
        AuditAction.CREATE,
        AuditResourceType.PROJECT_TASK, // Using PROJECT_TASK as TASK doesn't exist
        data[0].id.toString(),
        { title: data[0].title }
      );
      
      // Reset form and refresh data
      setNewTask({ title: "", description: "" });
      fetchPhasesAndTasks();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  }
  
  // Function to create tasks has been removed
  
  async function handleDeletePhase(id: string) {
    if (!confirm("Are you sure you want to delete this phase? This will also delete all associated tasks.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("phases")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting phase:", error);
        alert(`Failed to delete phase: ${error.message}`);
        return;
      }
      
      // Create audit log
      await createAuditLog(
        AuditAction.DELETE,
        AuditResourceType.PHASE,
        id,
        {}
      );
      
      fetchPhasesAndTasks();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  }
  
  async function handleDeleteTask(id: number) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting task:", error);
        alert(`Failed to delete task: ${error.message}`);
        return;
      }
      
      // Create audit log
      await createAuditLog(
        AuditAction.DELETE,
        AuditResourceType.PROJECT_TASK,
        id.toString(),
        {}
      );
      
      fetchPhasesAndTasks();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  }
  
  async function setupDefaultPhases() {
    setSetupLoading(true);
    setSetupResult("");
    
    try {
      // Default phases
      const defaultPhases = [
        { name: "Phase 1", description: "Initial planning and setup", order_no: 1 },
        { name: "Phase 2", description: "Development and implementation", order_no: 2 },
        { name: "Phase 3", description: "Testing and refinement", order_no: 3 },
        { name: "Phase 4", description: "Deployment and handover", order_no: 4 }
      ];
      
      // Insert phases
      const { data: phasesData, error: phasesError } = await supabase
        .from("phases")
        .insert(defaultPhases)
        .select();
      
      if (phasesError) {
        throw new Error(`Error creating phases: ${phasesError.message}`);
      }
      
      // Default tasks
      const defaultTasks = [
        { title: "Requirements gathering", description: "Collect and document all requirements", status: 'planning' as const },
        { title: "System design", description: "Create system architecture and design documents", status: 'planning' as const },
        { title: "Development", description: "Implement the solution", status: 'planning' as const },
        { title: "Testing", description: "Test all functionality", status: 'planning' as const },
        { title: "Deployment", description: "Deploy to production", status: 'planning' as const }
      ];
      
      // Insert tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .insert(defaultTasks)
        .select();
      
      if (tasksError) {
        throw new Error(`Error creating tasks: ${tasksError.message}`);
      }
      
      // Create audit logs for each phase
      for (const phase of phasesData) {
        await createAuditLog(
          AuditAction.CREATE,
          AuditResourceType.PHASE,
          phase.id,
          { name: phase.name }
        );
      }
      
      // Create audit logs for each task
      for (const task of tasksData) {
        await createAuditLog(
          AuditAction.CREATE,
          AuditResourceType.PROJECT_TASK,
          task.id.toString(),
          { title: task.title }
        );
      }
      
      setSetupResult(`Successfully created ${phasesData.length} default phases and ${tasksData.length} default tasks!`);
      fetchPhasesAndTasks();
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error && 'message' in error) {
        errorMessage = String((error as { message?: string }).message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSetupResult(`Error: ${errorMessage}`);
      console.error("Error setting up phases:", error);
    } finally {
      setSetupLoading(false);
    }
  }
  
  async function createPhaseOneSequentialTasks() {
    setSetupLoading(true);
    setSetupResult("");
    
    try {
      // Sequential tasks for Phase 1
      const sequentialTasks = [
        { title: "Initial site survey", description: "Conduct initial site assessment", status: 'planning' as const },
        { title: "Feasibility study", description: "Assess technical and financial feasibility", status: 'planning' as const },
        { title: "Stakeholder meeting", description: "Meet with all stakeholders", status: 'planning' as const },
        { title: "Project kickoff", description: "Official project start", status: 'planning' as const },
        { title: "Resource allocation", description: "Assign team and resources", status: 'planning' as const }
      ];
      
      // Insert tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .insert(sequentialTasks)
        .select();
      
      if (tasksError) {
        throw new Error(`Error creating tasks: ${tasksError.message}`);
      }
      
      // Create audit logs for each task
      for (const task of tasksData) {
        await createAuditLog(
          AuditAction.CREATE,
          AuditResourceType.PROJECT_TASK,
          task.id.toString(),
          { title: task.title }
        );
      }
      
      setSetupResult(`Successfully created ${tasksData.length} sequential tasks for Phase 1!`);
      fetchPhasesAndTasks();
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error && 'message' in error) {
        errorMessage = String((error as { message?: string }).message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSetupResult(`Error: ${errorMessage}`);
      console.error("Error creating sequential tasks:", error);
    } finally {
      setSetupLoading(false);
    }
  }
  
  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h1 className="ff-page-title">Phases & Tasks Management</h1>
        <p className="ff-page-subtitle">Manage project phases and tasks for your workflow</p>
      </div>

      {/* Quick Setup Section */}
      <section className="ff-section">
        <h2 className="ff-section-title">Quick Setup</h2>
        <div className="ff-card">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={setupDefaultPhases}
              disabled={setupLoading}
              className="ff-button-primary disabled:opacity-50"
            >
              {setupLoading ? "Setting up..." : "Create Default Phases & Tasks"}
            </button>
            <button
              onClick={createPhaseOneSequentialTasks}
              disabled={setupLoading}
              className="ff-button-primary disabled:opacity-50"
            >
              {setupLoading ? "Creating..." : "Add Phase 1 Sequential Tasks"}
            </button>
          </div>
          {setupResult && (
            <div className={`mt-4 p-4 rounded-lg ${setupResult.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
              {setupResult}
            </div>
          )}
        </div>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phases Management */}
        <div>
          <h2 className="ff-section-title">Phases</h2>
          
          {/* Add Phase Form */}
          <form onSubmit={handleAddPhase} className="ff-card mb-6">
            <h3 className="ff-card-title">Add New Phase</h3>
            <div className="space-y-4">
              <div>
                <label className="ff-label">
                  Name *
                </label>
                <input
                  type="text"
                  value={newPhase.name}
                  onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                  className="ff-input"
                  required
                />
              </div>
              <div>
                <label className="ff-label">
                  Description
                </label>
                <textarea
                  value={newPhase.description}
                  onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                  className="ff-input"
                  rows={3}
                />
              </div>
              <div>
                <label className="ff-label">
                  Order
                </label>
                <input
                  type="number"
                  value={newPhase.order_no}
                  onChange={(e) => setNewPhase({ ...newPhase, order_no: parseInt(e.target.value) })}
                  className="ff-input"
                />
              </div>
              <button
                type="submit"
                className="ff-button-primary"
              >
                Add Phase
              </button>
            </div>
          </form>
          
          {/* Phases List */}
          {loading ? (
            <div className="ff-card text-center">
              <p className="ff-secondary-text">Loading phases...</p>
            </div>
          ) : phases.length === 0 ? (
            <div className="ff-card text-center">
              <p className="ff-secondary-text">No phases found. Add your first phase above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {phases.map((phase) => (
                <div key={phase.id} className="ff-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="ff-heading-medium">{phase.name}</h4>
                      <p className="ff-secondary-text">{phase.description}</p>
                      <p className="ff-muted-text mt-1">Order: {phase.order_no}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePhase(phase.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tasks Management */}
        <div>
          <h2 className="ff-section-title">Tasks</h2>
          
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="ff-card mb-6">
            <h3 className="ff-card-title">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="ff-label">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="ff-input"
                  required
                />
              </div>
              <div>
                <label className="ff-label">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="ff-input"
                  rows={3}
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">Tasks are created independently of phases. You can assign tasks to phases when creating a project.</p>
              </div>
              <button
                type="submit"
                className="ff-button-primary"
              >
                Add Task
              </button>
            </div>
          </form>
          
          {/* Tasks List */}
          {loading ? (
            <div className="ff-card text-center">
              <p className="ff-secondary-text">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="ff-card text-center">
              <p className="ff-secondary-text">No tasks found. Add your first task above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="ff-card">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <h4 className="ff-heading-medium">{task.title}</h4>
                      <p className="ff-secondary-text">{task.description}</p>
                      
                      {/* Task Status */}
                      <div className="mt-4">
                        <div className="flex items-center space-x-3">
                          <label className="ff-label mb-0">Status:</label>
                          <select 
                            value={task.status || 'planning'}
                            onChange={async (e) => {
                              const newStatus = e.target.value as 'planning' | 'submitted' | 'completed';
                              await supabase
                                .from("tasks")
                                .update({ status: newStatus })
                                .eq("id", task.id);
                              fetchPhasesAndTasks();
                            }}
                            className="ff-input max-w-xs"
                          >
                            <option value="planning">Planning</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
