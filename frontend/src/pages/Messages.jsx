import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import { Send, Smile, Check, CheckCheck, MoreVertical, Phone, Video, Info, User as UserIcon, MessageSquare } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const ENDPOINT = 'http://localhost:5000';
let socket;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { otherUser, listing }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // is the other user typing?
  const [meTyping, setMeTyping] = useState(false);
  
  const [filter, setFilter] = useState('all'); // all, unread, archived, blocked
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  
  const sidebarMenuRef = useRef(null);
  const chatMenuRef = useRef(null);

  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    socket = io(ENDPOINT);
    socket.emit('register', user._id);

    socket.on('connect', () => setSocketConnected(true));

    socket.on('get_online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('receive_message', (messageReceived) => {
      // If we are currently in this chat
      setActiveChat((currentChat) => {
        if (currentChat && currentChat.otherUser._id === messageReceived.sender._id) {
          setMessages((prev) => [...prev, messageReceived]);
          // We received a message while in chat, so mark it as read immediately
          socket.emit('mark_as_read', { receiverId: messageReceived.sender._id, senderId: user._id });
          // And update DB (optional if the controller is hit on re-fetch, but let's do a quick patch)
          axios.get(`${ENDPOINT}/api/messages/${messageReceived.sender._id}`, { headers: { Authorization: `Bearer ${user.token}` } }).then(() => {
            window.dispatchEvent(new Event('messages_read'));
          }).catch(console.error);
        }
        fetchConversations();
        return currentChat;
      });
    });

    socket.on('user_typing', (senderId) => {
      setActiveChat((currentChat) => {
        if (currentChat && currentChat.otherUser._id === senderId) {
          setIsTyping(true);
        }
        return currentChat;
      });
    });

    socket.on('user_stop_typing', (senderId) => {
      setActiveChat((currentChat) => {
        if (currentChat && currentChat.otherUser._id === senderId) {
          setIsTyping(false);
        }
        return currentChat;
      });
    });

    socket.on('messages_read', (readerId) => {
      setActiveChat((currentChat) => {
        if (currentChat && currentChat.otherUser._id === readerId) {
          setMessages(prev => prev.map(m => m.sender._id === user._id ? { ...m, read: true } : m));
        }
        return currentChat;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target)) setShowSidebarMenu(false);
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) setShowChatMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && user.blockedUsers) {
      setBlockedUserIds(user.blockedUsers);
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${ENDPOINT}/api/messages/conversations`, config);
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const targetUserId = searchParams.get('user');
    const targetListingId = searchParams.get('listing');
    const targetName = searchParams.get('name');
    
    if (targetUserId && targetName) {
      setActiveChat({
        otherUser: { _id: targetUserId, name: targetName },
        listing: targetListingId ? { _id: targetListingId, title: searchParams.get('title') || 'Listing' } : null
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
      setIsTyping(false);
      setShowEmojiPicker(false);
      
      // Tell sender we read their messages
      socket.emit('mark_as_read', { receiverId: activeChat.otherUser._id, senderId: user._id });
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchMessages = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const url = `${ENDPOINT}/api/messages/${activeChat.otherUser._id}`;
      const { data } = await axios.get(url, config);
      setMessages(data);
      fetchConversations(); // Update unread counts
      window.dispatchEvent(new Event('messages_read'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!meTyping && activeChat) {
      setMeTyping(true);
      socket.emit('typing', { receiverId: activeChat.otherUser._id, senderId: user._id });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      if (activeChat) {
        socket.emit('stop_typing', { receiverId: activeChat.otherUser._id, senderId: user._id });
      }
      setMeTyping(false);
    }, 2000);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stop_typing', { receiverId: activeChat.otherUser._id, senderId: user._id });
    setMeTyping(false);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${ENDPOINT}/api/messages`, {
        receiverId: activeChat.otherUser._id,
        content: newMessage,
        listingId: activeChat.listing ? activeChat.listing._id : 'general'
      }, config);

      socket.emit('send_message', data);
      setMessages([...messages, data]);
      setNewMessage('');
      setShowEmojiPicker(false);
      fetchConversations(); 
    } catch (error) {
      console.error(error);
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const handleArchiveChat = async () => {
    if (!activeChat) return;
    try {
      const currentConversation = conversations.find(c => c.otherUser._id === activeChat.otherUser._id);
      const isArchived = currentConversation?.isArchived || false;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${ENDPOINT}/api/messages/meta/${activeChat.otherUser._id}`, { isArchived: !isArchived }, config);
      setShowChatMenu(false);
      fetchConversations();
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${ENDPOINT}/api/messages/meta/${activeChat.otherUser._id}`, { deleteChat: true }, config);
      setShowChatMenu(false);
      setActiveChat(null);
      fetchConversations();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!activeChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const isBlocked = blockedUserIds.includes(activeChat.otherUser._id);
      
      if (isBlocked) {
        const { data } = await axios.post(`${ENDPOINT}/api/auth/unblock/${activeChat.otherUser._id}`, {}, config);
        setBlockedUserIds(data.blockedUsers);
        updateUser({ blockedUsers: data.blockedUsers });
      } else {
        const { data } = await axios.post(`${ENDPOINT}/api/auth/block/${activeChat.otherUser._id}`, {}, config);
        setBlockedUserIds(data.blockedUsers);
        updateUser({ blockedUsers: data.blockedUsers });
      }
      setShowChatMenu(false);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleReportConversation = async () => {
    if (!activeChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${ENDPOINT}/api/reports`, {
        reportedUser: activeChat.otherUser._id,
        reason: 'Inappropriate conversation behavior'
      }, config);
      alert('Conversation reported successfully.');
      setShowChatMenu(false);
    } catch (error) {
      console.error('Error reporting conversation:', error);
      alert('Failed to report conversation.');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const isBlocked = blockedUserIds.includes(conv.otherUser._id);
    
    if (filter === 'blocked') return isBlocked;
    if (isBlocked) return false; // Hide blocked users from other views

    if (filter === 'archived') return conv.isArchived;
    if (conv.isArchived) return false; // Hide archived from all and unread

    if (filter === 'unread') return conv.unreadCount > 0;
    
    return true; // all
  });

  if (!user) return null;

  if (user.role === 'admin') {
    return (
      <div className="text-center p-8 mt-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-500 mt-2">Admins cannot participate in marketplace chats.</p>
        <Link to="/admin/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] flex flex-col transition-colors duration-200">
      <div className="bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 dark:border-gray-800 flex overflow-hidden flex-grow w-full">
        
        {/* Sidebar */}
        <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Chats</h2>
              <div className="relative" ref={sidebarMenuRef}>
                <div 
                  onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
                </div>
                {showSidebarMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Views</div>
                    <button onClick={() => { setFilter('all'); setShowSidebarMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${filter === 'all' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>All Chats</button>
                    <button onClick={() => { setFilter('unread'); setShowSidebarMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${filter === 'unread' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>Unread Chats</button>
                    <button onClick={() => { setFilter('archived'); setShowSidebarMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${filter === 'archived' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>Archived Chats</button>
                    <button onClick={() => { setFilter('blocked'); setShowSidebarMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${filter === 'blocked' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>Blocked Users</button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Filter Pills */}
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>All</button>
              <button onClick={() => setFilter('unread')} className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>Unread</button>
              {filter === 'archived' && <button className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors bg-purple-600 text-white">Archived</button>}
              {filter === 'blocked' && <button className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors bg-red-600 text-white">Blocked</button>}
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow p-2 space-y-1 scrollbar-hide">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center text-gray-500 dark:text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>{filter === 'all' ? 'No conversations yet.' : `No ${filter} conversations.`}</p>
              </div>
            ) : (
              filteredConversations.map((conv, idx) => {
                const isActive = activeChat?.otherUser._id === conv.otherUser._id;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setActiveChat({ otherUser: conv.otherUser, listing: conv.lastMessage?.listing })}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center group relative ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="relative mr-4 flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold overflow-hidden shadow-sm">
                        {conv.otherUser.profilePicture ? (
                          <img src={conv.otherUser.profilePicture.startsWith('http') ? conv.otherUser.profilePicture : `http://localhost:5000${conv.otherUser.profilePicture}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          conv.otherUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {isOnline(conv.otherUser._id) && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full z-10"></div>
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0 pr-2">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">{conv.otherUser.name}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {new Date(conv.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {conv.lastMessage.sender._id === user._id && "You: "}{conv.lastMessage.content}
                        </p>
                        {conv.unreadCount > 0 && (
                          <div className="bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 shadow-sm">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!activeChat ? 'hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50' : 'flex'} w-full md:flex-1 flex-col relative`}>
          {!activeChat ? (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={40} className="text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Select a conversation from the sidebar or start a new chat from a listing to begin messaging.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex justify-between items-center z-20 sticky top-0 flex-shrink-0">
                <div className="flex items-center">
                  <button onClick={() => setActiveChat(null)} className="md:hidden mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <Link to={`/seller/${activeChat.otherUser._id}`} className="relative mr-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold overflow-hidden">
                       {activeChat.otherUser.profilePicture ? (
                          <img src={activeChat.otherUser.profilePicture.startsWith('http') ? activeChat.otherUser.profilePicture : `http://localhost:5000${activeChat.otherUser.profilePicture}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          activeChat.otherUser.name.charAt(0).toUpperCase()
                        )}
                    </div>
                  </Link>
                  <div className="flex flex-col">
                    <Link to={`/seller/${activeChat.otherUser._id}`} className="font-bold text-gray-900 dark:text-white hover:underline truncate">
                      {activeChat.otherUser.name}
                    </Link>
                    <span className="text-xs text-green-500 font-medium">
                      {isTyping ? 'typing...' : (isOnline(activeChat.otherUser._id) ? 'Online' : 'Offline')}
                    </span>
                  </div>
                </div>

                {/* Active Chat Menu */}
                <div className="relative" ref={chatMenuRef}>
                  <button 
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showChatMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                      {activeChat.listing && (
                        <button onClick={() => { navigate(`/listing/${activeChat.listing._id}`); setShowChatMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          View Listing
                        </button>
                      )}
                      <button onClick={() => { navigate(`/seller/${activeChat.otherUser._id}`); setShowChatMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        View Profile
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <button onClick={handleArchiveChat} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {conversations.find(c => c.otherUser._id === activeChat.otherUser._id)?.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
                      </button>
                      <button onClick={handleDeleteChat} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Delete Chat
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <button onClick={handleBlockUser} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {blockedUserIds.includes(activeChat.otherUser._id) ? 'Unblock User' : 'Block User'}
                      </button>
                      <button onClick={handleReportConversation} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Report Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Listing Banner */}
              {activeChat.listing && (
                <Link to={`/listing/${activeChat.listing._id}`} className="bg-gray-50 dark:bg-gray-800/80 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-3 flex-shrink-0">
                    <PackageIcon className="w-full h-full p-1.5 text-gray-400" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 truncate flex-grow">
                    Regarding: <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{activeChat.listing.title}</span>
                  </span>
                  <span className="text-blue-500 text-xs font-medium px-2">View listing</span>
                </Link>
              )}

              {/* Chat Messages */}
              <div 
                className="flex-grow overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50"
              >
                {messages.length === 0 ? (
                  <div className="flex justify-center mt-10">
                    <div className="bg-blue-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm shadow-sm border border-blue-100 dark:border-gray-700 text-center">
                      Say hi to {activeChat.otherUser.name}!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isMe = msg.sender._id === user._id || msg.sender === user._id;
                      
                      // Check if previous message was from the same sender to group them
                      const prevMsg = index > 0 ? messages[index - 1] : null;
                      const isSameSenderAsPrev = prevMsg && (prevMsg.sender._id === msg.sender._id || prevMsg.sender === msg.sender);
                      
                      return (
                        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSameSenderAsPrev ? 'mt-1' : 'mt-4'}`}>
                          <div 
                            className={`flex flex-col max-w-[85%] sm:max-w-[70%] px-3 py-2 shadow-sm text-[15px] ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-l-xl rounded-br-none rounded-tr-xl' 
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-r-xl rounded-bl-none rounded-tl-xl'
                            } ${isSameSenderAsPrev ? (isMe ? 'rounded-tr-xl' : 'rounded-tl-xl') : ''}`}
                          >
                            <span className="break-words whitespace-pre-wrap leading-tight">
                              {msg.content}
                            </span>
                            <div className={`flex justify-end items-center gap-1 text-[10px] mt-1 -mb-1 ${isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (
                                <span className={msg.read ? 'text-blue-100' : 'text-blue-300'}>
                                  {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex items-start mt-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex items-end relative flex-shrink-0 z-20">
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
                  </div>
                )}
                
                <button 
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                >
                  <Smile size={24} />
                </button>
                
                {blockedUserIds.includes(activeChat.otherUser._id) ? (
                  <div className="flex-grow mx-2 py-3 px-4 text-center bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl text-sm">
                    You have blocked this user. Unblock them to send a message.
                  </div>
                ) : (
                <form onSubmit={sendMessageHandler} className="flex-grow mx-2 relative flex items-center bg-white dark:bg-[#2a3942] rounded-xl shadow-sm border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600">
                  <textarea 
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message"
                    className="w-full bg-transparent text-gray-900 dark:text-gray-100 px-4 py-3 max-h-32 min-h-[44px] resize-none focus:outline-none scrollbar-hide text-[15px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessageHandler(e);
                      }
                    }}
                  />
                </form>
                )}
                
                <button 
                  onClick={sendMessageHandler}
                  disabled={!newMessage.trim() || blockedUserIds.includes(activeChat.otherUser._id)}
                  className={`p-3 rounded-full flex-shrink-0 transition-colors ${
                    newMessage.trim() 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple stub icon for the listing banner
const PackageIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export default Messages;
