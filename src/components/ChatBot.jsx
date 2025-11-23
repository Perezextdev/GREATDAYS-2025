import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Loader2, AlertCircle,
    CheckCircle, User, Bot, ArrowUp, Trash2, Shield
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { chatService } from '../services/chatService';
import { CHATBOT_CONFIG } from '../config/chatbotConfig';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [showEscalation, setShowEscalation] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [showUserInfoForm, setShowUserInfoForm] = useState(false);
    const [userInfoForm, setUserInfoForm] = useState({ name: '', email: '' });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const subscriptionRef = useRef(null);

    // Load chat session on mount
    useEffect(() => {
        const initSession = async () => {
            try {
                const session = await chatService.getSession();

                // Check if user info already exists in session
                if (session.user_name && session.user_email) {
                    setUserInfo({ name: session.user_name, email: session.user_email });
                    setShowUserInfoForm(false);
                } else {
                    setShowUserInfoForm(true);
                }

                if (session.messages.length === 0) {
                    const welcomeMsg = {
                        id: Date.now(),
                        role: 'assistant',
                        content: CHATBOT_CONFIG.welcomeMessage,
                        created_at: new Date().toISOString()
                    };
                    setMessages([welcomeMsg]);
                    // We don't save the welcome message to DB to avoid clutter, 
                    // or we could if we want it persistent. For now, let's keep it local until user interacts.
                } else {
                    setMessages(session.messages);
                }

                // Subscribe to real-time messages
                subscriptionRef.current = chatService.subscribeToMessages((newMessage) => {
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                });

            } catch (err) {
                console.error('Failed to init chat session:', err);
                setError('Failed to load chat history');
            }
        };

        initSession();

        return () => {
            if (subscriptionRef.current) subscriptionRef.current();
        };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !showUserInfoForm) {
            inputRef.current?.focus();
        }
    }, [isOpen, showUserInfoForm]);

    const handleUserInfoSubmit = async (e) => {
        e.preventDefault();
        if (!userInfoForm.name || !userInfoForm.email) {
            alert('Please provide your name and email');
            return;
        }

        // Save user info to session
        await chatService.saveUserInfo(userInfoForm);
        setUserInfo(userInfoForm);
        setShowUserInfoForm(false);

        // Add greeting message
        const greetingMsg = {
            id: Date.now(),
            role: 'assistant',
            content: `Nice to meet you, ${userInfoForm.name}! 👋 How can I help you today?`,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, greetingMsg]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        // Validate user info exists
        if (!userInfo || !userInfo.name || !userInfo.email) {
            setError('Please provide your information first.');
            setShowUserInfoForm(true);
            return;
        }

        const userMessage = inputValue.trim();
        setInputValue('');
        setError(null);

        try {
            // Add user message to DB
            await chatService.addMessage('user', userMessage);
            // Note: Real-time subscription will update the UI

            // Check if should escalate
            if (chatService.shouldEscalateMessage(userMessage)) {
                setShowEscalation(true);
                await chatService.addMessage('assistant', CHATBOT_CONFIG.escalationMessage);
                return;
            }

            // Get AI response
            setIsTyping(true);

            if (!aiService.isConfigured()) {
                throw new Error('AI service is not configured. Please contact support.');
            }

            const conversationHistory = await chatService.getConversationHistory();
            const response = await aiService.sendMessage(conversationHistory);

            await chatService.addMessage('assistant', response);

        } catch (err) {
            console.error('Chat error:', err);

            // Provide user-friendly error messages
            let errorMessage = CHATBOT_CONFIG.errorMessage;
            if (err.message?.includes('API key')) {
                errorMessage = 'Our AI assistant is temporarily unavailable. Please try escalating to human support.';
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                errorMessage = 'Connection issue detected. Please check your internet and try again.';
            } else if (err.message?.includes('rate limit')) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            }

            setError(errorMessage);
            // Only show error locally, don't save to DB
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: errorMessage,
                created_at: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleEscalate = async (e) => {
        e.preventDefault();

        // Validate user info before escalation
        if (!userInfo || !userInfo.name || !userInfo.email) {
            setError('User information is required for support escalation.');
            setShowUserInfoForm(true);
            setShowEscalation(false);
            return;
        }

        try {
            // Use stored user info for escalation
            const result = await chatService.escalateToSupport(userInfo);
            if (result.success) {
                await chatService.addMessage(
                    'assistant',
                    `✅ Your request has been escalated to our support team. Reference ID: ${result.requestId}. We'll get back to you at ${userInfo.email} shortly, or you can stay here and wait for an agent.`
                );
                setShowEscalation(false);
            }
        } catch (err) {
            console.error('Escalation error:', err);
            const errorMessage = 'Failed to escalate request. Please try again or contact support directly.';
            setError(errorMessage);
            await chatService.addMessage('assistant', errorMessage);
        }
    };

    const handleClearChat = () => {
        if (window.confirm('Clear chat history? This will also reset your information.')) {
            chatService.clearSession();
            setUserInfo(null);
            setShowUserInfoForm(true);
            setMessages([{
                id: Date.now(),
                role: 'assistant',
                content: CHATBOT_CONFIG.welcomeMessage,
                created_at: new Date().toISOString()
            }]);
            // Re-init session
            chatService.getSession();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all"
                    >
                        <MessageCircle size={28} />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                            !
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                                    {CHATBOT_CONFIG.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold">{CHATBOT_CONFIG.name}</h3>
                                    <p className="text-xs text-white/80">
                                        {userInfo ? `Chatting with ${userInfo.name}` : 'Online • Ready to help'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Clear chat"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* User Info Form */}
                        {showUserInfoForm && (
                            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                                <form onSubmit={handleUserInfoSubmit} className="w-full space-y-4">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-3">
                                            {CHATBOT_CONFIG.avatar}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Welcome to GREAT DAYS!</h3>
                                        <p className="text-sm text-gray-600 mt-1">Please introduce yourself to get started</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={userInfoForm.name}
                                            onChange={(e) => setUserInfoForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                                        <input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={userInfoForm.email}
                                            onChange={(e) => setUserInfoForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                                    >
                                        Start Chatting
                                    </button>
                                    <p className="text-xs text-gray-500 text-center">
                                        We'll use this info to assist you better and for support escalation if needed.
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* Messages */}
                        {!showUserInfoForm && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {(msg.role === 'assistant' || msg.role === 'admin') && (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${msg.role === 'admin' ? 'bg-purple-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                                    {msg.role === 'admin' ? <Shield size={16} /> : <Bot size={18} />}
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : msg.role === 'admin'
                                                        ? 'bg-purple-50 text-gray-800 border border-purple-200 rounded-bl-sm'
                                                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                                                    }`}
                                            >
                                                {msg.role === 'admin' && (
                                                    <p className="text-xs font-bold text-purple-600 mb-1">Support Agent</p>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0">
                                                    <User size={18} />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <div className="flex gap-2 justify-start">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                                                <Bot size={18} />
                                            </div>
                                            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Escalation Prompt */}
                                {showEscalation && (
                                    <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Connect with Support Team</p>
                                        <p className="text-xs text-gray-600 mb-3">
                                            We'll send your chat history to our support team at <strong>{userInfo.email}</strong>
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleEscalate}
                                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                Send to Support
                                            </button>
                                            <button
                                                onClick={() => setShowEscalation(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Input */}
                                {!showEscalation && (
                                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                                        <div className="flex gap-2">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                                                disabled={isTyping}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!inputValue.trim() || isTyping}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowEscalation(true)}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Need human support? Click here
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
