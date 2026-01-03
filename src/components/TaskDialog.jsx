import { useEffect, useState } from 'react'
import { TEAM_MEMBERS } from './teamMembers'

function TaskDialog({ isOpen, onClose, onCreate, onUpdate, projects, editingTask }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: '',
    projectId: projects[0]?.id ?? '',
    dueDate: '',
  })

  useEffect(() => {
    if (!isOpen) {
      setForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigneeId: '',
        projectId: projects[0]?.id ?? '',
        dueDate: '',
      })
      return
    }
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'todo',
        priority: editingTask.priority || 'medium',
        assigneeId: editingTask.assigneeId ?? '',
        projectId: editingTask.projectId ?? projects[0]?.id ?? '',
        dueDate: editingTask.dueDate || '',
        id: editingTask.id,
      })
    } else {
      setForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigneeId: '',
        projectId: projects[0]?.id ?? '',
        dueDate: '',
      })
    }
  }, [isOpen, projects, editingTask])

  if (!isOpen) return null

  const { title, description, status, priority, assigneeId, projectId, dueDate, id } = form
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900'
  const onField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  const isEdit = !!editingTask

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim() || !projectId) return
    const payload = {
      id,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
      projectId: Number(projectId),
      dueDate,
    }
    if (isEdit) onUpdate?.(payload); else onCreate(payload)
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-2 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl mx-auto my-8 overflow-visible" style={{maxWidth: '520px'}}>
        <h2 className="text-base font-semibold text-slate-900">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
        <p className="mt-1 text-xs text-slate-500">{isEdit ? 'Update task details and assignment' : 'Add a new task to the project'}</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={onField('title')}
              className={inputClass}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={onField('description')}
              className={inputClass}
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={onField('status')}
                className={inputClass}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Priority</label>
              <select
                value={priority}
                onChange={onField('priority')}
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Assign To</label>
            <select
              value={assigneeId}
              onChange={onField('assigneeId')}
              className={inputClass}
            >
              <option value="">Select user</option>
              {TEAM_MEMBERS.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-700">Project</label>
              <select
                value={projectId}
                onChange={onField('projectId')}
                className={inputClass}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={onField('dueDate')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-1.5 font-medium text-white hover:bg-emerald-600"
            >
              {isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskDialog
