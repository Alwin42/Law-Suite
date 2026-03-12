import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; 

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // --- 1. CHECK AUTHENTICATION ---
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role'); 

  // --- 2. DEFINE ROLE-BASED LINKS ---
  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Client Login", path: "/client-login" },
    { name: "Advocate Login", path: "/login" }
  ];

  const advocateLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Clients", path: "/clients" },
    { name: "Cases", path: "/cases" },
  ];

  const clientLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/client-dashboard" },
    { name: "Book Appointment", path: "/book-appointment" },
  ];

  const staffLinks = [
    { name: "Staff Dashboard", path: "/staff/dashboard" }, 
    { name: "Active Cases", path: "/staff/cases" },
  ];

  // --- 3. SELECT WHICH LINKS TO SHOW ---
  let currentLinks = publicLinks;
  if (token) {
    if (role === 'ADVOCATE') currentLinks = advocateLinks;
    else if (role === 'CLIENT') currentLinks = clientLinks;
    else if (role === 'STAFF') currentLinks = staffLinks;
  }

  const handleLogout = () => {
    localStorage.clear();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pt-4 md:pt-6 pointer-events-none">
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 35 }} 
        // Added 'relative' to anchor the dropdown perfectly
        className={`relative pointer-events-auto flex items-center justify-between px-6 py-3 md:px-8 md:py-3.5 w-full max-w-5xl rounded-full transition-all duration-300 ease-in-out border ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl shadow-lg border-white/50" 
            : "bg-white/40 backdrop-blur-md shadow-sm border-white/20" 
        }`}
      >
        {/* Left: Logo */}
        <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="text-xl font-extrabold tracking-[0.15em] text-slate-900 uppercase">
            Law Suite
          </div>
        </Link>
        
        {/* Right: Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="group relative text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.name}
              <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-slate-900 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full" />
            </Link>
          ))}

          {/* Dynamic Logout Button */}
          {token && (
             <button
               onClick={handleLogout}
               className="group relative text-sm font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
             >
               Logout
               <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full" />
             </button>
          )}
        </div>
        
        {/* Right: Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-800 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+0.5rem)] left-0 right-0 w-full bg-white  shadow-lg border border-slate-200 rounded-2xl overflow-hidden flex flex-col md:hidden pointer-events-auto"
            >
              <div className="flex flex-col py-2 px-4 space-y-2">
                {currentLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile Logout Button */}
                {token && (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>
    </div>
  );
};

export default Navbar;