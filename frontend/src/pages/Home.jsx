import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Available');
  const { user } = useContext(AuthContext);

  const fetchListings = async (searchKeyword = '', searchCategory = 'All', searchStatus = 'Available') => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/listings?keyword=${searchKeyword}&category=${searchCategory}&status=${searchStatus}`);
      setListings(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchListings('', category, statusFilter);
  }, [category, statusFilter]);

  const submitHandler = (e) => {
    e.preventDefault();
    fetchListings(keyword, category, statusFilter);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Listings</h1>
        
        <form onSubmit={submitHandler} className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow md:w-64">
            <input 
              type="text" 
              placeholder="Search listings..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
          
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Search
          </button>
        </form>

        {user && user.role === 'student' && (
          <Link to="/create" className="hidden md:inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">
            Create Listing
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all duration-200 group relative">
            <div className="relative overflow-hidden h-48">
              <img 
                src={listing.images[0] ? `http://localhost:5000${listing.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={listing.title} 
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${listing.status === 'Sold' ? 'opacity-50 grayscale' : ''}`}
              />
              {listing.status === 'Sold' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="bg-red-600 text-white px-4 py-1 rounded shadow-md text-lg font-bold uppercase tracking-wider transform -rotate-12 border-2 border-white">
                    Sold Out
                  </span>
                </div>
              )}
              {listing.status && listing.status !== 'Available' && (
                <div className="absolute top-2 left-2 z-10">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded shadow-sm ${
                    listing.status === 'Reserved' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">{listing.title}</h3>
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">{listing.category}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">${listing.price}</p>
                  {listing.seller && listing.seller.numReviews > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="text-yellow-500 mr-1">★</span> {listing.seller.rating.toFixed(1)} ({listing.seller.numReviews})
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{listing.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link to={`/listing/${listing._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm block text-center border border-blue-600 dark:border-blue-500 rounded py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <p className="text-xl mb-2 text-gray-800 dark:text-gray-200">No listings found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
