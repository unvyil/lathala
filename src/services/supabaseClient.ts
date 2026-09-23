import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Subscriber, ProjectFolder } from '../types/studio';

let cachedClient: SupabaseClient | null = null;
let cachedConfig: { url: string; key: string } | null = null;

const DEFAULT_SUPABASE_URL = 'https://vvjsesddnbsledhwoczp.supabase.co';
const DEFAULT_SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2anNlc2RkbmJzbGVkaHdvY3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTkyMzQsImV4cCI6MjEwNTczNTIzNH0.xpzi-quju_BwZ_ccw4h0ARx1OKMibYbjJ3joUx7PPyw';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  // 1. Check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // 2. Check in-memory / local storage settings
  try {
    const raw = localStorage.getItem('lathala_integrations_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return {
          url: parsed.supabaseUrl.trim(),
          anonKey: parsed.supabaseAnonKey.trim(),
        };
      }
    }
  } catch {
    // Ignore storage parse errors
  }

  return {
    url: (envUrl || DEFAULT_SUPABASE_URL).trim(),
    anonKey: (envKey || DEFAULT_SUPABASE_ANON).trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return (
    url.length > 0 &&
    anonKey.length > 0 &&
    !url.includes('YOUR_') &&
    !anonKey.includes('YOUR_') &&
    url.startsWith('https://')
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (cachedClient && cachedConfig?.url === url && cachedConfig?.key === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedConfig = { url, key: anonKey };
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

/**
 * Save project to Supabase with fallback
 */
export async function syncProjectToSupabase(
  project: Project,
  userId: string = 'default-user',
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const payload = {
      id: project.id,
      user_id: userId,
      title: project.title,
      segment_id: project.segmentId,
      folder: project.folder || null,
      is_starred: !!project.isStarred,
      artboard_width: project.artboardWidth,
      artboard_height: project.artboardHeight,
      artboard_background: project.artboardBackground,
      artboard_border_radius: project.artboardBorderRadius || 0,
      elements: project.elements,
      edited_at: project.editedAt,
      created_at: project.createdAt || project.editedAt,
    };

    const { error } = await supabase.from('projects').upsert(payload, {
      onConflict: 'id',
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Error]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all projects for a user from Supabase
 */
export async function fetchProjectsFromSupabase(
  userId: string = 'default-user',
): Promise<{ projects: Project[]; success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { projects: [], success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('edited_at', { ascending: false });

    if (error) throw error;

    const projects: Project[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      segmentId: row.segment_id || 'all',
      folder: row.folder || undefined,
      isStarred: row.is_starred || false,
      artboardWidth: row.artboard_width || 600,
      artboardHeight: row.artboard_height || 880,
      artboardBackground: row.artboard_background || '#F1EEE9',
      artboardBorderRadius: row.artboard_border_radius || 0,
      elements: Array.isArray(row.elements) ? row.elements : [],
      editedAt: row.edited_at || new Date().toISOString(),
      createdAt: row.created_at || row.edited_at,
    }));

    return { projects, success: true };
  } catch (err: any) {
    console.warn('[Supabase Fetch Error]', err);
    return { projects: [], success: false, error: err.message };
  }
}

/**
 * Delete project from Supabase
 */
export async function deleteProjectFromSupabase(
  projectId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false };

  try {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string,
): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL and Anon Key are required.' };
  }
  try {
    const client = createClient(url.trim(), anonKey.trim());
    const { error } = await client.from('projects').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Remember to run schema.sql to create tables)',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}
