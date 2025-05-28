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
  id: number;
  title: string;
  description?: string;
  phase_id?: string;
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
    phase_id: string;
  }>({
    title: "",
    description: "",
    phase_id: ""
  });
  
  // We'll implement editing functionality in the future if needed
  
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
      
      if (!newTask.phase_id) {
        alert("Please select a phase for this task");
        return;
      }
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          title: newTask.title,
          description: newTask.description || null,
          phase_id: newTask.phase_id
        }])
        .select();
      
      if (error) {
        console.error("Error adding task:", error);
        alert(`Failed to add task: ${error.message}`);
        return;
      }
      
      // Create audit log
      await createAuditLog(
        AuditAction.CREATE,
        AuditResourceType.PROJECT_TASK, // Using PROJECT_TASK as TASK doesn't exist
        data[0].id.toString(),
        { title: data[0].title, phase_id: data[0].phase_id }
      );
      
      // Reset form and refresh data
      setNewTask({ title: "", description: "", phase_id: "" });
      fetchPhasesAndTasks();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  }
  
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
      // First check if phases already exist
      if (phases.length > 0) {
        setSetupResult("Phases already exist in the database. You can add more phases manually.");
        setSetupLoading(false);
        return;
      }
      
      // Define default phases
      const defaultPhases = [
        { name: "Planning", description: "Initial project planning and requirements gathering", order_no: 1 },
        { name: "Design", description: "Technical design and architecture", order_no: 2 },
        { name: "Implementation", description: "Development and construction", order_no: 3 },
        { name: "Testing", description: "Quality assurance and testing", order_no: 4 },
        { name: "Deployment", description: "Final deployment and handover", order_no: 5 }
      ];
      
      // Insert phases
      const { data: phasesData, error } = await supabase
        .from("phases")
        .insert(defaultPhases)
        .select();
      
      if (error) {
        throw new Error(`Error creating phases: ${error.message}`);
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
      
      // Now create default tasks for each phase
      const defaultTasks = [
        // Planning phase tasks
        { title: "Requirements gathering", description: "Collect and document project requirements", phase_id: phasesData[0].id },
        { title: "Stakeholder interviews", description: "Interview key stakeholders", phase_id: phasesData[0].id },
        { title: "Project scope definition", description: "Define the scope of the project", phase_id: phasesData[0].id },
        
        // Design phase tasks
        { title: "Technical architecture", description: "Design the technical architecture", phase_id: phasesData[1].id },
        { title: "UI/UX design", description: "Create user interface designs", phase_id: phasesData[1].id },
        { title: "Design review", description: "Review and approve designs", phase_id: phasesData[1].id },
        
        // Implementation phase tasks
        { title: "Development setup", description: "Set up development environment", phase_id: phasesData[2].id },
        { title: "Core functionality", description: "Implement core functionality", phase_id: phasesData[2].id },
        { title: "Integration", description: "Integrate with external systems", phase_id: phasesData[2].id },
        
        // Testing phase tasks
        { title: "Test planning", description: "Create test plans", phase_id: phasesData[3].id },
        { title: "Unit testing", description: "Perform unit tests", phase_id: phasesData[3].id },
        { title: "User acceptance testing", description: "Conduct user acceptance testing", phase_id: phasesData[3].id },
        
        // Deployment phase tasks
        { title: "Deployment planning", description: "Plan the deployment process", phase_id: phasesData[4].id },
        { title: "Production deployment", description: "Deploy to production", phase_id: phasesData[4].id },
        { title: "Post-deployment review", description: "Review the deployment and address issues", phase_id: phasesData[4].id },
      ];
      
      // Insert tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .insert(defaultTasks)
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
          { title: task.title, phase_id: task.phase_id }
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
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Phases & Tasks Management</h1>
      
      {/* Setup Default Phases Button */}
      <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Quick Setup</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          If this is your first time setting up the system, you can create default phases and tasks with one click.
        </p>
        <button
          onClick={setupDefaultPhases}
          disabled={setupLoading || phases.length > 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {setupLoading ? "Setting up..." : "Setup Default Phases & Tasks"}
        </button>
        
        {setupResult && (
          <div className={`mt-4 p-4 rounded ${setupResult.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {setupResult}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phases Management */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Phases</h2>
          
          {/* Add Phase Form */}
          <form onSubmit={handleAddPhase} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-3">Add New Phase</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newPhase.name}
                onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newPhase.description}
                onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order
              </label>
              <input
                type="number"
                value={newPhase.order_no}
                onChange={(e) => setNewPhase({ ...newPhase, order_no: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Add Phase
            </button>
          </form>
          
          {/* Phases List */}
          {loading ? (
            <p className="text-center py-4">Loading phases...</p>
          ) : phases.length === 0 ? (
            <p className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded">No phases found. Add your first phase or use the quick setup.</p>
          ) : (
            <div className="space-y-3">
              {phases.map((phase) => (
                <div key={phase.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{phase.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Order: {phase.order_no}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePhase(phase.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
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
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-3">Add New Task</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phase *
              </label>
              <select
                value={newTask.phase_id}
                onChange={(e) => setNewTask({ ...newTask, phase_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Phase</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              disabled={phases.length === 0}
            >
              Add Task
            </button>
            {phases.length === 0 && (
              <p className="text-sm text-red-600 mt-2">You need to create at least one phase before adding tasks.</p>
            )}
          </form>
          
          {/* Tasks List */}
          {loading ? (
            <p className="text-center py-4">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded">No tasks found. Add your first task or use the quick setup.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const phase = phases.find(p => p.id === task.phase_id);
                return (
                  <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                        {phase && (
                          <p className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded inline-block mt-1">
                            {phase.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
