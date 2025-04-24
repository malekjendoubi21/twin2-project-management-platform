import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/Api';
import socketService from '../../utils/SocketService';
import useSession from '../../hooks/useSession';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { FaPaperPlane, FaChevronDown } from 'react-icons/fa';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import Lottie from 'react-lottie-player';
import Picker from 'emoji-picker-react';
import typingAnimation from '../../assets/typing-animation.json';

const ChatDialog = ({ workspaceId, workspaceName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user } = useSession();
  
  // Group messages by date
  const groupMessages = (msgs) => {
    const grouped = msgs.reduce((groups, message) => {
      if (!message || !message.createdAt) return groups;
      
      try {
        const date = new Date(message.createdAt);
        // Use simple YYYY-MM-DD format as key
        const dateKey = format(date, 'yyyy-MM-dd');
        
        if (!groups[dateKey]) {
          groups[dateKey] = {
            date,
            messages: []
          };
        }
        
        groups[dateKey].messages.push(message);
        return groups;
      } catch (err) {
        console.error("Error processing message date:", err);
        return groups;
      }
    }, {});
    
    return grouped;
  };
  
  const groupedMessages = groupMessages(messages);
  
  // Format date header
  const formatDateHeader = (date) => {
    if (!date) return 'Unknown date';
    try {
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
    
    // Join the workspace chat room
    socketService.emit('join-workspace-chat', workspaceId);
    
    // Socket event listeners
    socketService.on('new-message', handleNewMessage);
    socketService.on('user-typing', handleUserTyping);
    
    // Focus on input field
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 300);
    
    return () => {
      // Leave the workspace chat room when component unmounts
      socketService.emit('leave-workspace-chat', workspaceId);
      socketService.off('new-message', handleNewMessage);
      socketService.off('user-typing', handleUserTyping);
    };
  }, [workspaceId]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && !loadingMore) {
      scrollToBottom(true);
    }
  }, [messages]);
  
  // Handle typing indicator timeout
  useEffect(() => {
    if (typingUsers.size > 0) {
      const now = Date.now();
      if (now - lastTypingTime > 5000) {
        setTypingUsers(new Set());
      } else {
        const timeoutId = setTimeout(() => {
          setTypingUsers(new Set());
        }, 5000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [typingUsers, lastTypingTime]);
  
  // Scroll observer
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 80);
    };
    
    container.addEventListener('scroll', checkScrollPosition);
    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, []);
  
  // Fetch messages
  const fetchMessages = async (before = null) => {
    try {
      setLoading(true);
      
      let url = `/api/workspaces/${workspaceId}/messages`;
      if (before) {
        url += `?before=${before}`;
      }
      
      const response = await api.get(url);
      
      if (before) {
        // If loading more (older) messages
        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          setMessages(prevMessages => {
            // Ensure we don't have duplicates by ID
            const existingIds = new Set(prevMessages.map(m => m._id));
            const newMessages = response.data.filter(m => !existingIds.has(m._id));
            return [...newMessages, ...prevMessages];
          });
        }
      } else {
        // Initial load
        setMessages(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // Handle loading more (older) messages
  const handleLoadMore = () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    
    setLoadingMore(true);
    const oldestMessage = messages[0];
    if (oldestMessage && oldestMessage.createdAt) {
      fetchMessages(oldestMessage.createdAt);
    } else {
      setLoadingMore(false);
    }
  };
  
  // Handle scroll to load more messages
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      
      // If scrolled to top, load more messages
      if (scrollTop === 0 && hasMore && !loadingMore) {
        handleLoadMore();
      }
    }
  };
  
  // Scroll to bottom
  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };
  
  // Handle new message from socket
// Replace the handleNewMessage function with this improved version

