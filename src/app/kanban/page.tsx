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
  status?: string;
  phase?: string;
  project_manager?: string;
  completion?: number;
}

const STATUSES = [
  { key: "todo", label: "To Do", color: "bg-blue-50", border: "border-blue-100", text: "text-blue-600" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-600" },
  { key: "done", label: "Done", color: "bg-green-50", border: "border-green-100", text: "text-green-600" },
];

// Demo projects data from grid page
const DEMO_PROJECTS: Project[] = [
  { id: "1", name: "Downtown Fiber Installation", description: "High-speed fiber optic network deployment in downtown area", status: "Active", phase: "Infrastructure", project_manager: "John Smith", completion: 65 },
  { id: "2", name: "Business Park Network", description: "Dedicated fiber network for business park tenants", status: "Active", phase: "Testing", project_manager: "Sarah Johnson", completion: 85 },
  { id: "3", name: "Residential Area Expansion", description: "Expanding fiber coverage to residential neighborhoods", status: "Planning", phase: "Design", project_manager: "Mike Wilson", completion: 15 },
  { id: "4", name: "City Center Upgrade", description: "Upgrading existing infrastructure in city center", status: "Completed", phase: "Completed", project_manager: "Emma Davis", completion: 100 },
  { id: "5", name: "Industrial Zone Connection", description: "Connecting industrial facilities to fiber network", status: "Active", phase: "Infrastructure", project_manager: "Tom Brown", completion: 40 }
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(DEMO_PROJECTS[0].id);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
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

  // Get selected project
  const selectedProject = DEMO_PROJECTS.find(p => p.id === selectedProjectId) || DEMO_PROJECTS[0];

  useEffect(() => {
    // Demo data - no database calls
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      // Set demo tasks based on selected project
      setTasks([]);
      setLoading(false);
    }, 300);
  }, [selectedProjectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProjectDropdown && !(event.target as Element).closest('.project-selector')) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

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
    <div className="ff-page-container">
      {/* Page Header */}
      <div className="ff-page-header">
        <h1 className="ff-page-title">Project Kanban Board</h1>
        <p className="ff-page-subtitle">Visualize and manage project tasks across different workflow stages</p>
      </div>

      {/* Project Selector Section */}
      <section className="ff-section">
        <div className="relative project-selector">
          <label className="ff-label mb-4 block">Select Project</label>
          <div className="relative max-w-full">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full ff-card text-left flex items-center justify-between p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className={`w-4 h-4 rounded-full ${
                  selectedProject.status === 'Active' ? 'bg-green-500' :
                  selectedProject.status === 'Planning' ? 'bg-blue-500' :
                  selectedProject.status === 'Completed' ? 'bg-gray-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-2xl font-light text-foreground mb-2">{selectedProject.name}</div>
                  <div className="text-muted-foreground flex items-center gap-4 text-lg">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      selectedProject.status === 'Active' ? 'bg-green-100 text-green-800' :
                      selectedProject.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                      selectedProject.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedProject.status}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">{selectedProject.completion}% complete</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{selectedProject.phase} Phase</span>
                  </div>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${showProjectDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {DEMO_PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left p-8 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                      project.id === selectedProjectId ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${
                        project.status === 'Active' ? 'bg-green-500' :
                        project.status === 'Planning' ? 'bg-blue-500' :
                        project.status === 'Completed' ? 'bg-gray-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-xl font-light text-foreground mb-2">{project.name}</div>
                        <div className="text-muted-foreground flex items-center gap-4">
                          <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                            project.status === 'Active' ? 'bg-green-100 text-green-800' :
                            project.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                          <span>•</span>
                          <span>{project.completion}% complete</span>
                          <span>•</span>
                          <span>{project.phase} Phase</span>
                        </div>
                      </div>
                      {project.id === selectedProjectId && (
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Stats - Clean Apple Style */}
      <div className="ff-section">
        <div className="ff-grid-stats">
          <div className="ff-card-stats">
            <div className="ff-stat-value">{selectedProject.completion}%</div>
            <div className="ff-stat-label">Completion</div>
          </div>
          <div className="ff-card-stats">
            <div className="ff-stat-value">{selectedProject.status}</div>
            <div className="ff-stat-label">Status</div>
          </div>
          <div className="ff-card-stats">
            <div className="ff-stat-value">{selectedProject.phase}</div>
            <div className="ff-stat-label">Current Phase</div>
          </div>
          <div className="ff-card-stats">
            <div className="ff-stat-value">{selectedProject.project_manager}</div>
            <div className="ff-stat-label">Project Manager</div>
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="ff-section">
        <div className="flex justify-between items-center">
          <h2 className="ff-section-title">Task Management</h2>
          <button
            className="ff-button-primary"
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
                due_date: '',
                project_id: selectedProjectId
              }); 
            }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ff-section">
          <div className="text-center py-20">
            <div className="ff-muted-text">Loading tasks...</div>
          </div>
        </div>
      ) : (
        <div className="ff-section">
          {/* Kanban Columns - Apple-inspired Design */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {STATUSES.map(status => (
              <div key={status.key} className="space-y-6">
                {/* Column Header */}
                <div className="text-center pb-6 border-b border-gray-100">
                  <h3 className="ff-heading-medium mb-2">{status.label}</h3>
                  <div className={`inline-flex px-4 py-1 rounded-full text-sm font-medium ${status.color} ${status.text} ${status.border} border`}>
                    {status.key === 'todo' ? '📋' : status.key === 'in_progress' ? '⚡' : '✅'} 
                    <span className="ml-2">
                      {tasks.filter(t => t.status === status.key).length + 
                       (status.key === 'todo' ? 2 : status.key === 'in_progress' ? 1 : 2)} tasks
                    </span>
                  </div>
                </div>

                {/* Task Cards */}
                <div className="space-y-4 min-h-[400px]">
                  {/* Demo tasks based on selected project */}
                  {selectedProject.status !== 'Completed' && status.key === 'todo' && (
                    <>
                      <div className="ff-card group cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="ff-heading-medium">
                            {selectedProject.phase === 'Infrastructure' ? 'Site Survey & Mapping' : 
                             selectedProject.phase === 'Testing' ? 'Performance Validation' : 
                             selectedProject.phase === 'Design' ? 'Technical Specifications' : 'Project Assessment'}
                          </h4>
                          <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                        </div>
                        <p className="ff-body-text mb-6">
                          {selectedProject.phase === 'Infrastructure' ? 'Conduct comprehensive site assessment and create detailed mapping for optimal fiber deployment routes.' : 
                           selectedProject.phase === 'Testing' ? 'Validate network performance metrics and ensure all systems meet quality standards.' : 
                           selectedProject.phase === 'Design' ? 'Develop comprehensive technical specifications and architectural plans for implementation.' : 'Complete initial project evaluation and feasibility assessment.'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                            {selectedProject.project_manager}
                          </span>
                          <span className="text-red-500 text-xs font-medium">Due Today</span>
                        </div>
                      </div>
                      
                      {selectedProject.phase !== 'Completed' && (
                        <div className="ff-card group cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="ff-heading-medium">Documentation Review</h4>
                            <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                          </div>
                          <p className="ff-body-text mb-6">
                            Review and update all project documentation to ensure compliance and accuracy.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                              Technical Team
                            </span>
                            <span className="ff-muted-text text-xs">Due: This Week</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedProject.status !== 'Completed' && status.key === 'in_progress' && (
                    <div className="ff-card group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="ff-heading-medium">
                          {selectedProject.phase === 'Infrastructure' ? 'Network Infrastructure Setup' : 
                           selectedProject.phase === 'Testing' ? 'System Optimization' : 
                           selectedProject.phase === 'Design' ? 'Design Implementation' : 'Project Coordination'}
                        </h4>
                        <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                      </div>
                      <p className="ff-body-text mb-6">
                        {selectedProject.phase === 'Infrastructure' ? 'Installing and configuring core network infrastructure components and equipment systems.' : 
                         selectedProject.phase === 'Testing' ? 'Fine-tuning network performance parameters and optimizing system configurations.' : 
                         selectedProject.phase === 'Design' ? 'Implementing approved technical designs and coordinating with engineering teams.' : 'Managing project timelines and coordinating between multiple teams.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                          {selectedProject.project_manager}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1">
                            <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <span className="ff-muted-text text-xs">60%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {status.key === 'done' && (
                    <>
                      <div className="ff-card group cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="ff-heading-medium">Project Initiation</h4>
                          <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                        </div>
                        <p className="ff-body-text mb-6">
                          Successfully completed project kickoff meeting and established core team responsibilities for {selectedProject.name}.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                            Project Team
                          </span>
                          <span className="text-green-600 text-xs font-medium">✓ Completed</span>
                        </div>
                      </div>
                      
                      <div className="ff-card group cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="ff-heading-medium">Resource Allocation</h4>
                          <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                        </div>
                        <p className="ff-body-text mb-6">
                          All required team members, equipment, and materials have been successfully allocated to the project.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                            {selectedProject.project_manager}
                          </span>
                          <span className="text-green-600 text-xs font-medium">✓ Completed</span>
                        </div>
                      </div>

                      {selectedProject.completion > 50 && (
                        <div className="ff-card group cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="ff-heading-medium">Milestone Achievement</h4>
                            <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                          </div>
                          <p className="ff-body-text mb-6">
                            Successfully reached the 50% completion milestone with all quality standards met.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                              Quality Team
                            </span>
                            <span className="text-green-600 text-xs font-medium">✓ Completed</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* User Created Tasks */}
                  {tasks.filter(t => t.status === status.key).map((task) => (
                    <div
                      key={task.id}
                      className="ff-card group cursor-pointer"
                      onClick={() => { setEditTask(task); setForm(task); setShowModal(true); }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="ff-heading-medium">{task.title}</h4>
                        <div className={`w-3 h-3 rounded-full ${status.color} ${status.border} border-2`}></div>
                      </div>
                      {task.description && (
                        <p className="ff-body-text mb-6">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {task.assigned_to && (
                          <span className="ff-secondary-text text-xs px-3 py-1 bg-gray-50 rounded-full">
                            {task.assigned_to}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-red-500 text-xs font-medium">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal - Apple-inspired Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-6 z-50">
          <div className="ff-form-container max-w-2xl w-full">
            <h2 className="ff-heading-large mb-8">
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="ff-label">Task Title</label>
                <input
                  className="ff-input"
                  placeholder="Enter a clear, descriptive task title"
                  value={form.title || ''}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="ff-label">Description</label>
                <textarea
                  className="ff-input"
                  placeholder="Provide detailed information about this task"
                  rows={4}
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="ff-label">Project Phase</label>
                  <input
                    className="ff-input"
                    placeholder="e.g., Planning, Infrastructure, Testing"
                    value={form.step || ''}
                    onChange={e => setForm(f => ({ ...f, step: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="ff-label">Status</label>
                  <select
                    className="ff-input"
                    value={form.status || 'todo'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Task['status'] }))}
                  >
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="ff-label">Assigned To</label>
                  <input
                    className="ff-input"
                    placeholder="Team member name"
                    value={form.assigned_to || ''}
                    onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="ff-label">Due Date</label>
                  <input
                    type="date"
                    className="ff-input"
                    value={form.due_date || ''}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end pt-8 border-t border-gray-100">
                <button
                  type="button"
                  className="px-8 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ff-body-text"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ff-button-primary"
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