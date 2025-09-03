// src/components/Dashboard/AnalyticsBoard.jsx
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const STATUS_ORDER = [
  "Backlog","Ready For Development","In Progress","Ready For Review","Reviewed","Impediments","Done"
];

export default function AnalyticsBoard({ tasks }) {
  const counts = STATUS_ORDER.map(s => tasks.filter(t => t.status === s).length);

  const byAssignee = {};
  for (const t of tasks) {
    const key = t.assigneeId ?? "Unassigned";
    byAssignee[key] = (byAssignee[key] || 0) + 1;
  }

  const statusBar = { labels: STATUS_ORDER, datasets: [{ label: "Tasks", data: counts, backgroundColor: "#3B82F6", borderRadius: 8 }] };
  const assigneePie = { labels: Object.keys(byAssignee).map(k => k === "Unassigned" ? "Unassigned" : `User #${k}`), datasets: [{ data: Object.values(byAssignee), backgroundColor: ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#84CC16","#F472B6"] }] };

  return (
    <section className="mb-4 grid gap-4 lg:grid-cols-3">
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 lg:col-span-2">
        <h4 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Tasks per Status</h4>
        <div className="h-64"><Bar data={statusBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, precision: 0 } } }} /></div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <h4 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Tasks per Assignee</h4>
        <div className="h-64"><Doughnut data={assigneePie} options={{ responsive: true, maintainAspectRatio: false }} /></div>
      </div>
    </section>
  );
}
