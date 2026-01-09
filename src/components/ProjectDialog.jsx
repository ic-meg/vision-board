import { useEffect, useState } from 'react'

function ProjectDialog({ isOpen, onClose, onCreate, editingProject, allMembers, onAddMember, onUpdateMember, onDeleteMember }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    team: [],
  })

  const [errors, setErrors] = useState({ name: '', endDate: '', general: '' })
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [editingMemberId, setEditingMemberId] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setErrors({ name: '', endDate: '', general: '' })
      if (editingProject) {
        // Ensure endDate is a valid YYYY-MM-DD string for input type="date"
        let endDate = editingProject.endDate || ''
        if (endDate && endDate.length > 10) {
          endDate = String(endDate).slice(0, 10)
        }
        setForm({
          name: editingProject.name || '',
          description: editingProject.description || '',
          startDate: editingProject.startDate || '',
          endDate,
          id: editingProject.id,
          team: editingProject.team || [],
        })
      } else {
        setForm({ name: '', description: '', startDate: '', endDate: '', team: [] })
      }
    }
  }, [isOpen, editingProject])

  if (!isOpen) return null

  const { name, description, startDate, endDate, team } = form
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900'
  const onField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    //when user starts typing, this is where we clear the field 
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const isEdit = !!editingProject
  

  // Compute today's date in local YYYY-MM-DD format 
  const getLocalToday = () => {
    const d = new Date()
    //apply time zone so we get the local araw
    const tzOffset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - tzOffset * 60000)
    return local.toISOString().split('T')[0]
  }

  const today = getLocalToday()
  const minDate = (() => {
    if (isEdit && endDate) {
      return endDate < today ? endDate : today
    }
    return today
  })()

  function handleToggleMember(id) {
    setForm((prev) => {
      const team = prev.team.includes(id)
        ? prev.team.filter((mid) => mid !== id)
        : [...prev.team, id]
      return { ...prev, team }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    
    // Reset all errors
    setErrors({ name: '', endDate: '', general: '' })
    
    // Validate all required fields
    const newErrors = {}
    if (!form.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    
    if (!form.endDate && !isEdit) {
      newErrors.endDate = 'Deadline is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }))
      return
    }

    try {
      const result = onCreate(form);
      if (result && typeof result.then === 'function') {
        await result;
      }
      setErrors({ name: '', endDate: '', general: '' });
    } catch (err) {
      // Check for duplicate project name error from backend
      const msg = err?.message || err?.toString() || '';
      if (msg.includes('already exists')) {
        setErrors(prev => ({ ...prev, name: 'A project with this name already exists.' }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Failed to create project' }));
      }
    }
  }

  function handleAddMember() {
    const name = newMemberName.trim()
    if (!name) return
    const role = newMemberRole.trim() || 'Member'
    if (editingMemberId) {
      onUpdateMember?.({ id: editingMemberId, name, role })
    } else {
      onAddMember?.({ name, role })
    }
    setNewMemberName('')
    setNewMemberRole('')
    setEditingMemberId(null)
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
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
        {errors.general && (
          <p className="mt-2 text-sm text-red-600 text-center">{errors.general}</p>
        )}
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={onField('name')}
              className={inputClass}
              placeholder="e.g. New Website Launch"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={onField('description')}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Enter project description"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Deadline *</label>
            <input
              type="date"
              value={endDate ? String(endDate).slice(0, 10) : ''}
              onChange={onField('endDate')}
              placeholder="mm/dd/yyyy"
              className={inputClass}
              min={minDate}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
          {/* Team member assignment UI */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Assign Team Members ({team.length} selected)</label>
            {onAddMember && (
              <div className="mb-2 flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="New member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 outline-none focus:border-slate-900"
                />
                <input
                  type="text"
                  placeholder="Role (optional)"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-32 rounded-lg border border-slate-200 px-2 py-1 outline-none focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600"
                >
                  {editingMemberId ? 'Save' : 'Add'}
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {(allMembers || []).map((member) => {
                const selected = team.includes(member.id)
                const cls = selected
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
                return (
                  <div
                    key={member.id}
                    onClick={() => handleToggleMember(member.id)}
                    className={`relative flex items-center gap-3 rounded-xl border px-3 py-2 transition-all text-left cursor-pointer ${cls}`}
                  >
                    {selected && (
                      <span className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white shadow-md ring-4 ring-emerald-300/40">
                        ✓
                      </span>
                    )}
                    <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 text-sm">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                    <div className="ml-2 flex items-center gap-1 text-xs">
                      {onUpdateMember && (
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm ring-1 ring-slate-200 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Edit member"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingMemberId(member.id)
                            setNewMemberName(member.name)
                            setNewMemberRole(member.role || '')
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path d="M15.58 3.58a2 2 0 0 1 2.83 2.83l-9.19 9.19a2 2 0 0 1-.88.51l-3.3.94a.5.5 0 0 1-.62-.62l.94-3.3a2 2 0 0 1 .51-.88l9.19-9.19zm1.42 1.41a1 1 0 0 0-1.41 0l-.88.88 1.41 1.41.88-.88a1 1 0 0 0 0-1.41z" />
                          </svg>
                        </button>
                      )}
                      {onDeleteMember && (
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm ring-1 ring-slate-200 hover:text-red-600 hover:bg-red-50"
                          title="Remove member"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteMember(member.id)
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path fillRule="evenodd" d="M6.5 4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V5H17a1 1 0 1 1 0 2h-1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7H3a1 1 0 1 1 0-2h2V4zm2 1v9a1 1 0 1 0 2 0V5h-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
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
