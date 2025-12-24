'use client'

import { useState } from 'react'
import { VolumeHighOutline, Reload, CreateOutline, SaveOutline, CloseCircleOutline } from 'react-ionicons'
import AudioPlayer from '../../AudioPlayer'
import { ScriptSection } from '../utils/scriptParser'
import { useToast } from '../../Toast'
import { useConfirm } from '../../Confirm'
import { AudioFile } from '@/lib/types/script'
import { CREDIT_COSTS } from '@/lib/constants/credits'
import CoinIcon from '@/components/icons/CoinIcon'

interface ScriptSectionCardProps {
    section: ScriptSection
    scriptId: string
    authToken?: string
    selectedVoice?: string  // OpenAI TTS voice ID
    existingAudio?: AudioFile | null  // Audio file that matches this section
    onSectionUpdated?: (updatedSection: ScriptSection) => void
    onScriptUpdated?: (updatedScript: any) => void  // Callback to update parent script
}

export default function ScriptSectionCard({
    section,
    scriptId,
    authToken,
    selectedVoice,
    existingAudio,
    onSectionUpdated,
    onScriptUpdated
}: ScriptSectionCardProps) {
    const [generatingAudio, setGeneratingAudio] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedVisual, setEditedVisual] = useState(section.visual)
    const [editedNarasi, setEditedNarasi] = useState(section.narasi)
    const [saving, setSaving] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio?.audioUrl || null)
    const { showError, showSuccess } = useToast()
    const { confirm } = useConfirm()

    const handleGenerateTTS = async () => {
        if (!authToken) {
            showError('Login dulu yuk buat generate audio')
            return
        }

        // Use editedNarasi as source of truth (it reflects current state)
        const currentNarasi = editedNarasi || section.narasi

        if (!currentNarasi || currentNarasi.trim().length === 0) {
            showError('Teksnya masih kosong nih')
            return
        }

        // Show confirmation
        const confirmed = await confirm({
            title: 'Generate Audio TTS',
            message: `Bakal pakai ${CREDIT_COSTS.TTS_SECTION} kredit buat generate audio TTS section ini. Lanjut?`,
            confirmText: 'Ya, Generate',
            cancelText: 'Batal'
        })

        if (!confirmed) return

        setGeneratingAudio(true)

        // Debug: Log what we're sending
        const payload = {
            sectionIndex: section.index,
            narasiText: currentNarasi,
            timestamp: section.timestamp
        }

        try {
            console.log(`Generating audio for section ${section.index}, voice:`, selectedVoice)
            // Call API to generate TTS for this specific section
            const res = await fetch(`/api/scripts/${scriptId}/generate-section-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    ...payload,
                    voiceId: selectedVoice  // Pass selected voice to API
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                showError(data.message || data.error || 'Failed to generate audio')
                setGeneratingAudio(false)
                return
            }

            // Poll for audio completion
            const pollInterval = setInterval(async () => {
                const scriptRes = await fetch(`/api/scripts/${scriptId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
                const scriptData = await scriptRes.json()

                // Check if audio for this section is ready
                const matchingAudio = scriptData.script?.audioFiles?.find(
                    (af: AudioFile) => af.timestamp === section.timestamp
                )

                if (matchingAudio?.audioUrl) {
                    clearInterval(pollInterval)
                    setAudioUrl(matchingAudio.audioUrl)
                    setGeneratingAudio(false)
                    showSuccess('Audio generated successfully')

                    // Update parent script to trigger re-render with new audio
                    if (onScriptUpdated && scriptData.script) {
                        onScriptUpdated(scriptData.script)
                    }
                }
            }, 3000)

            // Timeout after 2 minutes
            setTimeout(() => {
                clearInterval(pollInterval)
                setGeneratingAudio(false)
            }, 120000)

        } catch (error) {
            showError('Network error. Please check your connection')
            setGeneratingAudio(false)
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
        setEditedVisual(section.visual)
        setEditedNarasi(section.narasi)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedVisual(section.visual)
        setEditedNarasi(section.narasi)
    }

    const handleSave = async () => {
        if (!authToken) {
            showError('Login dulu ya buat edit')
            return
        }

        // Check if audio already exists for this section
        const hasAudio = !!audioUrl || !!existingAudio

        // Show confirmation modal only if audio exists
        if (hasAudio) {
            const confirmed = await confirm({
                title: 'Simpan Perubahan?',
                message: 'Perubahan akan disimpan dan audio untuk bagian ini akan di-generate ulang.',
                confirmText: 'Simpan',
                cancelText: 'Batal'
            })

            if (!confirmed) return
        }

        setSaving(true)
        try {
            // Call parent callback to update the section
            const updatedSection: ScriptSection = {
                ...section,
                visual: editedVisual,
                narasi: editedNarasi
            }

            if (onSectionUpdated) {
                onSectionUpdated(updatedSection)
            }

            setIsEditing(false)
            showSuccess('Section updated successfully')

            // If audio existed, trigger TTS regeneration
            if (hasAudio && editedNarasi.trim()) {
                // Clear current audio to show regeneration is needed
                setAudioUrl(null)

                // Trigger TTS generation automatically
                setTimeout(() => {
                    handleGenerateTTS()
                }, 500) // Small delay to ensure save is processed first
            }
        } catch (error) {
            showError('Failed to save section')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAudio = async () => {
        if (!authToken) {
            showError('Login dulu ya')
            return
        }

        // Show confirmation
        const confirmed = await confirm({
            title: 'Hapus Audio?',
            message: 'Audio TTS untuk section ini akan dihapus. Kamu bisa generate ulang kapan aja.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal'
        })

        if (!confirmed) return

        try {
            // Call API to delete audio for this section
            const res = await fetch(`/api/scripts/${scriptId}/delete-section-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    timestamp: section.timestamp
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                showError(data.message || data.error || 'Failed to delete audio')
                return
            }

            // Clear local audio state
            setAudioUrl(null)

            // Refetch script to update parent
            const scriptRes = await fetch(`/api/scripts/${scriptId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            })
            const scriptData = await scriptRes.json()

            if (onScriptUpdated && scriptData.script) {
                onScriptUpdated(scriptData.script)
            }

            showSuccess('Audio deleted successfully')
        } catch (error) {
            showError('Network error. Please check your connection')
        }
    }

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors bg-white">
            {/* Header with timestamp and edit button */}
            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-sm font-mono font-semibold text-neutral-900">
                    {section.timestamp}
                </span>

                {!isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        title="Edit this section"
                    >
                        <CreateOutline color="currentColor" width="14px" height="14px" />
                        <span>Edit</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <CloseCircleOutline color="currentColor" width="14px" height="14px" />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-neutral-900 text-white hover:bg-neutral-800 rounded disabled:opacity-50 transition-colors"
                        >
                            {saving ? (
                                <>
                                    <Reload color="currentColor" width="14px" height="14px" cssClasses="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <SaveOutline color="currentColor" width="14px" height="14px" />
                                    <span>Save</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Visual description */}
                <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">VISUAL:</p>
                    {isEditing ? (
                        <textarea
                            value={editedVisual}
                            onChange={(e) => setEditedVisual(e.target.value)}
                            className="w-full text-sm text-neutral-700 leading-relaxed p-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none"
                            rows={2}
                            placeholder="Visual description..."
                        />
                    ) : (
                        <p className="text-sm text-neutral-700 leading-relaxed">
                            {section.visual || '-'}
                        </p>
                    )}
                </div>

                {/* Narasi text */}
                <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">NARASI:</p>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={editedNarasi}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value.length <= 1000) {
                                        setEditedNarasi(value)
                                    }
                                }}
                                className="w-full text-sm text-neutral-700 leading-relaxed p-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none"
                                rows={3}
                                placeholder="Narration text..."
                                maxLength={1000}
                            />
                            <div className={`text-xs mt-1 text-right ${editedNarasi.length >= 1000 ? 'text-red-500 font-medium' : editedNarasi.length >= 900 ? 'text-yellow-600' : 'text-neutral-400'}`}>
                                {editedNarasi.length}/1000 karakter
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-700 leading-relaxed">
                            {section.narasi || '-'}
                        </p>
                    )}
                </div>

                {/* Audio section - hidden during edit */}
                {!isEditing && (
                    audioUrl ? (
                        <div className="pt-2">
                            <AudioPlayer src={audioUrl} existingAudio={existingAudio || undefined} onDelete={handleDeleteAudio} />
                        </div>
                    ) : (
                        <div className="pt-2">
                            <button
                                onClick={handleGenerateTTS}
                                disabled={generatingAudio || !authToken}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {generatingAudio ? (
                                    <>
                                        <Reload color="currentColor" width="14px" height="14px" cssClasses="animate-spin" />
                                        <span>Generating Audio...</span>
                                    </>
                                ) : (
                                    <>
                                        <VolumeHighOutline color="currentColor" width="14px" height="14px" />
                                        <span>Generate TTS</span>
                                        <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-500">
                                            ({CREDIT_COSTS.TTS_SECTION} <CoinIcon className="w-2.5 h-2.5" />)
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
