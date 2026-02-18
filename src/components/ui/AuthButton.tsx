interface AuthButtonProps {
  children: React.ReactNode
  loading?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
  variant?: 'primary' | 'outline'
  className?: string
}

export function AuthButton({
  children,
  loading = false,
  type = 'submit',
  onClick,
  variant = 'primary',
  className = '',
}: AuthButtonProps) {
  const baseStyles = 'flex w-full items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60'

  const variantStyles =
    variant === 'primary'
      ? 'bg-brand-600 text-white hover:bg-brand-700'
      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {loading && (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
