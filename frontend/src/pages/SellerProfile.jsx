import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, User, Star, Package, CheckCircle, ShieldCheck, MessageSquare, X, Mail, Phone } from 'lucide-react';

const SellerProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' or 'following'

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        // Fetch seller details
        const { data: sellerData } = await axios.get(`http://localhost:5000/api/auth/user/${id}`);
        setSeller(sellerData);

        // Fetch seller's active listings
        const { data: listingsData } = await axios.get(`http://localhost:5000/api/listings?status=Available`);
        const sellerListings = listingsData.filter(listing => listing.seller && listing.seller._id === id);
        setListings(sellerListings);

        // Fetch seller's reviews
        const { data: reviewsData } = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(reviewsData);

        // Fetch followers/following counts
        const { data: countsData } = await axios.get(`http://localhost:5000/api/follow/counts/${id}`);
        setFollowersCount(countsData.followersCount);
        setFollowingCount(countsData.followingCount);

        // Check if current user is following
        if (user && user._id !== id) {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data: followStatus } = await axios.get(`http://localhost:5000/api/follow/status/${id}`, config);
          setIsFollowing(followStatus.isFollowing);
        }

      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id, user]);

  const toggleFollow = async () => {
    if (!user) {
      alert("Please log in to follow sellers.");
      return;
    }
    setFollowLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`http://localhost:5000/api/follow/${id}`, {}, config);
      setIsFollowing(data.isFollowing);
      // Update count locally
      setFollowersCount(prev => data.isFollowing ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.message || 'Error following seller');
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowModal = async (type) => {
    setShowFollowModal(type);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/follow/${type}/${id}`);
      if (type === 'followers') setFollowersList(data);
      if (type === 'following') setFollowingList(data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;
  }

  if (!seller) {
    return <div className="min-h-screen flex items-center justify-center dark:text-white">Seller not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex-shrink-0">
              {seller.profilePicture ? (
                <img 
                  src={seller.profilePicture.startsWith('http') ? seller.profilePicture : `http://localhost:5000${seller.profilePicture}`} 
                  alt={seller.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <User size={40} />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {seller.name}
                <ShieldCheck size={24} className="text-blue-500" />
              </h1>
              {seller.username && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">@{seller.username}</p>
              )}
              {(seller.email || seller.phoneNumber) && (
                <div className="flex flex-col gap-1 mt-2">
                  {seller.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <Mail size={16} />
                      <a href={`mailto:${seller.email}`} className="hover:underline">{seller.email}</a>
                    </div>
                  )}
                  {seller.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <Phone size={16} />
                      <a href={`tel:${seller.phoneNumber}`} className="hover:underline">{seller.phoneNumber}</a>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                  <Star size={16} className="fill-current" />
                  <span className="font-medium">{seller.rating > 0 ? seller.rating.toFixed(1) : 'New'}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">({seller.numReviews} reviews)</span>
                </div>
                {seller.role !== 'admin' && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
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
            </div>
          </div>

          {user && user._id !== id && (
            <div className="mt-6 md:mt-0 flex gap-3">
              <Link
                to={`/messages?user=${seller._id}&name=${encodeURIComponent(seller.name)}`}
                className="px-6 py-2.5 rounded-full font-medium shadow-sm transition-all duration-200 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white border border-gray-200 dark:border-gray-600"
              >
                <MessageSquare size={18} />
                Message
              </Link>
              {user.role !== 'admin' && seller.role !== 'admin' && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`px-8 py-2.5 rounded-full font-medium shadow-sm transition-all duration-200 flex items-center gap-2 ${
                    isFollowing 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle size={18} />
                      Following
                    </>
                  ) : (
                    'Follow'
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {seller.bio && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300">
            <p>{seller.bio}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Package className="text-blue-500" />
            Active Listings ({listings.length})
          </h2>
          
          {listings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No active listings right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <Link to={`/listing/${listing._id}`} key={listing._id} className="block group">
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={`http://localhost:5000${listing.images[0]}`} 
                          alt={listing.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-gray-900 dark:text-white shadow-sm">
                        Rs. {listing.price}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">{listing.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{listing.category}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md font-medium">
                          {listing.condition}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Star className="text-yellow-500" />
            Reviews ({reviews.length})
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 pb-5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user && user._id === review.reviewer?._id ? 'Me' : (review.reviewer?.name || 'Anonymous User')}
                      </div>
                      <div className="flex text-yellow-500 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-3">
                        "{review.comment}"
                      </p>
                    )}
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default SellerProfile;
