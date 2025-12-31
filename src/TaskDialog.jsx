import { useEffect, useState } from 'react'

function TaskDialog({ isOpen, onClose, onCreate, projects }) {
  const [form, setForm] = useState({
    title: '',
    projectId: projects[0]?.id ?? '',
    dueDate: '',
  })

  useEffect(() => {
    if (!isOpen) {
      setForm({ title: '', projectId: projects[0]?.id ?? '', dueDate: '' })
    }
  }, [isOpen, projects])

  if (!isOpen) return null

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.projectId) return
    onCreate({
      title: form.title.trim(),
      projectId: Number(form.projectId),
      dueDate: form.dueDate,
    })
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-2 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl mx-auto my-8 overflow-visible" style={{maxWidth: '420px'}}>
        <h2 className="text-base font-semibold text-slate-900">New Task</h2>
        <p className="mt-1 text-xs text-slate-500">Create a task and assign it to a project.</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">Task title</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-slate-900"
              placeholder="e.g. Design landing page hero"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Project</label>
            <select
              value={form.projectId}
              onChange={(event) => handleChange('projectId', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => handleChange('dueDate', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
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
              className="rounded-lg bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskDialog
