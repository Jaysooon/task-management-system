// src/components/Dashboard/KanbanBoard.jsx
import { useState } from "react";

const COLUMNS = [
  "Backlog",
  "Ready For Development",
  "In Progress",
  "Ready For Review",
  "Reviewed",
  "Impediments",
  "Done",
];

// Format date helper
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function KanbanBoard({
  tasks = [],
  usersById = {},
  onCardClick,
  onDropTask,
  currentUser,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Check if user can move a task
  function canMoveTask(task) {
    if (!currentUser) return false;
    const isAdmin = currentUser.role === "admin";
    const isPO = currentUser.role === "product_owner";
    const isDev = currentUser.role === "developer";
    // const isAssignee = task.assigneeId === currentUser._id;
    const isAssignee = String(task.assigneeId) === String(currentUser._id);
    
    return isAdmin || isPO || (isDev && isAssignee);
  }

  function handleDragStart(e, taskId) {
    const task = tasks.find((t) => String(t._id) === String(taskId));
    if (!canMoveTask(task)) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(task._id));
    setDraggedTaskId(task._id);

    // Add some visual feedback
    e.target.style.opacity = "0.5";
  }

  function handleDragEnd(e) {
    e.target.style.opacity = "1";
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e, columnName) {
    e.preventDefault();
    // setDragOverColumn(columnName);
    if (dragOverColumn !== columnName) setDragOverColumn(columnName);
  }

  function handleDragLeave(e) {
    // Only clear when leaving entire column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  }

  async function handleDrop(e, newStatus) {
    e.preventDefault();
    setDragOverColumn(null);

    const taskIdFromTransfer  = e.dataTransfer.getData("text/plain");
    const taskId = taskIdFromTransfer || draggedTaskId;
    
    if (!taskId) {
      setDraggedTaskId(null);
      return;
    }
      

    const task = tasks.find((t) => String(t._id) === String(taskId));
    if (!task) {
      setDraggedTaskId(null);
      return;
    }

    if (task.status === newStatus) {
      setDraggedTaskId(null);
      return;
    }

    try {
      const success = await onDropTask(task._id, newStatus);
      console.log("Drop task result:", success);
    } catch (err) {
      console.error("Drop task error:", err);
    } finally {
      setDraggedTaskId(null);
    }
  }

  function getAssigneeName(assigneeId) {
    if (!assigneeId) return "Unassigned";
    
    let user = usersById[assigneeId] || usersById[String(assigneeId)]
    if (!user) {
      const foundUser = Object.values(usersById).find(u => 
        String(u._id) === String(assigneeId) || 
        String(u.id) === String(assigneeId)
      );
      user = foundUser;
    }
    const result = user ? user.name : `Unknown (${assigneeId})`;
    return result;
  }

  function getTaskPriority(task) {
    if (!task.due) return "normal";
    // CHANGED: ensure diff is computed between Date objects, not strings
    const todayStr = new Date().toISOString().slice(0, 10);
    const dueStr = new Date(task.due).toISOString().slice(0, 10);
    const diffDays = Math.ceil(
      (new Date(dueStr) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "overdue";
    if (diffDays <= 2) return "urgent";
    return "normal";
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "overdue":
        return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200";
      case "urgent":
        return "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/40 dark:border-orange-700 dark:text-orange-200";
      default:
        return "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100";
    }
  }

  const grouped = {};
  for (const c of COLUMNS) grouped[c] = [];
  for (const t of tasks) {
    const s = COLUMNS.includes(t.status) ? t.status : "Backlog";
    grouped[s].push(t);
  }

  return (
    <section className="animate-fade-in-scale mt-6">
      <h2 className="text-2xl font-bold mb-2">Kanban Board</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`rounded-2xl border p-3 min-h-[120px] transition-colors ${
              dragOverColumn === col
                ? "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-sm">{col}</h4>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-700">
                {grouped[col].length}
              </span>
            </div>

            <div className="space-y-3">
              {grouped[col].map((task) => {
                const canMove = canMoveTask(task);
                const priority = getTaskPriority(task);
                const priorityColor = getPriorityColor(priority);
                const assigneeName = getAssigneeName(task.assigneeId)
                return (
                  <div
                    key={task._id}
                    draggable={canMove}
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick?.(task)}
                    className={`rounded-xl border p-3 text-left shadow-sm transition-all ${priorityColor} ${
                      canMove
                        ? "cursor-grab hover:shadow-md active:cursor-grabbing"
                        : "cursor-pointer opacity-75"
                    } ${String(draggedTaskId) === String(task._id) ? "opacity-50" : ""}`}
                    title={
                      !canMove
                        ? "You don't have permission to move this task"
                        : ""
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate font-medium text-sm">
                        {task.title}
                      </div>
                      {!canMove && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          🔒
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {task.desc}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
                      {task.due && (
                        <span
                          className={`rounded px-1.5 py-0.5 ${
                            priority === "overdue"
                              ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                              : priority === "urgent"
                              ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          📅 {formatDisplayDate(task.due)}
                        </span>
                      )}

                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 flex items-center gap-1">
                        <span>👤</span>
                        <span className="font-medium">{assigneeName}</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {grouped[col].length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400 dark:border-zinc-600">
                  {dragOverColumn === col ? "Drop here" : "No tasks"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
