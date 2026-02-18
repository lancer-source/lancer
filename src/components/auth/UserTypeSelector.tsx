import type { UserType } from '@/types/database'

const USER_TYPE_OPTIONS: { value: UserType; label: string }[] = [
  { value: 'lancer', label: 'I offer services' },
  { value: 'homeowner', label: 'I need services' },
]

interface UserTypeSelectorProps {
  value: UserType | ''
  onChange: (value: UserType) => void
  disabled?: boolean
}

export function UserTypeSelector({ value, onChange, disabled = false }: UserTypeSelectorProps) {
  return (
    <div className="flex justify-center gap-3">
      {USER_TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              isSelected
                ? 'bg-brand-600 text-white shadow-sm'
                : 'border border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-600'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