const handleNewMessage = (message) => {
    // Safety check - make sure message and message._id exist
    if (!message || !message._id) {
      console.warn('Received invalid message format:', message);
      return;
    }
    
    // Check if message sender exists, use fallback if not
    if (!message.sender) {
      message.sender = {
        _id: 'unknown',
        name: 'Unknown User',
        profile_picture: null
      };
    }
    
    setMessages(prevMessages => {
      // Check if this is a message we already have by ID
      const existingMessageById = prevMessages.find(m => m._id === message._id);
      if (existingMessageById) {
        return prevMessages; // Already have this exact message
      }
      
      // Check if this is our own message that was optimistically added
      // Compare content and sender to identify if it's a duplicate of an optimistic message
      const isOptimisticDuplicate = prevMessages.some(m => 
        m.isOptimistic && 
        m.content === message.content && 
        m.sender._id === message.sender._id &&
        Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 30000 // Within 30 seconds
      );
      
      if (isOptimisticDuplicate) {
        // If we find our optimistic message, replace it with the real one instead of adding a duplicate
        return prevMessages.map(m => 
          (m.isOptimistic && 
           m.content === message.content && 
           m.sender._id === message.sender._id) 
            ? { ...message, _id: message._id } // Replace with server version
            : m
        );
      }
      
      // If it's a new message, add it
      return [...prevMessages, message];
    });
    
    // If the new message is not from the current user, mark it as read
    if (user && message.sender._id !== user._id) {
      markMessageAsRead(message._id);
    }
    
    // Remove user from typing list if they exist there
    if (message.sender._id && typingUsers.has(message.sender._id)) {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(message.sender._id);
        return updated;
      });
    }
  };
  // Handle user typing event
  const handleUserTyping = ({ userId, userName }) => {
    if (!user || userId !== user._id) {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.add(userId);
        return updated;
      });
      setLastTypingTime(Date.now());
    }
  };
  
  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await api.post(`/api/workspaces/${workspaceId}/messages/read`, {
        messageIds: [messageId]
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };
  
  // Send a new message
  const sendMessage = async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim()) return;
  
    // Define these variables outside the try block so they're available in catch block
    let optimisticId = `temp-${Date.now()}`;
    let optimisticMessage = {
      _id: optimisticId,
      content: newMessage,
      sender: user,
      workspace: workspaceId,
      createdAt: new Date().toISOString(),
      read_by: [{ user: user?._id }],
      isOptimistic: true
    };
    
    try {
      setMessageSending(true);
      
      // Optimistically add message to UI (using previously defined variables)
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      scrollToBottom(true);
      
      // Actually send the message
      const response = await api.post(`/api/workspaces/${workspaceId}/messages`, {
        content: newMessage
      });
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.isOptimistic && msg._id === optimisticId
          ? { ...response.data, _id: response.data._id } // Ensure _id is set 
          : msg
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove failed optimistic message
      setMessages(prev => prev.filter(m => m._id !== optimisticId));
      setNewMessage(optimisticMessage.content); // Restore message text to input
    } finally {
      setMessageSending(false);
    }
  };
  
  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Emit typing event
    socketService.emit('typing-chat', {
      workspaceId,
      userName: user?.name || 'A user'
    });
    
    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      // Don't need to emit "stopped typing" - the server timeout handles this
    }, 3000);
  };
  
  // Handle emoji select
  const onEmojiClick = (emojiData, event) => {
    // Log to debug the emoji data structure
    // Add the emoji to the message text (handle different emoji-picker-react versions)
    if (emojiData.emoji) {
      // For newer versions (v4+)
      setNewMessage(prev => prev + emojiData.emoji);
    } else if (typeof emojiData === 'object') {
      // For older versions with different object structure
      const emoji = emojiData?.native || emojiData?.colons || "😊";
      setNewMessage(prev => prev + emoji);
    } else if (typeof emojiData === 'string') {
      // For very simple implementation
      setNewMessage(prev => prev + emojiData);
    }
    
    // Close picker and focus the input
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };
  
  // Format date for messages
  const formatMessageDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (err) {
      return 'unknown time';
    }
  };
  
  // Check if messages are consecutive from same sender
  const isContinuousMessage = (currentMsg, previousMsg) => {
    if (!previousMsg || !currentMsg) return false;
    
    try {
      const currentDate = new Date(currentMsg.createdAt);
      const prevDate = new Date(previousMsg.createdAt);
      const timeDiff = currentDate.getTime() - prevDate.getTime();
      
      return currentMsg.sender._id === previousMsg.sender._id && 
             timeDiff < 60000; // Less than a minute apart
    } catch (err) {
      return false;
    }
  };
  
  // Render a message
  const renderMessage = (message, index, messages) => {
    // Safety check for null message
    if (!message || !message.sender) {
      return null;
    }
    
    const isCurrentUser = message.sender._id === user._id;
    const isContinuous = isContinuousMessage(message, messages[index - 1]);
    
    // Use a truly unique key by combining message ID with index
    const uniqueKey = `${message._id || 'temp'}-${index}`;
    
    return (
      <motion.div 
      key={uniqueKey}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isContinuous ? 'mt-1' : 'mt-3'}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      >
        {!isCurrentUser && !isContinuous && (
          <div className="flex-shrink-0 mr-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {message.sender.profile_picture ? (
                  <img 
                    src={message.sender.profile_picture} 
                    alt={message.sender.name || 'User'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div class="bg-gradient-to-br from-purple-600 to-blue-500 text-white flex items-center justify-center h-full w-full">${(message.sender.name?.charAt(0) || 'U').toUpperCase()}</div>`;
                    }}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white flex items-center justify-center h-full w-full">
                    {(message.sender.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className={`flex flex-col ${!isCurrentUser && isContinuous ? 'ml-10' : ''}`}>
          {!isContinuous && (
            <div className="flex items-center mb-1">
              {!isCurrentUser && (
                <span className="font-medium text-xs">{message.sender.name || 'Unknown User'}</span>
              )}
              <span className="text-xs opacity-50 ml-auto">
                {message.createdAt && isToday(new Date(message.createdAt)) 
                  ? format(new Date(message.createdAt), 'h:mm a') 
                  : message.createdAt 
                    ? format(new Date(message.createdAt), 'MMM d, h:mm a')
                    : 'Unknown time'}
              </span>
            </div>
          )}
          
          <div 
            className={`rounded-lg px-3 py-2 max-w-xs md:max-w-sm break-words ${
              isCurrentUser 
                ? 'bg-gradient-to-br from-primary to-blue-600 text-white ml-auto' 
                : 'bg-base-200 text-base-content'
            } ${message.isOptimistic ? 'opacity-70' : ''}`}
          >
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <motion.div
      className="fixed bottom-20 right-6 bg-base-100 rounded-2xl shadow-2xl overflow-hidden z-50
                border border-base-300 flex flex-col w-[95vw] sm:w-[400px] md:w-[450px] h-[600px] md:h-[650px]"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Chat header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="avatar">
          <div className="w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-green-50">

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <motion.div 
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 0.95, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "loop" 
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </motion.div>
            </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-lg">{workspaceName || 'Workspace'}</h3>
            <div className="text-xs opacity-80 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></div>
              Team Chat
            </div>
          </div>
        </div>
        <motion.button 
          className="btn btn-ghost btn-sm btn-circle" 
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>
      
      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-base-100 dark:bg-base-200 space-y-4"
        onScroll={handleScroll}
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-base-content/70">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => fetchMessages()}>Retry</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full space-y-4">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base-content/70 text-lg font-medium">No messages yet</p>
              <p className="text-base-content/50 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="flex justify-center mb-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {Object.entries(groupedMessages).map(([date, group], groupIndex) => (
              <div key={`date-${date}-${groupIndex}`} className="space-y-1">
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-base-300"></div>
                  <span className="flex-shrink mx-3 text-xs text-base-content/50 font-medium">
                    {formatDateHeader(group.date)}
                  </span>
                  <div className="flex-grow border-t border-base-300"></div>
                </div>
                
                {group.messages.map((message, msgIndex) => renderMessage(
                  message, 
                  msgIndex, 
                  group.messages
                ))}
              </div>
            ))}
            
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-2 pl-2 mb-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Lottie
                    loop
                    animationData={typingAnimation}
                    play
                    style={{ width: 40, height: 24 }}
                  />
                </div>
                <span className="text-sm text-base-content/60">
                  Someone is typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            className="absolute right-4 bottom-20 bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg"
            onClick={() => scrollToBottom(true)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <FaChevronDown />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Message input */}
      <div className="p-3 border-t border-base-300 bg-base-100">
        <form onSubmit={sendMessage} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="input input-bordered w-full pr-12"
                disabled={loading || messageSending}
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <HiOutlineEmojiHappy size={20} />
              </button>
              
              {/* Emoji picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    className="absolute right-0 bottom-full mb-1 z-10"
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Picker onEmojiClick={onEmojiClick} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-circle flex-shrink-0"
              disabled={!newMessage.trim() || loading || messageSending}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={messageSending ? { rotate: 360 } : {}}
                transition={messageSending ? { 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: "linear" 
                } : {}}
              >
                <FaPaperPlane />
              </motion.div>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatDialog;