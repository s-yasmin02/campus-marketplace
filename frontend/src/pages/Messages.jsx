import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';

const ENDPOINT = 'http://localhost:5000';
let socket;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { otherUser, listing }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    socket = io(ENDPOINT);
    socket.emit('register', user._id);

    socket.on('connect', () => setSocketConnected(true));

    socket.on('receive_message', (messageReceived) => {
      // If we are currently in this chat
      setActiveChat((currentChat) => {
        if (
          currentChat && 
          currentChat.otherUser._id === messageReceived.sender._id
        ) {
          setMessages((prev) => [...prev, messageReceived]);
        }
        // Also refetch conversations to update sidebar
        fetchConversations();
        return currentChat;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

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

  // Handle URL params for initiating chat from listing page
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    const targetListingId = searchParams.get('listing');
    const targetName = searchParams.get('name');
    
    if (targetUserId && targetName) {
      // Set an active chat that might not exist in conversations yet
      setActiveChat({
        otherUser: { _id: targetUserId, name: targetName },
        listing: targetListingId ? { _id: targetListingId, title: searchParams.get('title') || 'Listing' } : null
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const url = `${ENDPOINT}/api/messages/${activeChat.otherUser._id}`;
      const { data } = await axios.get(url, config);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

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
      fetchConversations(); // update sidebar
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex overflow-hidden flex-grow ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-200">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-100 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-200">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center shadow-sm z-10 transition-colors duration-200">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl mr-3">
              <MessageSquare className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-grow p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No conversations yet.</div>
            ) : (
              conversations.map((conv, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveChat({ otherUser: conv.otherUser, listing: conv.lastMessage?.listing })}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center group ${
                    activeChat?.otherUser._id === conv.otherUser._id
                      ? 'bg-blue-50 dark:bg-gray-800 shadow-sm ring-1 ring-blue-500/20 dark:ring-blue-500/40' : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
                    {conv.otherUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow truncate">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">{conv.otherUser.name}</h4>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage?.listing ? `Re: ${conv.lastMessage.listing.title}` : 'General Inquiry'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900 relative transition-colors duration-200">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md flex justify-between items-center z-10 shadow-sm transition-colors duration-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
                    {activeChat.otherUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{activeChat.otherUser.name}</h3>
                    {activeChat.listing && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-0.5 rounded mt-0.5">
                        Regarding: {activeChat.listing.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.sender._id === user._id || msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] px-5 py-3 shadow-md ${
                          msg.sender._id === user._id || msg.sender === user._id
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm' 
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 text-right ${
                          msg.sender._id === user._id || msg.sender === user._id ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <form onSubmit={sendMessageHandler} className="flex space-x-3 max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-6 ring-1 ring-black/5 dark:ring-white/5">
                <MessageSquare size={48} className="text-blue-200 dark:text-blue-900" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Your Messages</h3>
              <p className="mt-3 text-center max-w-md text-gray-500 dark:text-gray-400 leading-relaxed">
                Select a conversation from the sidebar to continue chatting, or start a new one from a listing page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
