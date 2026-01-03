import TaskItem from './TaskItem'
import { TEAM_MEMBERS } from './teamMembers'

function TaskView({ tasks, projectsById, formatDate, searchTerm, onSearchChange, onNewTask, onEditTask }) {
  const hasTasks = tasks?.length > 0
  const inputWrap = 'w-full rounded-xl border border-transparent bg-slate-100 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus-within:border-slate-300 focus-within:bg-white'
  const inputClass = 'w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none'
  const newBtnClass = 'shrink-0 rounded-full border border-black px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-50'

  return (
    <section className="mt-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className={inputWrap}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className={inputClass}
          />
        </div>
        <button type="button" onClick={onNewTask} className={newBtnClass}>
          + New Task
        </button>
      </div>

      {hasTasks ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const project = projectsById.get(task.projectId)
            const assignee = task.assigneeId ? TEAM_MEMBERS.find((m) => m.id === task.assigneeId) : null
            return (
              <TaskItem
                key={task.id}
                task={task}
                projectName={project ? project.name : ''}
                formatDate={formatDate}
                assignee={assignee || undefined}
                onEdit={() => onEditTask?.(task)}
              />
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No tasks found. Create one to get started.
        </div>
      )}
    </section>
  )
}

export default TaskView
