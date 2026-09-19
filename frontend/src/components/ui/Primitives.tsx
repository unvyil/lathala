import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-onyx text-parchment hover:bg-espresso disabled:bg-espresso/40 disabled:text-parchment/60',
  secondary:
    'bg-base text-onyx border border-sandbar hover:border-espresso/50 disabled:opacity-50',
  ghost: 'text-espresso hover:bg-sandbar/50 disabled:opacity-50',
  danger: 'bg-[#8C2B1F] text-parchment hover:bg-[#71221a]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-parchment',
        'disabled:cursor-not-allowed whitespace-nowrap',
        size === 'sm' ? 'h-8 px-3 text-[12px]' : 'h-10 px-4 text-[13px]',
        variants[variant],
        className,
      ].join(' ')}
    />
  )
}

export function IconButton({
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-espresso',
        'transition-colors duration-150 ease-out hover:bg-sandbar/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      ].join(' ')}
    />
  )
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'h-10 w-full rounded-lg border border-sandbar bg-base px-3 text-[13px] text-onyx',
        'placeholder:text-espresso/45 transition-colors duration-150 ease-out',
        'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
        className,
      ].join(' ')}
    />
  )
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        'h-10 w-full appearance-none rounded-lg border border-sandbar bg-base px-3 text-[13px] text-onyx',
        'transition-colors duration-150 ease-out focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
        className,
      ].join(' ')}
    >
      {children}
    </select>
  )
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-espresso/70"
    >
      {children}
    </label>
  )
}

export function RolePill({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-espresso px-2.5 py-1 text-[11px] font-medium text-parchment">
      {role}
    </span>
  )
}

export function DepartmentBadge({
  name,
  color,
}: {
  name: string
  color: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ backgroundColor: `${color}1F`, color }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  )
}
