import React from 'react'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  PlusIcon,
} from 'lucide-react'
import type { CanvasElement, ImportedFont } from '../../types/studio'
import { BASE_FONTS, SWATCHES } from '../canvas/constants'

interface InspectorProps {
  element: CanvasElement | null
  fonts: ImportedFont[]
  onPatch: (id: string, patch: Partial<CanvasElement>) => void
  onImportFont: () => void
}

export function Inspector({
  element,
  fonts,
  onPatch,
  onImportFont,
}: InspectorProps) {
  if (!element) {
    return (
      <div className="border-t border-white/10 px-4 py-6">
        <p className="text-[12px] leading-relaxed text-parchment/50">
          Select a layer on the artboard to edit its properties.
        </p>
      </div>
    )
  }

  const patch = (next: Partial<CanvasElement>) => onPatch(element.id, next)

  return (
    <div className="max-h-[52%] overflow-y-auto border-t border-white/10 px-4 py-4 lathala-scroll">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-parchment/55">
          {element.kind} properties
        </h2>
      </div>

      <Section title="Frame">
        <div className="grid grid-cols-4 gap-2">
          <NumberField
            label="X"
            value={element.x}
            onChange={(v) => patch({ x: v })}
          />
          <NumberField
            label="Y"
            value={element.y}
            onChange={(v) => patch({ y: v })}
          />
          <NumberField
            label="W"
            value={element.width}
            onChange={(v) => patch({ width: Math.max(8, v) })}
          />
          <NumberField
            label="H"
            value={element.height}
            onChange={(v) => patch({ height: Math.max(8, v) })}
          />
        </div>
      </Section>

      {element.kind === 'text' && (
        <>
          <Section title="Content">
            <textarea
              value={element.text}
              onChange={(e) => patch({ text: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-onyx/60 px-2.5 py-2 text-[12px] leading-relaxed text-parchment focus:border-accent focus:outline-none"
            />
          </Section>
          <Section
            title="Typography"
            action={
              <button
                onClick={onImportFont}
                className="flex items-center gap-1 text-[10px] font-medium text-accent transition-colors duration-150 ease-out hover:text-parchment"
              >
                <PlusIcon size={11} strokeWidth={1.5} />
                Import font
              </button>
            }
          >
            <select
              value={element.fontFamily}
              onChange={(e) => patch({ fontFamily: e.target.value })}
              aria-label="Font family"
              className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-onyx/60 px-2.5 text-[12px] text-parchment focus:border-accent focus:outline-none"
            >
              {BASE_FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
              {fonts.map((f) => (
                <option key={f.id} value={f.family}>
                  {f.family} (imported)
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <NumberField
                label="Size"
                value={element.fontSize}
                onChange={(v) => patch({ fontSize: Math.max(6, v) })}
              />
              <NumberField
                label="Weight"
                value={element.fontWeight}
                step={100}
                onChange={(v) =>
                  patch({ fontWeight: Math.min(900, Math.max(100, v)) })
                }
              />
              <NumberField
                label="Track"
                value={element.letterSpacing}
                onChange={(v) => patch({ letterSpacing: v })}
              />
            </div>
            <div className="mt-2 flex gap-1">
              {(
                [
                  ['left', AlignLeftIcon],
                  ['center', AlignCenterIcon],
                  ['right', AlignRightIcon],
                ] as const
              ).map(([value, Icon]) => (
                <button
                  key={value}
                  aria-label={`Align ${value}`}
                  aria-pressed={element.align === value}
                  onClick={() => patch({ align: value })}
                  className={`flex h-8 flex-1 items-center justify-center rounded-lg transition-colors duration-150 ease-out ${
                    element.align === value
                      ? 'bg-accent text-white'
                      : 'bg-onyx/60 text-parchment/60 hover:text-parchment'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </Section>
          <Section title="Colour">
            <SwatchRow
              value={element.color}
              onChange={(c) => patch({ color: c })}
            />
          </Section>
        </>
      )}

      {element.kind === 'shape' && (
        <>
          <Section title="Shape">
            <div className="flex gap-1">
              {(['rect', 'ellipse'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => patch({ shape: s })}
                  aria-pressed={element.shape === s}
                  className={`h-8 flex-1 rounded-lg text-[11px] font-medium capitalize transition-colors duration-150 ease-out ${
                    element.shape === s
                      ? 'bg-accent text-white'
                      : 'bg-onyx/60 text-parchment/60 hover:text-parchment'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {element.shape === 'rect' && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                <NumberField
                  label="Radius"
                  value={element.radius}
                  onChange={(v) => patch({ radius: Math.max(0, v) })}
                />
              </div>
            )}
          </Section>
          <Section title="Fill">
            <SwatchRow
              value={element.fill}
              onChange={(c) => patch({ fill: c })}
            />
          </Section>
        </>
      )}

      {element.kind === 'image' && (
        <Section title="Source">
          <input
            value={element.src}
            onChange={(e) => patch({ src: e.target.value })}
            aria-label="Image URL"
            className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-onyx/60 px-2.5 text-[12px] text-parchment focus:border-accent focus:outline-none"
          />
          <input
            value={element.alt}
            onChange={(e) => patch({ alt: e.target.value })}
            aria-label="Alt text"
            placeholder="Alt text"
            className="h-9 w-full rounded-lg border border-white/10 bg-onyx/60 px-2.5 text-[12px] text-parchment placeholder:text-parchment/35 focus:border-accent focus:outline-none"
          />
        </Section>
      )}

      {element.kind === 'hotspot' && (
        <Section title="Link">
          <input
            value={element.href}
            onChange={(e) => patch({ href: e.target.value })}
            aria-label="Hotspot URL"
            className="mb-2 h-9 w-full rounded-lg border border-white/10 bg-onyx/60 px-2.5 text-[12px] text-parchment focus:border-accent focus:outline-none"
          />
          <input
            value={element.label}
            onChange={(e) => patch({ label: e.target.value })}
            aria-label="Hotspot label"
            className="h-9 w-full rounded-lg border border-white/10 bg-onyx/60 px-2.5 text-[12px] text-parchment focus:border-accent focus:outline-none"
          />
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-[10px] font-medium uppercase tracking-[0.12em] text-parchment/40">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] uppercase tracking-[0.1em] text-parchment/35">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full rounded-lg border border-white/10 bg-onyx/60 px-2 text-[12px] text-parchment focus:border-accent focus:outline-none"
      />
    </label>
  )
}

function SwatchRow({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      {SWATCHES.map((s) => (
        <button
          key={s}
          aria-label={`Use ${s}`}
          onClick={() => onChange(s)}
          className={`h-6 w-6 rounded-full border transition-transform duration-150 ease-out hover:scale-110 ${
            value.toLowerCase() === s.toLowerCase()
              ? 'border-accent ring-1 ring-accent'
              : 'border-white/15'
          }`}
          style={{ backgroundColor: s }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Custom colour"
        className="h-6 w-8 cursor-pointer rounded border border-white/15 bg-transparent"
      />
    </div>
  )
}
