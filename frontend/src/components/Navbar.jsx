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
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 mb-9 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ease-in-out ${
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm py-3" : "bg-transparent"
      }`}
    >
      {/* Left: Logo */}
      <Link to="/">
        <div className="text-xl font-bold tracking-[0.2em] text-primary uppercase">
          Law Suite
        </div>
      </Link>
      
      {/* Right: Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {currentLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="group relative text-md font-medium text-primary/80 hover:text-primary transition-colors"
          >
            {link.name}
            {/* Hover Underline Animation */}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}

        {/* Dynamic Logout Button (Matches your link styling) */}
        {token && (
           <button
             onClick={handleLogout}
             className="group relative text-md font-medium text-red-500/80 hover:text-red-500 transition-colors cursor-pointer"
           >
             Logout
             
           </button>
        )}
      </div>
      
      {/* Mobile Menu Icon would go here (omitted for brevity) */}
    </motion.nav>
  );
};

export default Navbar;