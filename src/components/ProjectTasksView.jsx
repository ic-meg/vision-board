import TaskItem from './TaskItem'

function ProgressBar({ completed, total }) {
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Project Progress</span>
        <span>{completed}/{total} tasks completed</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-600 text-white',
    overdue: 'bg-red-100 text-red-700',
  }
  const cls = map[status] || 'bg-slate-100 text-slate-700'
  return <span className={`rounded-full px-2 py-[3px] text-[11px] font-medium ${cls}`}>{status}</span>
}

function ProjectTasksView({ project, tasks, projectsById, formatDate, searchTerm, statusFilter, priorityFilter, onSearchChange, onStatusChange, onPriorityChange, onNewTask, onEditTask, onDeleteTask, onBack, onToggleTaskComplete, teamMembers }) {
  const visibleTasks = tasks.slice()
  const q = searchTerm.trim().toLowerCase()

  const totalTasks = visibleTasks.length
  const completedTasks = visibleTasks.filter((t) => t.status === 'completed').length

  const matchQuery = (t) => !q || `${t.title}`.toLowerCase().includes(q)
  const matchStatus = (t) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'todo') return t.status === 'open' || t.status === 'todo'
    if (statusFilter === 'in-progress') return t.status === 'in-progress'
    return false
  }
  const matchPriority = (t) => {
    if (priorityFilter === 'all') return true
    return (t.priority || 'medium') === priorityFilter
  }
  return (
    <section className="mt-4">
      <div className="mb-4 flex items-start justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
          title="Back to Projects"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNewTask}
          className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600"
        >
          + Add Task
        </button>
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          {project.name}
          <StatusBadge status={project.status} />
        </h2>
        {project.description ? (
          <p className="mt-1 text-sm text-slate-600">{project.description}</p>
        ) : null}
      </div>

      <ProgressBar completed={completedTasks} total={totalTasks} />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2 w-full rounded-xl border border-transparent bg-slate-100 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus-within:border-slate-300 focus-within:bg-white">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
        <div className="flex items-center">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed" disabled>Completed (hidden)</option>
          </select>
        </div>
        <div className="flex items-center">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {visibleTasks
          .filter(matchQuery)
          .filter(matchStatus)
          .filter(matchPriority)
          .sort((a, b) => {
            const aDone = a.status === 'completed'
            const bDone = b.status === 'completed'
            if (aDone === bDone) return 0
            return aDone ? 1 : -1
          })
          .map((task) => {
            const projectForTask = projectsById.get(task.projectId)
            const assignee = task.assigneeId ? teamMembers?.find(m => m.id === task.assigneeId) : null
            return (
              <TaskItem
                key={task.id}
                task={task}
                projectName={projectForTask ? projectForTask.name : ''}
                formatDate={formatDate}
                assignee={assignee || undefined}
                onEdit={() => onEditTask?.(task)}
                onDelete={onDeleteTask ? () => onDeleteTask(task) : undefined}
                onToggleComplete={onToggleTaskComplete ? () => onToggleTaskComplete(task) : undefined}
              />
            )
          })}
      </div>
    </section>
  )
}

export default ProjectTasksView
