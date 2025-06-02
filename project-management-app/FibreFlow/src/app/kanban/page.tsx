"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const STATUSES = [
  { key: "todo", label: "To Do", color: "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100" },
  { key: "done", label: "Done", color: "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100" },
];

import { Dialog } from "@headlessui/react";

export default function KanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    step: "",
    order: 1,
    status: "todo",
    assigned_to: "",
    due_date: ""
  });

  useEffect(() => {
    async function fetchTasks() {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, description, step, order, status")
        .order("step")
        .order("order");
      setTasks(data || []);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  // Group by step
  const steps = Array.from(new Set(tasks.map(t => t.step))).filter(Boolean);
  const grouped = steps.map(step => ({
    step,
    tasks: tasks.filter(t => t.step === step)
  }));

  // Progress calculation for each step
  const getStepProgress = (step: string) => {
    const stepTasks = tasks.filter(t => t.step === step);
    const completed = stepTasks.filter(t => t.status === "done").length;
    return { completed, total: stepTasks.length };
  };

  // Drag and drop handler
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    // Only allow status change, not reordering within column
    if (source.droppableId === destination.droppableId) return;
    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    setUpdating(true);
    // Optimistically update UI
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
    // Persist to Supabase
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    setUpdating(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => { setShowModal(true); setEditTask(null); setForm({ title: '', description: '', step: steps[0] || '', order: 1, status: 'todo', assigned_to: '', due_date: '' }); }}
        >+ Add Task</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading tasks...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-12">
            {grouped.map(({ step, tasks: stepTasks }) => {
              const { completed, total } = getStepProgress(step);
              return (
                <div key={step}>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-semibold">{step}</h3>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded h-2 relative">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
                      />
                      <span className="absolute right-2 top-[-22px] text-xs text-gray-500">{completed}/{total} done</span>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    {STATUSES.map(status => (
                      <Droppable droppableId={status.key} key={status.key} direction="vertical">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 min-h-[80px] space-y-3 p-2 rounded transition border ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                          >
                            <div className="font-medium mb-2 px-2">{status.label}</div>
                            {stepTasks.filter(t => t.status === status.key).map((task, idx) => (
                              <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`rounded p-4 shadow ${status.color} border border-gray-300 dark:border-gray-700 transition ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                                    style={{ ...provided.draggableProps.style, opacity: updating ? 0.6 : 1 }}
                                    onDoubleClick={() => { setEditTask(task); setForm(task); setShowModal(true); }}
                                  >
                                    <div className="font-semibold flex justify-between items-center">
                                      <span>{task.title}</span>
                                      {task.assigned_to && <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">{task.assigned_to}</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                                    {task.due_date && <div className="text-xs text-red-500 mt-1">Due: {task.due_date}</div>}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
      {/* Modal for create/edit task */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-8 z-10 w-full max-w-md relative">
            <Dialog.Title className="text-lg font-bold mb-4">{editTask ? 'Edit Task' : 'Add Task'}</Dialog.Title>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setUpdating(true);
                if (editTask) {
                  // Update
                  await supabase.from('tasks').update(form).eq('id', editTask.id);
                  setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...form } : t));
                } else {
                  // Insert
                  const { data } = await supabase.from('tasks').insert([form]).select();
                  if (data && data[0]) setTasks(prev => [...prev, data[0]]);
                }
                setShowModal(false);
                setUpdating(false);
              }}
              className="space-y-4"
            >
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={form.step}
                  onChange={e => setForm(f => ({ ...f, step: e.target.value }))}
                  required
                >
                  {steps.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-16"
                  min={1}
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value, 10) }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  required
                >
                  {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <input
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Assignee"
                  value={form.assigned_to}
                  onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                />
              </div>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={form.due_date || ''}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  onClick={() => setShowModal(false)}
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  disabled={updating}
                >{editTask ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

