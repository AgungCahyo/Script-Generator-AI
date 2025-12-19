'use client'

import { useState } from 'react'
import { Reload, ChevronDownOutline, ChevronUpOutline } from 'react-ionicons'
import CustomDropdown from './CustomDropdown'
import { ScriptFormData } from '@/lib/types/form'
import {
    MODEL_OPTIONS,
    DEFAULT_MODEL
} from '@/lib/constants/models'
import {
    DURATION_OPTIONS,
    PLATFORM_OPTIONS,
    TONE_OPTIONS,
    FORMAT_OPTIONS,
    LANGUAGE_OPTIONS,
    HOOK_STYLE_OPTIONS,
    DEFAULT_DURATION,
    DEFAULT_PLATFORM,
    DEFAULT_TONE,
    DEFAULT_FORMAT,
    DEFAULT_LANGUAGE,
    DEFAULT_HOOK_STYLE
} from '@/lib/constants/script-options'

interface ScriptFormProps {
    onSubmit: (data: ScriptFormData) => Promise<void>
    loading: boolean
    disabled?: boolean
}

export default function ScriptForm({ onSubmit, loading, disabled = false }: ScriptFormProps) {
    const [topic, setTopic] = useState('')
    const [model, setModel] = useState(DEFAULT_MODEL)
    const [duration, setDuration] = useState(DEFAULT_DURATION)
    const [platform, setPlatform] = useState(DEFAULT_PLATFORM)
    const [tone, setTone] = useState(DEFAULT_TONE)
    const [format, setFormat] = useState(DEFAULT_FORMAT)
    const [targetAudience, setTargetAudience] = useState('')
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
    const [hookStyle, setHookStyle] = useState(DEFAULT_HOOK_STYLE)
    const [additionalNotes, setAdditionalNotes] = useState('')
    const [showOptions, setShowOptions] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim() || loading || disabled) return
        await onSubmit({
            topic: topic.trim(),
            model,
            duration,
            platform,
            tone,
            format,
            targetAudience: targetAudience.trim(),
            language,
            hookStyle,
            additionalNotes: additionalNotes.trim(),
        })
        setTopic('')
        setAdditionalNotes('')
    }

    const isDisabled = loading || disabled

    const inputClasses = `w-full h-10 px-3 text-sm border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow ${isDisabled ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'}`

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Topic Input - Main */}
            <div>
                <label className="block text-sm text-neutral-600 mb-2">Topic</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={disabled ? "Sign in to generate scripts..." : "Apa topik video yang ingin kamu buat?"}
                        className={`flex-1 ${inputClasses}`}
                        disabled={isDisabled}
                    />
                    <button
                        type="submit"
                        disabled={isDisabled || !topic.trim()}
                        className="h-10 px-4 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                Generating
                            </span>
                        ) : (
                            'Generate'
                        )}
                    </button>
                </div>
            </div>

            {/* Options Toggle */}
            <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                disabled={isDisabled}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {showOptions ? (
                    <ChevronUpOutline color="currentColor" width="16px" height="16px" />
                ) : (
                    <ChevronDownOutline color="currentColor" width="16px" height="16px" />
                )}
                {showOptions ? 'Sembunyikan opsi' : 'Tampilkan opsi lanjutan'}
            </button>

            {/* Options Section */}
            {showOptions && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4">
                    {/* Row 1: Model & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CustomDropdown
                            label="AI Model"
                            value={model}
                            onChange={setModel}
                            options={MODEL_OPTIONS}
                            disabled={isDisabled}
                        />
                        <CustomDropdown
                            label="Durasi"
                            value={duration}
                            onChange={setDuration}
                            options={DURATION_OPTIONS}
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Row 2: Platform & Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CustomDropdown
                            label="Platform"
                            value={platform}
                            onChange={setPlatform}
                            options={PLATFORM_OPTIONS}
                            disabled={isDisabled}
                        />
                        <CustomDropdown
                            label="Bahasa"
                            value={language}
                            onChange={setLanguage}
                            options={LANGUAGE_OPTIONS}
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Row 3: Tone & Format */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CustomDropdown
                            label="Tone/Gaya"
                            value={tone}
                            onChange={setTone}
                            options={TONE_OPTIONS}
                            disabled={isDisabled}
                        />
                        <CustomDropdown
                            label="Format"
                            value={format}
                            onChange={setFormat}
                            options={FORMAT_OPTIONS}
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Row 4: Hook Style */}
                    <CustomDropdown
                        label="Hook Style"
                        value={hookStyle}
                        onChange={setHookStyle}
                        options={HOOK_STYLE_OPTIONS}
                        disabled={isDisabled}
                    />

                    {/* Row 5: Target Audience */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                            Target Audience (opsional)
                        </label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="Contoh: anak muda 18-25, profesional, ibu rumah tangga"
                            disabled={isDisabled}
                            className={inputClasses}
                        />
                    </div>

                    {/* Row 6: Additional Notes */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                            Catatan Tambahan (opsional)
                        </label>
                        <textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Instruksi khusus, contoh: sertakan CTA untuk subscribe, hindari kata-kata tertentu, dll."
                            disabled={isDisabled}
                            rows={3}
                            className={`w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow resize-none ${isDisabled ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'}`}
                        />
                    </div>
                </div>
            )}
        </form>
    )
}
