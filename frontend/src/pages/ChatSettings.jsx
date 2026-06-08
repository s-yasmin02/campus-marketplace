import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Bell, Eye, CheckCircle, Volume2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ENDPOINT = 'http://localhost:5000';

const ChatSettings = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    chatNotifications: true,
    soundNotifications: true,
    showOnlineStatus: true,
    readReceipts: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        chatNotifications: user.notificationPreferences?.chat ?? true,
        soundNotifications: user.notificationPreferences?.soundNotifications ?? true,
        showOnlineStatus: user.privacyPreferences?.showOnlineStatus ?? true,
        readReceipts: user.privacyPreferences?.readReceipts ?? true,
      });
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `${ENDPOINT}/api/auth/profile`,
        {
          notificationPreferences: {
            ...user.notificationPreferences,
            chat: settings.chatNotifications,
            soundNotifications: settings.soundNotifications,
          },
          privacyPreferences: {
            ...user.privacyPreferences,
            showOnlineStatus: settings.showOnlineStatus,
            readReceipts: settings.readReceipts,
          }
        },
        config
      );

      // Update local context
      login(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your messaging preferences and privacy.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Bell className="w-5 h-5 mr-2 text-blue-500" /> Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts for new messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.chatNotifications} onChange={() => handleToggle('chatNotifications')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Sound Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Play a sound when a message arrives</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.soundNotifications} onChange={() => handleToggle('soundNotifications')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Shield className="w-5 h-5 mr-2 text-green-500" /> Privacy & Safety
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Online Status</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Show others when you are active</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.showOnlineStatus} onChange={() => handleToggle('showOnlineStatus')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Read Receipts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Let others know when you've read their messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.readReceipts} onChange={() => handleToggle('readReceipts')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center space-x-4">
        {saveSuccess && <span className="text-sm text-green-600 dark:text-green-400 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Saved successfully</span>}
        <button 
          onClick={() => navigate('/messages')}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Chat
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

    </div>
  );
};

export default ChatSettings;
