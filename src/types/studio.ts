export type AppView = 'dashboard' | 'editor' | 'crm';

export type ElementKind = 'text' | 'shape' | 'image' | 'hotspot' | 'divider' | 'line';

export interface BaseElement {
  id: string;
  kind: ElementKind;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  opacity?: number;
  rotation?: number;
}

export type TextHierarchyRole = 'title' | 'heading' | 'subheading' | 'body' | 'caption';

export interface TextElement extends BaseElement {
  kind: 'text';
  text: string;
  textRole?: TextHierarchyRole;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export type ShapeKind = 'rect' | 'ellipse' | 'pill' | 'triangle' | 'star';

export interface ShapeElement extends BaseElement {
  kind: 'shape';
  shape: ShapeKind;
  fill: string;
  borderColor?: string;
  borderWidth?: number;
  radius: number;
}

export interface ImageElement extends BaseElement {
  kind: 'image';
  src: string;
  alt: string;
  radius: number;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface HotspotElement extends BaseElement {
  kind: 'hotspot';
  href: string;
  label: string;
  openInNewTab?: boolean;
}

export type LineEndpoint = 'none' | 'arrow' | 'circle' | 'square';

export interface DividerElement extends BaseElement {
  kind: 'divider' | 'line';
  color: string;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
  startEndpoint?: LineEndpoint;
  endEndpoint?: LineEndpoint;
}

export type CanvasElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | HotspotElement
  | DividerElement;

export interface ProjectFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isClerkAuthenticated?: boolean;
}

export interface Project {
  id: string;
  userId?: string;
  title: string;
  editedAt: string;
  createdAt?: string;
  segmentId: string;
  folder?: string;
  isStarred?: boolean;
  artboardWidth: number;
  artboardHeight: number;
  artboardBackground: string;
  artboardBorderRadius?: number;
  elements: CanvasElement[];
}

export interface Department {
  id: string;
  name: string;
  color: string;
}

export type SubscriberStatus = 'pending' | 'sent' | 'bounced' | 'unsubscribed';

export interface CustomFieldColumn {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'tag' | 'link';
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
  status: SubscriberStatus;
  lastSentAt?: string;
  customData?: Record<string, string | number>;
}

export interface ImportedFont {
  id: string;
  family: string;
  source: 'google' | 'custom';
  url?: string;
  label?: string;
  category?: string;
  weights?: number[];
}

export interface IntegrationsConfig {
  backendMode: 'local' | 'supabase' | 'custom_api';
  supabaseUrl: string;
  supabaseAnonKey: string;
  clerkPublishableKey: string;
  googleAppsScriptUrl: string;
  googleSheetId?: string;
  smtpHost?: string;
  smtpUser?: string;
  smtpSenderName: string;
  smtpSenderEmail: string;
  resendApiKey?: string;
  autoSyncGoogleSheets: boolean;
}
