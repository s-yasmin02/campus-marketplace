import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, LogOut, User, MessageCircle, Settings, List, Heart, X, Menu } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';
let socket;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const fetchUnread = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`${ENDPOINT}/api/messages/conversations`, config);
          const totalUnread = data.reduce((acc, conv) => acc + conv.unreadCount, 0);
          setUnreadMessages(totalUnread);
        } catch (error) {
          console.error('Error fetching unread messages:', error);
        }
      };

      fetchUnread();

      socket = io(ENDPOINT);
      socket.emit('register', user._id);

      socket.on('receive_message', () => {
        fetchUnread();
      });

      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {user && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-4 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg focus:outline-none transition-all"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight hidden sm:block dark:text-white">Campus Market</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/messages" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group">
                      <MessageCircle className="h-5 w-5 mr-1.5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      <span>Messages</span>
                      {unreadMessages > 0 && (
                        <span className="absolute top-1 right-1 -mt-1 -mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white transform scale-100 animate-pulse">
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Profile Picture Trigger */}
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 focus:outline-none ml-2"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-transparent hover:border-blue-500 transition-all flex items-center justify-center overflow-hidden shadow-sm">
                    {user.profilePicture ? (
                      <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </Link>
                
                {/* Overlay Backdrop */}
                {isSidebarOpen && (
                  <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                  ></div>
                )}

                {/* Left Sidebar */}
                <div 
                  className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`}
                >
                  {/* Sidebar Header */}
                  <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex flex-col items-center mt-4">
                      <div className="h-20 w-20 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center mb-3">
                        {user.profilePicture ? (
                          <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-gray-300" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{user.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">{user.email}</p>
                    </div>
                  </div>

                  {/* Sidebar Links */}
                  <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
                    >
                      <User className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      My Profile
                    </Link>
                    
                    {user.role !== 'admin' && (
                      <>
                        <Link 
                          to="/my-listings" 
                          onClick={() => setIsSidebarOpen(false)}
                          className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
                        >
                          <List className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          My Listings
                        </Link>
                        <Link 
                          to="/wishlist" 
                          onClick={() => setIsSidebarOpen(false)}
                          className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
                        >
                          <Heart className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          Wishlist
                        </Link>
                      </>
                    )}
                    
                    <Link 
                      to="/settings" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors group"
                    >
                      <Settings className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      Settings
                    </Link>
                  </div>

                  {/* Sidebar Footer */}
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                      Campus Market &copy; {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
