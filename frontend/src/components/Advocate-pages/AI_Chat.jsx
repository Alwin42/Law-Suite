import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AIChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post('https://law-suite-niov.onrender.com/api/chatbot/ask/', 
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const botMsg = { role: 'bot', content: response.data.reply };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: 'error', content: "Connection failed. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-17 flex flex-col h-[85vh] max-h-[800px] w-full max-w-3xl mx-auto bg-white sm:border sm:border-gray-200 sm:rounded-xl shadow-sm font-sans overflow-hidden transition-all">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-primary tracking-tight">Law Suite Assistant</h2>
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
            </div>

            {/* Chat Area using your custom 'background' color */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background flex flex-col gap-5" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-accent opacity-80">
                        <svg className="w-10 h-10 mb-3 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p className="text-sm font-medium">How can I assist with your cases today?</p>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 text-sm leading-relaxed break-words shadow-sm transition-all duration-300 animate-[fadeIn_0.3s_ease-out]
                            ${msg.role === 'user' 
                                ? 'bg-black text-white rounded-2xl rounded-tr-sm' 
                                : msg.role === 'error'
                                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-2xl rounded-tl-sm'
                                    : 'bg-white text-primary border border-gray-100 rounded-2xl rounded-tl-sm'
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Animated Typing Indicator */}
                {loading && (
                    <div className="flex w-full justify-start animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="flex items-center p-3 sm:p-4 bg-slate-50 border-t border-gray-100 gap-3">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a case or client..." 
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-sm text-primary bg-gray-100 shadow-md border border-transparent rounded-lg transition-all duration-200 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-accent disabled:opacity-50"
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()} 
                    className="flex items-center justify-center w-11 h-11 bg-gray-600 text-white rounded-lg transition-all duration-200 hover:opacity-20 active:scale-95 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default AIChat;