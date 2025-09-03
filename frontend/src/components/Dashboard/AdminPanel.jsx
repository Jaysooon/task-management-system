// src/components/Admin/AdminPanel.jsx
import { useEffect, useState } from "react";
import {
  fetchRegistrations,
  fetchUsers,
  approveRegistration,
  declineRegistration,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../Navbar";
import { FaArrowLeft } from "react-icons/fa6";
export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [regs, setRegs] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({}); // regId -> role
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadRegistrations();
    fetchUsers()
      .then((data) => {
        setUsers(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      });
  }, []);

  async function loadRegistrations() {
    try {
      setLoading(true);
      const data = await fetchRegistrations();
      setRegs(data || []);
      console.log("Loaded registrations:", data);
    } catch (error) {
      console.error("Failed to load registrations:", error);
      setRegs([]);
    } finally {
      setLoading(false);
    }
  }

  if (user?.role !== "admin") return <Navigate to="/" replace />;

  function setRoleFor(id, role) {
    setSelectedRoles((prev) => ({ ...prev, [id]: role }));
  }

  async function onApprove(reg) {
    const role = selectedRoles[reg._id] || "developer";
    setProcessing(reg._id);

    try {
      console.log("Approving registration:", reg._id, "with role:", role);
      await approveRegistration(reg, role);

      // Remove from local state
      setRegs((prev) => prev.filter((r) => r._id !== reg._id));

      // Clean up selected role
      setSelectedRoles((prev) => {
        const updated = { ...prev };
        delete updated[reg._id];
        return updated;
      });

      console.log("Registration approved successfully");
    } catch (error) {
      console.error("Failed to approve registration:", error);
      alert("Failed to approve registration. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  async function onDecline(reg) {
    if (
      !confirm(
        `Are you sure you want to decline the registration for ${reg.name} (${reg.email})?`
      )
    ) {
      return;
    }

    setProcessing(reg._id);

    try {
      console.log("Declining registration:", reg._id);
      await declineRegistration(reg._id);

      // Remove from local state
      setRegs((prev) => prev.filter((r) => r._id !== reg._id));

      // Clean up selected role
      setSelectedRoles((prev) => {
        const updated = { ...prev };
        delete updated[reg._id];
        return updated;
      });

      console.log("Registration declined successfully");
    } catch (error) {
      console.error("Failed to decline registration:", error);
      alert("Failed to decline registration. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  // console.log("Registrations:", regs);

  return (
    <>
      <Navbar isHidden={false} loggedIn={true}></Navbar>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/dashboard"
            className="text-sm font-semibold text-black dark:text-zinc-100 inline-flex items-center hover:text-zinc-500"
          >
            <FaArrowLeft className="mr-1" /> Back
          </a>
          <button
            onClick={loadRegistrations}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Manage pending user registrations
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-zinc-500">
                Loading registrations...
              </p>
            </div>
          ) : regs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📝</div>
              <div className="text-lg font-medium mb-2">
                No Pending Registrations
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                All registration requests have been processed.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                {regs.length} pending registration{regs.length !== 1 ? "s" : ""}
              </div>

              <ul className="space-y-3">
                {regs.map((reg) => (
                  <li
                    key={reg._id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-lg">{reg.name}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {reg.email}
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Submitted:{" "}
                        {new Date(reg.createdAt).toLocaleDateString()}
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
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="space-y-4">
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg">{user.name}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        Role:
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => setRoleFor(user._id, e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm border-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                        disabled={processing === user._id}
                      >
                        <option value="developer">Developer</option>
                        <option value="product_owner">Product Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(user)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing === user._id}
                      >
                        {processing === user._id ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => onDecline(user)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing === user._id}
                      >
                        {processing === user._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
