// src/components/Dashboard/TaskModal.jsx
import { useEffect, useState } from "react";
import {
  updateTask,
  patchTask,
  deleteTask as apiDeleteTask,
  addComment,
} from "../../api/api";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const STATUS = [
  "Backlog",
  "Ready For Development",
  "In Progress",
  "Ready For Review",
  "Reviewed",
  "Impediments",
  "Done",
];

export default function TaskModal({
  task,
  onClose,
  onSaved,
  users = [],
  currentUser,
}) {
  const [form, setForm] = useState({
    id: task?._id,
    title: task?.title || "",
    desc: task?.desc || "",
    status: task?.status || "Backlog",
    due: task?.due ? task.due.slice(0, 10) : "",
    assigneeId: task?.assigneeId ?? null,
    createdBy: task?.createdBy ?? null,
    comments: task?.comments || [],
  });
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      console.log("TaskModal opened with task:", task);
      setForm({
        id: task._id,
        title: task.title || "",
        desc: task.desc || "",
        status: task.status || "Backlog",
        due: task.due ? task.due.slice(0, 10) : "",
        assigneeId: task.assigneeId ?? null,
        createdBy: task.createdBy ?? null,
        comments: task.comments || [],
      });
      setNewComment("");
      setError("");
    }
  }, [task]);

  // Permission flags
  const isAdmin = currentUser?.role === "admin";
  const isPO = currentUser?.role === "product_owner";
  const isDev = currentUser?.role === "developer";
  const isAssignee = String(form.assigneeId) === String(currentUser?._id);

  // Permission logic:
  // Admin: full edit + delete
  // PO: full edit + delete
  // Dev: only status if assigned + can comment
  const canEditAll = isAdmin || isPO;
  const canDevChangeStatus = isDev && isAssignee;
  const canDelete = isAdmin || isPO;
  const canComment = isAdmin || isPO || (isDev && isAssignee);

  function getUserName(userId) {
    if (!userId) return "Unknown User";
    const user = users.find((u) => String(u._id) == String(userId));
    return user ? user.name : `User #${userId}`;
  }

  function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  async function handleAddComment() {
  if (!newComment.trim() || !canComment) return;

  try {
    const updatedTask = await addComment(form.id, { text: newComment });
    setForm((prev) => ({
      ...prev,
      ...updatedTask,
      due: updatedTask.due ? updatedTask.due.slice(0, 10) : "",
    }));
    setNewComment("");
    onSaved?.(updatedTask);
  } catch (err) {
    console.error("Failed to save comment:", err);
    setError("Failed to save comment.");
  }
  }

  async function handleSave() {
    setError("");
    setLoading(true);

    try {
      let updated;

      if (canEditAll) {
        // Admin/PO: full update
        const updateData = {
          id: form.id,
          title: form.title.trim(),
          desc: form.desc.trim(),
          status: form.status,
          due: form.due || null,
          assigneeId: form.assigneeId || null,
          createdBy: form.createdBy || currentUser?._id,
          comments: form.comments,
        };

        updated = await updateTask(updateData);
        console.log("Full update data:", updateData);
      } else if (canDevChangeStatus) {
        const patchData = {
          status: form.status,
          comments: form.comments,
        };

        updated = await patchTask(form.id, patchData);
      } else {
        setError("You do not have permission to modify this task.");
        setLoading(false);
        return;
      }

      setForm((prev) => ({
        ...prev,
        ...updated,
        // Normalize date if server returned ISO
        due: updated.due ? updated.due.slice(0, 10) : "",
        id: updated._id || prev.id,
      }));

      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) {
      setError("You don't have permission to delete this task.");
      return;
    }
    if (!confirm("Delete this task? This action cannot be undone.")) return;

    setLoading(true);
    try {
      await apiDeleteTask(form.id);
      onSaved?.({ deleted: true, id: form.id });
      onClose?.();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 p-6 dark:border-zinc-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">Task</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-300">
                {isAdmin
                  ? "Admin - full control"
                  : isPO
                  ? "Product Owner - full control"
                  : isDev && isAssignee
                  ? "Developer - can update status & comment"
                  : "Read-only"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border px-3 py-1.5 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
            >
              <FaTimes/>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-h-[calc(90vh-120px)]">
          {/* Task Details - Left Side */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Title</span>
                  <input
                    value={form.title}
                    disabled={!canEditAll}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    disabled={!(canEditAll || canDevChangeStatus)}
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={form.desc}
                  disabled={!canEditAll}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  className="mt-1 h-28 w-full rounded-xl border px-3 py-2 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
                  placeholder="Describe the work to be done..."
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Due Date</span>
                  <input
                    type="date"
                    value={form.due}
                    disabled={!canEditAll}
                    onChange={(e) => setForm({ ...form, due: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Assignee</span>
                  <select
                    value={form.assigneeId ?? ""}
                    disabled={!canEditAll}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        assigneeId: e.target.value ? e.target.value : null,
                      })
                    }
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Current: {form.assigneeId ? getUserName(form.assigneeId) : "Unassigned"}
                  </div>
                </label>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Comments - Right Side */}
          <div className="w-80 border-l border-zinc-200 dark:border-zinc-700 flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h4 className="font-medium">
                Comments ({form.comments?.length || 0})
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {form.comments?.length > 0 ? (
                form.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-700/50"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <span className="font-medium">
                        {comment.authorName || getUserName(comment.authorId)}
                      </span>
                      <span>{formatDateTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                  No comments yet
                </p>
              )}
            </div>

            {/* Add Comment */}
            {canComment && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="rounded-lg inline-flex items-center gap-2 bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus className="h-4 w-4"/>
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 p-6 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            {canDelete ? (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <FaTrash className="h4 w-4"/>
                {loading ? "Deleting..." : "Delete Task"}
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
              >
                <FaTimes className="h4 w-4"/>
                Cancel
              </button>
              {(canEditAll || canDevChangeStatus) && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaSave className="h4 w-4"/>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
