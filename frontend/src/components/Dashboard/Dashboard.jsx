// src/components/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { fetchTasks, fetchUsers, createTask, patchTask } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AnalyticsBoard from "./AnalyticsBoard";
import KanbanBoard from "./KanbanBoard";
import TaskModal from "./TaskModal";
import Toolbar from "./Toolbar";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    assigneeId: "",
    onlyOverdue: false,
  });
  const [dragError, setDragError] = useState(null);

  useEffect(() => {
    fetchTasks()
      .then((data) => {
        setTasks(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch tasks:", err);
        setTasks([]);
      });

    fetchUsers()
      .then((data) => {
        setUsers(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      });
  }, []);

  useEffect(() => {
    if (dragError) {
      const timer = setTimeout(() => setDragError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [dragError]);

  // Determine visible tasks by role:
  // - Admin: all tasks
  // - PO: all tasks
  // - Developer: only tasks assigned to them
  function scopedTasksForRole() {
    if (!user) return tasks;
    if (user.role === "admin") return tasks;
    if (user.role === "product_owner") return tasks;
    if (user.role === "developer") {
      // Convert both to numbers for proper comparison
      // return tasks.filter((t) => t.assigneeId === user._id);
      return tasks.filter((t) => String(t.assigneeId) === String(user._id));
    }
    return tasks;
  }

  function applyFilters(list) {
    return list.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (
        filters.assigneeId &&
        String(t.assigneeId) !== String(filters.assigneeId)
      )
        return false;
      if (filters.onlyOverdue) {
        const today = new Date().toISOString().slice(0, 10);
        if (!t.due || !(t.due < today)) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${t.title} ${t.desc || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  const visibleTasks = applyFilters(scopedTasksForRole());

  const usersById = {};
  for (const u of users) {
    usersById[u._id] = u;
    if (u.id && u.id !== u._id) {
      usersById[u.id] = u;
    }
    usersById[String(u._id)] = u;
  }

  async function handleDropTask(taskId, newStatus) {
    const t = tasks.find((x) => String(x._id) === String(taskId));

    if (!t) {
      setDragError("Task not found");
      return false;
    }

    const isAdmin = user?.role === "admin";
    const isPO = user?.role === "product_owner";
    const isDev = user?.role === "developer";
    const isAssignee = String(t.assigneeId) === String(user?._id);

    const canMove = isAdmin || isPO || (isDev && isAssignee);
    if (!canMove) {
      setDragError("You don't have permission to move this task.");
      return false;
    }

    if (t.status === newStatus) {
      return true;
    }

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((x) =>
        String(x._id) === String(taskId) ? { ...x, status: newStatus } : x
      )
    );

    try {
      const updated = await patchTask(t._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((x) => (String(x._id) === String(taskId) ? updated : x))
      );
      return true;
    } catch (err) {
      console.error("Failed to persist task move", err);
      setTasks(previousTasks);
      setDragError("Could not move the task — server error.");
      return false;
    }
  }

  function handleSaved(updated) {
    if (!updated) return;
    if (updated.deleted) {
      setTasks((prev) =>
        prev.filter((t) => String(t._id) !== String(updated.id))
      );
      return;
    }
    if (updated._id) {
      setTasks((prev) =>
        prev.map((t) => (String(t._id) === updated._id ? updated : t))
      );
    }
  }

  async function handleAddTask() {
    if (!(user?.role === "admin" || user?.role === "product_owner")) return;
    const now = new Date();
    const due = new Date(now.getTime() + 7 * 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 10);

    const payload = {
      title: "New Task",
      desc: "Describe the work to be done…",
      status: "Backlog",
      due,
      assigneeId: null,
      createdBy: user._id,
    };

    try {
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
      setSelected(created);
    } catch (e) {
      console.error(e);
      alert("Failed to create task.");
    }
  }

  return (
    <>
      <Navbar isHidden={false} loggedIn={true} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Welcome {user?.name} · Role:{" "}
              <span className="font-medium">{user?.role}</span>
            </p>
          </div>

          {user?.role === "admin" && (
            <a
              href="/admin"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Admin Panel
            </a>
          )}
        </header>

        {/* Drag Error Notification */}
        {dragError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {dragError}
          </div>
        )}

        <Toolbar
          user={user}
          users={users}
          filters={filters}
          onFiltersChange={setFilters}
          onAddTask={handleAddTask}
        />

        <AnalyticsBoard tasks={visibleTasks} usersById={usersById}/>

        <KanbanBoard
          tasks={visibleTasks}
          usersById={usersById}
          onCardClick={(t) => setSelected(t)}
          onDropTask={handleDropTask}
          currentUser={user}
        />

        {selected && (
          <TaskModal
            task={selected}
            onClose={() => setSelected(null)}
            onSaved={handleSaved}
            users={users}
            currentUser={user}
          />
        )}
      </main>
    </>
  );
}
