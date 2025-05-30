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
  
  // Setup states for quick setup functionality
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<string | null>(null);
  
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
  
  // Function to set up default phases and tasks
  async function setupDefaultPhasesAndTasks() {
    setSetupLoading(true);
    setSetupResult(null);
    
    try {
      // Default phases data
      const defaultPhases = [
        { name: "Planning", description: "Initial project planning phase", order_no: 1 },
        { name: "Design", description: "Network design and architecture", order_no: 2 },
        { name: "Implementation", description: "Physical installation and configuration", order_no: 3 },
        { name: "Testing", description: "Verification and quality assurance", order_no: 4 },
        { name: "Handover", description: "Client handover and documentation", order_no: 5 }
      ];
      
      // Insert default phases
      const { data: phasesData, error: phasesError } = await supabase
        .from("phases")
        .insert(defaultPhases)
        .select();
      
      if (phasesError) {
        throw new Error(`Error creating phases: ${phasesError.message}`);
      }
      
      // Default tasks
      const defaultTasks = [
        { title: "Site Survey", description: "Conduct initial site survey", status: "planning" },
        { title: "Requirements Gathering", description: "Document client requirements", status: "planning" },
        { title: "Network Design", description: "Create network architecture design", status: "planning" },
        { title: "Equipment Procurement", description: "Order necessary equipment", status: "planning" },
        { title: "Cable Installation", description: "Install fiber optic cables", status: "planning" },
        { title: "Equipment Installation", description: "Install networking equipment", status: "planning" },
        { title: "Configuration", description: "Configure network devices", status: "planning" },
        { title: "Testing", description: "Perform connectivity and performance tests", status: "planning" },
        { title: "Documentation", description: "Prepare handover documentation", status: "planning" },
        { title: "Client Training", description: "Train client staff on system usage", status: "planning" }
      ];
      
      // Insert default tasks
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
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSetupResult(`Error: ${errorMessage}`);
      console.error("Error setting up phases:", error);
    } finally {
      setSetupLoading(false);
    }
  }
  
  // Placeholder function for the setup button in the UI
  async function setupDefaultPhases() {
    await setupDefaultPhasesAndTasks();
  }
  
  // Placeholder function for the create sequential tasks button in the UI
  async function createPhaseOneSequentialTasks() {
    setSetupLoading(true);
    setSetupResult(null);
    
    try {
      // Implementation would go here
      setSetupResult("Sequential tasks creation feature is coming soon.");
    } catch (error) {
      setSetupResult("Error: Failed to create sequential tasks.");
      console.error("Error creating sequential tasks:", error);
    } finally {
      setSetupLoading(false);
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Phases & Tasks Management</h1>
      
      {/* Setup Buttons */}
      <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Quick Setup</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          If this is your first time setting up the system, you can create default phases and tasks with one click.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={setupDefaultPhases}
            disabled={setupLoading || phases.length > 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            {setupLoading ? "Setting up..." : "Setup Default Phases & Tasks"}
          </button>
          
          <button
            onClick={createPhaseOneSequentialTasks}
            disabled={setupLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            {setupLoading ? "Creating..." : "Create Phase One Sequential Tasks"}
          </button>
        </div>
        
        {setupResult && (
          <div className={`mt-4 p-3 rounded ${setupResult.startsWith("Error") ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"}`}>
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                <p className="text-sm">Tasks are now created independently of phases. You can assign tasks to phases when creating a project.</p>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Add Task
            </button>
          </form>
          
          {/* Tasks List */}
          {loading ? (
            <p className="text-center py-4">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded">No tasks found. Add your first task above.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <h4 className="font-semibold">{task.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      
                      {/* Task Status */}
                      <div className="mt-3 flex flex-col space-y-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2 w-24">Status:</span>
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
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="planning">Planning</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        
                        {/* Notes field removed as it doesn't exist in the schema */}
                      </div>
                      
                      {/* Order number display removed as it doesn't exist in the schema */}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
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
