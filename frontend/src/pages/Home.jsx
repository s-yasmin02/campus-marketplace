import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await axios.get('http://localhost:5000/api/listings');
      setListings(data);
    };
    fetchListings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Latest Listings</h1>
        <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          Create Listing
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
            <img 
              src={listing.images[0] ? `http://localhost:5000${listing.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
              alt={listing.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{listing.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{listing.category}</span>
                </div>
                <p className="mt-1 text-xl font-bold text-gray-900">${listing.price}</p>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{listing.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link to={`/listing/${listing._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm block text-center border border-blue-600 rounded py-1 hover:bg-blue-50 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No listings found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
