export type ElementType =
  | "text"
  | "image"
  | "button"
  | "spacer"
  | "rectangle"
  | "circle"
  | "link_zone"
  | "polygon"
  | "star"
  | "line";

export interface CanvasElement {
  id: string;
  type: ElementType;
  content?: string;
  url?: string;
  x?: number;
  y?: number;
  width?: number;
  height: number;
  top: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  fill?: string;
}

export interface Subscriber {
  id: string;
  created_at?: string;
  name: string;
  email: string;
  role: string;
  department: string;
  type: string;
  is_sent: boolean;
  status: string;
  last_sent_at?: string;
}

export interface LinkZone {
  top: number;
  height: number;
  url: string;
}

export interface DispatchPayload {
  image_base64: string;
  link_zones: LinkZone[];
}
