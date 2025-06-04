"use client";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  step?: string;
  order?: number;
  assigned_to?: string;
  due_date?: string;
  project_id?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

const STATUSES = [
  { key: "todo", label: "To Do", color: "bg-blue-50 text-blue-800 border-blue-200" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  { key: "done", label: "Done", color: "bg-green-50 text-green-800 border-green-200" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>({
    title: "",
    description: "",
    step: "",
    order: 1,
    status: "todo",
    assigned_to: "",
    due_date: ""
  });

  useEffect(() => {
    // Demo data - no database calls
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      // Set demo project
      setProject({
        id: "demo-project",
        name: "Fiber Installation Project",
        description: "High-speed fiber optic network deployment"
      });
      
      // Set demo tasks
      setTasks([]);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo mode - just update local state
    try {
      if (editTask) {
        // Update existing task
        setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...form } as Task : t));
      } else {
        // Create new task with demo ID
        const newTask: Task = {
          ...form,
          id: Date.now(), // Demo ID
        } as Task;
        setTasks(prev => [...prev, newTask]);
      }
      
      setShowModal(false);
      setForm({
        title: '',
        description: '',
        step: '',
        order: 1,
        status: 'todo',
        assigned_to: '',
        due_date: ''
      });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          {project ? `${project.name} - Kanban Board` : "Kanban Board"}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {project?.description || "Manage tasks across different stages"}
        </p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          onClick={() => { 
            setShowModal(true); 
            setEditTask(null); 
            setForm({ 
              title: '', 
              description: '', 
              step: '', 
              order: 1, 
              status: 'todo', 
              assigned_to: '', 
              due_date: ''
            }); 
          }}
        >
          + Add Task
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="space-y-8">
          {/* Planning Phase Demo */}
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Planning Phase</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-500 text-sm">2/5 completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STATUSES.map(status => (
                <div key={status.key} className="space-y-3 p-4 rounded-lg border-2 border-dashed border-gray-200 min-h-[200px]">
                  <h4 className="text-lg font-medium text-center pb-2 border-b">{status.label}</h4>
                  
                  {/* Sample tasks for demo */}
                  {status.key === 'todo' && (
                    <>
                      <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                        <h5 className="font-medium mb-2">Site Survey</h5>
                        <p className="text-gray-600 text-sm mb-2">Conduct initial site assessment</p>
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">John D.</span>
                          <span className="text-red-600 text-xs">Due: Today</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                        <h5 className="font-medium mb-2">Requirements Gathering</h5>
                        <p className="text-gray-600 text-sm">Document project requirements</p>
                      </div>
                    </>
                  )}
                  
                  {status.key === 'in_progress' && (
                    <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                      <h5 className="font-medium mb-2">Feasibility Study</h5>
                      <p className="text-gray-600 text-sm mb-2">Assess technical and financial feasibility</p>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Sarah M.</span>
                    </div>
                  )}
                  
                  {status.key === 'done' && (
                    <>
                      <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                        <h5 className="font-medium mb-2">Project Kickoff</h5>
                        <p className="text-gray-600 text-sm">Initial project meeting completed</p>
                      </div>
                      <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                        <h5 className="font-medium mb-2">Team Assignment</h5>
                        <p className="text-gray-600 text-sm">Core team members assigned</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Implementation Phase */}
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Implementation Phase</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-500 text-sm">1/4 completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STATUSES.map(status => (
                <div key={status.key} className="space-y-3 p-4 rounded-lg border-2 border-dashed border-gray-200 min-h-[200px]">
                  <h4 className="text-lg font-medium text-center pb-2 border-b">{status.label}</h4>
                  
                  {status.key === 'todo' && (
                    <>
                      <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                        <h5 className="font-medium mb-2">Fiber Installation</h5>
                        <p className="text-gray-600 text-sm">Install fiber optic cables</p>
                      </div>
                      <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                        <h5 className="font-medium mb-2">Equipment Setup</h5>
                        <p className="text-gray-600 text-sm">Configure network equipment</p>
                      </div>
                    </>
                  )}
                  
                  {status.key === 'in_progress' && (
                    <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                      <h5 className="font-medium mb-2">Network Testing</h5>
                      <p className="text-gray-600 text-sm mb-2">Testing connectivity and speeds</p>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Tech Team</span>
                    </div>
                  )}
                  
                  {status.key === 'done' && (
                    <div className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}>
                      <h5 className="font-medium mb-2">Permits Obtained</h5>
                      <p className="text-gray-600 text-sm">All necessary permits secured</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Created Tasks */}
          {tasks.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-6">Your Tasks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATUSES.map(status => (
                  <div key={status.key} className="space-y-3 p-4 rounded-lg border-2 border-dashed border-gray-200 min-h-[200px]">
                    <h4 className="text-lg font-medium text-center pb-2 border-b">{status.label}</h4>
                    {tasks.filter(t => t.status === status.key).map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border-2 ${status.color} hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => { setEditTask(task); setForm(task); setShowModal(true); }}
                      >
                        <h5 className="font-medium mb-2">{task.title}</h5>
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          {task.assigned_to && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {task.assigned_to}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="text-red-600 text-xs">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>User tasks would appear here</div>
      )}

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              {editTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  value={form.title || ''}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Task description (optional)"
                  rows={3}
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Step/Phase</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Planning, Design"
                    value={form.step || ''}
                    onChange={e => setForm(f => ({ ...f, step: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.status || 'todo'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Task['status'] }))}
                  >
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Assignee name"
                    value={form.assigned_to || ''}
                    onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.due_date || ''}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}