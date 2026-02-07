import { Button } from "./ui/Button"; 
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Decorative Lines (Subtle Waves) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 50 Q 25 60, 50 50 T 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M0 55 Q 25 60, 50 50 T 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M0 60 Q 25 70, 50 60 T 100 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M0 40 Q 25 50, 50 40 T 100 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary uppercase mb-6 leading-tight">
            Automated Digital <br></br> Workspace for Advocates 
          </h1>
          <h2 className="text-xl md:text-2xl text-accent font-normal leading-relaxed mb-10">
            Streamlining Legal Workflows Through <br className="hidden md:block"/> Unbiased Digital Automation
          </h2>
          
          <div className="flex gap-4">
            <Button 
                variant="ghost" 
                className="group text-lg px-0 hover:bg-transparent"
            >
              Login
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* Right Visual - Lady Justice */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative h-[600px] hidden md:flex items-center justify-center"
        >
            
            <img 
                src="../public/lady-justice.png" 
                alt="Statue of Lady Justice" 
                className="object-cover h-full w-auto drop-shadow-2xl grayscale-[30%] contrast-110"
            />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;