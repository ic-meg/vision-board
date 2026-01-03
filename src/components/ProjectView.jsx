import ProjectCard from './ProjectCard'

function ProjectView({ projects, formatDate, searchTerm, onSearchChange, onEdit, onDelete, onOpen }) {
  const inputWrap = 'w-full rounded-xl border border-transparent bg-slate-100 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus-within:border-slate-300 focus-within:bg-white'
  const inputClass = 'w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none'

  return (
    <section className="mt-4">
      <div className="mb-6">
        <div className={inputWrap}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            formatDate={formatDate}
            showPhase
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  )
}

export default ProjectView
