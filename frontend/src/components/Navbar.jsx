import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
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
    navigate('/login');
  };

  return (
    
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pt-4 md:pt-6 pointer-events-none">
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 35 }} // Bouncy, organic drop-in
        className={`pointer-events-auto flex items-center justify-between px-6 py-3 md:px-8 md:py-3.5 w-full max-w-5xl rounded-full transition-all duration-300 ease-in-out border ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl shadow-lg border-white/50" // Frosted glass when scrolling
            : "bg-white/40 backdrop-blur-md shadow-sm border-white/20" // Softer glass at the top
        }`}
      >
        {/* Left: Logo */}
        <Link to="/home">
          <div className="text-xl font-extrabold tracking-[0.15em] text-slate-900 uppercase">
            Law Suite
          </div>
        </Link>
        
        {/* Right: Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="group relative text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.name}
              {/* Hover Underline Animation */}
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
        
        {/* Mobile Menu Icon would go here */}
      </motion.nav>
    </div>
  );
};

export default Navbar;