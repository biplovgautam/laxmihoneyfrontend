import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaTrash, FaHistory, FaComments } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { v4 as uuidv4 } from 'uuid';
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
  const [anonymousId, setAnonymousId] = useState('');
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

  // Helper: Get or create anonymous ID
  const getOrCreateAnonymousId = () => {
    let anonId = localStorage.getItem('chatbot_anonymous_id');
    if (!anonId) {
      anonId = `anon-${uuidv4()}`;
      localStorage.setItem('chatbot_anonymous_id', anonId);
    }
    return anonId;
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

  // Initialize anonymous ID on mount
  useEffect(() => {
    const anonId = getOrCreateAnonymousId();
    setAnonymousId(anonId);
  }, []);

  // Update auth status whenever user changes
  useEffect(() => {
    const newStatus = isUserAuthenticated() ? 'authenticated' : 'anonymous';
    devLog('🔐 Auth status update:', {
      firebaseUser: !!user,
      userEmail: user?.email,
      newStatus: newStatus
    });
    setAuthStatus(newStatus);
  }, [user]);

  // Fetch chat history on mount and when user logs in
  useEffect(() => {
    if (anonymousId) {
      devLog('🔄 Triggering history fetch:', {
        anonymousId,
        hasUser: !!user,
        userEmail: user?.email
      });
      fetchChatHistory();
    }
  }, [anonymousId, user]);

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      
      // Get fresh auth token (will auto-refresh if needed)
      const authToken = await getValidAuthToken();
      const isAuthenticated = !!authToken;
      
      let url = `${API_BASE_URL}/api1/llm/history`;
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isAuthenticated) {
        // ✅ AUTHENTICATED: Send ONLY Authorization header (NO anonymousId)
        headers['Authorization'] = `Bearer ${authToken}`;
        devLog('📤 Fetching authenticated history');
      } else {
        // ✅ ANONYMOUS: Send ONLY anonymousId (NO Authorization header)
        const anonId = getOrCreateAnonymousId();
        url += `?anonymousId=${anonId}`;
        devLog('📤 Fetching anonymous history with ID:', anonId);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        
        devLog('📥 History response:', {
          user_type: data.user_type,
          message_count: data.message_count,
          expected: isAuthenticated ? 'authenticated' : 'anonymous'
        });
        
        // Update auth status from backend response
        if (data.user_type) {
          setAuthStatus(data.user_type);
          
          // Verify we got what we expected
          const expectedType = isAuthenticated ? 'authenticated' : 'anonymous';
          if (data.user_type !== expectedType) {
            console.warn(`⚠️ Expected ${expectedType} but got ${data.user_type}`);
            console.warn('Check backend terminal logs for details!');
          }
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
      } else if (response.status === 401 && isAuthenticated) {
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

      // Prepare request body
      const requestBody = {
        message: userMessage
      };

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };

      if (isAuthenticated) {
        // ✅ AUTHENTICATED: Send ONLY Authorization header (NO anonymousId)
        headers['Authorization'] = `Bearer ${authToken}`;
        devLog('📤 Sending authenticated message');
      } else {
        // ✅ ANONYMOUS: Add anonymousId to body (NO Authorization header)
        requestBody.anonymousId = anonymousId;
        devLog('📤 Sending anonymous message with ID:', anonymousId);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401 && isAuthenticated) {
          // Token expired, fallback to anonymous
          console.log('❌ Token expired, retrying as anonymous');
          setAuthStatus('anonymous');
          localStorage.removeItem('authToken');
          // Retry as anonymous
          return await getBotResponseFromLLM(userMessage);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      devLog('📥 Message response:', {
        user_type: data.user_type,
        expected: isAuthenticated ? 'authenticated' : 'anonymous'
      });
      
      // Update auth status from backend response
      if (data.user_type) {
        setAuthStatus(data.user_type);
        
        // Verify we got what we expected
        const expectedType = isAuthenticated ? 'authenticated' : 'anonymous';
        if (data.user_type !== expectedType) {
          console.warn(`⚠️ Expected ${expectedType} but got ${data.user_type}`);
        }
      }
      
      // Update message count
      setMessageCount(prev => prev + 2); // User message + bot response
      
      return data.response || "I apologize, but I received an unexpected response. Please try again! 🙏";
      
    } catch (error) {
      console.error('Chatbot error:', error);
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
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        duration={4000}
      />

      {/* Floating Chat Button with Lottie Animation - Only shows when chat is closed */}
      {!isOpen && (
        <motion.button
          id="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Always render Lottie */}
            <div className="w-full h-full">
              <DotLottieReact
                src="https://lottie.host/e5551b86-c2f2-4f2e-80f1-a55d7640f385/VS5zzBIn9D.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
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
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-5rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-100"
          >
            {/* Header - Modern & Minimal */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-5 relative">
              {/* Action Buttons - Top Right */}
              <div className="absolute top-4 right-4 flex gap-2">
                {authStatus === 'authenticated' && (
                  <motion.button
                    onClick={handleClearChat}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-200"
                    title="Clear Chat History"
                  >
                    <FaTrash className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <FaTimes className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              {/* Header Content */}
              <div className="flex items-center gap-3 pr-24">
                <div className="relative w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  {/* Lottie Animation */}
                  <div className="w-10 h-10">
                    <DotLottieReact
                      src="https://lottie.host/e5551b86-c2f2-4f2e-80f1-a55d7640f385/VS5zzBIn9D.lottie"
                      loop
                      autoplay
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl">Laxmi Honey</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-sm"></span>
                    <span className="text-white/95 text-sm font-medium">
                      {authStatus === 'authenticated' ? 'Logged in' : 'Guest'}
                    </span>
                  </div>
                  {messageCount > 0 && (
                    <p className="text-white/75 text-xs mt-0.5">
                      {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-amber-50/30 to-orange-50/20">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="flex gap-1.5 justify-center mb-2">
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></span>
                      <span className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                    <p className="text-sm text-gray-500">Loading chat history...</p>
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
                </>
              )}
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
