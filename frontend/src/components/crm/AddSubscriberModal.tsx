import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button, Input, Label, Select } from '../ui/Primitives'
import { useStudio } from '../../contexts/StudioContext'

export function AddSubscriberModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { departments, addSubscriber } = useStudio()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Subscriber')
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? '')

  const reset = () => {
    setName('')
    setEmail('')
    setRole('Subscriber')
    setDepartmentId(departments[0]?.id ?? '')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    addSubscriber({
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Subscriber',
      departmentId,
      status: 'pending',
    })
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add subscriber"
      description="New records join the workspace directory as Pending."
      width="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="sub-name">Full name</Label>
          <Input
            id="sub-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nina S\u00f8rensen"
            required
          />
        </div>
        <div>
          <Label htmlFor="sub-email">Email</Label>
          <Input
            id="sub-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nina@studio.com"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sub-role">Role</Label>
            <Input
              id="sub-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sub-dept">Department</Label>
            <Select
              id="sub-dept"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add subscriber
          </Button>
        </div>
      </form>
    </Modal>
  )
}
