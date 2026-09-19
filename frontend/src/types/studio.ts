export type AppView = 'dashboard' | 'editor' | 'crm'

export type ElementKind = 'text' | 'shape' | 'image' | 'hotspot'

export interface BaseElement {
  id: string
  kind: ElementKind
  name: string
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  locked: boolean
}

export interface TextElement extends BaseElement {
  kind: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number
}

export interface ShapeElement extends BaseElement {
  kind: 'shape'
  shape: 'rect' | 'ellipse'
  fill: string
  radius: number
}

export interface ImageElement extends BaseElement {
  kind: 'image'
  src: string
  radius: number
  alt: string
}

export interface HotspotElement extends BaseElement {
  kind: 'hotspot'
  href: string
  label: string
}

export type CanvasElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | HotspotElement

/** Elements are stored bottom-to-top: index 0 renders at the lowest z-index. */
export interface Project {
  id: string
  title: string
  editedAt: string
  segmentId: string
  elements: CanvasElement[]
}

export interface Department {
  id: string
  name: string
  color: string
}

export type SubscriberStatus = 'pending' | 'sent'

export interface Subscriber {
  id: string
  name: string
  email: string
  role: string
  departmentId: string
  status: SubscriberStatus
}

export interface ImportedFont {
  id: string
  family: string
  source: 'google' | 'woff2' | 'ttf'
  url: string
}
