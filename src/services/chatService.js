import { supabase } from '../lib/supabaseClient';
import { shouldEscalate } from '../config/chatbotConfig';

/**
 * Chat Service for managing chat sessions and support escalation
 */

class ChatService {
    constructor() {
        this.storageKey = 'greatdays_chat_session_id';
        this.currentSessionId = null;
        this.realtimeSubscription = null;
    }

    /**
     * Get or create chat session
     */
    async getSession() {
        // Try to get session ID from local storage
        let sessionId = localStorage.getItem(this.storageKey);

        if (sessionId) {
            // Verify session exists in Supabase
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (data && !error) {
                this.currentSessionId = sessionId;
                return {
                    ...data,
                    messages: await this.getMessages(sessionId)
                };
            }
        }

        // Create new session if none exists or invalid
        return await this.createSession();
    }

    /**
     * Create a new session
     */
    async createSession(userInfo = null) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert([{
                status: 'active',
                user_name: userInfo?.name || null,
                user_email: userInfo?.email || null,
                metadata: { userAgent: navigator.userAgent }
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating session:', error);
            throw error;
        }

        this.currentSessionId = data.id;
        localStorage.setItem(this.storageKey, data.id);

        return {
            ...data,
            messages: []
        };
    }

    /**
     * Get messages for a session
     */
    async getMessages(sessionId) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Save user info to session
     */
    async saveUserInfo(userInfo) {
        if (!this.currentSessionId) await this.getSession();

        const { error } = await supabase
            .from('chat_sessions')
            .update({
                user_name: userInfo.name,
                user_email: userInfo.email
            })
            .eq('id', this.currentSessionId);

        if (error) console.error('Error saving user info:', error);
    }

    /**
     * Add message to session
     */
    async addMessage(role, content) {
        if (!this.currentSessionId) await this.getSession();

        const message = {
            session_id: this.currentSessionId,
            role, // 'user', 'assistant', or 'admin'
            content,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('chat_messages')
            .insert([message])
            .select()
            .single();

        if (error) {
            console.error('Error adding message:', error);
            throw error;
        }

        // Update session updated_at timestamp to trigger real-time updates for admin list
        await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', this.currentSessionId);

        return data;
    }

    /**
     * Subscribe to real-time messages
     */
    subscribeToMessages(onMessage) {
        if (!this.currentSessionId) return;

        if (this.realtimeSubscription) {
            supabase.removeChannel(this.realtimeSubscription);
        }

        this.realtimeSubscription = supabase
            .channel(`chat:${this.currentSessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${this.currentSessionId}`
            }, (payload) => {
                onMessage(payload.new);
            })
            .subscribe();

        return () => {
            if (this.realtimeSubscription) {
                supabase.removeChannel(this.realtimeSubscription);
            }
        };
    }

    /**
     * Get conversation history for AI context
     */
    async getConversationHistory(maxMessages = 10) {
        if (!this.currentSessionId) return [];
        const messages = await this.getMessages(this.currentSessionId);
        const recentMessages = messages.slice(-maxMessages);

        return recentMessages.map(msg => ({
            role: msg.role === 'admin' ? 'assistant' : msg.role, // Treat admin as assistant for AI context
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
        if (!this.currentSessionId) await this.getSession();

        try {
            // Update session status to escalated
            const { error: updateError } = await supabase
                .from('chat_sessions')
                .update({
                    status: 'escalated',
                    user_name: userInfo.name,
                    user_email: userInfo.email
                })
                .eq('id', this.currentSessionId);

            if (updateError) throw updateError;

            // Also create a support request for visibility in the old system (optional, but good for compatibility)
            // For now, we rely on the new chat_sessions table for the live chat interface

            return {
                success: true,
                requestId: this.currentSessionId
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
        this.currentSessionId = null;
        if (this.realtimeSubscription) {
            supabase.removeChannel(this.realtimeSubscription);
        }
    }
}

// Export singleton instance
export const chatService = new ChatService();
