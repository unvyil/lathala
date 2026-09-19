import React, { useMemo, useState } from 'react'
import {
  ArrowLeftIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react'
import { useStudio } from '../contexts/StudioContext'
import { Button, DepartmentBadge, RolePill } from '../components/ui/Primitives'
import { DepartmentManagerModal } from '../components/crm/DepartmentManagerModal'
import { AddSubscriberModal } from '../components/crm/AddSubscriberModal'

export function CRM() {
  const {
    subscribers,
    departments,
    setView,
    updateSubscriber,
    deleteSubscriber,
    markSent,
  } = useStudio()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [deptOpen, setDeptOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return subscribers
    return subscribers.filter((s) =>
      [s.name, s.email, s.role].some((v) => v.toLowerCase().includes(q)),
    )
  }, [subscribers, query])

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id))
  const pending = subscribers.filter((s) => s.status === 'pending').length

  const toggleAll = () =>
    setSelected(allSelected ? [] : rows.map((r) => r.id))

  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  return (
    <div className="min-h-full bg-parchment">
      <header className="sticky top-0 z-30 bg-onyx">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-8">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-[13px] font-medium text-parchment/75 transition-colors duration-150 ease-out hover:text-parchment"
          >
            <ArrowLeftIcon size={15} strokeWidth={1.5} />
            Lathala Studio
          </button>
          <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-sandbar text-[11px] font-semibold text-onyx">
            IV
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-8 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-onyx">
              Workspace Audience
            </h1>
            <p className="mt-1 text-[13px] text-espresso/70">
              {subscribers.length} subscribers · {pending} pending ·{' '}
              {departments.length} departments
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SearchIcon
                size={15}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/50"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search audience"
                aria-label="Search audience"
                className="h-10 w-60 rounded-full border border-sandbar bg-base pl-9 pr-4 text-[13px] text-onyx placeholder:text-espresso/45 transition-colors duration-150 ease-out focus:border-accent focus:outline-none"
              />
            </div>
            <Button variant="secondary" onClick={() => setDeptOpen(true)}>
              <SettingsIcon size={15} strokeWidth={1.5} />
              Manage Departments
            </Button>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <PlusIcon size={15} strokeWidth={1.5} />
              Add Subscriber
            </Button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-sandbar bg-base px-4 py-3">
            <span className="text-[12px] font-medium text-onyx">
              {selected.length} selected
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                markSent(selected)
                setSelected([])
              }}
            >
              Mark as sent
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                selected.forEach(deleteSubscriber)
                setSelected([])
              }}
            >
              Remove
            </Button>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-sandbar bg-base">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-sandbar text-[10px] uppercase tracking-[0.14em] text-espresso/60">
                <th scope="col" className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all subscribers"
                    className="h-4 w-4 rounded border-sandbar accent-[#0062FF]"
                  />
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Department
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="w-14 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((sub) => {
                const dept = departments.find((d) => d.id === sub.departmentId)
                return (
                  <tr
                    key={sub.id}
                    className="border-b border-sandbar/70 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(sub.id)}
                        onChange={() => toggleOne(sub.id)}
                        aria-label={`Select ${sub.name}`}
                        className="h-4 w-4 rounded border-sandbar accent-[#0062FF]"
                      />
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-onyx">
                      {sub.name}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-espresso/80">
                      {sub.email}
                    </td>
                    <td className="px-4 py-3">
                      <RolePill role={sub.role} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center">
                        {dept ? (
                          <DepartmentBadge
                            name={dept.name}
                            color={dept.color}
                          />
                        ) : (
                          <span className="text-[12px] text-espresso/50">
                            Unassigned
                          </span>
                        )}
                        <select
                          aria-label={`Department for ${sub.name}`}
                          value={sub.departmentId}
                          onChange={(e) =>
                            updateSubscriber(sub.id, {
                              departmentId: e.target.value,
                            })
                          }
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        >
                          <option value="">Unassigned</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updateSubscriber(sub.id, {
                            status: sub.status === 'sent' ? 'pending' : 'sent',
                          })
                        }
                        aria-pressed={sub.status === 'sent'}
                        className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors duration-150 ease-out ${
                          sub.status === 'sent'
                            ? 'bg-[#2F6F5E]/15 text-[#2F6F5E]'
                            : 'bg-sandbar text-espresso'
                        }`}
                      >
                        {sub.status === 'sent' ? 'Sent' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteSubscriber(sub.id)}
                        aria-label={`Delete ${sub.name}`}
                        className="rounded-lg p-1.5 text-espresso/55 transition-colors duration-150 ease-out hover:bg-sandbar/70 hover:text-[#8C2B1F]"
                      >
                        <Trash2Icon size={15} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="px-4 py-10 text-center text-[13px] text-espresso/60">
              No subscribers match "{query}".
            </p>
          )}
        </div>
      </main>

      <DepartmentManagerModal
        open={deptOpen}
        onClose={() => setDeptOpen(false)}
      />
      <AddSubscriberModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
