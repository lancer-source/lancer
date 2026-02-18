interface AuthInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  autoComplete?: string
}

export function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  disabled = false,
  autoComplete,
}: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  )
}
