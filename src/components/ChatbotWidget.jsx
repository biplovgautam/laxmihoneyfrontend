import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to Laxmi Honey Industry. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // API Base URL from environment
  const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || '').replace(/\/$/, '');

  // Check if user is authenticated
  const isUserAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target) && isOpen) {
        // Check if click is not on the floating button
        const floatingButton = document.getElementById('chatbot-floating-button');
        if (floatingButton && !floatingButton.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const quickReplies = [
    "What honey products do you offer?",
    "Tell me about health benefits of honey",
    "What's your delivery policy?",
    "How can I contact you?"
  ];



  const getBotResponseFromLLM = async (userMessage) => {
    try {
      if (!API_BASE_URL) {
        throw new Error('Backend API base URL is not configured');
      }

      const isAuthenticated = isUserAuthenticated();
      const endpoint = isAuthenticated ? '/api1/llm/authenticated' : '/api1/llm/public';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify({
          message: userMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from LLM');
      }

      const data = await response.json();
      
      if (typeof data === 'object' && data.response) {
        return data.response;
      } else if (typeof data === 'string') {
        return data;
      } else {
        return "I apologize, but I received an unexpected response. Please try again! 🙏";
      }
    } catch (error) {
      console.error('Chatbot error:', error.message);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact us directly at +977 981-9492581. 🙏";
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    const currentMessage = inputMessage;
    setInputMessage('');

    try {
      // Pass only the raw user message to backend
      const botResponseText = await getBotResponseFromLLM(currentMessage);
      const botResponse = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble right now. Please try again or contact us at +977 981-9492581. 🙏",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button with Lottie Animation - Only shows when chat is closed */}
      {!isOpen && (
        <motion.button
          id="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <div className="w-20 h-20">
            <DotLottieReact
              src="https://lottie.host/e5551b86-c2f2-4f2e-80f1-a55d7640f385/VS5zzBIn9D.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-5rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-100"
          >
            {/* Header - Modern & Minimal */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-5 relative">
              {/* Close Button - Top Right */}
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4 text-white" />
              </motion.button>

              {/* Header Content */}
              <div className="flex items-center gap-3 pr-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10">
                    <DotLottieReact
                      src="https://lottie.host/e5551b86-c2f2-4f2e-80f1-a55d7640f385/VS5zzBIn9D.lottie"
                      loop
                      autoplay
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Laxmi Honey</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-sm"></span>
                    <span className="text-white/95 text-sm font-medium">Always here to help</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-amber-50/30 to-orange-50/20">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1.5 ${message.sender === 'user' ? 'text-white/80' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></span>
                      <span className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-5 py-3 bg-white/80 backdrop-blur-sm border-t border-amber-100/50">
                <p className="text-xs text-gray-500 mb-2.5 font-medium">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 text-xs font-medium rounded-xl border border-amber-200/50 transition-all duration-200 shadow-sm"
                    >
                      {reply}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-amber-100/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-5 py-3.5 bg-amber-50/50 border border-amber-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm placeholder:text-gray-400 transition-all duration-200"
                />
                <motion.button
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputMessage.trim()}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-200 ${
                    inputMessage.trim() 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 hover:shadow-xl' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <FaPaperPlane className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
