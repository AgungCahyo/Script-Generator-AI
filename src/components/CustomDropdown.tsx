'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownOutline } from 'react-ionicons'
import { DropdownOption } from '@/lib/constants/models'
import CoinIcon from './icons/CoinIcon'

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
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`truncate ${selectedOption ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {selectedOption?.label || placeholder}
                    </span>
                    {selectedOption?.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded shrink-0">
                            {selectedOption.badge}
                        </span>
                    )}
                </div>
                <ChevronDownOutline
                    color="currentColor"
                    width="16px"
                    height="16px"
                    cssClasses={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate">{option.label}</span>
                                        {option.badge && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded shrink-0">
                                                {option.badge}
                                            </span>
                                        )}
                                    </div>
                                    {option.description && (
                                        <span className="text-xs text-neutral-500 mt-0.5">
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                                {option.credits !== undefined && (
                                    <span className="text-xs font-semibold text-neutral-900 shrink-0 inline-flex items-center gap-0.5">
                                        {option.credits} <CoinIcon className="w-3 h-3" />
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
