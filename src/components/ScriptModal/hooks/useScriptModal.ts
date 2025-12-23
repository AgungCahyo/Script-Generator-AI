import { useState, useEffect } from 'react'

export interface UseScriptModalReturn {
    isMounted: boolean
    isEditing: boolean
    editedScript: string
    copied: boolean
    isEditingTitle: boolean
    editedTitle: string
    setIsEditing: (value: boolean) => void
    setEditedScript: (value: string) => void
    handleEdit: (currentScript: string) => void
    handleCancelEdit: () => void
    copyToClipboard: (scriptText: string) => void
    handleEditTitle: (currentTitle: string) => void
    handleCancelEditTitle: () => void
    setEditedTitle: (value: string) => void
}

/**
 * Custom hook for managing ScriptModal state and lifecycle
 * Handles modal mount animation, edit mode, and clipboard operations
 */
export function useScriptModal(isOpen: boolean): UseScriptModalReturn {
    const [isMounted, setIsMounted] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedScript, setEditedScript] = useState('')
    const [copied, setCopied] = useState(false)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editedTitle, setEditedTitle] = useState('')

    // Mount animation effect for popup
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsMounted(true), 10)
            return () => clearTimeout(timer)
        } else {
            setIsMounted(false)
        }
    }, [isOpen])

    // Reset edit state when closing
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false)
            setEditedScript('')
            setIsEditingTitle(false)
            setEditedTitle('')
        }
    }, [isOpen])

    const handleEdit = (currentScript: string) => {
        setEditedScript(currentScript)
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedScript('')
    }

    const copyToClipboard = (scriptText: string) => {
        if (scriptText) {
            navigator.clipboard.writeText(scriptText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleEditTitle = (currentTitle: string) => {
        setEditedTitle(currentTitle)
        setIsEditingTitle(true)
    }

    const handleCancelEditTitle = () => {
        setIsEditingTitle(false)
        setEditedTitle('')
    }

    return {
        isMounted,
        isEditing,
        editedScript,
        copied,
        isEditingTitle,
        editedTitle,
        setIsEditing,
        setEditedScript,
        handleEdit,
        handleCancelEdit,
        copyToClipboard,
        handleEditTitle,
        handleCancelEditTitle,
        setEditedTitle
    }
}
