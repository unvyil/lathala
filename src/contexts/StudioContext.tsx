import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import type {
  AppView,
  CanvasElement,
  Department,
  ImportedFont,
  Project,
  Subscriber,
  CustomFieldColumn,
  IntegrationsConfig,
  ProjectFolder,
} from '../types/studio';
import { StorageService } from '../services/storage';
import { ARTBOARD_HEIGHT, ARTBOARD_WIDTH } from '../data/defaultData';
import {
  isSupabaseConfigured,
  syncProjectToSupabase,
  fetchProjectsFromSupabase,
  deleteProjectFromSupabase,
} from '../services/supabaseClient';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface StudioContextValue {
  view: AppView;
  setView: (view: AppView) => void;
  // Projects
  projects: Project[];
  activeProject: Project | null;
  openProject: (id: string) => void;
  createProject: (title?: string, folderId?: string) => string;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, patch: Partial<Omit<Project, 'id'>>) => void;
  toggleStarProject: (id: string) => void;
  moveProjectToFolder: (projectId: string, folderId: string | null) => void;
  setElements: (
    projectId: string,
    updater: (elements: CanvasElement[]) => CanvasElement[],
  ) => void;
  // Folders
  folders: ProjectFolder[];
  addFolder: (name: string, color?: string) => void;
  deleteFolder: (id: string) => void;
  // Undo / Redo for active project canvas
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  // Personalization preview
  previewSubscriberId: string | null;
  setPreviewSubscriberId: (id: string | null) => void;
  previewSubscriber: Subscriber | null;
  // Departments
  departments: Department[];
  addDepartment: (name: string, color: string) => void;
  updateDepartment: (id: string, patch: Partial<Omit<Department, 'id'>>) => void;
  deleteDepartment: (id: string) => void;
  // Subscribers / CRM
  subscribers: Subscriber[];
  addSubscriber: (subscriber: Omit<Subscriber, 'id'>) => void;
  updateSubscriber: (
    id: string,
    patch: Partial<Omit<Subscriber, 'id'>>,
  ) => void;
  deleteSubscriber: (id: string) => void;
  markSent: (ids: string[]) => void;
  // Custom Columns for CRM spreadsheet
  customColumns: CustomFieldColumn[];
  addCustomColumn: (label: string, type?: CustomFieldColumn['type']) => void;
  deleteCustomColumn: (id: string) => void;
  // Google Sheets / Integrations
  integrations: IntegrationsConfig;
  updateIntegrations: (patch: Partial<IntegrationsConfig>) => void;
  isSyncingSheets: boolean;
  syncWithGoogleSheets: () => Promise<{ success: boolean; message: string }>;
  supabaseSyncStatus: 'synced' | 'syncing' | 'local' | 'error';
  // Fonts
  fonts: ImportedFont[];
  addFont: (font: Omit<ImportedFont, 'id'>) => void;
  // System actions
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  resetAllData: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('editor');
  const [projects, setProjects] = useState<Project[]>(() => StorageService.loadProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const loaded = StorageService.loadProjects();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [folders, setFolders] = useState<ProjectFolder[]>(() => StorageService.loadFolders());
  const [departments, setDepartments] = useState<Department[]>(() =>
    StorageService.loadDepartments(),
  );
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() =>
    StorageService.loadSubscribers(),
  );
  const [customColumns, setCustomColumns] = useState<CustomFieldColumn[]>(() =>
    StorageService.loadCustomColumns(),
  );
  const [fonts, setFonts] = useState<ImportedFont[]>(() => StorageService.loadFonts());
  const [integrations, setIntegrations] = useState<IntegrationsConfig>(() =>
    StorageService.loadIntegrations(),
  );
  const [previewSubscriberId, setPreviewSubscriberId] = useState<string | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'synced' | 'syncing' | 'local' | 'error'>(() =>
    isSupabaseConfigured() ? 'synced' : 'local'
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // History stacks for active project's elements (Undo / Redo)
  const historyPast = useRef<Record<string, CanvasElement[][]>>({});
  const historyFuture = useRef<Record<string, CanvasElement[][]>>({});

  // Auto-persist changes to LocalStorage
  useEffect(() => {
    StorageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    StorageService.saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    StorageService.saveDepartments(departments);
  }, [departments]);

  useEffect(() => {
    StorageService.saveSubscribers(subscribers);
  }, [subscribers]);

  useEffect(() => {
    StorageService.saveCustomColumns(customColumns);
  }, [customColumns]);

  useEffect(() => {
    StorageService.saveFonts(fonts);
  }, [fonts]);

  useEffect(() => {
    StorageService.saveIntegrations(integrations);
  }, [integrations]);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = uid('toast');
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? (projects[0] || null),
    [projects, activeProjectId],
  );

  const previewSubscriber = useMemo(() => {
    if (!previewSubscriberId) return subscribers[0] || null;
    return subscribers.find((s) => s.id === previewSubscriberId) ?? subscribers[0] ?? null;
  }, [subscribers, previewSubscriberId]);

  // Debounced auto-sync to Supabase if configured
  const syncTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (!isSupabaseConfigured() && integrations.backendMode !== 'supabase') {
      setSupabaseSyncStatus('local');
      return;
    }
    setSupabaseSyncStatus('syncing');
    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      if (activeProject) {
        const res = await syncProjectToSupabase(activeProject);
        setSupabaseSyncStatus(res.success ? 'synced' : 'error');
      }
    }, 1200);
    return () => clearTimeout(syncTimeoutRef.current);
  }, [projects, activeProject, integrations.backendMode]);

  const touch = (project: Project): Project => ({
    ...project,
    editedAt: new Date().toISOString(),
  });

  const openProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setView('editor');
  }, []);

  const createProject = useCallback((title: string = 'Untitled dispatch', folderId?: string) => {
    const newId = uid('proj');
    const project: Project = {
      id: newId,
      title,
      editedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      segmentId: 'all',
      folder: folderId,
      isStarred: false,
      artboardWidth: ARTBOARD_WIDTH,
      artboardHeight: ARTBOARD_HEIGHT,
      artboardBackground: '#F1EEE9',
      elements: [
        {
          id: uid('el'),
          kind: 'text',
          name: 'Newsletter Title',
          x: 40,
          y: 60,
          width: 520,
          height: 60,
          visible: true,
          locked: false,
          text: title,
          fontFamily: 'Instrument Serif',
          fontSize: 38,
          fontWeight: 400,
          color: '#070D0D',
          align: 'left',
          lineHeight: 1.15,
          letterSpacing: -0.4,
        },
        {
          id: uid('el'),
          kind: 'text',
          name: 'Introduction Body',
          x: 40,
          y: 140,
          width: 520,
          height: 100,
          visible: true,
          locked: false,
          text: 'Dear Valued Reader,\nWelcome to our latest release. Write your editorial thoughts here or drag in images and link hotspots from the dock on the left.',
          fontFamily: 'Instrument Sans',
          fontSize: 15,
          fontWeight: 400,
          color: '#302E2F',
          align: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
        },
      ],
    };
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(newId);
    setView('editor');
    addToast(`Created new design: "${title}"`, 'success');
    return newId;
  }, [addToast]);

  const duplicateProject = useCallback((id: string) => {
    setProjects((prev) => {
      const source = prev.find((p) => p.id === id);
      if (!source) return prev;
      const copy: Project = {
        ...source,
        id: uid('proj'),
        title: `${source.title} (Copy)`,
        editedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        elements: source.elements.map((el) => ({ ...el, id: uid('el') })),
      };
      const index = prev.findIndex((p) => p.id === id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    addToast('Duplicated design project', 'info');
  }, [addToast]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
    deleteProjectFromSupabase(id).catch(() => {});
    addToast('Deleted design project', 'info');
  }, [activeProjectId, addToast]);

  const toggleStarProject = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? touch({ ...p, isStarred: !p.isStarred }) : p))
    );
  }, []);

  const moveProjectToFolder = useCallback((projectId: string, folderId: string | null) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? touch({ ...p, folder: folderId || undefined }) : p))
    );
    addToast('Project moved to folder', 'info');
  }, [addToast]);

  const addFolder = useCallback((name: string, color: string = '#D97706') => {
    const newFolder: ProjectFolder = { id: uid('fold'), name, color };
    setFolders((prev) => [...prev, newFolder]);
    addToast(`Created folder "${name}"`, 'success');
  }, [addToast]);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setProjects((prev) =>
      prev.map((p) => (p.folder === id ? touch({ ...p, folder: undefined }) : p))
    );
    addToast('Folder deleted', 'info');
  }, [addToast]);

  const updateProject = useCallback(
    (id: string, patch: Partial<Omit<Project, 'id'>>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? touch({ ...p, ...patch }) : p)),
      );
    },
    [],
  );

  const setElements = useCallback(
    (
      projectId: string,
      updater: (elements: CanvasElement[]) => CanvasElement[],
    ) => {
      setProjects((prev) => {
        const project = prev.find((p) => p.id === projectId);
        if (!project) return prev;

        // Record history snapshot for undo
        const currentEls = project.elements;
        if (!historyPast.current[projectId]) {
          historyPast.current[projectId] = [];
        }
        historyPast.current[projectId].push(currentEls);
        // Limit history to 30 snapshots
        if (historyPast.current[projectId].length > 30) {
          historyPast.current[projectId].shift();
        }
        // Clear future on new action
        historyFuture.current[projectId] = [];

        const updated = updater(currentEls);
        return prev.map((p) =>
          p.id === projectId ? touch({ ...p, elements: updated }) : p,
        );
      });
    },
    [],
  );

  // Undo / Redo implementation
  const canUndo = activeProject
    ? (historyPast.current[activeProject.id]?.length || 0) > 0
    : false;
  const canRedo = activeProject
    ? (historyFuture.current[activeProject.id]?.length || 0) > 0
    : false;

  const undo = useCallback(() => {
    if (!activeProject) return;
    const pid = activeProject.id;
    const past = historyPast.current[pid];
    if (!past || past.length === 0) return;

    const previousElements = past.pop()!;
    if (!historyFuture.current[pid]) historyFuture.current[pid] = [];
    historyFuture.current[pid].push(activeProject.elements);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === pid ? touch({ ...p, elements: previousElements }) : p,
      ),
    );
  }, [activeProject]);

  const redo = useCallback(() => {
    if (!activeProject) return;
    const pid = activeProject.id;
    const future = historyFuture.current[pid];
    if (!future || future.length === 0) return;

    const nextElements = future.pop()!;
    if (!historyPast.current[pid]) historyPast.current[pid] = [];
    historyPast.current[pid].push(activeProject.elements);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === pid ? touch({ ...p, elements: nextElements }) : p,
      ),
    );
  }, [activeProject]);

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Departments
  const addDepartment = useCallback((name: string, color: string) => {
    setDepartments((prev) => [...prev, { id: uid('dep'), name, color }]);
    addToast(`Added department "${name}"`, 'success');
  }, [addToast]);

  const updateDepartment = useCallback(
    (id: string, patch: Partial<Omit<Department, 'id'>>) => {
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setSubscribers((prev) =>
      prev.map((s) => (s.departmentId === id ? { ...s, departmentId: '' } : s)),
    );
    addToast('Removed department', 'info');
  }, [addToast]);

  // Subscribers / Audience
  const addSubscriber = useCallback((sub: Omit<Subscriber, 'id'>) => {
    setSubscribers((prev) => [{ ...sub, id: uid('sub') }, ...prev]);
    addToast(`Added subscriber: ${sub.name}`, 'success');
  }, [addToast]);

  const updateSubscriber = useCallback(
    (id: string, patch: Partial<Omit<Subscriber, 'id'>>) => {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const deleteSubscriber = useCallback((id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    addToast('Subscriber removed from audience', 'info');
  }, [addToast]);

  const markSent = useCallback((ids: string[]) => {
    const timestamp = new Date().toISOString();
    setSubscribers((prev) =>
      prev.map((s) =>
        ids.includes(s.id)
          ? { ...s, status: 'sent', lastSentAt: timestamp }
          : s,
      ),
    );
    addToast(`Marked ${ids.length} subscribers as sent`, 'success');
  }, [addToast]);

  // Custom Columns for CRM
  const addCustomColumn = useCallback(
    (label: string, type: CustomFieldColumn['type'] = 'text') => {
      const key = label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/^_+|_+$/g, '');
      const newCol: CustomFieldColumn = {
        id: uid('col'),
        key: key || `field_${Date.now()}`,
        label,
        type,
      };
      setCustomColumns((prev) => [...prev, newCol]);
      addToast(`Added spreadsheet column: "${label}"`, 'success');
    },
    [addToast],
  );

  const deleteCustomColumn = useCallback((id: string) => {
    setCustomColumns((prev) => prev.filter((c) => c.id !== id));
    addToast('Removed spreadsheet column', 'info');
  }, [addToast]);

  // Fonts
  const addFont = useCallback((font: Omit<ImportedFont, 'id'>) => {
    setFonts((prev) => {
      if (prev.some((f) => f.family.toLowerCase() === font.family.toLowerCase())) {
        return prev;
      }
      return [...prev, { ...font, id: uid('font') }];
    });
    addToast(`Font "${font.family}" added to typography palette`, 'success');
  }, [addToast]);

  // Integrations & Google Sheets Sync
  const updateIntegrations = useCallback((patch: Partial<IntegrationsConfig>) => {
    setIntegrations((prev) => ({ ...prev, ...patch }));
    addToast('Integration settings updated', 'success');
  }, [addToast]);

  const syncWithGoogleSheets = useCallback(async () => {
    setIsSyncingSheets(true);
    try {
      if (!integrations.googleAppsScriptUrl) {
        // Simulated demonstration sync with helpful instructions
        await new Promise((r) => setTimeout(r, 1200));
        setIsSyncingSheets(false);
        addToast(
          'Sample sync verified! Paste your Google Apps Script Web App URL in Settings to sync live with Google Drive.',
          'info',
        );
        return {
          success: true,
          message: 'Simulated sync complete. Configured Apps Script URL will sync live rows.',
        };
      }

      // Real fetch from Google Apps Script Web App URL
      const response = await fetch(integrations.googleAppsScriptUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script returned status ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result.subscribers) && result.subscribers.length > 0) {
        setSubscribers(result.subscribers);
        addToast(`Successfully synced ${result.subscribers.length} rows from Google Sheet!`, 'success');
        setIsSyncingSheets(false);
        return { success: true, message: `Synced ${result.subscribers.length} rows.` };
      }

      setIsSyncingSheets(false);
      return { success: true, message: 'Google Sheet connected (0 rows returned).' };
    } catch (err: any) {
      setIsSyncingSheets(false);
      addToast(`Sync notice: ${err.message || 'Check Apps Script CORS/deployment permissions'}`, 'error');
      return { success: false, message: err.message };
    }
  }, [integrations.googleAppsScriptUrl, addToast]);

  const resetAllData = useCallback(() => {
    StorageService.resetAllToDefaults();
    setProjects(StorageService.loadProjects());
    setDepartments(StorageService.loadDepartments());
    setSubscribers(StorageService.loadSubscribers());
    setCustomColumns(StorageService.loadCustomColumns());
    setFonts(StorageService.loadFonts());
    setIntegrations(StorageService.loadIntegrations());
    addToast('Workspace restored to pristine editorial defaults', 'info');
  }, [addToast]);

  const value: StudioContextValue = {
    view,
    setView,
    projects,
    activeProject,
    openProject,
    createProject,
    duplicateProject,
    deleteProject,
    updateProject,
    toggleStarProject,
    moveProjectToFolder,
    setElements,
    folders,
    addFolder,
    deleteFolder,
    canUndo,
    canRedo,
    undo,
    redo,
    previewSubscriberId,
    setPreviewSubscriberId,
    previewSubscriber,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    subscribers,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    markSent,
    customColumns,
    addCustomColumn,
    deleteCustomColumn,
    integrations,
    updateIntegrations,
    isSyncingSheets,
    syncWithGoogleSheets,
    supabaseSyncStatus,
    fonts,
    addFont,
    toasts,
    addToast,
    dismissToast,
    resetAllData,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}
