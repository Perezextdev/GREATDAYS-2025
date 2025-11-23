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
                const session = JSON.parse(stored);
                // Validate session structure
                if (this.validateSession(session)) {
                    return session;
                }
                console.warn('Invalid session structure, creating new session');
            } catch (e) {
                console.error('Error parsing chat session:', e);
            }
        }

        // Create new session
        const newSession = {
            id: this.generateSessionId(),
            messages: [],
            createdAt: new Date().toISOString(),
            escalated: false,
            userInfo: null
        };

        this.saveSession(newSession);
        return newSession;
    }

    /**
     * Validate session structure
     */
    validateSession(session) {
        return session &&
            typeof session === 'object' &&
            session.id &&
            Array.isArray(session.messages) &&
            session.createdAt;
    }

    /**
     * Save session to localStorage
     */
    saveSession(session) {
        localStorage.setItem(this.storageKey, JSON.stringify(session));
    }

    /**
     * Save user info to session
     */
    saveUserInfo(userInfo) {
        const session = this.getSession();
        session.userInfo = userInfo;
        this.saveSession(session);
    }

    /**
     * Get user info from session
     */
    getUserInfo() {
        const session = this.getSession();
        return session.userInfo || null;
    }

    /**
     * Add message to session
     */
    addMessage(role, content) {
        const session = this.getSession();
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
        // Validate user info
        if (!userInfo || !userInfo.name || !userInfo.email) {
            throw new Error('User information is required for support escalation');
        }

        const session = this.getSession();

        try {
            // Create chat history summary
            const chatHistory = session.messages
                .map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`)
                .join('\n\n');

            // Validate we have messages to escalate
            if (session.messages.length === 0) {
                throw new Error('No conversation to escalate');
            }

            // Create support request
            const { data, error } = await supabase
                .from('support_requests')
                .insert([{
                    name: userInfo.name,
                    email: userInfo.email,
                    subject: 'Chat Escalation - Assistance Needed',
                    message: `This request was escalated from the chatbot.\n\nUser: ${userInfo.name} (${userInfo.email})\n\n--- CHAT HISTORY ---\n\n${chatHistory}`,
                    priority: 'medium',
                    status: 'open',
                    source: 'chatbot'
                }])
                .select();

            if (error) {
                console.error('Supabase error during escalation:', error);
                throw new Error(`Failed to create support request: ${error.message}`);
            }

            if (!data || data.length === 0) {
                throw new Error('No data returned from support request creation');
            }

            // Mark session as escalated
            session.escalated = true;
            session.supportRequestId = data[0].id;
            this.saveSession(session);

            return {
                success: true,
                requestId: data[0].id
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
