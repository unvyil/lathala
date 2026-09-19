import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type {
  AppView,
  CanvasElement,
  Department,
  ImportedFont,
  Project,
  Subscriber,
} from '../types/studio'
import { blankElements, initialProjects } from '../data/projects'
import { initialDepartments, initialSubscribers } from '../data/workspace'

interface StudioContextValue {
  view: AppView
  setView: (view: AppView) => void
  projects: Project[]
  activeProject: Project | null
  openProject: (id: string) => void
  createProject: () => void
  renameProject: (id: string, title: string) => void
  duplicateProject: (id: string) => void
  deleteProject: (id: string) => void
  updateProject: (id: string, patch: Partial<Omit<Project, 'id'>>) => void
  setElements: (
    projectId: string,
    updater: (elements: CanvasElement[]) => CanvasElement[],
  ) => void
  departments: Department[]
  addDepartment: (name: string, color: string) => void
  updateDepartment: (id: string, patch: Partial<Omit<Department, 'id'>>) => void
  deleteDepartment: (id: string) => void
  subscribers: Subscriber[]
  addSubscriber: (subscriber: Omit<Subscriber, 'id'>) => void
  updateSubscriber: (
    id: string,
    patch: Partial<Omit<Subscriber, 'id'>>,
  ) => void
  deleteSubscriber: (id: string) => void
  markSent: (ids: string[]) => void
  fonts: ImportedFont[]
  addFont: (font: Omit<ImportedFont, 'id'>) => void
}

const StudioContext = createContext<StudioContextValue | null>(null)

const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('dashboard')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments)
  const [subscribers, setSubscribers] =
    useState<Subscriber[]>(initialSubscribers)
  const [fonts, setFonts] = useState<ImportedFont[]>([])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )

  const touch = (project: Project): Project => ({
    ...project,
    editedAt: new Date().toISOString(),
  })

  const openProject = useCallback((id: string) => {
    setActiveProjectId(id)
    setView('editor')
  }, [])

  const createProject = useCallback(() => {
    const project: Project = {
      id: uid('proj'),
      title: 'Untitled dispatch',
      editedAt: new Date().toISOString(),
      segmentId: 'all',
      elements: blankElements(),
    }
    setProjects((prev) => [project, ...prev])
    setActiveProjectId(project.id)
    setView('editor')
  }, [])

  const renameProject = useCallback((id: string, title: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? touch({ ...p, title }) : p)),
    )
  }, [])

  const duplicateProject = useCallback((id: string) => {
    setProjects((prev) => {
      const source = prev.find((p) => p.id === id)
      if (!source) return prev
      const copy: Project = {
        ...source,
        id: uid('proj'),
        title: `${source.title} copy`,
        editedAt: new Date().toISOString(),
        elements: source.elements.map((el) => ({ ...el, id: uid('el') })),
      }
      const index = prev.findIndex((p) => p.id === id)
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setActiveProjectId((current) => (current === id ? null : current))
  }, [])

  const updateProject = useCallback(
    (id: string, patch: Partial<Omit<Project, 'id'>>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? touch({ ...p, ...patch }) : p)),
      )
    },
    [],
  )

  const setElements = useCallback(
    (
      projectId: string,
      updater: (elements: CanvasElement[]) => CanvasElement[],
    ) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? touch({ ...p, elements: updater(p.elements) }) : p,
        ),
      )
    },
    [],
  )

  const addDepartment = useCallback((name: string, color: string) => {
    setDepartments((prev) => [...prev, { id: uid('dep'), name, color }])
  }, [])

  const updateDepartment = useCallback(
    (id: string, patch: Partial<Omit<Department, 'id'>>) => {
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      )
    },
    [],
  )

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id))
    setSubscribers((prev) =>
      prev.map((s) =>
        s.departmentId === id ? { ...s, departmentId: '' } : s,
      ),
    )
  }, [])

  const addSubscriber = useCallback((subscriber: Omit<Subscriber, 'id'>) => {
    setSubscribers((prev) => [{ ...subscriber, id: uid('sub') }, ...prev])
  }, [])

  const updateSubscriber = useCallback(
    (id: string, patch: Partial<Omit<Subscriber, 'id'>>) => {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      )
    },
    [],
  )

  const deleteSubscriber = useCallback((id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const markSent = useCallback((ids: string[]) => {
    setSubscribers((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status: 'sent' } : s)),
    )
  }, [])

  const addFont = useCallback((font: Omit<ImportedFont, 'id'>) => {
    setFonts((prev) =>
      prev.some((f) => f.family === font.family)
        ? prev
        : [...prev, { ...font, id: uid('font') }],
    )
  }, [])

  const value: StudioContextValue = {
    view,
    setView,
    projects,
    activeProject,
    openProject,
    createProject,
    renameProject,
    duplicateProject,
    deleteProject,
    updateProject,
    setElements,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    subscribers,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    markSent,
    fonts,
    addFont,
  }

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  )
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used within StudioProvider')
  return ctx
}
