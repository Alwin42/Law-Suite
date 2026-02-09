import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["Home", "Clients", "Cases", "Dashboard", "Login"];

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
      <div className="text-xl font-bold tracking-[0.2em] text-primary uppercase">
        Law Suite
      </div>

      {/* Right: Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`${link.toLowerCase()}`}
            className="group relative text-md font-medium text-primary/80 hover:text-primary transition-colors"
          >
            {link}
            {/* Hover Underline Animation */}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>
      
      {/* Mobile Menu Icon would go here (omitted for brevity) */}
    </motion.nav>
  );
};

export default Navbar;