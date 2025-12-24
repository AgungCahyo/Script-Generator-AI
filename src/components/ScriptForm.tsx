'use client'

import { useState, useMemo, useEffect } from 'react'
import { Reload, ChevronDownOutline, ChevronUpOutline, Mic } from 'react-ionicons'
import CustomDropdown from './CustomDropdown'
import { useConfirm } from './Confirm'
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
import {
    VOICE_TONE_OPTIONS,
    PACING_OPTIONS,
    VOCABULARY_OPTIONS,
    DEFAULT_VOICE_TONE,
    DEFAULT_PACING,
    DEFAULT_VOCABULARY
} from '@/lib/constants/narration-options'
import { calculateScriptCost } from '@/lib/credits'
import CoinIcon from './icons/CoinIcon'

interface ScriptFormProps {
    onSubmit: (data: ScriptFormData) => Promise<void>
    loading: boolean
    disabled?: boolean
    autoExpand?: boolean
}

export default function ScriptForm({ onSubmit, loading, disabled = false, autoExpand = false }: ScriptFormProps) {
    const { confirm } = useConfirm()
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
    // Narration customization
    const [voiceTone, setVoiceTone] = useState(DEFAULT_VOICE_TONE)
    const [pacing, setPacing] = useState(DEFAULT_PACING)
    const [vocabularyLevel, setVocabularyLevel] = useState(DEFAULT_VOCABULARY)

    // Auto-expand options if requested (e.g. for new users)
    useEffect(() => {
        if (autoExpand) {
            setShowOptions(true)
        }
    }, [autoExpand])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim() || loading || disabled) return

        // Calculate credits with tiered model pricing
        const credits = calculateScriptCost(model, parseInt(duration))

        // Show confirmation
        const confirmed = await confirm({
            title: 'Generate Script',
            message: `Bakal pakai ${credits} kredit buat generate script ${duration} menit nih. Lanjut?`,
            confirmText: 'Ya, Generate',
            cancelText: 'Batal'
        })

        if (!confirmed) return

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
            voiceTone,
            pacing,
            vocabularyLevel,
        })
        setTopic('')
        setAdditionalNotes('')
    }

    const isDisabled = loading || disabled

    // Calculate credit cost based on model tier and duration
    const creditCost = useMemo(() => {
        const durationValue = typeof duration === 'string' ? parseInt(duration) : duration
        return calculateScriptCost(model, durationValue)
    }, [model, duration])

    const inputClasses = `w-full h-10 px-3 text-sm border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition-shadow ${isDisabled ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'}`

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
                        className="h-10 px-4 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                Generating
                            </span>
                        ) : (
                            <>
                                <span>Generate</span>
                                <span className="text-[10px] opacity-75 inline-flex items-center gap-0.5">
                                    ({creditCost} <CoinIcon className="w-2.5 h-2.5" />)
                                </span>
                            </>
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

                    {/* Narration Style Section */}
                    <div className="pt-3 border-t border-neutral-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Mic color="currentColor" width="16px" height="16px" />
                            <h3 className="text-xs font-semibold text-neutral-700">Narration Style</h3>
                        </div>

                        {/* Row 5a: Voice Tone & Pacing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <CustomDropdown
                                label="Voice Tone"
                                value={voiceTone}
                                onChange={setVoiceTone}
                                options={VOICE_TONE_OPTIONS}
                                disabled={isDisabled}
                            />
                            <CustomDropdown
                                label="Pacing"
                                value={pacing}
                                onChange={setPacing}
                                options={PACING_OPTIONS}
                                disabled={isDisabled}
                            />
                        </div>

                        {/* Row 5b: Vocabulary Level */}
                        <CustomDropdown
                            label="Vocabulary Level"
                            value={vocabularyLevel}
                            onChange={setVocabularyLevel}
                            options={VOCABULARY_OPTIONS}
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Row 6: Target Audience */}
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

                    {/* Row 7: Additional Notes */}
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
                            className={`${inputClasses} h-[100px]`}
                        />
                    </div>
                </div>
            )}
        </form>
    )
}
