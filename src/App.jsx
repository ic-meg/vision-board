import { useEffect, useMemo, useState } from 'react'
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
import AccountDialog from './components/AccountDialog'
import { fetchProjects, fetchTasks, createProject, updateProject, deleteProject, createTask, updateTask, deleteTask, updateAccount, deleteAccount } from './api/client'
import { TEAM_MEMBERS as DEFAULT_TEAM_MEMBERS } from './components/teamMembers'

function normalizeTask(task) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.dueDate)
  due.setHours(0, 0, 0, 0)

  const baseStatus = task.status === 'in_progress' ? 'in-progress' : task.status
  const isOverdue = baseStatus !== 'completed' && due < today

  return { ...task, status: isOverdue ? 'overdue' : baseStatus }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
}

function App() {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem('authUser')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const isAuthenticated = !!authUser
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [projectSearch, setProjectSearch] = useState('')
  const [taskSearch, setTaskSearch] = useState('')
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [projectTaskSearch, setProjectTaskSearch] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState('all')
  const [projectPriorityFilter, setProjectPriorityFilter] = useState('all')
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const stored = window.localStorage.getItem('teamMembers')
      return stored ? JSON.parse(stored) : DEFAULT_TEAM_MEMBERS
    } catch {
      return DEFAULT_TEAM_MEMBERS
    }
  })

  function loadProjectTeams() {
    try {
      const stored = window.localStorage.getItem('projectTeams')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  function loadTaskAssignees() {
    try {
      const stored = window.localStorage.getItem('taskAssignees')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  function persistTaskAssignees(map) {
    try {
      window.localStorage.setItem('taskAssignees', JSON.stringify(map))
    } catch {
      // ignore
    }
  }

  function persistProjectTeams(projectsList) {
    try {
      const map = {}
      projectsList.forEach((p) => {
        if (Array.isArray(p.team) && p.team.length) {
          map[p.id] = p.team
        }
      })
      window.localStorage.setItem('projectTeams', JSON.stringify(map))
    } catch {
      // ignore
    }
  }

  function persistTeamMembers(members) {
    try {
      window.localStorage.setItem('teamMembers', JSON.stringify(members))
    } catch {
      // ignore
    }
  }

  async function loadData() {
    try {
      const userId = authUser?.id
      const [proj, t] = await Promise.all([
        fetchProjects(userId),
        fetchTasks(userId),
      ])
      const teamByProject = loadProjectTeams()
      const taskAssignees = loadTaskAssignees()
      const completedByProject = new Map()
      t.forEach((task) => {
        const info = completedByProject.get(task.projectId) || { total: 0, done: 0 }
        info.total += 1
        if (task.status === 'completed') info.done += 1
        completedByProject.set(task.projectId, info)
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      setProjects(
        proj.map((p) => {
          const info = completedByProject.get(p.id)
          const total = info?.total ?? 0
          const done = info?.done ?? 0
          const allCompleted = total > 0 && done === total

          const due = new Date(p.dueDate)
          due.setHours(0, 0, 0, 0)
          const isOverdue = !allCompleted && due < today

          let uiStatus
          if (isOverdue) {
            uiStatus = 'overdue'
          } else if (allCompleted) {
            uiStatus = 'completed'
          } else {
            uiStatus = 'active'
          }

          return { ...p, status: uiStatus, team: teamByProject[p.id] ?? [] }
        }),
      )

      setTasks(
        t.map((task) =>
          normalizeTask({ ...task, assigneeId: taskAssignees[task.id] ?? task.assigneeId }),
        ),
      )
    } catch (err) {
      console.error('Failed to load data', err)
    }
  }

  useEffect(() => {
    if (authUser) {
      loadData()
    }
  }, [authUser])

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalTasks = tasks.length

    let inProgress = 0
    let projectsCompleted = 0

    projects.forEach((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id)
      const total = projectTasks.length
      const done = projectTasks.filter((t) => t.status === 'completed').length

      if (total > 0 && done === total) {
        projectsCompleted += 1
      } else if (total > 0 && done > 0 && done < total) {
        inProgress += 1
      }
    })

    const overdue = tasks.filter((task) => task.status === 'overdue').length

    const tasksCompleted = tasks.filter((task) => task.status === 'completed').length
    return { totalProjects, totalTasks, inProgress, completed: projectsCompleted, overdue, projectCompleted: projectsCompleted, taskCompleted: tasksCompleted }
  }, [projects, tasks])

  async function handleCreateProject(input) {
    const name = input.name.trim()
    if (!name) return
    const payload = {
      name,
      description: input.description.trim() || 'New project created from dashboard',
      status: 'active',
      phase: 'planning',
      startDate: input.startDate || new Date().toISOString().slice(0, 10),
      endDate: input.endDate || input.startDate || new Date().toISOString().slice(0, 10),
      // Store end date as dueDate for backend
      dueDate: input.endDate || input.startDate || new Date().toISOString().slice(0, 10),
      progress: typeof input.progress === 'number' ? input.progress : 0,
      ownerId: authUser?.id,
    }
    try {
      const created = await createProject(payload)
      setProjects((prev) => {
        const next = [...prev, { ...created, tasksTotal: 0, tasksCompleted: 0, team: input.team || [] }]
        persistProjectTeams(next)
        return next
      })
      setIsProjectDialogOpen(false)
      await loadData()
    } catch (err) {
      console.error('Failed to create project', err)
    }
  }

  function handleEditProject(project) {
    setEditingProject(project)
    setIsProjectDialogOpen(true)
  }

  async function handleUpdateProject(updated) {
    try {
      const payload = {
        name: updated.name.trim(),
        description: updated.description.trim(),
        startDate: updated.startDate,
        endDate: updated.endDate,
        // keep backend dueDate in sync with end date (or start date fallback)
        dueDate: updated.endDate || updated.startDate || new Date().toISOString().slice(0, 10),
      }
			await updateProject(updated.id, payload)
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        persistProjectTeams(next)
        return next
      })
      setIsProjectDialogOpen(false)
      setEditingProject(null)
      await loadData()
    } catch (err) {
      console.error('Failed to update project', err)
    }
  }

  async function handleDeleteProject(project) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(project.id)
        setProjects((prev) => {
          const next = prev.filter((p) => p.id !== project.id)
          persistProjectTeams(next)
          return next
        })
        setTasks((prev) => {
          const remaining = prev.filter((t) => t.projectId !== project.id)
          const map = loadTaskAssignees()
          prev.forEach((t) => {
            if (t.projectId === project.id) {
              delete map[t.id]
            }
          })
          persistTaskAssignees(map)
          return remaining
        })
        await loadData()
      } catch (err) {
        console.error('Failed to delete project', err)
      }
    }
  }

  function openProjectTasks(project) {
    setSelectedProjectId(project.id)
    setActiveTab('projectTasks')
  }

  async function handleCreateTask(input) {
    const title = input.title.trim()
    if (!title) return
    const payload = {
      title,
      description: input.description || '',
      projectId: input.projectId,
      dueDate: input.dueDate || new Date().toISOString().slice(0, 10),
      status: input.status || 'open',
      priority: input.priority || 'medium',
			assigneeId: input.assigneeId ? Number(input.assigneeId) : undefined,
    }
    try {
      const created = await createTask(payload)
      const localTask = normalizeTask({ ...created, assigneeId: payload.assigneeId })
      setTasks((prev) => {
        const next = [...prev, localTask]
        const map = loadTaskAssignees()
        if (payload.assigneeId) {
          map[localTask.id] = payload.assigneeId
          persistTaskAssignees(map)
        }
        return next
      })
      setIsTaskDialogOpen(false)
      setEditingTask(null)
      await loadData()
    } catch (err) {
      console.error('Failed to create task', err)
    }
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  async function handleUpdateTask(updated) {
    try {
      await updateTask(updated.id, updated)
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === updated.id ? normalizeTask({ ...t, ...updated }) : t))
        const map = loadTaskAssignees()
        if (updated.assigneeId) {
          map[updated.id] = Number(updated.assigneeId)
        } else {
          delete map[updated.id]
        }
        persistTaskAssignees(map)
        return next
      })
      setIsTaskDialogOpen(false)
      setEditingTask(null)
      await loadData()
    } catch (err) {
      console.error('Failed to update task', err)
    }
  }

  function handleAddTeamMember(input) {
    const name = (input?.name || '').trim()
    if (!name) return
    const role = (input?.role || '').trim() || 'Member'
    const nextId = teamMembers.length ? Math.max(...teamMembers.map((m) => m.id)) + 1 : 1
    const avatar = input?.avatar && input.avatar.trim()
      ? input.avatar.trim()
      : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(name)}`
    const member = { id: nextId, name, role, avatar }
    const next = [...teamMembers, member]
    setTeamMembers(next)
    persistTeamMembers(next)
  }

  function handleUpdateTeamMember(input) {
    const id = input?.id
    const name = (input?.name || '').trim()
    if (!id || !name) return
    const role = (input?.role || '').trim() || 'Member'
    setTeamMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, name, role } : m))
      persistTeamMembers(next)
      return next
    })
  }

  function handleDeleteTeamMember(id) {
    if (!window.confirm('Remove this team member from the workspace?')) return
    setTeamMembers((prev) => {
      const next = prev.filter((m) => m.id !== id)
      persistTeamMembers(next)
      return next
    })

    setProjects((prev) => {
      const next = prev.map((p) =>
        Array.isArray(p.team)
          ? { ...p, team: p.team.filter((mid) => mid !== id) }
          : p,
      )
      persistProjectTeams(next)
      return next
    })

    setTasks((prev) => {
      const next = prev.map((t) =>
        t.assigneeId === id ? { ...t, assigneeId: undefined } : t,
      )
      const map = loadTaskAssignees()
      Object.keys(map).forEach((taskId) => {
        if (Number(map[taskId]) === id) {
          delete map[taskId]
        }
      })
      persistTaskAssignees(map)
      return next
    })
  }

  async function handleToggleTaskCompleted(task) {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed'
    const payload = {
      ...task,
      status: nextStatus,
    }

    try {
      await updateTask(task.id, payload)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? normalizeTask({ ...t, status: nextStatus })
            : t,
        ),
      )
      await loadData()
    } catch (err) {
      console.error('Failed to toggle task completion', err)
    }
  }

  async function handleDeleteTask(task) {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(task.id)
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== task.id)
        const map = loadTaskAssignees()
        delete map[task.id]
        persistTaskAssignees(map)
        return next
      })
      await loadData()
    } catch (err) {
      console.error('Failed to delete task', err)
    }
  }

  async function handleUpdateAccount(fields) {
    if (!authUser) return
    try {
      const updated = await updateAccount(authUser.id, fields)
      setAuthUser(updated)
      try {
        window.localStorage.setItem('authUser', JSON.stringify(updated))
      } catch {
        // ignore
      }
      setIsAccountDialogOpen(false)
    } catch (err) {
      console.error('Failed to update account', err)
    }
  }

  async function handleDeleteAccount() {
    if (!authUser) return
    try {
      await deleteAccount(authUser.id)
    } catch (err) {
      console.error('Failed to delete account', err)
    }
    handleLogout()
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
    const base = tasks.filter((t) => t.projectId === selectedProjectId)
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

  function handleAuthenticated(user) {
    setAuthUser(user)
    try {
      window.localStorage.setItem('authUser', JSON.stringify(user))
    } catch {
      // ignore storage errors
    }
    // Load data for this user
    loadData()
  }

  function handleLogout() {
    setAuthUser(null)
    setProjects([])
    setTasks([])
    try {
      window.localStorage.removeItem('authUser')
    } catch {
      // ignore storage errors
    }
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        initialMode="signin"
        onAuthenticated={handleAuthenticated}
      />
    )
  }

  // Background is fixed to theme gradient
  const bgClass = 'app-background-gradient'

  return (
    <div className={`app-zoom min-h-screen bg-white ${bgClass} text-slate-900`}>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
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
            {authUser && (
              <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm border border-slate-200">
                <span className="text-[11px] text-slate-500">
                  Welcome,
                  {' '}
                  <span className="font-semibold text-slate-900">{authUser.name}</span>
                </span>
                <span className="h-4 w-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() => setIsAccountDialogOpen(true)}
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Account
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            )}
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
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${activeTab === 'dashboard' ? 'bg-black' : 'bg-transparent'}`}
            >
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
                  onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}
                  className="rounded-full border border-black px-3 py-1 text-xs font-medium text-black hover:bg-emerald-50"
                >
                  + New Task
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => {
                  const project = projectsById.get(task.projectId)
                  const assignee = task.assigneeId ? teamMembers.find((m) => m.id === task.assigneeId) : null
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      projectName={project ? project.name : ''}
                      formatDate={formatDate}
                      assignee={assignee || undefined}
                      onToggleComplete={() => handleToggleTaskCompleted(task)}
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
            onNewTask={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleTaskComplete={handleToggleTaskCompleted}
            teamMembers={teamMembers}
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
            onNewTask={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleTaskComplete={handleToggleTaskCompleted}
            teamMembers={teamMembers}
            onBack={backToProjects}
          />
        ) : null}
      </div>
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => { setIsProjectDialogOpen(false); setEditingProject(null); }}
        onCreate={editingProject ? handleUpdateProject : handleCreateProject}
        editingProject={editingProject}
        allMembers={teamMembers}
        onAddMember={handleAddTeamMember}
        onUpdateMember={handleUpdateTeamMember}
        onDeleteMember={handleDeleteTeamMember}
      />
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => { setIsTaskDialogOpen(false); setEditingTask(null); }}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        editingTask={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
        teamMembers={teamMembers}
      />
      <AccountDialog
        isOpen={isAccountDialogOpen}
        onClose={() => setIsAccountDialogOpen(false)}
        user={authUser}
        onUpdate={handleUpdateAccount}
        onDelete={handleDeleteAccount}
      />
    </div>
  )
}

export default App
