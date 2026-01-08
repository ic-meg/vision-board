function TaskItem({ task, projectName, formatDate, assignee, onEdit, onDelete, onToggleComplete }) {
  const { title, status: rawStatus, dueDate, description, priority } = task
  const status = rawStatus === 'open' ? 'todo' : rawStatus
  const isOverdue = rawStatus === 'overdue'
  const isCompleted = status === 'completed'
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

  const titleClass = isCompleted
    ? 'font-medium text-slate-400 line-through'
    : 'font-medium text-slate-900'

  return (
    <div
      className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md cursor-pointer"
      onClick={() => onEdit?.(task)}
    >
      <div className="flex flex-1 items-start gap-3">
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => {
              e.stopPropagation()
              onToggleComplete?.(task)
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
          <p className={titleClass}>{title}</p>
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
        {onDelete && (
          <button
            type="button"
            title="Delete task"
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete?.(task); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M6.5 4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V5H17a1 1 0 1 1 0 2h-1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7H3a1 1 0 1 1 0-2h2V4zm2 1v9a1 1 0 1 0 2 0V5h-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskItem
