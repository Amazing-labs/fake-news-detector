import type { ReactNode } from 'react'

export function DarkFormCard(props: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="bg-card text-card-foreground border-border rounded-2xl border p-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">{props.title}</h1>
        {props.description ? (
          <p className="text-muted-foreground mt-1 text-sm">
            {props.description}
          </p>
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
        className={`border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border px-3 py-2.5 transition outline-none focus-visible:ring-[3px] ${className ?? ''}`}
        {...rest}
      />
    </label>
  )
}

export function DarkSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string
    options: ReadonlyArray<{ value: string; label: string }>
  },
) {
  const { label, options, className, ...rest } = props

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        className={`border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border px-3 py-2.5 transition outline-none focus-visible:ring-[3px] ${className ?? ''}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
        className={`border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 rounded-lg border px-3 py-2.5 transition outline-none focus-visible:ring-[3px] ${className ?? ''}`}
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
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground border'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${tone} ${className ?? ''}`}
      {...rest}
    />
  )
}
