const features = [
    { 
        title: "Kanban Workflow", 
        desc: "7-stage workflow from Backlog to Done",
        icon: "📋"
    },
    { 
        title: "Drag & Drop", 
        desc: "Intuitive task movement between stages",
        icon: "🖱️"
    },
    { 
        title: "Role Permissions", 
        desc: "Admin, PO, and Developer access levels",
        icon: "👥"
    },
    { 
        title: "Team Comments", 
        desc: "Built-in task discussion system",
        icon: "💬"
    },
];

const HeroFeatures = () => (
    <ul id="features" className="mt-10 grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => (
            <li
                key={i}
                className="rounded-2xl border border-zinc-200 bg-gray-100 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-800 hover:shadow-md transition-shadow"
            >
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{f.icon}</span>
                    <h3 className="font-semibold dark:text-amber-600">{f.title}</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {f.desc}
                </p>
            </li>
        ))}
    </ul>
);

export default HeroFeatures;