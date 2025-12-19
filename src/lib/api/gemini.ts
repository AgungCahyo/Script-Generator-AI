import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Initialize Gemini AI client
 * @param apiKey - Gemini API key
 * @returns GoogleGenerativeAI instance
 */
export function initializeGemini(apiKey: string) {
    return new GoogleGenerativeAI(apiKey)
}

/**
 * Get Gemini model by name
 * @param genAI - GoogleGenerativeAI instance
 * @param modelName - Model identifier
 * @returns GenerativeModel instance
 */
export function getGeminiModel(genAI: GoogleGenerativeAI, modelName: string) {
    return genAI.getGenerativeModel({ model: modelName })
}
