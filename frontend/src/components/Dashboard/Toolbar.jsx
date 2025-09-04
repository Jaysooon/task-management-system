// src/components/Dashboard/Toolbar.jsx
import {FaPlus} from "react-icons/fa"
export default function Toolbar({ user, users, filters, onFiltersChange, onAddTask }) {
  const ALL_STATUSES = [
    "Backlog",
    "Ready For Development",
    "In Progress",
    "Ready For Review",
    "Reviewed",
    "Impediments",
    "Done",
  ];

  function setFilter(k, v) { onFiltersChange({...filters, [k]: v}); }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-xs text-zinc-500">Search</span>
          <input className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Title or description…" value={filters.search} onChange={e=>setFilter('search', e.target.value)} />
        </label>

        <label className="block">
          <span className="text-xs text-zinc-500">Status</span>
          <select className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={filters.status} onChange={e=>setFilter('status', e.target.value)}>
            <option value="">All</option>
            {ALL_STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-zinc-500">Assignee</span>
          <select className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={filters.assigneeId} onChange={e=>setFilter('assigneeId', e.target.value)}>
            <option value="">All Assignees</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-zinc-500">Only Overdue</span>
          <select className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={filters.onlyOverdue ? "1" : ""} onChange={e=>setFilter('onlyOverdue', e.target.value === "1")}>
            <option value="">No</option>
            <option value="1">Yes</option>
          </select>
        </label>
      </div>

      {(user?.role === "admin" || user?.role === "product_owner") && (
        <div className="flex items-center lg:ml-4">
          <button onClick={onAddTask} className="rounded-xl inline-flex items-center bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <FaPlus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}
