import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle, 
  Info,
  LogOut
} from 'lucide-react';

const Settings = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Account');

  // Account Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');

  // Notification Form State
  const [notificationData, setNotificationData] = useState({
    chat: true,
    wishlist: true,
    review: true,
    report: true
  });
  const [notificationMessage, setNotificationMessage] = useState('');

  // Privacy Form State
  const [privacyData, setPrivacyData] = useState({
    publicProfile: true,
    showEmail: false,
    showPhoneNumber: false,
    twoFactorAuth: false
  });
  const [privacyMessage, setPrivacyMessage] = useState('');

  // Appearance State
  const [appearance, setAppearance] = useState(localStorage.getItem('theme') || 'system');
  const [appearanceMessage, setAppearanceMessage] = useState('');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    phoneNumber: '',
    profilePicture: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Logout State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Support Form State
  const [supportData, setSupportData] = useState({
    subject: '',
    message: '',
    type: 'support'
  });
  const [supportStatus, setSupportStatus] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'Profile') {
      fetchProfile();
    }
  }, [user, activeTab]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
      setProfileData({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || '',
        phoneNumber: data.phoneNumber || '',
        profilePicture: data.profilePicture || ''
      });
      if (data.notificationPreferences) {
        setNotificationData(data.notificationPreferences);
      }
      if (data.privacyPreferences) {
        setPrivacyData(data.privacyPreferences);
      }
      if (data.appearance) {
        setAppearance(data.appearance);
        localStorage.setItem('theme', data.appearance);
        applyTheme(data.appearance);
      }
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAccountMessage('New passwords do not match!');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/auth/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, config);
      
      setAccountMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      setAccountMessage(error.response?.data?.message || 'Failed to update password');
    }
  };

  const deleteAccount = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete('http://localhost:5000/api/auth/profile', config);
      logout();
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      setAccountMessage('Failed to delete account');
      setShowDeleteModal(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const updatedPreferences = { ...notificationData, [key]: !notificationData[key] };
    setNotificationData(updatedPreferences);
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/auth/profile', {
        notificationPreferences: updatedPreferences
      }, config);
      setNotificationMessage('Preferences saved!');
      setTimeout(() => setNotificationMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save notification preferences', error);
      // Revert on failure
      setNotificationData({ ...notificationData, [key]: !updatedPreferences[key] });
      setNotificationMessage('Failed to save preferences.');
    }
  };

  const handlePrivacyToggle = async (key) => {
    const updatedPreferences = { ...privacyData, [key]: !privacyData[key] };
    setPrivacyData(updatedPreferences);
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/auth/profile', {
        privacyPreferences: updatedPreferences
      }, config);
      setPrivacyMessage('Privacy settings saved!');
      setTimeout(() => setPrivacyMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save privacy preferences', error);
      // Revert on failure
      setPrivacyData({ ...privacyData, [key]: !updatedPreferences[key] });
      setPrivacyMessage('Failed to save preferences.');
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAppearanceChange = async (theme) => {
    setAppearance(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/auth/profile', { appearance: theme }, config);
      setAppearanceMessage('Appearance saved!');
      setTimeout(() => setAppearanceMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save appearance', error);
      setAppearanceMessage('Failed to save appearance.');
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const uploadCloudinary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // TODO: Replace with actual Cloudinary credentials
    const CLOUD_NAME = 'YOUR_CLOUD_NAME';
    const UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';

    if (CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      alert('Cloudinary is not configured. Please provide your Cloud Name and Upload Preset in Settings.jsx.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      setUploadingImage(true);
      const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      setProfileData({ ...profileData, profilePicture: data.secure_url });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      alert('Failed to upload image. Make sure your upload preset is Unsigned.');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', profileData, config);
      
      // Update AuthContext
      login(data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile', error);
      alert('Failed to update profile.');
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportData.subject || !supportData.message) return;
    
    setIsSubmittingSupport(true);
    setSupportStatus('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/support', supportData, config);
      setSupportStatus('Ticket submitted successfully! Our team will review it shortly.');
      setSupportData({ subject: '', message: '', type: 'support' });
      setTimeout(() => setSupportStatus(''), 5000);
    } catch (error) {
      console.error('Error submitting support ticket', error);
      setSupportStatus(error.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  const menuItems = [
    { id: 'Account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'Profile', label: 'Profile', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'Notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'Privacy & Security', label: 'Privacy & Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'Appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'Help & Support', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'About', label: 'About', icon: <Info className="w-5 h-5" /> },
    { id: 'Logout', label: 'Logout', icon: <LogOut className="w-5 h-5" />, isAction: true }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Account Settings</h3>
            <p className="text-gray-600">Manage your account details and security.</p>
            
            {accountMessage && (
              <div className="p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                {accountMessage}
              </div>
            )}

            {/* Email View */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Email Address</h4>
              <p className="text-gray-600 mb-2">Your email address is used for login and notifications.</p>
              <input type="email" value={user.email} className="w-full rounded-md border border-gray-300 px-4 py-2 bg-gray-200 text-gray-500 cursor-not-allowed" readOnly />
            </div>

            {/* Change Password */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
              <form onSubmit={updatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Update Password
                </button>
              </form>
            </div>

            {/* Delete Account */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h4 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h4>
              <p className="text-red-600 mb-4">Permanently delete your account and all associated data (listings, messages, etc.). This action cannot be undone.</p>
              <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Delete Account
              </button>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Are you absolutely sure?</h3>
                  <p className="text-gray-600 mb-6">
                    This will permanently delete your account, remove your listings, and erase all your messages. This action <strong>cannot</strong> be undone.
                  </p>
                  <div className="flex space-x-4 justify-end">
                    <button onClick={() => setShowDeleteModal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button onClick={deleteAccount} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                      Yes, Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'Profile':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Profile Settings</h3>
            <p className="text-gray-600">Update your public profile and contact information.</p>
            
            {loadingProfile ? (
              <div className="p-8 text-center text-gray-500">Loading profile data...</div>
            ) : (
              <form onSubmit={saveProfile} className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-full border-2 border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                      {profileData.profilePicture ? (
                        <img src={profileData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer inline-block font-medium text-sm shadow-sm">
                        Change Picture
                        <input type="file" className="hidden" accept="image/*" onChange={uploadCloudinary} disabled={uploadingImage} />
                      </label>
                      {uploadingImage && <p className="text-xs text-blue-500 mt-2 font-medium">Uploading to Cloudinary...</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" name="username" value={profileData.username} onChange={handleProfileChange} placeholder="@student123" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-100 text-gray-500" readOnly />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="text" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} placeholder="+1 (555) 000-0000" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows="3" placeholder="Tell us a little bit about yourself..." className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button type="submit" disabled={uploadingImage} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Notification Preferences</h3>
            <p className="text-gray-600">Choose what updates you want to receive.</p>
            
            {notificationMessage && (
              <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 font-medium">
                {notificationMessage}
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${notificationData.chat ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${notificationData.chat ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notificationData.chat} onChange={() => handleNotificationToggle('chat')} />
                <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Chat Messages</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${notificationData.wishlist ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${notificationData.wishlist ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notificationData.wishlist} onChange={() => handleNotificationToggle('wishlist')} />
                <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Wishlist Updates</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${notificationData.review ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${notificationData.review ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notificationData.review} onChange={() => handleNotificationToggle('review')} />
                <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">New Reviews</span>
              </label>

              {user.role === 'admin' && (
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${notificationData.report ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${notificationData.report ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <input type="checkbox" className="hidden" checked={notificationData.report} onChange={() => handleNotificationToggle('report')} />
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">New Reports (Admin)</span>
                </label>
              )}
            </div>
          </div>
        );
      case 'Privacy & Security':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Privacy & Security</h3>
            <p className="text-gray-600">Manage your profile visibility and security preferences.</p>
            
            {privacyMessage && (
              <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 font-medium">
                {privacyMessage}
              </div>
            )}

            {/* Profile Visibility */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Profile Visibility</h4>
              
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${privacyData.publicProfile ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${privacyData.publicProfile ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={privacyData.publicProfile} onChange={() => handlePrivacyToggle('publicProfile')} />
                <div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors block">Public Profile</span>
                  <span className="text-gray-500 text-sm">Allow other users to view your profile and listings.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group pt-2">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${privacyData.showEmail ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${privacyData.showEmail ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={privacyData.showEmail} onChange={() => handlePrivacyToggle('showEmail')} />
                <div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors block">Show Email</span>
                  <span className="text-gray-500 text-sm">Display your email address on your public profile.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group pt-2">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${privacyData.showPhoneNumber ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${privacyData.showPhoneNumber ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={privacyData.showPhoneNumber} onChange={() => handlePrivacyToggle('showPhoneNumber')} />
                <div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors block">Show Phone Number</span>
                  <span className="text-gray-500 text-sm">Display your phone number on your public profile.</span>
                </div>
              </label>
            </div>

            {/* Security Preferences */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4 mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Security Preferences</h4>
              
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${privacyData.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${privacyData.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={privacyData.twoFactorAuth} onChange={() => handlePrivacyToggle('twoFactorAuth')} />
                <div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors block">Two-Factor Authentication</span>
                  <span className="text-gray-500 text-sm">Require an extra security code when logging in.</span>
                </div>
              </label>
            </div>
          </div>
        );
      case 'Appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h3>
            <p className="text-gray-600 dark:text-gray-400">Customize the look and feel of Campus Market.</p>
            
            {appearanceMessage && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 font-medium">
                {appearanceMessage}
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transition-colors duration-200">
              <button 
                onClick={() => handleAppearanceChange('light')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-medium transition-all ${
                  appearance === 'light' 
                    ? 'bg-white border-2 border-blue-500 text-blue-600 shadow-md' 
                    : 'bg-white dark:bg-gray-700 border-2 border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-500"></div>
                <span>Light</span>
              </button>
              
              <button 
                onClick={() => handleAppearanceChange('dark')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-medium transition-all ${
                  appearance === 'dark' 
                    ? 'bg-gray-800 dark:bg-gray-900 border-2 border-blue-500 text-white shadow-md' 
                    : 'bg-gray-800 dark:bg-gray-900 border-2 border-transparent text-gray-300 hover:border-gray-600 shadow-sm'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500 border border-indigo-600"></div>
                <span>Dark</span>
              </button>

              <button 
                onClick={() => handleAppearanceChange('system')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-medium transition-all ${
                  appearance === 'system' 
                    ? 'bg-gray-100 dark:bg-gray-600 border-2 border-blue-500 text-gray-900 dark:text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-600 border-2 border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 shadow-sm'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>
        );
      case 'Help & Support':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Get assistance or report an issue with your account.</p>
            </div>

            {/* FAQ Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                Frequently Asked Questions
              </h4>
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">How do I verify my student status?</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your student status is verified during registration using your .edu email address. If you are having issues, please submit a support ticket below.</p>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Is there a fee for listing items?</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No, creating listings on Campus Market is completely free for all verified students.</p>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">How do I safely meet for transactions?</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">We strongly recommend meeting in well-lit, public areas on campus, such as the student union or library, during daytime hours.</p>
                </div>
              </div>
            </div>

            {/* Support / Bug Form */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h4>
              
              {supportStatus && (
                <div className={`p-4 rounded-lg mb-6 font-medium ${supportStatus.includes('successfully') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'}`}>
                  {supportStatus}
                </div>
              )}

              <form onSubmit={handleSupportSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type of Inquiry</label>
                  <select 
                    value={supportData.type}
                    onChange={(e) => setSupportData({...supportData, type: e.target.value})}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="support">General Support</option>
                    <option value="bug">Report a Bug / Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={supportData.subject}
                    onChange={(e) => setSupportData({...supportData, subject: e.target.value})}
                    placeholder="Briefly describe your issue" 
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea 
                    required
                    rows="5"
                    value={supportData.message}
                    onChange={(e) => setSupportData({...supportData, message: e.target.value})}
                    placeholder="Please provide as much detail as possible..." 
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmittingSupport}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmittingSupport ? (
                      <span>Submitting...</span>
                    ) : (
                      <span>Submit Ticket</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'About':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">About</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Information about Campus Market and legal policies.</p>
            </div>

            {/* App Info & Developer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">App Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Name</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Campus Market</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Version</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Last Updated</span>
                    <span className="text-gray-900 dark:text-white">June 2026</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Developer Info</h4>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    Built exclusively for university students to safely buy and sell items within their campus community.
                  </p>
                  <div className="pt-2">
                    <a href="#" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      Meet the Team
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Documents */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal & Policies</h4>
              <div className="space-y-4">
                <div className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Terms and Conditions</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Read the rules and guidelines for using Campus Market.</p>
                </div>
                <div className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Privacy Policy</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Understand how we collect, use, and protect your data.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-colors duration-200">
        
        {/* Left Menu */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h2>
          </div>
          <nav className="flex-1 overflow-y-auto pb-4 space-y-1 px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction && item.id === 'Logout') {
                    setShowLogoutModal(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === item.id && !item.isAction
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : item.isAction && item.id === 'Logout'
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className={`mr-3 ${activeTab === item.id && !item.isAction ? 'text-white' : item.isAction && item.id === 'Logout' ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-white dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-3xl">
            {renderContent()}
          </div>
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Logout</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Are you sure you want to logout?
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogoutConfirm} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-colors shadow-sm shadow-red-500/30"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
