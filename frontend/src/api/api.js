const API = import.meta.env.VITE_API || "http://localhost:5000";

async function parseJson(resp) {
  if (resp.status === 204) return null;
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

async function handleResponse(resp) {
  if (resp.status === 401 || resp.status === 403) {
    // clear local auth and raise — caller (AuthContext) will handle redirect/logout
    clearAuthStorage();
    const errBody = await parseJson(resp).catch(() => null);
    const err = new Error((errBody && errBody.error) || "Authentication failed");
    err.status = resp.status;
    throw err;
  }

  if (!resp.ok) {
    const errBody = await parseJson(resp).catch(() => null);
    const message = (errBody && errBody.error) || resp.statusText || "API Error";
    const err = new Error(message);
    err.status = resp.status;
    throw err;
  }

  return parseJson(resp);
}

export async function apiCall(path, options = {}) {
  const resp = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  return handleResponse(resp);
}

export async function authCall(path, options = {}) {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }

  const resp = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  try {
    return await handleResponse(resp);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      clearAuthStorage();
    }
    throw err;
  }
}

// --- Auth
export async function loginUser(email, password) {
  return apiCall("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(userData) {
  return apiCall("/registrations", {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      status: "pending",
      createdAt: new Date().toISOString(),
    }),
  });
}

export async function getCurrentUser() {
  return authCall("/users/verify-token", { method: "POST" });
}

// --- Tasks
export async function fetchTasks() {
  return authCall("/tasks");
}
export async function fetchUsers() {
  return authCall("/users");
}
export async function createTask(taskData) {
  return authCall("/tasks", {
    method: "POST",
    body: JSON.stringify({ ...taskData, comments: taskData.comments || [] }),
  });
}

export async function updateTask(taskData) {
  // taskData must contain id or _id
  const taskId = taskData.id || taskData._id;
  if (!taskId) throw new Error("updateTask requires taskData.id or taskData._id");
  const updateData = { ...taskData };
  delete updateData.id;
  delete updateData._id;
  return authCall(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ ...updateData, comments: updateData.comments || [] }),
  });
}

export async function patchTask(id, updates) {
  return authCall(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id) {
  return authCall(`/tasks/${id}`, { method: "DELETE" });
}

export async function getTask(id) {
  return authCall(`/tasks/${id}`);
}

export async function addComment(taskId, { text }) {
  if (!text || !text.trim()) {
    throw new Error("Comment text is required");
  }
  return authCall(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// Update user profile (PATCH request for partial updates)
export async function updateUserProfile(userId, profileData) {
  return authCall(`/users/${userId}`, {
    method: 'PUT', // Using PUT for complete profile update
    body: JSON.stringify(profileData)
  });
}

// Alternative: Patch user for partial updates
export async function patchUser(userId, updates) {
  return authCall(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

// --- Admin / Registrations
export async function fetchRegistrations() {
  return authCall("/registrations");
}

export async function approveRegistration(reg, role = "developer") {
  return authCall(`/registrations/${reg._id || reg.id}/approve`, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function declineRegistration(id) {
  return authCall(`/registrations/${id}`, { method: "DELETE" });
}

export async function createUser(userData) {
  return authCall("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function deleteUser(userId) {
  return authCall(`/users/${userId}`, { method: "DELETE" });
}

// --- Helpers (same names used elsewhere in your frontend)
export function isAuthenticated() {
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("auth_user");
  return !!(token && user);
}

export function getCurrentUserFromStorage() {
  const userStr = localStorage.getItem("auth_user");
  return userStr ? JSON.parse(userStr) : null;
}

export function logoutUser() {
  clearAuthStorage();
}

export default {
  apiCall,
  authCall,
  loginUser,
  registerUser,
  getCurrentUser,
  fetchTasks,
  fetchUsers,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
  getTask,
  addComment,
  createUser,
  updateUserProfile,
  patchUser,
};

