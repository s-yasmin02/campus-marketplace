import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyListings = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/listings/my-listings', config);
        setListings(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyListings();
  }, [user, navigate]);

  const updateStatus = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/listings/${id}`, { status: newStatus }, config);
      setListings(listings.map(l => l._id === id ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error(error);
      alert('Error updating status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Listings</h1>
        <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">
          Create New Listing
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
            <div className="relative overflow-hidden h-48">
              <img 
                src={listing.images[0] ? `http://localhost:5000${listing.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={listing.title} 
                className={`w-full h-full object-cover transition-all ${listing.status === 'Sold' ? 'opacity-50 grayscale' : ''}`}
              />
              {listing.status === 'Sold' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="bg-red-600 text-white px-4 py-1 rounded shadow-md text-lg font-bold uppercase tracking-wider transform -rotate-12 border-2 border-white">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">{listing.title}</h3>
                  <select 
                    value={listing.status}
                    onChange={(e) => updateStatus(listing._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      listing.status === 'Available' 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50' 
                        : listing.status === 'Reserved'
                        ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50'
                        : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Rs. {listing.price}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{listing.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between transition-colors duration-200">
                <Link to={`/listing/${listing._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors">
                  View
                </Link>
                <Link to={`/listing/${listing._id}/edit`} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-sm transition-colors">
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <p className="text-lg mb-4">You haven't created any listings yet.</p>
            <Link to="/create" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Create your first listing</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
