function StatCard({ label, value, icon, accent }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className={accent}>{icon}</span>
      </div>
      <div className="mt-4 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function DashboardStats({ stats }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Projects" value={stats.totalProjects} icon="◎" accent="text-sky-500" />
      <StatCard label="Total Tasks" value={stats.totalTasks} icon="⏱" accent="text-violet-500" />
      <StatCard label="In Progress" value={stats.inProgress} icon="⧗" accent="text-orange-500" />
      <StatCard label="Completed" value={stats.completed} icon="✔" accent="text-emerald-500" />
      <StatCard label="Overdue" value={stats.overdue} icon="!" accent="text-rose-500" />
    </section>
  )
}

export default DashboardStats
