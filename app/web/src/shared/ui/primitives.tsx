import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export function PageLayout(props: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-950">
            {props.title}
          </h1>
          {props.description ? (
            <p className="max-w-3xl text-sm text-slate-600">
              {props.description}
            </p>
          ) : null}
        </div>
        {props.actions ? <div>{props.actions}</div> : null}
      </div>
      {props.children}
    </div>
  )
}

export function SectionCard(props: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="space-y-1">
        <h2 className="text-base font-medium text-slate-950">{props.title}</h2>
        {props.description ? (
          <p className="text-sm text-slate-600">{props.description}</p>
        ) : null}
      </div>
      {props.children}
    </section>
  )
}

export function DataList(props: {
  items: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {props.items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-slate-200 bg-slate-50 p-3"
        >
          <dt className="text-xs tracking-wide text-slate-500 uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm break-all text-slate-900">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function EmptyState(props: {
  title: string
  description: string
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      <p className="font-medium text-slate-900">{props.title}</p>
      <p className="mt-2">{props.description}</p>
      {props.linkTo && props.linkLabel ? (
        <Link
          to={props.linkTo}
          className="mt-4 inline-flex text-sm font-medium text-slate-900 underline"
        >
          {props.linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

export function StatusBadge(props: { value: string | null | undefined }) {
  return (
    <span className="inline-flex rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {props.value ?? 'N/A'}
    </span>
  )
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger'
  },
) {
  const { className, variant = 'primary', type = 'button', ...rest } = props

  const tone =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-500'
        : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${tone} ${className ?? ''}`}
      {...rest}
    />
  )
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
  },
) {
  const { label, className, ...rest } = props
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input
        className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 ${className ?? ''}`}
        {...rest}
      />
    </label>
  )
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string
  },
) {
  const { label, className, ...rest } = props
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <textarea
        className={`min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 ${className ?? ''}`}
        {...rest}
      />
    </label>
  )
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string
    children: ReactNode
  },
) {
  const { label, className, children, ...rest } = props
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <select
        className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 ${className ?? ''}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

export function Notice(props: {
  tone?: 'error' | 'success' | 'info'
  children: ReactNode
}) {
  const tone =
    props.tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : props.tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-50 text-slate-700'

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${tone}`}>
      {props.children}
    </div>
  )
}
