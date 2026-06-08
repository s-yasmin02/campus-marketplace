import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, LogOut, User, MessageCircle, Settings, List, Heart, X, Menu, Bell, Check } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';
let socket;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read).length;

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

      const fetchNotifications = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`${ENDPOINT}/api/notifications`, config);
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchUnread();
      fetchNotifications();

      socket = io(ENDPOINT);
      socket.emit('register', user._id);

      socket.on('receive_message', () => {
        fetchUnread();
      });

      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`${ENDPOINT}/api/notifications/${notification._id}/read`, {}, config);
        setNotifications((prev) => 
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
      }
      setShowNotifications(false);
      navigate(`/listing/${notification.listing._id}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${ENDPOINT}/api/notifications/read-all`, {}, config);
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

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

                    {/* Notifications Bell */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full focus:outline-none transition-colors group"
                      >
                        <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                        {unreadNotifications > 0 && (
                          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[9px] font-bold text-white shadow-md ring-2 ring-white transform scale-100">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </span>
                        )}
                      </button>

                      {/* Dropdown Panel */}
                      {showNotifications && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                              {unreadNotifications > 0 && (
                                <button 
                                  onClick={handleMarkAllRead}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                >
                                  <Check size={14} className="mr-1" />
                                  Mark all read
                                </button>
                              )}
                            </div>
                            <div className="overflow-y-auto flex-grow scrollbar-hide">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                                  <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                                  <p>No notifications yet.</p>
                                </div>
                              ) : (
                                <ul>
                                  {notifications.map((notif) => (
                                    <li 
                                      key={notif._id} 
                                      onClick={() => handleNotificationClick(notif)}
                                      className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                    >
                                      <div className="flex-shrink-0 relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-sm">
                                          {notif.sender?.profilePicture ? (
                                            <img src={notif.sender.profilePicture.startsWith('http') ? notif.sender.profilePicture : `${ENDPOINT}${notif.sender.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={20} /></div>
                                          )}
                                        </div>
                                        {!notif.read && <div className="absolute top-0 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white dark:border-gray-800"></div>}
                                      </div>
                                      <div className="flex-grow">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                                          <span className="font-semibold">{notif.sender?.name}</span> posted a new listing: <span className="font-medium text-gray-900 dark:text-white">{notif.listing?.title}</span>
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                          {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                        </p>
                                      </div>
                                      {notif.listing?.images?.length > 0 && (
                                        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                                          <img src={`${ENDPOINT}${notif.listing.images[0]}`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Profile Picture Trigger */}
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 focus:outline-none ml-2"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-transparent hover:border-blue-500 transition-all flex items-center justify-center overflow-hidden shadow-sm">
                    {user.profilePicture ? (
                      <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
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
                          <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
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
