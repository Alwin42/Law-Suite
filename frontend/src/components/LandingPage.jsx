import { Button } from "./ui/Button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2,  TrendingUp , CalendarPlus} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const LandingPage = () => {
  // Track scroll position for the Hero fade-out effect
  const { scrollY } = useScroll();
  
  // Transform scroll position into opacity/movement values
  // [0, 300] means: from 0px scrolled to 300px scrolled
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]); // Moves text slightly up as it fades

  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      
      {/* ----------------- STATIC BACKGROUND LINES ----------------- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 flex justify-between px-6 md:px-24 opacity-[0.05]">
            <div className="w-[1px] h-full bg-primary"></div>
            <div className="w-[1px] h-full bg-primary hidden md:block"></div>
            <div className="w-[1px] h-full bg-primary hidden md:block"></div>
            <div className="w-[1px] h-full bg-primary"></div>
        </div>
      </div>

      {/* ================= SECTION 1: HERO ================= */}
      <section className="relative min-h-screen flex items-center pt-20 pb-10 z-10">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Hero Text (Fades out on scroll) */}
          <motion.div 
            style={{ opacity: heroOpacity, y: heroY }}
            className="max-w-xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary uppercase mb-6 leading-tight">
              Law  Suite
            </h1>
            <h2 className="text-xl md:text-2xl text-accent font-normal leading-relaxed mb-10 border-l-4 border-primary/20 pl-6">
              Streamlining Legal Workflows Through <br className="hidden md:block"/> Unbiased Digital Automation
            </h2>
            <div className="flex gap-9">
              <Link to="/login">
                <Button variant="ghost" className="group text-lg px-0 hover:bg-transparent pl-0">
                  Book Appointment
                  <CalendarPlus className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="group text-lg px-0 hover:bg-transparent pl-0">
                  Login
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              
            </div>
          </motion.div>

          {/* Right: Lady Justice Image (Hero Version) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex items-center justify-center h-[60vh] md:h-[80vh]"
          >
             <div className="relative h-full w-auto flex items-center justify-center">
               <img 
                  src="/lady-justice.png" 
                  alt="Statue of Lady Justice" 
                  className="object-contain h-full w-auto drop-shadow-2xl grayscale-[20%] contrast-110"
               />
               
               
             </div>
          </motion.div>

        </div>
      </section>

      {/* ================= SECTION 2: ABOUT ================= */}
      <section id="about" className="relative min-h-screen flex items-center py-20 z-10 bg-background/50">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Lady Justice Image (About Version - Static Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative hidden md:flex items-center justify-center h-[60vh] md:h-[80vh]"
          >
             <div className="relative h-full w-auto flex items-center justify-center">
               <img 
                  src="/lady-justice.png" 
                  alt="Statue of Lady Justice" 
                  className="object-contain h-full w-auto drop-shadow-2xl grayscale-[20%] contrast-110 scale-x-[-1]" 
               />
             </div>
          </motion.div>

          {/* Right: About Text (Fades In when scrolled to) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="pl-0 md:pl-10"
          >
            {/* The Extra Number to Showcase Beauty */}
            <div className="mb-6 flex items-baseline gap-3">
                <span className="text-6xl font-bold text-primary">50%</span>
                <span className="text-lg text-accent font-medium">Faster Case Filing</span>
            </div>

            <span className="text-sm font-bold tracking-widest text-primary uppercase mb-2 block">
              About Law Suite
            </span>
            <h3 className="text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              Revolutionizing <br/> Legal Practice
            </h3>
            <p className="text-accent mb-8 leading-relaxed text-lg max-w-lg">
              Law Suite is an advanced Automated Digital Workspace designed specifically for legal advocates. 
              We believe that technology should empower legal professionals to focus on what matters most.
            </p>

            <div className="space-y-6 max-w-lg">
              <div className="p-6 bg-white/80 border border-gray-100 rounded-lg shadow-sm backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <h4 className="font-semibold text-primary mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Our Vision
                </h4>
                <p className="text-sm text-accent">Creating a future where every advocate has access to intelligent digital tools that eliminate unconscious bias.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary text-sm uppercase tracking-wide">Key Features</h4>
                <ul className="grid grid-cols-1 gap-2">
                  {[
                    "Intelligent Workflow Automation",
                    "Bias-Free Decision Support",
                    "Centralized Document Management",
                    "Secure Collaboration Platform"
                  ].map((item, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="flex items-center text-sm text-accent"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-3 text-primary" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;