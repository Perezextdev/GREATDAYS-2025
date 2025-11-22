import { OPENROUTER_CONFIG, GEMINI_CONFIG, SYSTEM_PROMPT } from '../config/chatbotConfig';

/**
 * AI Service for chatbot interactions
 * Supports OpenRouter and Gemini APIs
 */

class AIService {
    constructor() {
        this.provider = import.meta.env.VITE_AI_PROVIDER || 'openrouter';
        this.openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    /**
     * Send message to AI and get response
     * @param {Array} messages - Conversation history
     * @returns {Promise<string>} AI response
     */
    async sendMessage(messages) {
        try {
            if (this.provider === 'openrouter' && this.openrouterKey) {
                return await this.sendToOpenRouter(messages);
            } else if (this.provider === 'gemini' && this.geminiKey) {
                return await this.sendToGemini(messages);
            } else {
                throw new Error('No AI provider configured');
            }
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }

    /**
     * Send message to OpenRouter API
     */
    async sendToOpenRouter(messages) {
        const response = await fetch(OPENROUTER_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openrouterKey}`,
                'Content-Type': 'application/json',
                ...OPENROUTER_CONFIG.headers
            },
            body: JSON.stringify({
                model: OPENROUTER_CONFIG.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages
                ],
                max_tokens: OPENROUTER_CONFIG.maxTokens,
                temperature: OPENROUTER_CONFIG.temperature
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenRouter API error');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    }

    /**
     * Send message to Gemini API
     */
    async sendToGemini(messages) {
        // Convert messages to Gemini format
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Prepend system prompt as first user message
        contents.unshift({
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }]
        });

        const response = await fetch(
            `${GEMINI_CONFIG.apiUrl}?key=${this.geminiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        maxOutputTokens: GEMINI_CONFIG.maxTokens,
                        temperature: GEMINI_CONFIG.temperature
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I could not generate a response.';
    }

    /**
     * Classify message complexity
     * @param {string} message - User message
     * @returns {string} 'simple' or 'complex'
     */
    classifyMessage(message) {
        const complexKeywords = [
            'payment', 'refund', 'cancel', 'problem', 'issue', 'error',
            'bug', 'not working', 'broken', 'complaint', 'urgent'
        ];

        const lowerMessage = message.toLowerCase();
        const isComplex = complexKeywords.some(keyword => lowerMessage.includes(keyword));

        return isComplex ? 'complex' : 'simple';
    }

    /**
     * Check if AI service is configured
     */
    isConfigured() {
        return (this.provider === 'openrouter' && this.openrouterKey) ||
            (this.provider === 'gemini' && this.geminiKey);
    }
}

// Export singleton instance
export const aiService = new AIService();
