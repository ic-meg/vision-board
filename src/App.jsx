import { useMemo, useState } from 'react'
import './App.css'
import AuthPage from './AuthPage'
import DashboardStats from './DashboardStats'
import ProjectView from './ProjectView'
import ProjectCard from './ProjectCard'
import TaskItem from './TaskItem'
import ProjectDialog from './ProjectDialog'
import TaskDialog from './TaskDialog'

const initialProjects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern UI/UX',
    status: 'active',
    phase: 'execution',
    dueDate: '2025-02-15',
    tasksTotal: 3,
    tasksCompleted: 1,
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Build cross-platform mobile app for iOS and Android',
    status: 'planning',
    phase: 'planning',
    dueDate: '2025-03-30',
    tasksTotal: 2,
    tasksCompleted: 1,
  },
  {
    id: 3,
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign planning and execution',
    status: 'active',
    phase: 'execution',
    dueDate: '2025-01-31',
    tasksTotal: 2,
    tasksCompleted: 0,
  },
]

const initialTasks = [
  {
    id: 1,
    title: 'Create social media content calendar',
    projectId: 3,
    dueDate: '2025-01-05',
    status: 'overdue',
  },
  {
    id: 2,
    title: 'Implement responsive navigation',
    projectId: 1,
    dueDate: '2025-01-25',
    status: 'overdue',
  },
  {
    id: 3,
    title: 'Design email templates',
    projectId: 3,
    dueDate: '2025-01-28',
    status: 'overdue',
  },
  {
    id: 4,
    title: 'Set up content management system',
    projectId: 1,
    dueDate: '2025-02-01',
    status: 'overdue',
  },
  {
    id: 5,
    title: 'Design app wireframes',
    projectId: 2,
    dueDate: '2025-02-05',
    status: 'overdue',
  },
]

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState(initialProjects)
  const [tasks, setTasks] = useState(initialTasks)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')
  const [editingProject, setEditingProject] = useState(null)

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalTasks = tasks.length

    const inProgress = projects.filter(
      (project) => project.tasksCompleted > 0 && project.tasksCompleted < project.tasksTotal,
    ).length

    const completed = projects.filter(
      (project) => project.tasksCompleted === project.tasksTotal && project.tasksTotal > 0,
    ).length

    const overdue = tasks.filter((task) => task.status === 'overdue').length

    return { totalProjects, totalTasks, inProgress, completed, overdue }
  }, [projects, tasks])

  function handleCreateProject(input) {
    const name = input.name.trim()
    if (!name) return
    const nextId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1

    const project = {
      id: nextId,
      name,
      description:
        input.description.trim() || 'New project created from dashboard',
      status: input.status || 'planning',
      phase: 'planning',
      dueDate: input.dueDate || new Date().toISOString().slice(0, 10),
      tasksTotal: 0,
      tasksCompleted: 0,
    }

    setProjects((prev) => [...prev, project])
    setIsProjectDialogOpen(false)
  }

  function handleEditProject(project) {
    setEditingProject(project)
    setIsProjectDialogOpen(true)
  }

  function handleUpdateProject(updated) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
    setIsProjectDialogOpen(false)
    setEditingProject(null)
  }

  function handleDeleteProject(project) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    }
  }

  function handleCreateTask(input) {
    const title = input.title.trim()
    if (!title) return

    const nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1

    const task = {
      id: nextId,
      title,
      projectId: input.projectId,
      dueDate: input.dueDate || new Date().toISOString().slice(0, 10),
      status: 'open',
    }

    setTasks((prev) => [...prev, task])
    setIsTaskDialogOpen(false)
  }

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [tasks])

  const projectsById = useMemo(() => {
    const map = new Map()
    projects.forEach((project) => {
      map.set(project.id, project)
    })
    return map
  }, [projects])

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase()
    if (!query) return projects
    return projects.filter((project) => {
      const text = `${project.name} ${project.description}`.toLowerCase()
      return text.includes(query)
    })
  }, [projects, projectSearch])

  if (!isAuthenticated) {
    return (
      <AuthPage
        initialMode="signin"
        onAuthenticated={() => setIsAuthenticated(true)}
      />
    )
  }

  return (
    <div className="app-zoom min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Task Management System
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your projects and tasks efficiently
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsProjectDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">
              +
            </span>
            New Project
          </button>
        </header>

        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px]">
              ⌘
            </span>
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${activeTab === 'projects' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-700">
              📁
            </span>
            Projects
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            <DashboardStats stats={stats} />

            <section className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent Projects
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    formatDate={formatDate}
                    compact
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
              {projects.length > 3 && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 shadow"
                    onClick={() => setActiveTab('projects')}
                  >
                    View All
                  </button>
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Upcoming Deadlines
                </h2>
                <button
                  type="button"
                  onClick={() => setIsTaskDialogOpen(true)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  + New Task
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => {
                  const project = projectsById.get(task.projectId)
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      projectName={project ? project.name : ''}
                      formatDate={formatDate}
                    />
                  )
                })}
              </div>
            </section>
          </>
        ) : (
          <ProjectView
            projects={filteredProjects}
            formatDate={formatDate}
            searchTerm={projectSearch}
            onSearchChange={setProjectSearch}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        )}
      </div>
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => { setIsProjectDialogOpen(false); setEditingProject(null); }}
        onCreate={editingProject ? handleUpdateProject : handleCreateProject}
        editingProject={editingProject}
      />
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onCreate={handleCreateTask}
        projects={projects}
      />
    </div>
  )
}

export default App
