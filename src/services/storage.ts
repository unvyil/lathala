import { Project, Department, Subscriber, CustomFieldColumn, ImportedFont, IntegrationsConfig, ProjectFolder } from '../types/studio';
import {
  INITIAL_PROJECTS,
  INITIAL_DEPARTMENTS,
  INITIAL_SUBSCRIBERS,
  INITIAL_CUSTOM_COLUMNS,
  DEFAULT_FONTS,
  INITIAL_INTEGRATIONS,
} from '../data/defaultData';

const INITIAL_FOLDERS: ProjectFolder[] = [
  { id: 'templates', name: 'Brand Systems', color: '#D97706' },
  { id: 'weekly', name: 'Weekly Dispatches', color: '#2563EB' },
  { id: 'executive', name: 'Executive Briefs', color: '#059669' },
];

const STORAGE_KEYS = {
  PROJECTS: 'lathala_projects_v2',
  DEPARTMENTS: 'lathala_departments_v2',
  SUBSCRIBERS: 'lathala_subscribers_v2',
  CUSTOM_COLUMNS: 'lathala_columns_v2',
  FONTS: 'lathala_fonts_v2',
  INTEGRATIONS: 'lathala_integrations_v2',
  FOLDERS: 'lathala_folders_v2',
};

export const StorageService = {
  loadFolders(): ProjectFolder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (!data) return INITIAL_FOLDERS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  },

  saveFolders(folders: ProjectFolder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.warn('Failed to save folders', e);
    }
  },

  loadProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) return INITIAL_PROJECTS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
    } catch (e) {
      console.warn('Failed to load projects from storage, falling back to defaults', e);
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save projects to storage', e);
    }
  },

  loadDepartments(): Department[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      if (!data) return INITIAL_DEPARTMENTS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  },

  saveDepartments(departments: Department[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    } catch (e) {
      console.warn('Failed to save departments', e);
    }
  },

  loadSubscribers(): Subscriber[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      if (!data) return INITIAL_SUBSCRIBERS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBSCRIBERS;
    } catch {
      return INITIAL_SUBSCRIBERS;
    }
  },

  saveSubscribers(subscribers: Subscriber[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    } catch (e) {
      console.warn('Failed to save subscribers', e);
    }
  },

  loadCustomColumns(): CustomFieldColumn[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_COLUMNS);
      if (!data) return INITIAL_CUSTOM_COLUMNS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_CUSTOM_COLUMNS;
    } catch {
      return INITIAL_CUSTOM_COLUMNS;
    }
  },

  saveCustomColumns(columns: CustomFieldColumn[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COLUMNS, JSON.stringify(columns));
    } catch (e) {
      console.warn('Failed to save columns', e);
    }
  },

  loadFonts(): ImportedFont[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FONTS);
      if (!data) return DEFAULT_FONTS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : DEFAULT_FONTS;
    } catch {
      return DEFAULT_FONTS;
    }
  },

  saveFonts(fonts: ImportedFont[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FONTS, JSON.stringify(fonts));
    } catch (e) {
      console.warn('Failed to save fonts', e);
    }
  },

  loadIntegrations(): IntegrationsConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
      if (!data) return INITIAL_INTEGRATIONS;
      return { ...INITIAL_INTEGRATIONS, ...JSON.parse(data) };
    } catch {
      return INITIAL_INTEGRATIONS;
    }
  },

  saveIntegrations(config: IntegrationsConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save integrations', e);
    }
  },

  resetAllToDefaults(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
