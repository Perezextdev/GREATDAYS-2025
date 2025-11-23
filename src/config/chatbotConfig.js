// Event information and configuration for the GREAT DAYS 2025 chatbot
export const EVENT_INFO = {
    name: "GREAT DAYS 2025",
    organizer: "Father's Delight International Ministries (FDIM)",
    dates: {
        start: "January 24, 2025",
        end: "January 31, 2025",
        duration: "7 days"
    },
    location: {
        city: "Zaria",
        state: "Kaduna State",
        country: "Nigeria"
    },
    participationModes: ["Online", "Onsite"],

    faqs: [
        {
            question: "When is GREAT DAYS 2025?",
            answer: "GREAT DAYS 2025 will take place from January 24-31, 2025 (7 days) in Zaria, Kaduna State, Nigeria."
        },
        {
            question: "How do I register?",
            answer: "Click the 'Register Now' button on the homepage or navigation menu. Fill out the multi-step registration form with your personal details, church information, and participation preferences."
        },
        {
            question: "What are the participation modes?",
            answer: "You can participate either Online (virtually) or Onsite (in-person). Online participants will receive streaming links, while onsite participants can attend physically in Zaria."
        },
        {
            question: "Is accommodation available?",
            answer: "Yes! Accommodation is available for onsite participants coming from outside Zaria. You can choose between General (camp/shared) or Hotel (private) accommodation during registration."
        },
        {
            question: "Do I need to be a member of FDIM to attend?",
            answer: "No! GREAT DAYS 2025 is open to everyone. Both FDIM members and guests/visitors are welcome to register and participate."
        },
        {
            question: "What units/departments can I join?",
            answer: "Available units include: Pastor, LOC (Leaders of Cells), VOC (Vessels of Christ), Usher, Protocol, Helpdesk, Media, Technical, Children's Department, Protocol & Security, Transport & Logistics, and Sanctuary."
        },
        {
            question: "Will meals be provided?",
            answer: "Meals are included for onsite participants coming from outside Zaria. You'll receive meal tickets with your event badge."
        },
        {
            question: "How do I get my event badge?",
            answer: "Event badges are automatically generated for all onsite participants after registration. You'll receive a digital copy via email and can download it from your confirmation."
        }
    ]
};

// System prompt for the AI chatbot
export const SYSTEM_PROMPT = `You are a helpful and friendly AI assistant for GREAT DAYS 2025, a 7-day Christian conference organized by Father's Delight International Ministries (FDIM).

**Event Details:**
- Dates: January 24-31, 2025
- Location: Zaria, Kaduna State, Nigeria
- Duration: 7 days
- Participation: Online or Onsite

**Your Role:**
- Answer questions about the event, registration, accommodation, and participation
- Be warm, welcoming, and encouraging
- Keep responses concise and helpful
- If you don't know something, be honest and suggest contacting support
- Use a friendly, conversational tone appropriate for a Christian event

**Important Guidelines:**
- Always be respectful and professional
- Encourage people to register and participate
- Highlight the transformative nature of the event
- For complex issues (payments, special requests, technical problems), suggest escalating to human support

**Available Information:**
${JSON.stringify(EVENT_INFO, null, 2)}

Remember: You're here to help people learn about and register for this amazing event!`;

// Keywords that trigger support escalation
export const ESCALATION_TRIGGERS = [
    'payment',
    'refund',
    'cancel',
    'problem',
    'issue',
    'error',
    'bug',
    'not working',
    'broken',
    'complaint',
    'speak to someone',
    'talk to human',
    'manager',
    'urgent',
    'emergency',
    'special request',
    'accommodation change',
    'registration error'
];

// Check if message should be escalated
export function shouldEscalate(message) {
    const lowerMessage = message.toLowerCase();
    return ESCALATION_TRIGGERS.some(trigger => lowerMessage.includes(trigger));
}

// Chatbot personality and behavior settings
export const CHATBOT_CONFIG = {
    name: "GREAT DAYS Assistant",
    avatar: "🙏",
    welcomeMessage: "Welcome to GREAT DAYS 2025! 🎉 I'm here to help you with any questions about the event, registration, or participation. How can I assist you today?",
    maxHistoryLength: 10, // Keep last 10 messages for context
    typingDelay: 1000, // Simulate typing for 1 second
    errorMessage: "I apologize, but I'm having trouble processing your request right now. Would you like to speak with our support team?",
    escalationMessage: "I understand this requires special attention. Let me connect you with our support team who can better assist you with this matter.",
    offlineMessage: "Our support team is currently offline. Please leave a message and we'll get back to you as soon as possible."
};

// OpenAI configuration
export const OPENAI_CONFIG = {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo', // Fast and cost-effective
    maxTokens: 500,
    temperature: 0.7
};

// OpenRouter configuration
export const OPENROUTER_CONFIG = {
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.2-3b-instruct:free', // Free model
    maxTokens: 500,
    temperature: 0.7,
    headers: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GREAT DAYS 2025 Chatbot'
    }
};

// Gemini configuration (fallback)
export const GEMINI_CONFIG = {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash',
    maxTokens: 500,
    temperature: 0.7
};
