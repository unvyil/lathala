import React, { useState, useMemo } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  CopyIcon,
  Trash2Icon,
  ArrowRightIcon,
  ClockIcon,
  UsersIcon,
  SendIcon,
  FileTextIcon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  FolderIcon,
  StarIcon,
  CheckSquareIcon,
  SquareIcon,
  FilterIcon,
  MailIcon,
  SparklesIcon,
  CheckCircle2Icon,
  Clock3Icon,
  AlertCircleIcon,
  MoreVerticalIcon,
  Edit2Icon,
  DatabaseIcon,
  UserCheckIcon,
  ChevronDownIcon,
  FolderPlusIcon,
  MoveRightIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { Subscriber, SubscriberStatus, Project } from '../../types/studio';
import { AuthModal } from '../auth/AuthModal';

type NavCategory = 'recents' | 'all' | 'starred' | 'dispatch-table' | string; // string for folder IDs

export function DashboardView() {
  const {
    projects,
    activeProject,
    openProject,
    createProject,
    duplicateProject,
    deleteProject,
    updateProject,
    toggleStarProject,
    moveProjectToFolder,
    folders,
    addFolder,
    deleteFolder,
    subscribers,
    departments,
    updateSubscriber,
    addSubscriber,
    deleteSubscriber,
    markSent,
    setView,
    addToast,
    supabaseSyncStatus,
    integrations,
  } = useStudio();

  const { user, openAuthModal, isSignedIn } = useAuth();

  // Navigation selection
  const [currentNav, setCurrentNav] = useState<NavCategory>('recents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCreationFolder, setSelectedCreationFolder] = useState<string>('');

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#D97706');

  // Moving project modal
  const [movingProject, setMovingProject] = useState<Project | null>(null);

  // Department Table & Dispatch states
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [subSearch, setSubSearch] = useState<string>('');
  const [isAddingSub, setIsAddingSub] = useState<boolean>(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubRole, setNewSubRole] = useState('');
  const [newSubDept, setNewSubDept] = useState(departments[0]?.id || 'eng');

  // Filtered projects based on active navigation & search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (currentNav === 'recents') return true;
      if (currentNav === 'all') return true;
      if (currentNav === 'starred') return !!p.isStarred;
      // Filter by folder ID
      return p.folder === currentNav;
    });
  }, [projects, searchQuery, currentNav]);

  // Filtered subscribers for Department Table
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesDept = deptFilter === 'all' || s.departmentId === deptFilter;
      const matchesSearch =
        s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.role.toLowerCase().includes(subSearch.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [subscribers, deptFilter, subSearch]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createProject(newTitle.trim(), selectedCreationFolder || undefined);
    setNewTitle('');
    setSelectedCreationFolder('');
    setIsCreating(false);
  };

  const handleRenameProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && renameTitle.trim()) {
      updateProject(renamingId, { title: renameTitle.trim() });
      addToast('Project renamed', 'success');
      setRenamingId(null);
      setRenameTitle('');
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  // Checkbox selection in Department Table
  const isAllSubSelected =
    filteredSubscribers.length > 0 &&
    filteredSubscribers.every((s) => selectedSubIds.includes(s.id));

  const toggleSelectAllSubs = () => {
    if (isAllSubSelected) {
      setSelectedSubIds([]);
    } else {
      setSelectedSubIds(filteredSubscribers.map((s) => s.id));
    }
  };

  const toggleSelectSub = (id: string) => {
    setSelectedSubIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Batch actions on selected subscribers
  const handleBatchDispatch = () => {
    if (selectedSubIds.length === 0) return;
    markSent(selectedSubIds);
    addToast(
      `Dispatched "${activeProject?.title || 'Edition'}" to ${selectedSubIds.length} subscriber(s)!`,
      'success',
    );
    setSelectedSubIds([]);
  };

  const handleBatchStatus = (status: SubscriberStatus) => {
    selectedSubIds.forEach((id) => updateSubscriber(id, { status }));
    addToast(`Updated status for ${selectedSubIds.length} members`, 'info');
    setSelectedSubIds([]);
  };

  const handleBatchDelete = () => {
    selectedSubIds.forEach((id) => deleteSubscriber(id));
    addToast(`Removed ${selectedSubIds.length} members`, 'info');
    setSelectedSubIds([]);
  };

  const handleAddNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubEmail.trim()) return;
    addSubscriber({
      name: newSubName.trim(),
      email: newSubEmail.trim(),
      role: newSubRole.trim() || 'Contributor',
      departmentId: newSubDept,
      status: 'pending',
    });
    setNewSubName('');
    setNewSubEmail('');
    setNewSubRole('');
    setIsAddingSub(false);
    addToast('New audience member added', 'success');
  };

  const totalSubs = subscribers.length;
  const sentSubs = subscribers.filter((s) => s.status === 'sent').length;
  const starredCount = projects.filter((p) => p.isStarred).length;

  const currentFolderName = folders.find((f) => f.id === currentNav)?.name;

  return (
    <div className="flex-1 flex bg-parchment overflow-hidden text-onyx">
      {/* 1. FIGMA / CANVA STYLE LEFT SIDEBAR */}
      <aside className="w-64 border-r border-sandbar bg-base flex flex-col justify-between shrink-0 select-none">
        {/* Workspace & User Profile */}
        <div className="p-4 border-b border-sandbar">
          <div
            onClick={() => openAuthModal('signin')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-sandbar/50 cursor-pointer transition-colors group"
            title="Manage user account & Clerk SSO"
          >
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
              }
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-sandbar shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-onyx truncate group-hover:text-accent flex items-center gap-1">
                <span>{user?.name || 'Guest Publisher'}</span>
              </div>
              <div className="text-[10px] text-espresso/60 truncate font-mono">
                {user?.email || 'Sign in with Clerk'}
              </div>
            </div>
            <ChevronDownIcon size={14} className="text-espresso/40 group-hover:text-onyx" />
          </div>
        </div>

        {/* Primary Navigation Items */}
        <div className="flex-1 overflow-y-auto lathala-scroll p-3 space-y-5">
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-espresso/50 px-3 mb-1.5">
              Workspace
            </div>

            <button
              onClick={() => setCurrentNav('recents')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentNav === 'recents'
                  ? 'bg-onyx text-parchment font-semibold shadow-xs'
                  : 'text-espresso/80 hover:bg-sandbar/50 hover:text-onyx'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClockIcon size={15} />
                <span>Recents</span>
              </div>
              <span className="text-[10px] opacity-70 font-mono">{projects.length}</span>
            </button>

            <button
              onClick={() => setCurrentNav('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentNav === 'all'
                  ? 'bg-onyx text-parchment font-semibold shadow-xs'
                  : 'text-espresso/80 hover:bg-sandbar/50 hover:text-onyx'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileTextIcon size={15} />
                <span>All Editions</span>
              </div>
              <span className="text-[10px] opacity-70 font-mono">{projects.length}</span>
            </button>

            <button
              onClick={() => setCurrentNav('starred')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentNav === 'starred'
                  ? 'bg-onyx text-parchment font-semibold shadow-xs'
                  : 'text-espresso/80 hover:bg-sandbar/50 hover:text-onyx'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StarIcon size={15} className={starredCount > 0 ? 'text-amber-500 fill-amber-500' : ''} />
                <span>Starred</span>
              </div>
              <span className="text-[10px] opacity-70 font-mono">{starredCount}</span>
            </button>

            <button
              onClick={() => setCurrentNav('dispatch-table')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentNav === 'dispatch-table'
                  ? 'bg-onyx text-parchment font-semibold shadow-xs'
                  : 'text-espresso/80 hover:bg-sandbar/50 hover:text-onyx'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UsersIcon size={15} />
                <span>Department CRM</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-accent text-white text-[9px] font-mono">
                {totalSubs}
              </span>
            </button>
          </div>

          {/* Folders & Collections */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-espresso/50">
                Folders & Tags
              </span>
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="p-1 rounded-md text-espresso/60 hover:text-onyx hover:bg-sandbar/50"
                title="Create New Folder"
              >
                <FolderPlusIcon size={13} />
              </button>
            </div>

            {folders.map((folder) => {
              const count = projects.filter((p) => p.folder === folder.id).length;
              const isActive = currentNav === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentNav(folder.id)}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-sandbar/80 text-onyx font-semibold shadow-xs'
                      : 'text-espresso/70 hover:bg-sandbar/40 hover:text-onyx'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || '#D97706' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                    <span className="text-[10px] font-mono">{count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-espresso/40 hover:text-red-700 p-0.5"
                      title="Delete folder"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cloud Sync & Architecture Status (Supabase / Clerk BYOK) */}
        <div className="p-3 border-t border-sandbar bg-sandbar/20">
          <div className="p-2.5 rounded-xl bg-base border border-sandbar text-[11px] space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-onyx flex items-center gap-1.5">
                <DatabaseIcon size={12} className="text-accent" />
                <span>Supabase Sync</span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                  supabaseSyncStatus === 'synced'
                    ? 'bg-emerald-100 text-emerald-800'
                    : supabaseSyncStatus === 'syncing'
                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                    : 'bg-sandbar text-espresso/70'
                }`}
              >
                {supabaseSyncStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-espresso/60 leading-tight">
              {supabaseSyncStatus === 'synced'
                ? 'Canvas state & dispatches persist live to PostgreSQL database.'
                : 'Running in zero-config local BYOK mode. Connect .env for cloud sync.'}
            </p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto lathala-scroll">
        {/* Top Header & Fast Start Strip */}
        <header className="bg-espresso text-parchment px-6 py-7 md:px-10 border-b border-sandbar/20 shrink-0">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-accent text-xs font-mono tracking-wider uppercase mb-1">
                <SparklesIcon size={14} />
                <span>Lathala Studio</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-parchment tracking-tight">
                {currentNav === 'dispatch-table'
                  ? 'Department Audience & Dispatch Roster'
                  : currentFolderName
                  ? `Folder: ${currentFolderName}`
                  : currentNav === 'starred'
                  ? 'Starred Editions'
                  : 'Editorial Artboards & Dispatches'}
              </h1>
              <p className="text-xs md:text-sm text-parchment/70 mt-1 max-w-xl font-sans">
                {currentNav === 'dispatch-table'
                  ? 'Manage recipient departments, verify email targets, and trigger newsletter releases.'
                  : 'Design typography layouts, personalize variables with {{name}}, and organize issues.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreating(true)}
                className="h-10 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <PlusIcon size={16} />
                <span>Create New Dispatch</span>
              </button>
            </div>
          </div>

          {/* Quick Start Templates Strip (visible when viewing projects) */}
          {currentNav !== 'dispatch-table' && (
            <div className="max-w-6xl mx-auto w-full mt-6 pt-5 border-t border-white/10">
              <div className="text-[10px] font-mono text-parchment/50 uppercase tracking-wider mb-2.5">
                Quick Start from Editorial Templates
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    title: 'Blank Artboard',
                    desc: '600px standard canvas',
                    icon: PlusIcon,
                    action: () => createProject('Untitled Dispatch'),
                  },
                  {
                    title: 'Executive Briefing',
                    desc: 'Serif headline & lead deck',
                    icon: FileTextIcon,
                    action: () => createProject('Executive Briefing — Issue № 1'),
                  },
                  {
                    title: 'Product Drop',
                    desc: 'Hero image + CTA button',
                    icon: SparklesIcon,
                    action: () => createProject('Product Launch Announcement'),
                  },
                  {
                    title: 'Weekly Digest',
                    desc: 'Segmented multi-story format',
                    icon: MailIcon,
                    action: () => createProject('Weekly Digest & Dispatch'),
                  },
                ].map((tmpl, idx) => (
                  <div
                    key={idx}
                    onClick={tmpl.action}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 cursor-pointer transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="flex items-center gap-2 text-parchment/80 group-hover:text-accent mb-1 transition-colors">
                      <tmpl.icon size={15} />
                      <span className="text-xs font-serif font-semibold">{tmpl.title}</span>
                    </div>
                    <p className="text-[10px] text-parchment/50">{tmpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Controls Subheader (Search, View Toggle, Filter) */}
        <div className="bg-base border-b border-sandbar px-6 md:px-10 py-3 sticky top-0 z-20 shadow-2xs">
          <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title / Filter Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-espresso/70">
              <span className="font-semibold text-onyx capitalize font-serif text-sm">
                {currentNav === 'dispatch-table'
                  ? 'Subscribers Spreadsheet'
                  : currentNav === 'starred'
                  ? 'Starred Editions'
                  : currentFolderName || 'Recent Projects'}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                {currentNav === 'dispatch-table'
                  ? `${filteredSubscribers.length} total members`
                  : `${filteredProjects.length} editions`}
              </span>
            </div>

            {/* Right Controls */}
            {currentNav !== 'dispatch-table' ? (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <SearchIcon
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-espresso/40"
                  />
                  <input
                    type="text"
                    placeholder="Search editions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 w-48 md:w-60 rounded-xl bg-parchment border border-sandbar text-xs text-onyx focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center bg-parchment border border-sandbar rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'grid' ? 'bg-base text-onyx shadow-2xs' : 'text-espresso/50'
                    }`}
                  >
                    <LayoutGridIcon size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="List view"
                    className={`p-1.5 rounded-lg ${
                      viewMode === 'list' ? 'bg-base text-onyx shadow-2xs' : 'text-espresso/50'
                    }`}
                  >
                    <ListIcon size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <SearchIcon
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-espresso/40"
                  />
                  <input
                    type="text"
                    placeholder="Search name, email, role..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    className="h-8 pl-8 pr-3 w-48 md:w-64 rounded-xl bg-parchment border border-sandbar text-xs text-onyx focus:outline-none focus:border-accent"
                  />
                </div>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-xl bg-parchment border border-sandbar text-xs text-onyx focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsAddingSub(true)}
                  className="h-8 px-3 rounded-xl bg-onyx hover:bg-espresso text-parchment text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PlusIcon size={14} />
                  <span>Add Member</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-6xl mx-auto w-full p-6 md:p-10 flex-1">
          {/* SECTION A: PROJECTS VIEW (GRID OR LIST) */}
          {currentNav !== 'dispatch-table' && (
            <div>
              {filteredProjects.length === 0 ? (
                <div className="bg-base border border-dashed border-sandbar rounded-2xl p-12 text-center max-w-md mx-auto my-8">
                  <FileTextIcon size={32} className="mx-auto text-espresso/30 mb-2" />
                  <h3 className="font-serif text-lg font-bold text-onyx">No Editions Found</h3>
                  <p className="text-xs text-espresso/60 mt-1 mb-4">
                    {searchQuery
                      ? 'No projects match your search query.'
                      : 'Create your first newsletter edition in this collection.'}
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso transition-colors"
                  >
                    Create New Edition
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((proj) => {
                    const targetDept = departments.find((d) => d.id === proj.segmentId);
                    const folderObj = folders.find((f) => f.id === proj.folder);

                    return (
                      <div
                        key={proj.id}
                        className="group bg-base border border-sandbar hover:border-onyx/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-artboard relative"
                      >
                        <div>
                          {/* Mini Artboard Thumbnail Preview */}
                          <div
                            onClick={() => openProject(proj.id)}
                            className="h-44 w-full rounded-xl border border-sandbar/70 mb-4 cursor-pointer overflow-hidden relative shadow-inner flex flex-col p-4 transition-transform group-hover:scale-[1.01]"
                            style={{ backgroundColor: proj.artboardBackground || '#F1EEE9' }}
                          >
                            {/* Star Badge */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarProject(proj.id);
                              }}
                              className="absolute top-3 right-3 p-1.5 rounded-lg bg-base/80 hover:bg-base text-espresso/60 hover:text-amber-500 shadow-2xs transition-colors"
                              title={proj.isStarred ? 'Unstar' : 'Star project'}
                            >
                              <StarIcon
                                size={14}
                                className={proj.isStarred ? 'text-amber-500 fill-amber-500' : ''}
                              />
                            </button>

                            <div className="text-[10px] font-mono text-espresso/50 uppercase tracking-widest mb-1 truncate">
                              {targetDept ? targetDept.name : 'All Subscribers'}
                            </div>
                            <div className="font-serif text-base font-bold text-onyx line-clamp-2 leading-tight">
                              {proj.title}
                            </div>

                            {/* Thumbnail preview bars */}
                            <div className="mt-3 space-y-1.5 opacity-70">
                              <div className="h-1.5 w-3/4 bg-onyx/20 rounded-full" />
                              <div className="h-1.5 w-1/2 bg-onyx/15 rounded-full" />
                            </div>

                            <div className="mt-auto flex items-center justify-between text-[10px] text-espresso/50 border-t border-sandbar/50 pt-2 font-mono">
                              <span>{proj.elements.length} layers</span>
                              <span>
                                {proj.artboardWidth}×{proj.artboardHeight}
                              </span>
                            </div>
                          </div>

                          {/* Title & Folder Tag */}
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              onClick={() => openProject(proj.id)}
                              className="font-serif text-base font-bold text-onyx hover:text-accent cursor-pointer transition-colors leading-snug line-clamp-1"
                            >
                              {proj.title}
                            </h3>
                          </div>

                          {/* Folder & Modified info */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {folderObj ? (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium border"
                                style={{
                                  backgroundColor: `${folderObj.color}15`,
                                  borderColor: `${folderObj.color}30`,
                                  color: folderObj.color,
                                }}
                              >
                                {folderObj.name}
                              </span>
                            ) : (
                              <button
                                onClick={() => setMovingProject(proj)}
                                className="text-[10px] text-espresso/50 hover:text-onyx flex items-center gap-1 font-mono"
                              >
                                <span>+ Assign Folder</span>
                              </button>
                            )}

                            <span className="text-[11px] text-espresso/50 flex items-center gap-1 font-mono">
                              <ClockIcon size={11} />
                              <span>{new Date(proj.editedAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions Strip */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-sandbar/60">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setRenamingId(proj.id);
                                setRenameTitle(proj.title);
                              }}
                              title="Rename Edition"
                              className="p-1.5 rounded-lg text-espresso/60 hover:text-onyx hover:bg-sandbar/50 transition-colors"
                            >
                              <Edit2Icon size={13} />
                            </button>
                            <button
                              onClick={() => setMovingProject(proj)}
                              title="Move to Folder"
                              className="p-1.5 rounded-lg text-espresso/60 hover:text-onyx hover:bg-sandbar/50 transition-colors"
                            >
                              <FolderIcon size={13} />
                            </button>
                            <button
                              onClick={() => duplicateProject(proj.id)}
                              title="Duplicate project"
                              className="p-1.5 rounded-lg text-espresso/60 hover:text-onyx hover:bg-sandbar/50 transition-colors"
                            >
                              <CopyIcon size={13} />
                            </button>
                            <button
                              onClick={() => deleteProject(proj.id)}
                              title="Delete project"
                              className="p-1.5 rounded-lg text-espresso/60 hover:text-red-700 hover:bg-sandbar/50 transition-colors"
                            >
                              <Trash2Icon size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => openProject(proj.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso transition-colors"
                          >
                            <span>Open Studio</span>
                            <ArrowRightIcon size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="bg-base border border-sandbar rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-sandbar/30 border-b border-sandbar text-[11px] font-mono uppercase tracking-wider text-espresso/70">
                        <th className="py-3 px-4 w-10">★</th>
                        <th className="py-3 px-4">Edition Title</th>
                        <th className="py-3 px-4">Folder</th>
                        <th className="py-3 px-4">Audience</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Modified</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sandbar/40 font-sans">
                      {filteredProjects.map((proj) => {
                        const targetDept = departments.find((d) => d.id === proj.segmentId);
                        const folderObj = folders.find((f) => f.id === proj.folder);

                        return (
                          <tr
                            key={proj.id}
                            className="hover:bg-sandbar/20 transition-colors cursor-pointer group"
                            onClick={() => openProject(proj.id)}
                          >
                            <td
                              className="py-3 px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarProject(proj.id);
                              }}
                            >
                              <StarIcon
                                size={14}
                                className={
                                  proj.isStarred
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-espresso/30 hover:text-amber-500'
                                }
                              />
                            </td>
                            <td className="py-3 px-4 font-serif font-bold text-onyx text-sm group-hover:text-accent">
                              {proj.title}
                            </td>
                            <td className="py-3 px-4">
                              {folderObj ? (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                                  style={{
                                    backgroundColor: `${folderObj.color}15`,
                                    color: folderObj.color,
                                  }}
                                >
                                  {folderObj.name}
                                </span>
                              ) : (
                                <span className="text-espresso/40 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-espresso/80">
                              {targetDept ? targetDept.name : 'All Subscribers'}
                            </td>
                            <td className="py-3 px-4 font-mono text-espresso/60">
                              {proj.artboardWidth}×{proj.artboardHeight}
                            </td>
                            <td className="py-3 px-4 text-espresso/60 font-mono">
                              {new Date(proj.editedAt).toLocaleDateString()}
                            </td>
                            <td
                              className="py-3 px-4 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => duplicateProject(proj.id)}
                                  title="Duplicate"
                                  className="p-1 rounded text-espresso/60 hover:text-onyx"
                                >
                                  <CopyIcon size={13} />
                                </button>
                                <button
                                  onClick={() => deleteProject(proj.id)}
                                  title="Delete"
                                  className="p-1 rounded text-espresso/60 hover:text-red-700"
                                >
                                  <Trash2Icon size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION B: DEPARTMENT TABLE & NEWSLETTER DISPATCH (Spreadsheet View) */}
          {currentNav === 'dispatch-table' && (
            <div className="space-y-4">
              {/* Header stats strip */}
              <div className="flex items-center justify-between bg-base border border-sandbar rounded-2xl p-4 shadow-2xs">
                <div>
                  <h3 className="font-serif text-lg font-bold text-onyx">
                    Interactive Recipient Roster
                  </h3>
                  <p className="text-xs text-espresso/70 mt-0.5">
                    Click cells to edit values. Select rows to dispatch or update statuses simultaneously.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <CheckCircle2Icon size={15} />
                    <span>{sentSubs} Dispatched</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                    <Clock3Icon size={15} />
                    <span>{totalSubs - sentSubs} Pending</span>
                  </div>
                </div>
              </div>

              {/* Editable Spreadsheet Table */}
              <div className="bg-base border border-sandbar rounded-2xl overflow-hidden shadow-2xs relative">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-sandbar/40 border-b border-sandbar text-[11px] font-mono uppercase tracking-wider text-espresso/80 select-none">
                      {/* Action Checkbox Header */}
                      <th className="py-3 px-4 w-12 text-center">
                        <button
                          onClick={toggleSelectAllSubs}
                          title="Select All"
                          className="text-onyx hover:text-accent transition-colors"
                        >
                          {isAllSubSelected ? (
                            <CheckSquareIcon size={16} className="text-accent" />
                          ) : (
                            <SquareIcon size={16} />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email (Dispatch Target)</th>
                      <th className="py-3 px-4">Role / Position</th>
                      <th className="py-3 px-4">Department (Editable Dropdown)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandbar/40">
                    {filteredSubscribers.map((sub) => {
                      const isSelected = selectedSubIds.includes(sub.id);

                      return (
                        <tr
                          key={sub.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-accent/10' : 'hover:bg-sandbar/20'
                          }`}
                        >
                          {/* Action Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleSelectSub(sub.id)}
                              className="text-onyx hover:text-accent transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquareIcon size={16} className="text-accent" />
                              ) : (
                                <SquareIcon size={16} className="text-espresso/40" />
                              )}
                            </button>
                          </td>

                          {/* Name (Inline editable) */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => updateSubscriber(sub.id, { name: e.target.value })}
                              className="w-full bg-transparent font-medium text-onyx border-b border-transparent hover:border-sandbar focus:border-accent focus:outline-none transition-colors"
                            />
                          </td>

                          {/* Email (Inline editable) */}
                          <td className="py-3 px-4 font-mono text-espresso/80">
                            <input
                              type="email"
                              value={sub.email}
                              onChange={(e) => updateSubscriber(sub.id, { email: e.target.value })}
                              className="w-full bg-transparent border-b border-transparent hover:border-sandbar focus:border-accent focus:outline-none transition-colors"
                            />
                          </td>

                          {/* Role / Position (Inline editable) */}
                          <td className="py-3 px-4 text-espresso/80">
                            <input
                              type="text"
                              value={sub.role}
                              onChange={(e) => updateSubscriber(sub.id, { role: e.target.value })}
                              className="w-full bg-transparent border-b border-transparent hover:border-sandbar focus:border-accent focus:outline-none transition-colors"
                            />
                          </td>

                          {/* Department (Editable dropdown) */}
                          <td className="py-3 px-4">
                            <select
                              value={sub.departmentId}
                              onChange={(e) =>
                                updateSubscriber(sub.id, { departmentId: e.target.value })
                              }
                              className="h-7 px-2 rounded-lg bg-parchment border border-sandbar text-xs text-onyx focus:outline-none focus:border-accent cursor-pointer"
                            >
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Status (Clickable status badge) */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                updateSubscriber(sub.id, {
                                  status: sub.status === 'sent' ? 'pending' : 'sent',
                                })
                              }
                              title="Click to toggle status"
                              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold transition-all ${
                                sub.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {sub.status.toUpperCase()}
                            </button>
                          </td>

                          {/* Delete Row */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteSubscriber(sub.id)}
                              title="Delete subscriber"
                              className="p-1 rounded text-espresso/50 hover:text-red-700 transition-colors"
                            >
                              <Trash2Icon size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredSubscribers.length === 0 && (
                  <div className="p-8 text-center text-xs text-espresso/50">
                    No subscribers match your search criteria.
                  </div>
                )}
              </div>

              {/* Floating Batch Action Bar */}
              {selectedSubIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-onyx text-parchment rounded-2xl shadow-artboard px-5 py-3 flex items-center gap-4 z-40 border border-sandbar/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="text-xs font-mono">
                    <strong className="text-accent">{selectedSubIds.length}</strong> selected
                  </div>

                  <div className="h-4 w-px bg-white/20" />

                  <button
                    onClick={handleBatchDispatch}
                    className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <SendIcon size={13} />
                    <span>Dispatch Newsletter to Selected</span>
                  </button>

                  <button
                    onClick={() => handleBatchStatus('sent')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                  >
                    Mark Sent
                  </button>

                  <button
                    onClick={() => handleBatchStatus('pending')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                  >
                    Mark Pending
                  </button>

                  <button
                    onClick={handleBatchDelete}
                    className="p-1.5 rounded-xl text-red-400 hover:bg-white/10 transition-colors"
                    title="Delete Selected"
                  >
                    <Trash2Icon size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal (Clerk / Local) */}
      <AuthModal />

      {/* New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-onyx/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-base border border-sandbar rounded-2xl w-full max-w-md shadow-artboard overflow-hidden">
            <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold">New Newsletter Edition</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-parchment/60 hover:text-parchment text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Edition Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Issue 16 — The Autumn Digest"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Folder Assignment (Optional)
                </label>
                <select
                  value={selectedCreationFolder}
                  onChange={(e) => setSelectedCreationFolder(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none cursor-pointer"
                >
                  <option value="">No folder (General)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sandbar">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-sandbar text-xs text-espresso hover:bg-sandbar/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso"
                >
                  Create & Launch Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Project Modal */}
      {renamingId && (
        <div className="fixed inset-0 bg-onyx/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-base border border-sandbar rounded-2xl w-full max-w-md shadow-artboard overflow-hidden">
            <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold">Rename Edition</h3>
              <button
                onClick={() => setRenamingId(null)}
                className="text-parchment/60 hover:text-parchment text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRenameProject} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sandbar">
                <button
                  type="button"
                  onClick={() => setRenamingId(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-sandbar text-xs text-espresso hover:bg-sandbar/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Project to Folder Modal */}
      {movingProject && (
        <div className="fixed inset-0 bg-onyx/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-base border border-sandbar rounded-2xl w-full max-w-sm shadow-artboard overflow-hidden">
            <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold">Move to Folder</h3>
              <button
                onClick={() => setMovingProject(null)}
                className="text-parchment/60 hover:text-parchment text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-xs text-espresso/70 font-medium">
                Choose a folder for &ldquo;{movingProject.title}&rdquo;:
              </div>

              <div className="space-y-1 max-h-52 overflow-y-auto">
                <button
                  onClick={() => {
                    moveProjectToFolder(movingProject.id, null);
                    setMovingProject(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
                    !movingProject.folder
                      ? 'bg-onyx text-parchment font-semibold'
                      : 'hover:bg-sandbar/50 text-onyx'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sandbar shrink-0" />
                  <span>No Folder (General)</span>
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      moveProjectToFolder(movingProject.id, f.id);
                      setMovingProject(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
                      movingProject.folder === f.id
                        ? 'bg-onyx text-parchment font-semibold'
                        : 'hover:bg-sandbar/50 text-onyx'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: f.color }}
                    />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Folder Modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-onyx/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-base border border-sandbar rounded-2xl w-full max-w-sm shadow-artboard overflow-hidden">
            <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold">Create New Folder</h3>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="text-parchment/60 hover:text-parchment text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Autumn 2026 Launches"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {['#D97706', '#2563EB', '#059669', '#DC2626', '#7C3AED', '#070D0D'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewFolderColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newFolderColor === color ? 'scale-110 border-onyx' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sandbar">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-sandbar text-xs text-espresso hover:bg-sandbar/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subscriber Modal */}
      {isAddingSub && (
        <div className="fixed inset-0 bg-onyx/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-base border border-sandbar rounded-2xl w-full max-w-md shadow-artboard overflow-hidden">
            <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold">Add Audience Member</h3>
              <button
                onClick={() => setIsAddingSub(false)}
                className="text-parchment/60 hover:text-parchment text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddNewMember} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Elena Rostova"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="elena@company.com"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Role / Position
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Typography Designer"
                  value={newSubRole}
                  onChange={(e) => setNewSubRole(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Department
                </label>
                <select
                  value={newSubDept}
                  onChange={(e) => setNewSubDept(e.target.value)}
                  className="w-full h-9 rounded-xl border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sandbar">
                <button
                  type="button"
                  onClick={() => setIsAddingSub(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-sandbar text-xs text-espresso hover:bg-sandbar/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso"
                >
                  Add to Audience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
