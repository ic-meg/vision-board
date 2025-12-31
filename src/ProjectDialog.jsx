import { useEffect, useState } from 'react'
import { TEAM_MEMBERS } from './teamMembers'

function ProjectDialog({ isOpen, onClose, onCreate, editingProject }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    team: [],
    progress: 0,
  })

  useEffect(() => {
    if (isOpen) {
      if (editingProject) {
        setForm({
          name: editingProject.name || '',
          description: editingProject.description || '',
          status: editingProject.status || 'planning',
          startDate: editingProject.startDate || '',
          endDate: editingProject.endDate || '',
          id: editingProject.id,
          team: editingProject.team || [],
          progress: editingProject.progress ?? 0,
        })
      } else {
        setForm({ name: '', description: '', status: 'planning', startDate: '', endDate: '', team: [], progress: 0 })
      }
    }
  }, [isOpen, editingProject])

  if (!isOpen) return null

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleToggleMember(id) {
    setForm((prev) => {
      const team = prev.team.includes(id)
        ? prev.team.filter((mid) => mid !== id)
        : [...prev.team, id]
      return { ...prev, team }
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    onCreate(form)
  }

  const isEdit = !!editingProject

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{isEdit ? 'Edit Project' : 'Create New Project'}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {isEdit ? 'Update project details and team members' : 'Add a new project to your workspace'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">Project Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-slate-900"
              placeholder="e.g. New Website Launch"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
              rows={3}
              placeholder="Enter project description"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700">Start Date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => handleChange('startDate', event.target.value)}
                placeholder="mm/dd/yyyy"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700">End Date *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => handleChange('endDate', event.target.value)}
                placeholder="mm/dd/yyyy"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
                required
              />
            </div>
          </div>
          {/* Progress slider */}
          <div className="mb-2 flex items-center gap-4">
            <label className="text-xs font-medium text-slate-700 whitespace-nowrap">Progress: {form.progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.progress}
              onChange={e => handleChange('progress', Number(e.target.value))}
              className="flex-1 h-2 rounded-lg outline-none focus:outline-none bg-gray-200"
              style={{
                accentColor: '#1976d2',
                height: '6px',
                marginTop: '0',
              }}
            />
          </div>
          {/* Team member assignment UI */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Assign Team Members ({form.team.length} selected)</label>
            <div className="grid grid-cols-2 gap-2">
              {TEAM_MEMBERS.map((member) => {
                const selected = form.team.includes(member.id)
                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => handleToggleMember(member.id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-all text-left ${selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 text-sm">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                    {selected && (
                      <span className="ml-2 text-emerald-600">
                        <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#10B981" fillOpacity="0.15"/><path d="M7 11.5l3 3 5-6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                )
              })}
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
              className="rounded-lg bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
            >
              {isEdit ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectDialog
