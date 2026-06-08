import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LifeBuoy, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportTicket = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Bug Report');
  const [message, setMessage] = useState('');
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const categories = [
    'Bug Report',
    'Technical Issue',
    'Account Issue',
    'Feedback',
    'Other'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('http://localhost:5000/api/support', config);
        setTickets(data);
      } catch (error) {
        console.error('Failed to fetch tickets', error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTickets();
  }, [user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const { data } = await axios.post('http://localhost:5000/api/support', {
        subject,
        type,
        message
      }, config);

      setTickets([data, ...tickets]);
      setSubject('');
      setMessage('');
      setType('Bug Report');
      alert('Support ticket created successfully.');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error creating support ticket.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"><Clock size={12} /> Open</span>;
      case 'resolved':
      case 'closed':
        return <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800"><CheckCircle size={12} /> {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
          <LifeBuoy className="text-blue-600 dark:text-blue-400" size={32} />
          Support & Help Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Need assistance? Submit a ticket below and our support team will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Ticket Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              Submit a Request
            </h2>
            
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide as much detail as possible..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>

        {/* My Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Tickets</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {tickets.length} Total
              </span>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {fetchLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Loading tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <AlertCircle size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tickets yet</p>
                  <p className="text-sm">You haven't submitted any support requests.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{ticket.subject}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{ticket.type}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-100 dark:border-gray-800 whitespace-pre-wrap">
                      {ticket.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportTicket;
