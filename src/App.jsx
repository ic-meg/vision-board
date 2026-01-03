import { useMemo, useState } from 'react'
import './App.css'
import AuthPage from './components/AuthPage'
import DashboardStats from './components/DashboardStats'
import ProjectView from './components/ProjectView'
import TaskView from './components/TaskView'
import ProjectTasksView from './components/ProjectTasksView'
import ProjectCard from './components/ProjectCard'
import TaskItem from './components/TaskItem'
import ProjectDialog from './components/ProjectDialog'
import TaskDialog from './components/TaskDialog'

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
  const [editingTask, setEditingTask] = useState(null)
  const [projectSearch, setProjectSearch] = useState('')
  const [taskSearch, setTaskSearch] = useState('')
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [projectTaskSearch, setProjectTaskSearch] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState('all')
  const [projectPriorityFilter, setProjectPriorityFilter] = useState('all')

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

  function openProjectTasks(project) {
    setSelectedProjectId(project.id)
    setActiveTab('projectTasks')
  }

  function handleCreateTask(input) {
    const title = input.title.trim()
    if (!title) return

    const nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1

    const task = {
      id: nextId,
      title,
      description: input.description || '',
      projectId: input.projectId,
      dueDate: input.dueDate || new Date().toISOString().slice(0, 10),
      status: input.status || 'open',
      priority: input.priority || 'medium',
      assigneeId: input.assigneeId,
    }

    setTasks((prev) => [...prev, task])
    setIsTaskDialogOpen(false)
    setEditingTask(null)
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  function handleUpdateTask(updated) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
    setIsTaskDialogOpen(false)
    setEditingTask(null)
  }

  function backToProjects() {
    setSelectedProjectId(null)
    setProjectTaskSearch('')
    setProjectStatusFilter('all')
    setProjectPriorityFilter('all')
    setActiveTab('projects')
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

  const filteredTasks = useMemo(() => {
    const query = taskSearch.trim().toLowerCase()
    if (!query) return tasks
    return tasks.filter((task) => `${task.title}`.toLowerCase().includes(query))
  }, [tasks, taskSearch])

  const selectedProject = useMemo(() => {
    return selectedProjectId ? projectsById.get(selectedProjectId) : null
  }, [selectedProjectId, projectsById])

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return []
    const base = tasks.filter((t) => t.projectId === selectedProjectId && t.status !== 'completed')
    const q = projectTaskSearch.trim().toLowerCase()
    const searched = q ? base.filter((t) => `${t.title}`.toLowerCase().includes(q)) : base
    if (projectStatusFilter === 'all') return searched
    if (projectStatusFilter === 'todo') return searched.filter((t) => t.status === 'open' || t.status === 'todo')
    if (projectStatusFilter === 'in-progress') return searched.filter((t) => t.status === 'in-progress')
    const statusFiltered = searched
    // Apply priority filter on top
    if (projectPriorityFilter === 'all') return statusFiltered
    return statusFiltered.filter((t) => (t.priority || 'medium') === projectPriorityFilter)
  }, [tasks, selectedProjectId, projectTaskSearch, projectStatusFilter, projectPriorityFilter])

  if (!isAuthenticated) {
    return (
      <AuthPage
        initialMode="signin"
        onAuthenticated={() => setIsAuthenticated(true)}
      />
    )
  }

  // Background is fixed to theme gradient
  const bgClass = 'app-background-gradient'

  return (
    <div className={`app-zoom min-h-screen bg-white ${bgClass} text-slate-900`}>
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
          <div className="flex items-center gap-3">
            <button
            type="button"
            onClick={() => setIsProjectDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-400"
          >
            <span className="text-base font-semibold">+</span>
            New Project
            </button>
          </div>
        </header>

        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${activeTab === 'dashboard' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px]">
              ⌘
            </span>
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${activeTab === 'projects' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] text-emerald-700">
              📁
            </span>
            Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${activeTab === 'tasks' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] text-emerald-700">
              ✅
            </span>
            All Tasks
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
                    onOpen={openProjectTasks}
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
                  className="rounded-full border border-black px-3 py-1 text-xs font-medium text-black hover:bg-emerald-50"
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
        ) : activeTab === 'projects' ? (
          <ProjectView
            projects={filteredProjects}
            formatDate={formatDate}
            searchTerm={projectSearch}
            onSearchChange={setProjectSearch}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onOpen={openProjectTasks}
          />
        ) : activeTab === 'tasks' ? (
          <TaskView
            tasks={filteredTasks}
            projectsById={projectsById}
            formatDate={formatDate}
            searchTerm={taskSearch}
            onSearchChange={setTaskSearch}
            onNewTask={() => setIsTaskDialogOpen(true)}
            onEditTask={handleEditTask}
          />
        ) : activeTab === 'projectTasks' && selectedProject ? (
          <ProjectTasksView
            project={selectedProject}
            tasks={projectTasks}
            projectsById={projectsById}
            formatDate={formatDate}
            searchTerm={projectTaskSearch}
            statusFilter={projectStatusFilter}
            onSearchChange={setProjectTaskSearch}
            onStatusChange={setProjectStatusFilter}
            priorityFilter={projectPriorityFilter}
            onPriorityChange={setProjectPriorityFilter}
            onNewTask={() => setIsTaskDialogOpen(true)}
            onEditTask={handleEditTask}
            onBack={backToProjects}
          />
        ) : null}
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
        onUpdate={handleUpdateTask}
        editingTask={editingTask}
        projects={projects}
      />
    </div>
  )
}

export default App
