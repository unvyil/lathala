import React, { useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button, Input, Label } from '../ui/Primitives'
import { useStudio } from '../../contexts/StudioContext'

const SWATCHES = [
  '#B4552D',
  '#2F6F5E',
  '#5B4BB7',
  '#A4762A',
  '#8C2B1F',
  '#2B5D8C',
  '#6B6F3A',
  '#302E2F',
]

export function DepartmentManagerModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const {
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    subscribers,
  } = useStudio()
  const [name, setName] = useState('')
  const [color, setColor] = useState(SWATCHES[0])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addDepartment(trimmed, color)
    setName('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage departments"
      description="Departments segment the workspace audience and drive dispatch targeting."
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <ul className="divide-y divide-sandbar">
        {departments.map((dept) => {
          const count = subscribers.filter(
            (s) => s.departmentId === dept.id,
          ).length
          return (
            <li key={dept.id} className="flex items-center gap-3 py-3">
              <ColorPicker
                value={dept.color}
                onChange={(next) => updateDepartment(dept.id, { color: next })}
              />
              <input
                value={dept.name}
                onChange={(e) =>
                  updateDepartment(dept.id, { name: e.target.value })
                }
                aria-label={`Rename ${dept.name}`}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[13px] font-medium text-onyx transition-colors duration-150 ease-out hover:border-sandbar focus:border-accent focus:bg-base focus:outline-none"
              />
              <span className="shrink-0 text-[11px] text-espresso/60">
                {count} {count === 1 ? 'member' : 'members'}
              </span>
              <button
                onClick={() => deleteDepartment(dept.id)}
                aria-label={`Delete ${dept.name}`}
                className="rounded-lg p-1.5 text-espresso/60 transition-colors duration-150 ease-out hover:bg-sandbar/70 hover:text-[#8C2B1F]"
              >
                <Trash2Icon size={15} strokeWidth={1.5} />
              </button>
            </li>
          )
        })}
      </ul>

      <form
        onSubmit={submit}
        className="mt-5 rounded-xl border border-sandbar bg-parchment/60 p-4"
      >
        <Label htmlFor="new-dept">New department</Label>
        <div className="flex items-center gap-2">
          <ColorPicker value={color} onChange={setColor} />
          <Input
            id="new-dept"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wholesale"
          />
          <Button type="submit" variant="primary" className="shrink-0">
            <PlusIcon size={15} strokeWidth={1.5} />
            Add
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choose colour"
        className="h-7 w-7 rounded-full border border-sandbar transition-transform duration-150 ease-out hover:scale-105"
        style={{ backgroundColor: value }}
      />
      {open && (
        <div className="absolute left-0 top-9 z-20 grid w-[136px] grid-cols-4 gap-1.5 rounded-xl border border-sandbar bg-base p-2 shadow-artboard">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Use ${s}`}
              onClick={() => {
                onChange(s)
                setOpen(false)
              }}
              className="h-6 w-6 rounded-full border border-sandbar transition-transform duration-150 ease-out hover:scale-110"
              style={{ backgroundColor: s }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
