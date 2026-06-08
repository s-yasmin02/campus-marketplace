import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWishlist = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/wishlist', config);
        setWishlist(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWishlist();
  }, [user, navigate]);

  const removeFromWishlist = async (listingId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/wishlist/${listingId}`, config);
      
      // Update local state
      setWishlist((prev) => ({
        ...prev,
        listings: prev.listings.filter((item) => item._id !== listingId)
      }));
    } catch (error) {
      console.error(error);
      alert('Error removing item from wishlist');
    }
  };

  if (!wishlist) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.listings.map((listing) => (
          <div key={listing._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col relative group transition-colors duration-200">
            <button 
              onClick={() => removeFromWishlist(listing._id)}
              className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-400 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm"
              title="Remove from Wishlist"
            >
              <Trash2 size={20} />
            </button>
            <img 
              src={listing.images && listing.images[0] ? `http://localhost:5000${listing.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
              alt={listing.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">{listing.title}</h3>
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-medium px-2.5 py-0.5 rounded">{listing.category}</span>
                </div>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Rs. {listing.price}</p>
                <div className="mt-2 text-sm">
                  <span className={`font-medium px-2 py-0.5 rounded border ${listing.status === 'Available' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50'}`}>
                    {listing.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link to={`/listing/${listing._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm block text-center border border-blue-600 dark:border-blue-500 rounded py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        {wishlist.listings.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <p className="text-lg mb-4">Your wishlist is empty.</p>
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Browse listings to add items</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
