import { supabase } from '../lib/supabaseClient';
import { shouldEscalate } from '../config/chatbotConfig';

/**
 * Chat Service for managing chat sessions and support escalation
 */

class ChatService {
    constructor() {
        this.storageKey = 'greatdays_chat_session';
    }

    /**
     * Get or create chat session
     */
    getSession() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing chat session:', e);
            }
        }

        // Create new session
        const newSession = {
            id: this.generateSessionId(),
            messages: [],
            createdAt: new Date().toISOString(),
            escalated: false
        };
        const message = {
            id: Date.now(),
            role, // 'user' or 'assistant'
            content,
            timestamp: new Date().toISOString()
        };

        session.messages.push(message);
        this.saveSession(session);
        return message;
    }

    /**
     * Get conversation history for AI context
     */
    getConversationHistory(maxMessages = 10) {
        const session = this.getSession();
        const recentMessages = session.messages.slice(-maxMessages);

        return recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Check if message should be escalated
     */
    shouldEscalateMessage(message) {
        return shouldEscalate(message);
    }

    /**
     * Escalate chat to support request
     */
    async escalateToSupport(userInfo) {
        const session = this.getSession();

        try {
            // Create chat history summary
            const chatHistory = session.messages
                .map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`)
                .join('\n\n');

            // Create support request
            const { data, error } = await supabase
                .from('support_requests')
                .insert([{
                    name: userInfo.name || 'Chat User',
                    email: userInfo.email || 'noreply@greatdays2025.com',
                    subject: 'Chat Escalation - Assistance Needed',
                    message: `This request was escalated from the chatbot.\n\n--- CHAT HISTORY ---\n\n${chatHistory}`,
                    priority: 'medium',
                    status: 'open',
                    source: 'chatbot'
                }])
                .select();

            if (error) throw error;

            // Mark session as escalated
            session.escalated = true;
            session.supportRequestId = data[0]?.id;
            this.saveSession(session);

            return {
                success: true,
                requestId: data[0]?.id
            };
        } catch (error) {
            console.error('Error escalating to support:', error);
            throw error;
        }
    }

    /**
     * Clear chat session
     */
    clearSession() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export chat history
     */
    exportChatHistory() {
        const session = this.getSession();
        const text = session.messages
            .map(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                return `[${time}] ${msg.role.toUpperCase()}: ${msg.content}`;
            })
            .join('\n\n');

        return text;
    }
}

// Export singleton instance
export const chatService = new ChatService();
