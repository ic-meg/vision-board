import { TEAM_MEMBERS } from './teamMembers'
function renderProgressBar(project) {
  // Use progress field if available, else fallback to tasks
  const percent = typeof project.progress === 'number'
    ? project.progress
    : (project.tasksTotal === 0 ? 0 : (project.tasksCompleted / project.tasksTotal) * 100);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Progress</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function ProjectCard({ project, formatDate, showPhase = false, compact = false, onEdit, onDelete }) {
  const assignedMembers = Array.isArray(project.team)
    ? TEAM_MEMBERS.filter(m => project.team.includes(m.id))
    : [];
  const status = project.status || 'active'
  let badgeClass = 'bg-slate-100 text-slate-700'
  if (status === 'active') {
    badgeClass = 'bg-emerald-100 text-emerald-700'
  } else if (status === 'planning') {
    badgeClass = 'bg-blue-100 text-blue-700'
  } else if (status === 'completed') {
    badgeClass = 'bg-slate-100 text-slate-800'
  }

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
          <p className={`mt-1 text-xs text-slate-500 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {project.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[32px]">
          <span className={`rounded-full px-2 py-[3px] text-[11px] font-medium ${badgeClass}`}>
            {status}
          </span>
          <div className="flex gap-1 mt-2">
            <button
              type="button"
              title="Edit Project"
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-600"
              onClick={() => onEdit && onEdit(project)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M15.58 3.58a2 2 0 0 1 2.83 2.83l-9.19 9.19a2 2 0 0 1-.88.51l-3.3.94a.5.5 0 0 1-.62-.62l.94-3.3a2 2 0 0 1 .51-.88l9.19-9.19zm1.42 1.41a1 1 0 0 0-1.41 0l-.88.88 1.41 1.41.88-.88a1 1 0 0 0 0-1.41z" />
              </svg>
            </button>
            <button
              type="button"
              title="Delete Project"
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600"
              onClick={() => onDelete && onDelete(project)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M6.5 4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V5H17a1 1 0 1 1 0 2h-1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7H3a1 1 0 1 1 0-2h2V4zm2 1v9a1 1 0 1 0 2 0V5h-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {renderProgressBar(project)}
      {assignedMembers.length > 0 && (
        <div className="mt-3 flex -space-x-2">
          {assignedMembers.map(member => (
            <img
              key={member.id}
              src={member.avatar}
              alt={member.name}
              title={member.name}
              className="h-7 w-7 rounded-full border-2 border-white shadow -ml-1"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="inline-flex items-center gap-1">
          <span>📅</span>
          <span>{formatDate(project.dueDate)}</span>
        </div>
        {showPhase ? <span>Phase: {project.phase}</span> : <span>{project.tasksCompleted} completed</span>}
      </div>
    </article>
  )
}

export default ProjectCard
