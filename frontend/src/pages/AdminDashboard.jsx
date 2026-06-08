import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShieldBan, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [usersList, setUsersList] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // users, listings, reports
  
  // Moderation Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [actionTaken, setActionTaken] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        const [usersRes, listingsRes, reportsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/listings', config),
          axios.get('http://localhost:5000/api/admin/reports', config)
        ]);

        setUsersList(usersRes.data);
        setListings(listingsRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          navigate('/admin-login');
        }
      }
    };

    fetchData();
  }, [user, navigate]);

  const banUserHandler = async (id) => {
    if (window.confirm('Are you sure you want to ban this user? All their listings will be deleted.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
        setUsersList(usersList.filter(u => u._id !== id));
        // Also remove their listings from state
        setListings(listings.filter(l => l.seller?._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error banning user');
      }
    }
  };

  const deleteListingHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/admin/listings/${id}`, config);
        setListings(listings.filter(l => l._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting listing');
      }
    }
  };

  const updateReportStatus = async (id, status, action = null, notes = null) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/admin/reports/${id}`, { 
        status, 
        actionTaken: action, 
        adminNotes: notes 
      }, config);
      setReports(reports.map(r => r._id === id ? data : r));
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating report');
    }
  };

  const openResolveModal = (id) => {
    setSelectedReportId(id);
    setActionTaken('Dismiss Report');
    setAdminNotes('');
    setIsResolveModalOpen(true);
  };

  const submitResolution = async (e) => {
    e.preventDefault();
    await updateReportStatus(selectedReportId, 'resolved', actionTaken, adminNotes);
    setIsResolveModalOpen(false);
    setSelectedReportId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500 transition-colors">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{usersList.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500 transition-colors">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Listings</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{listings.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500 transition-colors">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Pending Reports</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 transition-colors">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${activeTab === 'users' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`${activeTab === 'listings' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Manage Listings
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`${activeTab === 'reports' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
          >
            View Reports
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 py-0.5 px-2 rounded-full text-xs">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        {activeTab === 'users' && (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50' : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {u.role !== 'admin' && (
                      <button onClick={() => banUserHandler(u._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center justify-end w-full transition-colors">
                        <ShieldBan size={16} className="mr-1" /> Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'listings' && (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {listings.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{l.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{l.seller?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Rs. {l.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${l.status === 'Available' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => deleteListingHandler(l._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center justify-end w-full transition-colors">
                      <Trash2 size={16} className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'reports' && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">No reports found.</div>
            ) : (
              reports.map((r) => (
                <div key={r._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <AlertTriangle size={20} className={`${r.status === 'pending' ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'} mr-2`} />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Report from {r.reporter?.name}</h4>
                      <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        r.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50' : 
                        r.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-900 dark:text-gray-300">Reason:</span> {r.reason}</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-500 flex space-x-4">
                      {r.reportedListing && <span><span className="font-medium text-gray-900 dark:text-gray-400">Listing:</span> {r.reportedListing.title}</span>}
                      {r.reportedUser && <span><span className="font-medium text-gray-900 dark:text-gray-400">Reported User:</span> {r.reportedUser.name}</span>}
                      <span><span className="font-medium text-gray-900 dark:text-gray-400">Date:</span> {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  
                  {r.status === 'pending' ? (
                    <div className="flex space-x-3 mt-4 md:mt-0">
                      <button 
                        onClick={() => openResolveModal(r._id)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        <CheckCircle size={16} className="mr-1.5" /> Resolve Report
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Action Taken</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.actionTaken || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Resolved On</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {r.adminNotes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Admin Notes</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">{r.adminNotes}</p>
                        </div>
                      )}
                      {r.resolvedBy && (
                        <div className="mt-2 flex items-center justify-end">
                          <span className="text-xs text-gray-400">Resolved by {r.resolvedBy.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Resolve Report Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resolve Report</h3>
            <form onSubmit={submitResolution}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action to Take</label>
                <select 
                  value={actionTaken} 
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Dismiss Report">Dismiss Report (No Action)</option>
                  <option value="Warn User">Warn User</option>
                  <option value="Remove Listing">Remove Listing</option>
                  <option value="Suspend User">Suspend User (Temporary)</option>
                  <option value="Ban User">Ban User (Permanent)</option>
                </select>
                
                {actionTaken === 'Remove Listing' && <p className="text-xs text-red-500 mt-2">Warning: The reported listing will be removed.</p>}
                {actionTaken === 'Suspend User' && <p className="text-xs text-red-500 mt-2">Warning: The user will not be able to log in.</p>}
                {actionTaken === 'Ban User' && <p className="text-xs text-red-500 mt-2">Critical: The user will be banned and all their listings removed.</p>}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Notes (Internal)</label>
                <textarea 
                  required
                  rows="4" 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Document why this action was taken..."
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 font-medium transition-colors">
                  Submit Resolution
                </button>
                <button type="button" onClick={() => setIsResolveModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors">
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

export default AdminDashboard;
