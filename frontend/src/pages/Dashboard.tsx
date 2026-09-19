import React, { useMemo, useState } from "react";
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import { useStudio } from "../contexts/StudioContext";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { Button } from "../components/ui/Primitives";
import { UserButton } from "@clerk/clerk-react";

export function Dashboard() {
  const {
    projects,
    departments,
    subscribers,
    openProject,
    createProject,
    renameProject,
    duplicateProject,
    deleteProject,
    setView,
  } = useStudio();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => (segment === "all" ? true : p.segmentId === segment))
      .filter((p) => (q ? p.title.toLowerCase().includes(q) : true))
      .sort((a, b) => b.editedAt.localeCompare(a.editedAt));
  }, [projects, query, segment]);

  const pendingCount = subscribers.filter((s) => s.status === "pending").length;

  const filters = [
    { id: "all", label: "All designs" },
    ...departments.map((d) => ({ id: d.id, label: d.name })),
  ];

  return (
    <div className="min-h-full bg-parchment">
      <header className="sticky top-0 z-30 border-b border-sandbar bg-onyx">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-8">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-parchment">
            Lathala Studio
          </span>
          <div className="relative ml-2 hidden max-w-sm flex-1 md:block">
            <SearchIcon
              size={15}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-parchment/50"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search designs"
              aria-label="Search designs"
              className="h-9 w-full rounded-full border border-white/10 bg-white/[0.06] pl-9 pr-3 text-[13px] text-parchment placeholder:text-parchment/40 transition-colors duration-150 ease-out focus:border-accent focus:outline-none"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setView("crm")}
              className="hidden text-[12px] text-parchment/70 transition-colors duration-150 ease-out hover:text-parchment sm:block"
            >
              {pendingCount} pending recipients
            </button>
            <span
              aria-label="Ivana Vasquez"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-sandbar text-[11px] font-semibold text-onyx"
            >
              IV
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-8 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-onyx">
              Your files
            </h1>
            <p className="mt-1 text-[13px] text-espresso/70">
              {projects.length} designs · {subscribers.length} subscribers in
              the workspace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setView("crm")}>
              <UsersIcon size={15} strokeWidth={1.5} />
              Audience Directory (CRM)
            </Button>
            <Button variant="primary" onClick={createProject}>
              <PlusIcon size={15} strokeWidth={1.5} />
              New Design
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-sandbar pb-5">
          {filters.map((f) => {
            const active = segment === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSegment(f.id)}
                aria-pressed={active}
                className={`h-8 rounded-full px-3.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
                  active
                    ? "bg-onyx text-parchment"
                    : "bg-base text-espresso hover:bg-sandbar/70"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-6 gap-y-9">
          <button
            type="button"
            onClick={createProject}
            className="flex h-[248px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-espresso/25 bg-base/60 text-espresso transition-colors duration-150 ease-out hover:border-accent hover:bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-onyx text-parchment">
              <PlusIcon size={18} strokeWidth={1.5} />
            </span>
            <span className="text-[13px] font-semibold text-onyx">
              New Design
            </span>
            <span className="text-[11px] text-espresso/60">
              Blank 600 × 800 artboard
            </span>
          </button>

          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              department={departments.find((d) => d.id === project.segmentId)}
              onOpen={() => openProject(project.id)}
              onRename={(title) => renameProject(project.id, title)}
              onDuplicate={() => duplicateProject(project.id)}
              onDelete={() => deleteProject(project.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-[13px] text-espresso/60">
            No designs match "{query}" in this segment.
          </p>
        )}
      </main>
    </div>
  );
}
