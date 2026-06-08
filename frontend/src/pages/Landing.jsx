import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ShoppingBag, ShieldCheck, MessageCircle, Star, Search, 
  ChevronRight, Laptop, BookOpen, Shirt, Bike, MoreHorizontal,
  ArrowRight, Users, Activity, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useContext(AuthContext);

  const faqs = [
    {
      question: "Is Campus Marketplace only for students?",
      answer: "Yes! To ensure a safe and trusted environment, you need a valid university email address (.edu) to register and verify your account."
    },
    {
      question: "How do I pay for items?",
      answer: "We facilitate the connection between buyers and sellers. Payments are handled directly between users, typically through cash, Venmo, Zelle, or other peer-to-peer payment apps when you meet up."
    },
    {
      question: "Is it safe to meet up?",
      answer: "Always prioritize safety! We recommend meeting in public, well-lit campus areas during the day. Many campuses have designated 'Safe Exchange Zones' near campus security."
    },
    {
      question: "Can I sell services or just physical items?",
      answer: "Currently, Campus Marketplace is designed for physical items like textbooks, electronics, and clothing. Service listings are not supported at this time."
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 -z-10"></div>
        
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            {/* Left side content */}
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-semibold tracking-wider mb-6 border border-blue-200 dark:border-blue-800 shadow-sm">
                TRUSTED BY 10,000+ STUDENTS
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-400 dark:to-indigo-300 leading-tight">
                Buy, Sell & Exchange Items Across Campus
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                The exclusive, secure, and hyper-local marketplace designed specifically for your university community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to={user ? "/create" : "/login"} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center">
                  Start Selling <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/marketplace" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center">
                  <Search className="mr-2 h-5 w-5 text-gray-500" /> Browse Marketplace
                </Link>
              </div>
            </div>
            
            {/* Right side visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/20 dark:border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                <img src="/hero_illustration.png" alt="Campus Marketplace Illustration" className="w-full h-auto object-cover relative z-0" />
                
                {/* Floating Marketplace Cards */}
                <div className="absolute bottom-6 left-6 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40 dark:border-gray-700 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Laptop className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">MacBook Pro</p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">Rs. 85,000</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-6 right-6 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40 dark:border-gray-700 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Physics Textbook</p>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold">Rs. 2,500</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="relative -mt-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4 text-blue-600 dark:text-blue-400">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">15,000+</h3>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Listings</p>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">8,500+</h3>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Users</p>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4 text-green-600 dark:text-green-400">
                <Activity className="h-10 w-10" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">25,000+</h3>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Successful Trades</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Explore Categories</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Find exactly what you need for this semester, from textbooks to dorm decor.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-8">
            {[
              { name: 'Electronics', icon: Laptop, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { name: 'Books', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
              { name: 'Clothing', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
              { name: 'Sports', icon: Bike, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
              { name: 'Other', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-200 dark:bg-gray-800' }
            ].map((cat, i) => (
              <Link to="/marketplace" key={i} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2">
                <div className={`mx-auto w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className={`h-8 w-8 ${cat.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-24 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Simple, secure, and built exclusively for students.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 transform -translate-y-12"></div>
            
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your .edu email to verify your student status.', icon: Users },
              { step: '02', title: 'Post Listing', desc: 'Snap a photo, add details, and set your price in minutes.', icon: ShoppingBag },
              { step: '03', title: 'Chat Securely', desc: 'Negotiate and arrange meetups using our built-in messenger.', icon: MessageCircle },
              { step: '04', title: 'Meet & Trade', desc: 'Meet on campus safely to complete your exchange.', icon: CheckCircle }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="bg-white dark:bg-gray-800 mx-auto w-24 h-24 rounded-full border-4 border-blue-50 dark:border-gray-900 shadow-xl flex items-center justify-center mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <item.icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mr-4 mt-4 text-6xl font-black text-gray-100 dark:text-gray-800 -z-10">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="py-24 bg-blue-600 dark:bg-indigo-900 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Campus Marketplace?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">Designed for trust, speed, and the unique needs of college students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Verified Students", desc: "Every user is verified via their .edu email, ensuring a safe community.", icon: ShieldCheck },
              { title: "Secure Messaging", desc: "In-app chat means you never have to share your personal phone number.", icon: MessageCircle },
              { title: "Trust Ratings", desc: "Buy with confidence by checking a seller's rating and past reviews.", icon: Star },
              { title: "Hyper-Local", desc: "No shipping fees. Meet up on campus between classes for quick exchanges.", icon: CheckCircle }
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <feature.icon className="h-10 w-10 text-blue-200 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-6">
                <ShoppingBag className="h-8 w-8" />
                <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Campus Market</span>
              </Link>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                The premier platform for students to safely buy, sell, and trade items within their university community.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                <li><Link to="/marketplace" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Browse Marketplace</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sell an Item</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Campus Marketplace. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Instagram</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
