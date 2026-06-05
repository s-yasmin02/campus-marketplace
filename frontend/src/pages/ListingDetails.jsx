import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchListing();
  }, [id]);

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.delete(`http://localhost:5000/api/listings/${id}`, config);
        navigate('/');
      } catch (error) {
        console.error(error);
        alert('Error deleting listing');
      }
    }
  };

  if (!listing) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Listings</Link>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={listing.images[0] ? `http://localhost:5000${listing.images[0]}` : 'https://via.placeholder.com/600x400?text=No+Image'} 
              alt={listing.title} 
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{listing.title}</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">{listing.category}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">${listing.price}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Condition</h3>
                <p className="mt-1 text-gray-900">{listing.condition}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</h3>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Seller Info</h3>
                <p className="text-gray-900 font-medium">{listing.seller?.name}</p>
                <p className="text-gray-600">{listing.seller?.email}</p>
              </div>
            </div>

            {user && (user._id === listing.seller?._id || user.role === 'admin') && (
              <div className="flex space-x-4 border-t border-gray-100 pt-6">
                <Link 
                  to={`/listing/${listing._id}/edit`} 
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 font-medium transition-colors"
                >
                  Edit Listing
                </Link>
                <button 
                  onClick={deleteHandler} 
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
            
            {user && user._id !== listing.seller?._id && (
               <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors mt-4">
                 Contact Seller
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
