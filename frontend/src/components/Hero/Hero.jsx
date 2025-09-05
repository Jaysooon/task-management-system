// src/components/Hero/Hero.jsx
import { useState, useEffect, useRef } from "react";
import LoginModal from "../Modals/LoginModal";
import HeroFeatures from "./HeroFeatures";
import HeroKanbanPreview from "./HeroKanbanPreview";



const Hero = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="hero-container">
        <section className="hero-section reveal" ref={(el) => (sectionsRef.current[0] = el)}>
          <div className="hero-main-content">
            <div className="animate-fade-in-up">
              {/* Existing left content */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-white">
                Organize Your Work,{" "}
                <span className="text-amber-600">Simplify</span> Your Life
              </h1>
              <p className="mt-4 max-w-prose text-zinc-600 dark:text-zinc-300">
                A modern Kanban-style task management system built with React.
                Drag and drop tasks across workflow stages, assign team members,
                and track progress with role-based permissions.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="animate-fade-in-scale rounded-2xl bg-amber-600 px-5 py-3 text-white shadow-sm transition hover:bg-amber-400"
                >
                  Get Started
                </button>
              </div>
              <HeroFeatures />
            </div>
            <div className="animate-fade-in-right hero-kanban-preview">
              {/* Existing Kanban preview */}
              <div className="hero-kanban-container relative flex items-center justify-center min-h-[500px]">
                <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-800">
                  <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-zinc-700 dark:to-zinc-600" />
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 dark:ring-white/5 z-10" />
                  <HeroKanbanPreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hero-section reveal" ref={(el) => (sectionsRef.current[1] = el)}>
          <div className="hero-features-content animate-fade-in-up-stagger">
            {/* Existing features content */}
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-white text-center mb-12">
              Workflow Management Made Simple
            </h2>

            <div className="animate-fade-in-up-stagger hero-features-grid grid gap-8 md:grid-cols-3">
              {/* Role-Based Access Control */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Role-Based Control
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                  Admin, Product Owner, and Developer roles with specific
                  permissions for task management and workflow control.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                    <span className="dark:text-zinc-300">
                      Admin: Full system control
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    <span className="dark:text-zinc-300">
                      PO: Task & team management
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span className="dark:text-zinc-300">
                      Dev: Assigned task updates
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanban Workflow */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Kanban Workflow
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                  Visual workflow management with drag-and-drop functionality
                  across seven workflow stages.
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {[
                    "Backlog",
                    "Ready For Development",
                    "In Progress",
                    "Ready For Review",
                    "Reviewed",
                    "Impediments",
                    "Done",
                  ].map((status, i) => (
                    <div
                      key={status}
                      className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-center"
                    >
                      {status}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Collaboration */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Team Collaboration
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                  Built-in commenting system, task assignment, and priority
                  tracking for seamless team coordination.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm dark:text-zinc-300">
                    <span className="mr-2">💬</span> Task comments & discussion
                  </div>
                  <div className="flex items-center text-sm dark:text-zinc-300">
                    <span className="mr-2">👥</span> Team member assignments
                  </div>
                  <div className="flex items-center text-sm dark:text-zinc-300">
                    <span className="mr-2">📅</span> Due date tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Hero;
