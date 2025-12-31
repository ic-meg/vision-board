function TaskItem({ task, projectName, formatDate }) {
  const isOverdue = task.status === 'overdue'
  const dateLabel = `${formatDate(task.dueDate)}${isOverdue ? ' (Overdue)' : ''}`

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md">
      <div>
        <p className="font-medium text-slate-900">{task.title}</p>
        {projectName ? <p className="mt-0.5 text-xs text-slate-500">{projectName}</p> : null}
      </div>
      <p className="text-xs font-medium text-rose-500">{dateLabel}</p>
    </div>
  )
}

export default TaskItem
