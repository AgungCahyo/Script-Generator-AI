import { useState, useEffect, useRef } from 'react'
import { Script } from '../utils/types'

export interface UseScriptTypingReturn {
    displayedScript: string
    skipTyping: () => void
    isTyping: boolean
    scriptContentRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Custom hook for managing script typing animation
 * Handles incremental character-by-character display with auto-scroll
 */
export function useScriptTyping(
    script: Script | null,
    authToken?: string,
    onScriptUpdated?: (script: Script) => void
): UseScriptTypingReturn {
    const [displayedScript, setDisplayedScript] = useState('')
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const previousScriptRef = useRef<string>('')
    const scriptContentRef = useRef<HTMLDivElement>(null)

    const [isTyping, setIsTyping] = useState(false)
    const isTypingRef = useRef(false)  // Ref to track typing without causing re-renders
    const hasViewedRef = useRef<boolean>(false)  // Track if script was already viewed on mount


    // Mark script as viewed in database
    const markAsViewed = async (scriptId: string) => {
        // Skip if user is not authenticated (guest mode)
        if (!authToken) {
            return
        }

        try {
            const response = await fetch(`/api/scripts/${scriptId}/mark-viewed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Failed to mark script as viewed:', response.status, errorText)
            } else {
                const data = await response.json()

                // Update parent component with script that has firstViewedAt
                if (data.script && onScriptUpdated) {
                    onScriptUpdated(data.script)
                }
            }
        } catch (error) {
            console.error('Error marking script as viewed:', error)
            // Fail silently - this is not critical
        }
    }

    // Reset when script ID changes (not content!)
    useEffect(() => {
        if (!script?.id) return

        setDisplayedScript('')

        // Clear any active typing animation
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
        }

        // CRITICAL FIX: Reset previousScriptRef to prevent state mismatch
        previousScriptRef.current = ''
        setIsTyping(false)
        isTypingRef.current = false

        // Check if this script has already been viewed
        hasViewedRef.current = !!script.firstViewedAt

        // If this script has already been viewed, show it immediately
        if (script.firstViewedAt && script.script) {
            setDisplayedScript(script.script)
            previousScriptRef.current = script.script
        }
    }, [script?.id])  // ONLY script ID! Content changes should not reset

    // Typing animation effect - triggers ONLY on script content changes for NEW scripts
    useEffect(() => {
        if (!script?.id || !script?.script) return

        // Skip typing if this script was already viewed when mounted
        if (hasViewedRef.current) return

        const fullText = script.script
        const previousText = previousScriptRef.current

        if (fullText !== previousText && fullText.length > previousText.length) {
            previousScriptRef.current = fullText

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }

            let index = previousText.length
            setIsTyping(true)
            isTypingRef.current = true

            const typeNext = () => {
                if (index < fullText.length) {
                    setDisplayedScript(fullText.slice(0, index + 1))
                    index++
                    typingTimeoutRef.current = setTimeout(typeNext, 30)
                } else {
                    typingTimeoutRef.current = null
                    setIsTyping(false)
                    isTypingRef.current = false
                    // Mark this script as viewed in database
                    markAsViewed(script.id)
                }
            }

            typeNext()

            // NO cleanup return - let typing finish naturally!
            // Cleanup will happen when script ID changes or component unmounts
        }
    }, [script?.script, script?.id])  // Only script content and ID


    // Auto-scroll effect - follow typing animation
    useEffect(() => {
        if (scriptContentRef.current && displayedScript) {
            scriptContentRef.current.scrollTop = scriptContentRef.current.scrollHeight
        }
    }, [displayedScript])

    // Skip typing function
    const skipTyping = () => {
        if (script?.script && typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
            setDisplayedScript(script.script)
            previousScriptRef.current = script.script
            setIsTyping(false)
            isTypingRef.current = false

            // Mark as viewed in database when user skips
            markAsViewed(script.id)
        }
    }

    return {
        displayedScript,
        skipTyping,
        isTyping,
        scriptContentRef
    }
}
