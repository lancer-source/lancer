'use client'

import { useState, KeyboardEvent } from 'react'

const MAX_TAGS = 20

interface SkillsInputProps {
  label: string
  placeholder: string
  value: string[]
  onChange: (skills: string[]) => void
  disabled?: boolean
}

export function SkillsInput({ label, placeholder, value, onChange, disabled = false }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (value.length >= MAX_TAGS) return
    if (value.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('')
      return
    }
    onChange([...value, trimmed])
    setInputValue('')
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>

      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                disabled={disabled}
                className="ml-0.5 rounded-full p-0.5 text-brand-500 hover:bg-brand-100 hover:text-brand-700 disabled:cursor-not-allowed"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length >= MAX_TAGS ? `Max ${MAX_TAGS} tags` : placeholder}
        disabled={disabled || value.length >= MAX_TAGS}
        className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <p className="mt-1 text-xs text-slate-500">
        Press Enter to add. {value.length}/{MAX_TAGS} tags.
      </p>
    </div>
  )
}
