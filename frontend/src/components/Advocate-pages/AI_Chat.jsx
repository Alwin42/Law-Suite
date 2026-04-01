import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, Send, Sparkles, AlertCircle, User } from 'lucide-react';

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

    const handleSendMessage = async (e, suggestedText = null) => {
        if (e) e.preventDefault();
        
        const messageText = suggestedText || input;
        if (!messageText.trim()) return;

        const userMsg = { role: 'user', content: messageText };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post('https://law-suite-wemj.onrender.com/api/chatbot/ask/', 
                { message: messageText },
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
        <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[80vh] md:max-h-[800px] w-full max-w-4xl mx-auto bg-white md:border border-slate-200 md:rounded-2xl md:shadow-2xl font-sans overflow-hidden mt-16 md:mt-28 transition-all relative">
            
            {/* Premium Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-md z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Law Suite AI</h2>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Assistant Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 flex flex-col gap-6" ref={scrollRef}>
                
                {/* Empty State */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400 shadow-inner">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">How can I help you?</h3>
                        <p className="text-sm text-slate-500 text-center max-w-sm mb-8">
                            Ask me about case laws, draft legal documents, or query details about your current clients.
                        </p>
                        
                        <div className="flex flex-col gap-2 w-full max-w-sm">
                            <button onClick={() => handleSendMessage(null, "Summarize the latest updates on my active cases.")} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-left">
                                "Summarize the latest updates on my active cases"
                            </button>
                            <button onClick={() => handleSendMessage(null, "Draft an email requesting a hearing adjournment.")} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-left">
                                "Draft an email requesting a hearing adjournment"
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                            
                            {/* Bot Icon for AI messages */}
                            {msg.role !== 'user' && (
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mb-1">
                                    <Bot className="w-3 h-3 text-white" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div 
                                className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap
                                ${msg.role === 'user' 
                                    ? 'bg-slate-900 text-white rounded-2xl rounded-br-sm' 
                                    : msg.role === 'error'
                                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-2xl rounded-bl-sm'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm'
                                }`}
                            >
                                {msg.role === 'error' && <AlertCircle className="inline-block w-4 h-4 mr-2 -mt-0.5" />}
                                {msg.content}
                            </div>

                            {/* User Icon for User messages */}
                            {msg.role === 'user' && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-1">
                                    <User className="w-3 h-3 text-slate-500" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Animated Typing Indicator */}
                {loading && (
                    <div className="flex w-full justify-start animate-in fade-in duration-200">
                        <div className="flex items-end gap-2 max-w-[85%]">
                            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mb-1">
                                <Bot className="w-3 h-3 text-white" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100 transition-all duration-300">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Law Suite AI..." 
                        disabled={loading}
                        className="flex-1 max-h-32 px-4 py-3 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50"
                        autoComplete="off"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !input.trim()} 
                        className="flex items-center justify-center w-10 h-10 shrink-0 bg-slate-900 text-white rounded-xl transition-all duration-200 hover:bg-slate-800 active:scale-90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed m-1"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">AI can make mistakes. Consider verifying important legal information.</span>
                </div>
            </div>
        </div>
    );
};

export default AIChat;