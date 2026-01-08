const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function signUp(data) {
  return request('/auth', { method: 'POST', body: JSON.stringify(data) });
}

export function signIn(data) {
  return request('/auth/signin', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAccount(id, data) {
  return request(`/auth/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteAccount(id) {
  return request(`/auth/${id}`, { method: 'DELETE' });
}

// Projects
export function fetchProjects(userId) {
  const query = userId ? `?userId=${userId}` : '';
  return request(`/project${query}`);
}

export function createProject(data) {
  return request('/project', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProject(id, data) {
  return request(`/project/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteProject(id) {
  return request(`/project/${id}`, { method: 'DELETE' });
}

// Tasks
export function fetchTasks(userId) {
  const query = userId ? `?userId=${userId}` : '';
  return request(`/task${query}`);
}

export function createTask(data) {
  const { assigneeId, ...rest } = data;
  const payload = {
    ...rest,
    status: rest.status === 'in-progress' ? 'in_progress' : rest.status,
  };
  return request('/task', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateTask(id, data) {
  const { assigneeId, ...rest } = data;
  const payload = {
    ...rest,
    status: rest.status === 'in-progress' ? 'in_progress' : rest.status,
  };
  return request(`/task/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteTask(id) {
  return request(`/task/${id}`, { method: 'DELETE' });
}