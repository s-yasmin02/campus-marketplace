import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Camera, User, Mail, Calendar, Package, Heart, Star, X } from 'lucide-react';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' or 'following'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setProfilePicture(data.profilePicture || '');

        const { data: countsData } = await axios.get(`http://localhost:5000/api/follow/counts/${user._id}`);
        setFollowersCount(countsData.followersCount);
        setFollowingCount(countsData.followingCount);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file); // API expects 'images' field
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);
      // Backend returns an array of paths
      setProfilePicture(data[0]);
      setUploading(false);
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', {
        name,
        email,
        password: password || undefined,
        profilePicture
      }, config);
      
      setProfile(prev => ({ ...prev, ...data }));
      setIsEditing(false);
      setPassword('');
      // Update local storage / context if necessary
      login(data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating profile');
    }
  };

  const openFollowModal = async (type) => {
    setShowFollowModal(type);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/follow/${type}/${user._id}`);
      if (type === 'followers') setFollowersList(data);
      if (type === 'following') setFollowingList(data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (!profile) return <div className="text-center py-12">Profile not found.</div>;

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const picUrl = profilePicture ? `http://localhost:5000${profilePicture}` : 'https://via.placeholder.com/150?text=No+Pic';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
              {/* Stats Grid */}
            {/* Avatar */}
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden flex items-center justify-center transition-colors duration-200">
                {profilePicture ? (
                  <img src={picUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-300 dark:text-gray-600" />
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} />
                  <input type="file" className="hidden" onChange={uploadFileHandler} accept="image/*" />
                </label>
              )}
            </div>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={submitHandler} className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" />
                </div>
              </div>
              {uploading && <p className="text-sm text-blue-500 font-medium">Uploading image...</p>}
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg shadow transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
              <div className="flex items-center gap-4 mb-8">
                <p className="text-gray-500 dark:text-gray-400 flex items-center"><Mail size={16} className="mr-2" /> {profile.email}</p>
                {profile.role !== 'admin' && (
                  <>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div 
                      className="flex items-center gap-1 text-gray-600 dark:text-gray-300 cursor-pointer hover:underline"
                      onClick={() => openFollowModal('followers')}
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">{followersCount}</span> Followers
                    </div>
                    <div 
                      className="flex items-center gap-1 text-gray-600 dark:text-gray-300 cursor-pointer hover:underline"
                      onClick={() => openFollowModal('following')}
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">{followingCount}</span> Following
                    </div>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30 flex flex-col items-center justify-center text-center transition-colors">
                  <Calendar className="text-blue-500 dark:text-blue-400 mb-2" size={28} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Joined</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{joinDate}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800/30 flex flex-col items-center justify-center text-center transition-colors">
                  <Package className="text-purple-500 dark:text-purple-400 mb-2" size={28} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Listings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.listingsCount}</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6 border border-pink-100 dark:border-pink-800/30 flex flex-col items-center justify-center text-center transition-colors">
                  <Heart className="text-pink-500 dark:text-pink-400 mb-2" size={28} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Wishlist</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.wishlistCount}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-100 dark:border-yellow-800/30 flex flex-col items-center justify-center text-center transition-colors">
                  <Star className="text-yellow-500 dark:text-yellow-400 mb-2" size={28} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Seller Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.numReviews > 0 ? `${profile.rating.toFixed(1)} / 5` : 'No Ratings'}
                  </p>
                  {profile.numReviews > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">({profile.numReviews} reviews)</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFollowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{showFollowModal}</h3>
              <button onClick={() => setShowFollowModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {(showFollowModal === 'followers' ? followersList : followingList).length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No users found.</p>
              ) : (
                <div className="space-y-4">
                  {(showFollowModal === 'followers' ? followersList : followingList).map(u => (
                    <Link to={`/seller/${u._id}`} key={u._id} onClick={() => setShowFollowModal(null)} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {u.profilePicture ? (
                          <img src={u.profilePicture.startsWith('http') ? u.profilePicture : `http://localhost:5000${u.profilePicture}`} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                        {u.username && <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
