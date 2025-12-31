import ProjectCard from './ProjectCard'

function ProjectView({ projects, formatDate, searchTerm, onSearchChange, onEdit, onDelete }) {
  return (
    <section className="mt-4">
      <div className="mb-6">
        <div className="w-full rounded-xl border border-transparent bg-slate-100 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus-within:border-slate-300 focus-within:bg-white">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search projects..."
            className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
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
          />
        ))}
      </div>
    </section>
  )
}

export default ProjectView
