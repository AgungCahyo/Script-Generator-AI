'use client'

import { useState } from 'react'
import { VolumeHighOutline, Reload, CreateOutline } from 'react-ionicons'
import AudioPlayer from '../../AudioPlayer'
import ScriptEditorModal from '../../ScriptEditorModal'
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
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio?.audioUrl || null)
    const { showError, showSuccess } = useToast()
    const { confirm } = useConfirm()

    const handleGenerateTTS = async (narasiText?: string) => {
        if (!authToken) {
            showError('Login dulu yuk buat generate audio')
            return
        }

        // Use provided text or current section narasi
        const currentNarasi = narasiText || section.narasi

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

    const handleEditorSave = async (visual: string, narasi: string) => {
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

        try {
            // Call parent callback to update the section
            const updatedSection: ScriptSection = {
                ...section,
                visual,
                narasi
            }

            if (onSectionUpdated) {
                onSectionUpdated(updatedSection)
            }

            showSuccess('Section updated successfully')

            // If audio existed, trigger TTS regeneration
            if (hasAudio && narasi.trim()) {
                // Clear current audio to show regeneration is needed
                setAudioUrl(null)

                // Trigger TTS generation automatically with new narasi
                setTimeout(() => {
                    handleGenerateTTS(narasi)
                }, 500) // Small delay to ensure save is processed first
            }
        } catch (error) {
            showError('Failed to save section')
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
        <>
            {/* Script Editor Modal */}
            <ScriptEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleEditorSave}
                initialVisual={section.visual}
                initialNarasi={section.narasi}
                timestamp={section.timestamp}
            />

            <div className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors bg-white">
                {/* Header with timestamp and edit button */}
                <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-neutral-900">
                        {section.timestamp}
                    </span>

                    <button
                        onClick={() => setIsEditorOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        title="Edit this section"
                    >
                        <CreateOutline color="currentColor" width="14px" height="14px" />
                        <span>Edit</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Visual description */}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 mb-1">VISUAL:</p>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                            {section.visual || '-'}
                        </p>
                    </div>

                    {/* Narasi text */}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 mb-1">NARASI:</p>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                            {section.narasi || '-'}
                        </p>
                    </div>

                    {/* Audio section */}
                    {audioUrl ? (
                        <div className="pt-2">
                            <AudioPlayer src={audioUrl} existingAudio={existingAudio || undefined} onDelete={handleDeleteAudio} />
                        </div>
                    ) : (
                        <div className="pt-2">
                            <button
                                onClick={() => handleGenerateTTS()}
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
                    )}
                </div>
            </div>
        </>
    )
}
