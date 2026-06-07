import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Maximize2, X, Heart } from 'lucide-react';

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  
  // Edit form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState('');

  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListingAndWishlist = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(data);
        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
        setCategory(data.category);
        setCondition(data.condition);
        setStatus(data.status);

        if (user) {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data: wishlistData } = await axios.get('http://localhost:5000/api/wishlist', config);
          if (wishlistData.listings.some(item => item._id === id)) {
            setIsInWishlist(true);
          }
        }

        if (data && data.seller && data.seller._id) {
          const { data: reviewsData } = await axios.get(`http://localhost:5000/api/reviews/${data.seller._id}`);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchListingAndWishlist();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (isInWishlist) {
        await axios.delete(`http://localhost:5000/api/wishlist/${id}`, config);
        setIsInWishlist(false);
      } else {
        await axios.post('http://localhost:5000/api/wishlist', { listingId: id }, config);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/listings/${id}`, config);
        navigate('/');
      } catch (error) {
        console.error(error);
        alert('Error deleting listing');
      }
    }
  };

  const reportHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/reports', {
        reportedListing: id,
        reportedUser: listing.seller?._id,
        reason: reportReason
      }, config);
      setIsReportModalOpen(false);
      setReportReason('');
      alert('Report submitted successfully. Admins will review it shortly.');
    } catch (error) {
      console.error(error);
      alert('Error submitting report');
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/listings/${id}`, {
        title, price, description, category, condition, status
      }, config);
      setListing(data);
      setIsEditing(false);
      alert('Listing updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating listing');
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitReviewLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/reviews', {
        sellerId: listing.seller._id,
        rating: reviewRating,
        comment: reviewComment
      }, config);
      alert('Review submitted successfully!');
      const { data: reviewsData } = await axios.get(`http://localhost:5000/api/reviews/${listing.seller._id}`);
      setReviews(reviewsData);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  const nextImage = () => {
    if (listing && listing.images) {
      setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (listing && listing.images) {
      setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
    }
  };

  if (!listing) return <div className="text-center py-12">Loading...</div>;

  const isOwner = user && (user._id === listing.seller?._id || user.role === 'admin');

  const hasImages = listing.images && listing.images.length > 0;
  const currentImageUrl = hasImages ? `http://localhost:5000${listing.images[currentImageIndex]}` : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200">
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">&larr; Back to Listings</Link>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="md:flex">
          <div className="md:w-1/2 relative bg-black flex items-center justify-center min-h-[300px] group">
            <img 
              src={currentImageUrl} 
              alt={listing.title} 
              className="max-w-full max-h-96 object-contain"
            />
            {hasImages && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
              >
                <Maximize2 size={20} />
              </button>
            )}
            {hasImages && listing.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-80 transition-all">
                  <ChevronLeft size={28} />
                </button>
                <button onClick={nextImage} className="absolute right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-80 transition-all">
                  <ChevronRight size={28} />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {listing.images.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            {isEditing ? (
              <form onSubmit={updateHandler} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Title</label>
                  <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Price ($)</label>
                  <input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Category</label>
                  <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border p-2 rounded">
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Condition</label>
                  <select value={condition} onChange={(e)=>setCondition(e.target.value)} className="w-full border p-2 rounded">
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Status</label>
                  <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full border p-2 rounded">
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Description</label>
                  <textarea rows="3" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border p-2 rounded"></textarea>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Save Updates</button>
                  <button type="button" onClick={()=>setIsEditing(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{listing.title}</h2>
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-medium px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">{listing.category}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">${listing.price}</p>
                <div className="mb-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${listing.status === 'Available' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50'}`}>
                    Status: {listing.status}
                  </span>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Condition</h3>
                  <p className="mt-1 text-gray-900 dark:text-gray-200">{listing.condition}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</h3>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{listing.description}</p>
                </div>
                <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Seller Info</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{listing.seller?.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">{listing.seller?.email}</p>
                    </div>
                    {listing.seller?.numReviews > 0 && (
                      <div className="text-right">
                        <p className="text-lg text-yellow-500 font-bold">★ {listing.seller?.rating.toFixed(1)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{listing.seller?.numReviews} reviews</p>
                      </div>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <div className="flex space-x-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors"
                    >
                      Edit Details
                    </button>
                    <button 
                      onClick={deleteHandler} 
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
                
                {user && !isOwner && (
                   <button 
                     onClick={() => navigate(`/messages?user=${listing.seller?._id}&name=${encodeURIComponent(listing.seller?.name)}&listing=${listing._id}&title=${encodeURIComponent(listing.title)}`)}
                     className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors mt-4"
                   >
                     Contact Seller
                   </button>
                )}

                {user && !isOwner && (
                  <button 
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors mt-3 flex justify-center items-center space-x-2 border ${
                      isInWishlist 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
                    <span>{isInWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}</span>
                  </button>
                )}

                {user && !isOwner && user.role !== 'admin' && (
                   <button 
                     onClick={() => setIsReportModalOpen(true)}
                     className="w-full text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors mt-6 text-center block"
                   >
                     Report this listing
                   </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Seller Reviews</h3>
        
        {user && user._id !== listing.seller?._id && !reviews.find(r => r.reviewer?._id === user._id) && (
          <form onSubmit={submitReviewHandler} className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Leave a Review</h4>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Rating</label>
              <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Comment (Optional)</label>
              <textarea rows="3" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button type="submit" disabled={submitReviewLoading} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              {submitReviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No reviews yet for this seller.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{review.reviewer?.name}</span>
                  <span className="text-yellow-500 text-sm">★ {review.rating}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && hasImages && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          
          <img src={currentImageUrl} alt="Fullscreen" className="max-h-[90vh] max-w-[90vw] object-contain" />
          
          {listing.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-6 text-white hover:text-gray-300">
                <ChevronLeft size={48} />
              </button>
              <button onClick={nextImage} className="absolute right-6 text-white hover:text-gray-300">
                <ChevronRight size={48} />
              </button>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
                {listing.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-16 w-24 border-2 object-cover ${idx === currentImageIndex ? 'border-blue-500' : 'border-transparent opacity-50'}`}
                  >
                    <img src={`http://localhost:5000${img}`} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Report Listing</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={reportHandler}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for reporting</label>
                <textarea 
                  required
                  rows="4" 
                  value={reportReason} 
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please describe why you are reporting this listing or seller..."
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium transition-colors">
                  Submit Report
                </button>
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
