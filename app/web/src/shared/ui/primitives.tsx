import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export function PageLayout(props: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-[1.8rem] border border-[#ebe5dc] bg-white/88 px-5 py-6 shadow-[0_22px_75px_rgba(35,29,23,0.07)] backdrop-blur md:px-7 md:py-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#171514]/20 to-transparent" />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <PlatformBreadcrumb section={props.title} />
            <h1 className="mt-3 text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] text-balance text-[#171514] md:text-5xl">
              {props.title}
              <span className="font-editorial">.</span>
            </h1>
            {props.description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-pretty text-[#6f6860]">
                {props.description}
              </p>
            ) : null}
          </div>
          {props.actions ? (
            <div className="shrink-0">{props.actions}</div>
          ) : null}
        </div>
      </header>
      {props.children}
    </div>
  )
}

export function PlatformBreadcrumb(props: { section: string }) {
  return (
    <p className="text-sm font-black text-[#85807a]">
      Fake News Detector /{' '}
      <span className="text-[#1d78c1]">{props.section}</span>
    </p>
  )
}

export function SectionCard(props: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#ebe5dc] bg-white/92 shadow-[0_18px_65px_rgba(35,29,23,0.055)] backdrop-blur">
      <div className="border-b border-[#f0ebe4] px-5 py-4">
        <h2 className="text-base font-black tracking-[-0.02em] text-[#171514]">
          {props.title}
        </h2>
        {props.description ? (
          <p className="mt-1 max-w-2xl text-sm leading-5 text-[#7b7671]">
            {props.description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4 p-5">{props.children}</div>
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
          className="rounded-[1.2rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
        >
          <dt className="text-xs font-bold tracking-wide text-[#8c8680] uppercase">
            {item.label}
          </dt>
          <dd className="mt-2 text-xl leading-tight font-black break-words text-[#171514]">
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
    <div className="rounded-[1.55rem] border border-dashed border-[#e7e2dc] bg-white/70 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="text-base font-black text-[#171514]">{props.title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7b7671]">
        {props.description}
      </p>
      {props.linkTo && props.linkLabel ? (
        <Link
          to={props.linkTo}
          className="mt-5 inline-flex rounded-full border border-[#e7e2dc] bg-white px-4 py-2 text-sm font-bold text-[#171514] transition hover:bg-[#f7f4ef]"
        >
          {props.linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

export function StatusBadge(props: { value: string | null | undefined }) {
  const value = props.value ?? 'N/A'
  const lower = value.toLowerCase()
  const labels: Record<string, string> = {
    ACTIVE: 'Actif',
    APPROVED: 'Approuve',
    PENDING: 'En attente',
    PENDING_REVIEW: 'En revue',
    PUBLISHED: 'Publie',
    REJECTED: 'Refuse',
    SUSPENDED: 'Suspendu',
    VALIDATED: 'Valide',
    LU: 'Lu',
    NON_LU: 'Non lu',
    CORRECTION: 'Correction',
  }
  const label =
    labels[value] ??
    value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  const tone =
    lower.includes('reject') ||
    lower.includes('cancel') ||
    lower.includes('error')
      ? 'border-[#ffd9d7] bg-[#fff0ef] text-[#b13a35]'
      : lower.includes('publish') ||
          lower.includes('active') ||
          lower.includes('approved') ||
          lower.includes('valid')
        ? 'border-[#d6ead8] bg-[#eff8ef] text-[#247044]'
        : lower.includes('pending') ||
            lower.includes('review') ||
            lower.includes('wait')
          ? 'border-[#f3dfad] bg-[#fff6d8] text-[#8a610c]'
          : 'border-[#cce3f6] bg-[#edf7ff] text-[#1d78c1]'

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black tracking-[0.08em] uppercase ${tone}`}
    >
      {label}
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
      ? 'border border-[#171514] bg-[#171514] text-white shadow-[0_12px_30px_rgba(23,21,20,0.12)] hover:bg-[#2d2926]'
      : variant === 'danger'
        ? 'border border-[#d84a46] bg-[#d84a46] text-white hover:bg-[#c9343b]'
        : 'border border-[#e7e2dc] bg-white text-[#171514] shadow-[0_10px_28px_rgba(35,29,23,0.06)] hover:bg-[#f7f4ef]'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-black transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${tone} ${className ?? ''}`}
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
    <label className="grid gap-1.5 text-sm">
      <span className="font-bold text-[#171514]">{label}</span>
      <input
        className={`rounded-2xl border border-[#e7e2dc] bg-white/95 px-3 py-2.5 text-[#171514] transition outline-none placeholder:text-[#a49d95] focus:border-[#171514] focus:ring-3 focus:ring-[#171514]/10 ${className ?? ''}`}
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
    <label className="grid gap-1.5 text-sm">
      <span className="font-bold text-[#171514]">{label}</span>
      <textarea
        className={`min-h-32 rounded-2xl border border-[#e7e2dc] bg-white/95 px-3 py-2.5 text-[#171514] transition outline-none placeholder:text-[#a49d95] focus:border-[#171514] focus:ring-3 focus:ring-[#171514]/10 ${className ?? ''}`}
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
    <label className="grid gap-1.5 text-sm">
      <span className="font-bold text-[#171514]">{label}</span>
      <select
        className={`rounded-2xl border border-[#e7e2dc] bg-white/95 px-3 py-2.5 text-[#171514] transition outline-none focus:border-[#171514] focus:ring-3 focus:ring-[#171514]/10 ${className ?? ''}`}
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
      ? 'border-[#ffd9d7] bg-[#fff0ef] text-[#b13a35]'
      : props.tone === 'success'
        ? 'border-[#d6ead8] bg-[#eff8ef] text-[#247044]'
        : 'border-[#cce3f6] bg-[#edf7ff] text-[#1d78c1]'

  return (
    <div className={`rounded-2xl border px-3 py-2 text-sm font-bold ${tone}`}>
      {props.children}
    </div>
  )
}
