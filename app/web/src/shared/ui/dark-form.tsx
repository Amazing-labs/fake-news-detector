import type { ReactNode } from 'react'

export function DarkFormCard(props: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#151515] p-6 text-white shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">{props.title}</h1>
        {props.description ? (
          <p className="mt-1 text-sm text-white/70">{props.description}</p>
        ) : null}
      </div>
      {props.children}
    </section>
  )
}

export function DarkInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
  },
) {
  const { label, className, ...rest } = props

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        className={`rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white transition outline-none placeholder:text-white/55 focus:border-white/45 ${className ?? ''}`}
        {...rest}
      />
    </label>
  )
}

export function DarkTextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string
  },
) {
  const { label, className, ...rest } = props

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea
        className={`min-h-24 rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white transition outline-none placeholder:text-white/55 focus:border-white/45 ${className ?? ''}`}
        {...rest}
      />
    </label>
  )
}

export function DarkButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode
    variant?: 'primary' | 'secondary'
  },
) {
  const { className, variant = 'primary', type = 'button', ...rest } = props
  const tone =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-white/90'
      : 'border border-white/15 bg-black text-white hover:bg-white/10'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${tone} ${className ?? ''}`}
      {...rest}
    />
  )
}
