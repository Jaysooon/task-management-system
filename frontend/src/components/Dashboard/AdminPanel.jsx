// src/components/Admin/AdminPanel.jsx
import { useEffect, useState } from "react";
import {
  fetchRegistrations,
  fetchUsers,
  approveRegistration,
  declineRegistration,
  createUser,
  deleteUser,
  updateUserProfile,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [regs, setRegs] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({}); // For registration approvals
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // Track which item is being processed
  const [editingUser, setEditingUser] = useState(null); // For inline editing
  const [editForm, setEditForm] = useState({}); // Form data for editing
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "developer" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  // Load all admin data
  async function loadData() {
    try {
      setLoading(true);
      const [regData, userData] = await Promise.all([
        fetchRegistrations().catch(() => []),
        fetchUsers().catch(() => [])
      ]);
      setRegs(regData || []);
      setUsers(userData || []);
      console.log("Admin data loaded - Registrations:", regData?.length, "Users:", userData?.length);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      setErrors({ general: "Failed to load data. Please refresh the page." });
    } finally {
      setLoading(false);
    }
  }

  if (user?.role !== "admin") return <Navigate to="/" replace />;

  // === REGISTRATION MANAGEMENT ===
  function setRoleFor(id, role) {
    setSelectedRoles((prev) => ({ ...prev, [id]: role }));
  }

  async function onApprove(reg) {
    const role = selectedRoles[reg._id] || "developer";
    setProcessing(reg._id);
    setErrors({});

    try {
      await approveRegistration(reg, role);
      // Remove from registrations and reload users to show the new user
      setRegs((prev) => prev.filter((r) => r._id !== reg._id));
      setSelectedRoles((prev) => {
        const updated = { ...prev };
        delete updated[reg._id];
        return updated;
      });
      
      // Refresh users list to include newly approved user
      const userData = await fetchUsers();
      setUsers(userData || []);
      
    } catch (error) {
      console.error("Failed to approve registration:", error);
      setErrors({ [`reg_${reg._id}`]: `Failed to approve registration: ${error.message}` });
    } finally {
      setProcessing(null);
    }
  }

  async function onDecline(reg) {
    if (!confirm(`Are you sure you want to decline the registration for ${reg.name} (${reg.email})?`)) {
      return;
    }

    setProcessing(reg._id);
    setErrors({});

    try {
      await declineRegistration(reg._id);
      setRegs((prev) => prev.filter((r) => r._id !== reg._id));
      setSelectedRoles((prev) => {
        const updated = { ...prev };
        delete updated[reg._id];
        return updated;
      });
    } catch (error) {
      console.error("Failed to decline registration:", error);
      setErrors({ [`reg_${reg._id}`]: `Failed to decline registration: ${error.message}` });
    } finally {
      setProcessing(null);
    }
  }

  // === USER MANAGEMENT ===
  
  // Validate create form
  function validateCreateForm() {
    const newErrors = {};
    if (!createForm.name.trim()) newErrors.name = "Name is required";
    if (!createForm.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) newErrors.email = "Invalid email format";
    if (!createForm.password.trim()) newErrors.password = "Password is required";
    else if (createForm.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    // Check for duplicate email
    if (users.some(u => u.email.toLowerCase() === createForm.email.toLowerCase().trim())) {
      newErrors.email = "Email already exists";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreateUser() {
    if (!validateCreateForm()) return;

    setProcessing("create");
    try {
      const newUser = await createUser(createForm);
      setUsers((prev) => [...prev, newUser]);
      setCreateForm({ name: "", email: "", password: "", role: "developer" });
      setShowCreateForm(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to create user:", error);
      setErrors({ create: `Failed to create user: ${error.message}` });
    } finally {
      setProcessing(null);
    }
  }

  function startEditUser(userData) {
    // Initialize inline editing for a user
    setEditingUser(userData._id);
    setEditForm({
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
    setErrors({});
  }

  function validateEditForm() {
    const newErrors = {};
    if (!editForm.name.trim()) newErrors.name = "Name is required";
    if (!editForm.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(editForm.email)) newErrors.email = "Invalid email format";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function saveUserEdit(userId) {
    if (!validateEditForm()) return;

    setProcessing(userId);
    try {
      const updatedUser = await updateUserProfile(userId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role
      });
      
      // Update local state with server response
      setUsers((prev) => prev.map(u => u._id === userId ? updatedUser : u));
      setEditingUser(null);
      setEditForm({});
      setErrors({});
    } catch (error) {
      console.error("Failed to update user:", error);
      setErrors({ [`edit_${userId}`]: `Failed to update user: ${error.message}` });
    } finally {
      setProcessing(null);
    }
  }

  function cancelEdit() {
    setEditingUser(null);
    setEditForm({});
    setErrors({});
  }

  async function handleDeleteUser(userData) {
    if (userData._id === user._id) {
      alert("You cannot delete your own account");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userData.name} (${userData.email})? This action cannot be undone.`)) {
      return;
    }

    setProcessing(userData._id);
    try {
      await deleteUser(userData._id);
      setUsers((prev) => prev.filter(u => u._id !== userData._id));
      setErrors({});
    } catch (error) {
      console.error("Failed to delete user:", error);
      setErrors({ [`user_${userData._id}`]: `Failed to delete user: ${error.message}` });
    } finally {
      setProcessing(null);
    }
  }

  return (
    <>
      <Navbar isHidden={false} loggedIn={true} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="animate-fade-in-right mb-6 flex items-center justify-between">
          <a
            href="/dashboard"
            className="text-sm font-semibold text-black dark:text-zinc-100 inline-flex items-center hover:text-zinc-500"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </a>
          <button
            onClick={loadData}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="animate-fade-in-right mb-6">
          <h2 className="text-3xl font-bold">Admin Panel</h2>
          <p className="text-zinc-600 dark:text-zinc-300">
            Manage user registrations and system users
          </p>
        </div>

        {/* Global Error */}
        {errors.general && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {errors.general}
          </div>
        )}

        {/* Statistics Summary */}
        <section className="animate-fade-in-up-stagger mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <span className="text-blue-600 dark:text-blue-400">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Total Users</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <span className="text-yellow-600 dark:text-yellow-400">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold">{regs.length}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Pending Registrations</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <span className="text-green-600 dark:text-green-400">🛡️</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Administrators</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pending Registrations Section */}
        <section className="animate-fade-in-scale animate-fade-in-scale mt-8">
          <h3 className="text-xl font-semibold mb-4">Pending Registrations</h3>
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-zinc-500">Loading registrations...</p>
              </div>
            ) : regs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-lg font-medium mb-2">No Pending Registrations</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  All registration requests have been processed.
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                  {regs.length} pending registration{regs.length !== 1 ? "s" : ""}
                </div>
                <div className="space-y-4">
                  {regs.map((reg) => (
                    <div key={reg._id}>
                      <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700/50">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{reg.name}</div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">{reg.email}</div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                            Submitted: {new Date(reg.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-sm">
                            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                              Role:
                            </label>
                            <select
                              value={selectedRoles[reg._id] || "developer"}
                              onChange={(e) => setRoleFor(reg._id, e.target.value)}
                              className="rounded-lg border px-3 py-2 text-sm border-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                              disabled={processing === reg._id}
                            >
                              <option value="developer">Developer</option>
                              <option value="product_owner">Product Owner</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => onApprove(reg)}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={processing === reg._id}
                            >
                              {processing === reg._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => onDecline(reg)}
                              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={processing === reg._id}
                            >
                              {processing === reg._id ? "..." : "Decline"}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Registration Error */}
                      {errors[`reg_${reg._id}`] && (
                        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                          {errors[`reg_${reg._id}`]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* User Management Section */}
        <section className="animate-fade-in-up mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">System Users</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={processing === "create"}
            >
              <FaPlus className="h-4 w-4" />
              Add User
            </button>
          </div>

          {/* Create User Form */}
          {showCreateForm && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <h4 className="font-medium mb-3">Create New User</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className={`rounded-lg border px-3 py-2 text-sm w-full dark:bg-zinc-800 ${
                      errors.name ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className={`rounded-lg border px-3 py-2 text-sm w-full dark:bg-zinc-800 ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    className={`rounded-lg border px-3 py-2 text-sm w-full dark:bg-zinc-800 ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  />
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                >
                  <option value="developer">Developer</option>
                  <option value="product_owner">Product Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {/* Create Form Error */}
              {errors.create && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {errors.create}
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateUser}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={processing === "create"}
                >
                  <FaSave className="h-4 w-4" />
                  {processing === "create" ? "Creating..." : "Create User"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({ name: "", email: "", password: "", role: "developer" });
                    setErrors({});
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  <FaTimes className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-zinc-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <div className="text-lg font-medium mb-2">No Users Found</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Create your first user to get started.
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                  {users.length} system user{users.length !== 1 ? "s" : ""}
                </div>
                <div className="space-y-4">
                  {users.map((userData) => (
                    <div key={userData._id}>
                      <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700/50">
                        {/* User Info - Inline Editing */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {editingUser === userData._id ? (
                            // Inline edit form
                            <>
                              <div>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className={`rounded-lg border px-3 py-2 text-sm w-full dark:bg-zinc-800 ${
                                    errors.name ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'
                                  }`}
                                  placeholder="Full Name"
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                              </div>
                              <div>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                  className={`rounded-lg border px-3 py-2 text-sm w-full dark:bg-zinc-800 ${
                                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'
                                  }`}
                                  placeholder="Email"
                                />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                              </div>
                              <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                              >
                                <option value="developer">Developer</option>
                                <option value="product_owner">Product Owner</option>
                                <option value="admin">Admin</option>
                              </select>
                            </>
                          ) : (
                            // Display mode
                            <>
                              <div>
                                <div className="font-medium">{userData.name}</div>
                                {userData._id === user._id && (
                                  <span className="text-xs text-blue-600 dark:text-blue-400">(You)</span>
                                )}
                              </div>
                              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                {userData.email}
                              </div>
                              <div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  userData.role === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                                  userData.role === "product_owner" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                                  "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                }`}>
                                  {userData.role.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          {editingUser === userData._id ? (
                            // Edit mode buttons
                            <>
                              <button
                                onClick={() => saveUserEdit(userData._id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:opacity-50"
                                disabled={processing === userData._id}
                              >
                                <FaSave className="h-3 w-3" />
                                {processing === userData._id ? "..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                              >
                                <FaTimes className="h-3 w-3" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            // Display mode buttons
                            <>
                              <button
                                onClick={() => startEditUser(userData)}
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                                disabled={processing === userData._id}
                              >
                                <FaEdit className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(userData)}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-50"
                                disabled={processing === userData._id || userData._id === user._id}
                                title={userData._id === user._id ? "Cannot delete your own account" : "Delete user"}
                              >
                                <FaTrash className="h-3 w-3" />
                                {processing === userData._id ? "..." : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* User-specific Error */}
                      {(errors[`edit_${userData._id}`] || errors[`user_${userData._id}`]) && (
                        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                          {errors[`edit_${userData._id}`] || errors[`user_${userData._id}`]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}