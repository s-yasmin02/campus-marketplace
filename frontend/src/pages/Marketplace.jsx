import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, Eye, Bookmark, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchListings = async () => {
    try {
      let url = `http://localhost:5000/api/listings?keyword=${keyword}&category=${category}&status=${statusFilter}&condition=${condition}&sort=${sort}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      
      const { data } = await axios.get(url);
      setListings(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, condition, statusFilter, sort]);

  const submitHandler = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setCategory('All');
    setCondition('All');
    setStatusFilter('All');
    setMinPrice('');
    setMaxPrice('');
    setKeyword('');
    setSort('newest');
    // fetchListings will be called by useEffect since dependencies changed,
    // but minPrice/maxPrice/keyword might need manual trigger if others don't change
    setTimeout(fetchListings, 0); 
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
        <div className="space-y-2">
          {['All', 'Electronics', 'Books', 'Clothing', 'Other'].map(cat => (
            <label key={cat} className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="category" 
                value={cat} 
                checked={category === cat} 
                onChange={(e) => setCategory(e.target.value)}
                className="text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{cat === 'All' ? 'All Categories' : cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Condition</h3>
        <div className="space-y-2">
          {['All', 'Brand New', 'Like New', 'Excellent', 'Good', 'Fair', 'For Parts / Not Working'].map(cond => (
            <label key={cond} className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="condition" 
                value={cond} 
                checked={condition === cond} 
                onChange={(e) => setCondition(e.target.value)}
                className="text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{cond === 'All' ? 'Any Condition' : cond}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button onClick={() => fetchListings()} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm py-1.5 rounded transition-colors">
          Apply Price Filter
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      <button onClick={clearFilters} className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 text-lg font-bold text-gray-900 dark:text-white">
              <Filter size={20} /> Filters
            </div>
            <FilterSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
            
            <div className="flex items-center w-full md:w-auto gap-2">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600"
              >
                <SlidersHorizontal size={18} /> Filters
              </button>
              
              <form onSubmit={submitHandler} className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </form>
              
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="most_wishlisted">Most Wishlisted</option>
              </select>

              {user && user.role === 'student' && (
                <Link to="/create" className="hidden lg:inline-block bg-blue-600 text-white px-4 py-2 text-sm rounded-md shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Create Listing
                </Link>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => (
              <Link to={`/listing/${listing._id}`} key={listing._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 group">
                <div className="relative overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={listing.images && listing.images[0] ? `http://localhost:5000${listing.images[0]}` : 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={listing.title} 
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${listing.status === 'Sold' ? 'opacity-50 grayscale' : ''}`}
                  />
                  
                  {listing.isUrgent && listing.status === 'Available' && (
                    <div className="absolute top-2 right-2 z-10 flex items-center bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                      <Zap size={12} className="mr-1 fill-current" /> Urgent
                    </div>
                  )}

                  {listing.status === 'Sold' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <span className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded shadow-lg text-lg font-bold uppercase tracking-widest transform -rotate-12 border-2 border-white/20">
                        Sold Out
                      </span>
                    </div>
                  )}
                  {listing.status && listing.status !== 'Available' && listing.status !== 'Sold' && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded shadow-md bg-yellow-500 text-white">
                        {listing.status}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                  </div>
                  
                  <div className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Rs. {listing.price} 
                    {listing.isNegotiable && <span className="text-xs font-normal text-gray-500 ml-1">(OBO)</span>}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span className="truncate">{listing.condition}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Views"><Eye size={12} /> {listing.views || 0}</span>
                      <span className="flex items-center gap-1" title="Saves"><Bookmark size={12} /> {listing.savedCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {listings.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <Search size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">No listings found</h3>
                <p className="text-sm">Try adjusting your filters or search term.</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
