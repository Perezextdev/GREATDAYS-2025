import { OPENAI_CONFIG, OPENROUTER_CONFIG, GEMINI_CONFIG, SYSTEM_PROMPT } from '../config/chatbotConfig';

/**
 * AI Service for chatbot interactions
 * Supports OpenAI, OpenRouter and Gemini APIs
 */

class AIService {
    constructor() {
        this.provider = import.meta.env.VITE_AI_PROVIDER || 'openai';
        this.openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
        this.openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second

        // Log configuration status
        if (!this.isConfigured()) {
            console.warn('AI Service: No API keys configured');
        } else {
            console.log(`AI Service: Initialized with provider: ${this.provider}`);
        }
    }

    /**
     * Send message to AI and get response with retry logic
     * @param {Array} messages - Conversation history
     * @returns {Promise<string>} AI response
     */
    async sendMessage(messages) {
        if (!this.isConfigured()) {
            throw new Error('AI service is not configured. Please check your API keys.');
        }

        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`AI Service: Attempt ${attempt}/${this.maxRetries}`);

                if (this.provider === 'openai' && this.openaiKey) {
                    return await this.sendToOpenAI(messages);
                } else if (this.provider === 'openrouter' && this.openrouterKey) {
                    return await this.sendToOpenRouter(messages);
                } else if (this.provider === 'gemini' && this.geminiKey) {
                    return await this.sendToGemini(messages);
                }
            } catch (error) {
                lastError = error;
                console.error(`AI Service Error (attempt ${attempt}):`, error);

                // Don't retry on certain errors
                if (error.message?.includes('API key') || error.message?.includes('401')) {
                    throw error;
                }

                // Wait before retrying (exponential backoff)
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError || new Error('Failed to get AI response after multiple attempts');
    }

    /**
     * Send message to OpenAI API
     */
    async sendToOpenAI(messages) {
        try {
            const response = await fetch(OPENAI_CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: OPENAI_CONFIG.model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages
                    ],
                    max_tokens: OPENAI_CONFIG.maxTokens,
                    temperature: OPENAI_CONFIG.temperature
                })
            });

            if (!response.ok) {
                let errorMessage = 'OpenAI API error';
                try {
                    const error = await response.json();
                    errorMessage = error.error?.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }

                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenAI configuration.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status >= 500) {
                    throw new Error('OpenAI service is temporarily unavailable.');
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('No response content from AI');
            }

            return content;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    /**
     * Send message to OpenRouter API
     */
    async sendToOpenRouter(messages) {
        try {
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
                let errorMessage = 'OpenRouter API error';
                try {
                    const error = await response.json();
                    errorMessage = error.error?.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }

                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenRouter configuration.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status >= 500) {
                    throw new Error('OpenRouter service is temporarily unavailable.');
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('No response content from AI');
            }

            return content;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    /**
     * Send message to Gemini API
     */
    async sendToGemini(messages) {
        try {
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
                let errorMessage = 'Gemini API error';
                try {
                    const error = await response.json();
                    errorMessage = error.error?.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }

                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid API key. Please check your Gemini configuration.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content) {
                throw new Error('No response content from AI');
            }

            return content;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
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
        return (this.provider === 'openai' && this.openaiKey) ||
            (this.provider === 'openrouter' && this.openrouterKey) ||
            (this.provider === 'gemini' && this.geminiKey);
    }
}

// Export singleton instance
export const aiService = new AIService();
