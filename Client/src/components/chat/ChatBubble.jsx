import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatDialog from './ChatDialog';
import api from '../../utils/Api';
import socketService from '../../utils/SocketService';
import useSession from '../../hooks/useSession';

const ChatBubble = ({ workspaceId, workspaceName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const { user } = useSession();
  
  useEffect(() => {
    if (!workspaceId) return;
    
    // Function to fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get(`/api/workspaces/${workspaceId}/messages/unread/count`);
        setUnreadCount(response.data.count);
        if (response.data.count > 0) {
          setPulsing(true);
          setTimeout(() => setPulsing(false), 3000);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Listen for new messages
// Add null checks to the handleNewMessage function in your ChatBubble component

const handleNewMessage = (message) => {
    // Safety check to avoid null reference errors
    if (!message) {
      console.warn("Received null or undefined message");
      return;
    }
    
    // Check if message has sender and sender has _id
    if (!message.sender || !message.sender._id) {
      console.warn("Message has invalid sender format:", message);
      return;
    }
    
    // Now it's safe to check if this is a message from someone else
    if (message.sender._id !== user?._id && !isOpen) {
      setUnreadCount(prev => prev + 1);
      setPulsing(true);
      setTimeout(() => setPulsing(false), 3000);
    }
  };
    
    socketService.on('new-message', handleNewMessage);
    
    return () => {
      socketService.off('new-message', handleNewMessage);
    };
  }, [workspaceId, user, isOpen]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <ChatDialog 
            workspaceId={workspaceId} 
            workspaceName={workspaceName}
            onClose={toggleChat}
          />
        )}
      </AnimatePresence>
      
      <motion.button 
        className="relative group"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer circle with gradient and glow */}
        <motion.div 
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-80 blur-sm
                      ${pulsing ? 'animate-pulse-rapid' : ''}`}
          animate={pulsing ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: 2, duration: 0.8 }}
        />
        
        {/* Main button */}
        <motion.div 
          className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg
                      ${isOpen 
                        ? 'bg-gradient-to-br from-rose-500 to-red-600' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-7 w-7 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {isOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            )}
          </motion.svg>
        </motion.div>
        
        {/* Notification badge */}
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div 
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 
                        flex items-center justify-center font-bold shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animated particles when hovering */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white opacity-0"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: [0, (Math.random() - 0.5) * 40], 
                y: [0, (Math.random() - 0.5) * 40], 
                opacity: [0, 0.6, 0] 
              }}
              transition={{ 
                repeat: Infinity, 
                repeatDelay: Math.random() * 2, 
                duration: 2, 
                ease: "easeOut" 
              }}
              style={{
                top: `${50 + (Math.random() - 0.5) * 20}%`,
                left: `${50 + (Math.random() - 0.5) * 20}%`
              }}
            />
          ))}
        </div>
      </motion.button>

      {/* Help tooltip - shows only on first view */}
      <AnimatePresence>
        {!isOpen && unreadCount === 0 && (
          <motion.div
            className="absolute bottom-full right-0 mb-4 bg-base-200 shadow-xl text-sm p-3 rounded-lg w-48"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="font-medium mb-1">Workspace Chat</div>
            <p className="text-xs opacity-70">Click to chat with your team members in real-time</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-base-200 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBubble;