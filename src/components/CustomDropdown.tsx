'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownOutline } from 'react-ionicons'
import { DropdownOption } from '@/lib/constants/models'

interface CustomDropdownProps {
    value: string
    onChange: (value: string) => void
    options: DropdownOption[]
    placeholder?: string
    disabled?: boolean
    label?: string
}

export default function CustomDropdown({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    disabled = false,
    label
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSelect = (optionValue: string) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full h-10 px-3 text-sm bg-white border border-neutral-200 rounded-lg text-left flex items-center justify-between transition-all ${disabled
                    ? 'bg-neutral-50 cursor-not-allowed opacity-60'
                    : 'hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                    } ${isOpen ? 'ring-2 ring-neutral-900 border-transparent' : ''}`}
            >
                <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDownOutline
                    color="currentColor"
                    width="16px"
                    height="16px"
                    cssClasses={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${option.value === value
                                ? 'bg-neutral-100 text-neutral-900 font-medium'
                                : 'text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            <div className="flex flex-col">
                                <span>{option.label}</span>
                                {option.description && (
                                    <span className="text-xs text-neutral-500 mt-0.5">
                                        {option.description}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
