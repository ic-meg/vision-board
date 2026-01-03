function TaskItem({ task, projectName, formatDate, assignee, onEdit }) {
  const { title, status: rawStatus, dueDate, description, priority } = task
  const status = rawStatus === 'open' ? 'todo' : rawStatus
  const isOverdue = rawStatus === 'overdue'
  const dateLabel = `${formatDate(dueDate)}${isOverdue ? ' (Overdue)' : ''}`

  const statusClass = ({
    todo: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-200 text-slate-800',
  }[status]) || 'bg-slate-100 text-slate-700'

  const priorityClass = ({
    high: 'bg-emerald-200 text-emerald-900',
    medium: 'bg-emerald-50 text-emerald-700',
    low: 'bg-emerald-50 text-emerald-700',
  }[priority]) || 'bg-emerald-50 text-emerald-700'

  return (
    <div
      className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md cursor-pointer"
      onClick={() => onEdit?.(task)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{title}</p>
          {priority ? (
            <span className={`rounded-full px-2 py-[3px] text-[11px] font-medium ${priorityClass}`}>{priority}</span>
          ) : null}
          {status ? (
            <span className={`rounded-full px-2 py-[3px] text-[11px] font-medium ${statusClass}`}>{status}</span>
          ) : null}
        </div>
        {projectName ? <p className="mt-0.5 text-xs text-slate-500">{projectName}</p> : null}
        {description ? <p className="mt-1 text-xs text-slate-600">{description}</p> : null}
        {assignee ? (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <img src={assignee.avatar} alt={assignee.name} title={assignee.name} className="h-5 w-5 rounded-full border border-white shadow" />
            <span>{assignee.name}</span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <p className={`text-xs font-medium ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>{dateLabel}</p>
        {onEdit && (
          <button
            type="button"
            title="Edit task"
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-600"
            onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M15.58 3.58a2 2 0 0 1 2.83 2.83l-9.19 9.19a2 2 0 0 1-.88.51l-3.3.94a.5.5 0 0 1-.62-.62l.94-3.3a2 2 0 0 1 .51-.88l9.19-9.19zm1.42 1.41a1 1 0 0 0-1.41 0l-.88.88 1.41 1.41.88-.88a1 1 0 0 0 0-1.41z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskItem
