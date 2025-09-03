import { useState, useEffect } from "react";

// Mock data for the hero demo
const initialTasks = [
  { id: 1, title: "User Authentication", assignee: "Alice", status: "In Progress", priority: "high" },
  { id: 2, title: "Database Schema", assignee: "Bob", status: "Ready For Development", priority: "medium" },
  { id: 3, title: "API Endpoints", assignee: "Carol", status: "Backlog", priority: "high" },
  { id: 4, title: "UI Components", assignee: "Dave", status: "Ready For Review", priority: "low" },
];

const columns = ["Backlog", "Ready For Development", "In Progress", "Ready For Review"];

const HeroKanbanPreview = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState(null);
  const [animatingTask, setAnimatingTask] = useState(null);

  // Auto-demo animation - move tasks automatically every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];
        // Find a task that can be moved forward
        const taskToMove = updatedTasks.find(task => {
          const currentIndex = columns.indexOf(task.status);
          return currentIndex < columns.length - 1;
        });
        
        if (taskToMove) {
          const currentIndex = columns.indexOf(taskToMove.status);
          const newStatus = columns[currentIndex + 1];
          taskToMove.status = newStatus;
          
          // Add animation effect
          setAnimatingTask(taskToMove.id);
          setTimeout(() => setAnimatingTask(null), 600);
        } else {
          // Reset all tasks to start the demo over
          updatedTasks.forEach((task, index) => {
            task.status = columns[index % 2]; // Distribute between first two columns
          });
        }
        
        return updatedTasks;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === draggedTask.id ? { ...task, status: newStatus } : task
        )
      );
    }
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-l-red-400 bg-red-50 dark:bg-red-900/20";
      case "medium": return "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "low": return "border-l-green-400 bg-green-50 dark:bg-green-900/20";
      default: return "border-l-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const groupedTasks = columns.reduce((acc, column) => {
    acc[column] = tasks.filter(task => task.status === column);
    return acc;
  }, {});

  return (
    <div className="relative z-20 w-full rounded-xl bg-white/95 p-4 shadow-lg dark:bg-zinc-900/90">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
          Project Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Live Demo</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {columns.map((column) => (
          <div
            key={column}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50 min-h-[200px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {column}
              </h4>
              <span className="rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-xs">
                {groupedTasks[column].length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-2">
              {groupedTasks[column].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={`cursor-grab rounded-lg border-l-4 p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                    getPriorityColor(task.priority)
                  } ${
                    animatingTask === task.id ? "animate-pulse scale-105" : ""
                  } ${
                    draggedTask?.id === task.id ? "opacity-50 rotate-2" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-800 dark:text-white truncate">
                    {task.title}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                        {task.assignee[0]}
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        {task.assignee}
                      </span>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${
                      task.priority === "high" ? "bg-red-400" :
                      task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                    }`}></div>
                  </div>
                </div>
              ))}
              
              {/* Empty state */}
              {groupedTasks[column].length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-4 text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Drop tasks here
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Demo Instructions */}
      <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-blue-800 dark:text-blue-300">
            Drag cards between columns or watch the auto-demo
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroKanbanPreview;