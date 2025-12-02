import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaTrash, FaRobot, FaUser, FaCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import Toast from './Toast';

const ChatbotWidget = () => {
  const { user } = useAuth();
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [authStatus, setAuthStatus] = useState('anonymous');
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  // API Base URL from environment
  const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || '').replace(/\/$/, '');

  // Debug helper - only logs in development
  const devLog = (message, data) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  };

  // Helper: Get valid auth token (with auto-refresh)
  const getValidAuthToken = async () => {
    // Get the actual Firebase auth user (not the custom user from context)
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) return null;
    
    try {
      // Force refresh to get a fresh token (Firebase tokens expire after 1 hour)
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem('authToken', token);
      devLog('✅ Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  };

  // Check if user is authenticated
  const isUserAuthenticated = () => {
    return !!user;
  };

  // Update auth status whenever user changes
  useEffect(() => {
    const newStatus = isUserAuthenticated() ? 'authenticated' : 'anonymous';
    devLog('🔐 Auth status update:', {
      firebaseUser: !!user,
      userEmail: user?.email,
      newStatus: newStatus
    });
    setAuthStatus(newStatus);

    // Fetch history only for authenticated users
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    // Only fetch history for authenticated users
    if (!isUserAuthenticated()) {
      devLog('📭 Skipping history fetch for guest user');
      return;
    }

    try {
      setIsLoadingHistory(true);
      
      // Get fresh auth token (will auto-refresh if needed)
      const authToken = await getValidAuthToken();
      
      if (!authToken) {
        console.log('❌ No auth token available');
        setAuthStatus('anonymous');
        return;
      }
      
      const url = `${API_BASE_URL}/api1/llm/history`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };

      devLog('📤 Fetching authenticated history');

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        
        devLog('📥 History response:', {
          user_type: data.user_type,
          message_count: data.message_count
        });
        
        // Update auth status from backend response
        if (data.user_type) {
          setAuthStatus(data.user_type);
        }
        
        // Update message count
        if (data.message_count) {
          setMessageCount(data.message_count);
        }
        
        // Keep the welcome message and append history
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          const historyMessages = data.history.map((msg, index) => ({
            id: index + 2,
            text: msg.content || msg.text || msg.message,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          
          // Use functional update to get current messages
          setMessages(currentMessages => {
            const welcomeMessage = currentMessages[0];
            return [welcomeMessage, ...historyMessages];
          });
          setMessageCount(historyMessages.length);
        }
      } else if (response.status === 401) {
        // Token invalid, fallback to anonymous
        console.log('❌ Auth token invalid, switching to anonymous');
        setAuthStatus('anonymous');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Silently fail - user can still chat
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Clear chat history (authenticated users only)
  const handleClearChat = async () => {
    if (!isUserAuthenticated()) {
      showToast('warning', 'Only logged-in users can clear chat history');
      return;
    }

    if (!confirm('Are you sure you want to clear your entire chat history? This action cannot be undone.')) {
      return;
    }

    try {
      const authToken = await getValidAuthToken();
      if (!authToken) {
        showToast('error', 'Session expired. Please log in again.');
        setAuthStatus('anonymous');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api1/llm/clearchat`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        // Reset messages to welcome message only
        setMessages([{
          id: 1,
          text: "Hello! 👋 Welcome to Laxmi Honey Industry. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
        setMessageCount(0);
        showToast('success', 'Chat history cleared successfully!');
      } else if (response.status === 401) {
        showToast('error', 'Session expired. Please log in again.');
        setAuthStatus('anonymous');
        localStorage.removeItem('authToken');
      } else {
        throw new Error('Failed to clear chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      showToast('error', 'Failed to clear chat history. Please try again.');
    }
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

      // Get fresh auth token (will auto-refresh if needed)
      const authToken = await getValidAuthToken();
      const isAuthenticated = !!authToken;
      
      // Determine endpoint based on authentication
      const endpoint = isAuthenticated ? '/api1/llm/authenticated' : '/api1/llm/public';

      // Prepare request body - SIMPLIFIED for guest users
      const requestBody = {
        message: userMessage
      };

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };

      if (isAuthenticated) {
        // ✅ AUTHENTICATED: Send Authorization header for session memory
        headers['Authorization'] = `Bearer ${authToken}`;
        devLog('📤 Sending authenticated message (with session memory)');
      } else {
        // ✅ GUEST: Simple stateless request - no anonymousId, no tracking
        devLog('📤 Sending guest message (stateless)');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401 && isAuthenticated) {
          // Token expired, fallback to anonymous
          console.log('❌ Token expired, retrying as guest');
          setAuthStatus('anonymous');
          localStorage.removeItem('authToken');
          // Retry as guest (will use /api1/llm/public endpoint)
          return await getBotResponseFromLLM(userMessage);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      devLog('📥 Message response:', {
        user_type: data.user_type,
        expected: isAuthenticated ? 'authenticated' : 'guest'
      });
      
      // Update auth status from backend response
      if (data.user_type) {
        setAuthStatus(data.user_type);
      }
      
      // Update message count (only for authenticated users with session)
      if (isAuthenticated) {
        setMessageCount(prev => prev + 2); // User message + bot response
      }
      
      return data.response || "I apologize, but I received an unexpected response. Please try again!";
      
    } catch (error) {
      console.error('Chatbot error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact us directly at +977 981-9492581.";
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
        text: "I apologize, but I'm having trouble right now. Please try again or contact us at +977 981-9492581.",
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
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        duration={4000}
      />

      {/* Floating Chat Button - Modern Icon Design */}
      {!isOpen && (
        <motion.button
          id="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          {/* Button Content */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 -left-4 w-24 h-24 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-24 h-24 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
            </div>
            
            {/* Icon */}
            <div className="relative">
              <FaRobot className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              
              {/* Notification Badge */}
              {messageCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
                >
                  <span className="text-white text-xs font-bold">{messageCount > 9 ? '9+' : messageCount}</span>
                </motion.div>
              )}
              
              {/* Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></span>
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm py-2 px-3 rounded-lg whitespace-nowrap shadow-lg">
              Chat with us
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
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
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[680px] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header - Premium Design */}
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl animate-blob animation-delay-2000"></div>
              </div>

              {/* Header Content */}
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Bot Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <FaRobot className="w-7 h-7 text-amber-600" />
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                      <FaCircle className="w-2 h-2 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Bot Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-lg">Laxmi Assistant</h3>
                      <HiSparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </div>
                    <p className="text-white/90 text-sm font-medium">
                      {authStatus === 'authenticated' ? '🔐 Secure Session' : '👋 Guest Mode'}
                    </p>
                    {messageCount > 0 && authStatus === 'authenticated' && (
                      <p className="text-white/75 text-xs mt-0.5">
                        {messageCount} conversation{messageCount === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {authStatus === 'authenticated' && (
                    <motion.button
                      onClick={handleClearChat}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors duration-200 group"
                      title="Clear Chat History"
                    >
                      <FaTrash className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <FaTimes className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white custom-scrollbar">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Loading your conversation...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-gray-600 to-gray-700'
                          : 'bg-gradient-to-br from-amber-500 to-orange-500'
                      }`}>
                        {message.sender === 'user' ? (
                          <FaUser className="w-4 h-4 text-white" />
                        ) : (
                          <FaRobot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'
                              : 'bg-white border border-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 px-1">
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
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                        <FaRobot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce"></span>
                          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <HiSparkles className="w-4 h-4 text-amber-500" />
                  <p className="text-xs text-gray-600 font-semibold">Quick Questions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-2.5 bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 text-gray-700 hover:text-amber-700 text-xs font-medium rounded-xl border border-gray-200 hover:border-amber-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {reply}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area - Modern Design */}
            <div className="p-5 bg-white border-t border-gray-100">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white text-sm placeholder:text-gray-400 transition-all duration-200"
                  />
                  {inputMessage.trim() && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputMessage.trim()}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                    inputMessage.trim()
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaPaperPlane className={`w-4 h-4 ${inputMessage.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                </motion.button>
              </div>
              
              {/* Footer Info */}
              <div className="flex items-center justify-center gap-1 mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-400">
                    Powered by AI
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
