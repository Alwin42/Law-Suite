import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, CalendarPlus } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const LandingPage = () => {
  // Track scroll position for the Hero fade-out effect
  const { scrollY } = useScroll();
  
  // Transform scroll position into opacity/movement values
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]); 

  return (
    <div className="relative w-full bg-background overflow-x-hidden">
      
      {/* ----------------- STATIC BACKGROUND LINES (RESTORED) ----------------- */}
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
          
          <motion.div 
            style={{ opacity: heroOpacity, y: heroY }}
            className="max-w-xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary uppercase mb-6 leading-tight">
              Law Suite
            </h1>
            <h2 className="text-xl md:text-2xl text-accent font-normal leading-relaxed mb-10 border-l-4 border-primary/20 pl-6">
              Streamlining Legal Workflows Through <br className="hidden md:block"/> Unbiased Digital Automation
            </h2>
            <div className="flex gap-9">
              <Link to="/client-login">
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

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1.19 }}
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
      
      <section id="about" className="relative  py-24 z-10 bg-background/50 border-t border-slate-100/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Column: Sticky Header & Big Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 lg:sticky lg:top-32" // Sticky positioning for premium scroll effect
            >
              <span className="text-sm mt-9 p-7 font-bold tracking-widest text-emerald-600 uppercase mb-5 flex items-center gap-3">
                <span className="w-8 h-px bg-emerald-600"></span> About Law Suite
              </span>
              
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                Revolutionizing <br className="hidden lg:block"/> Legal Practice
              </h3>
              
              {/* Premium Stat Callout Card */}
              <div className="mt-8 p-8 sm:p-10 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                <div className="absolute -top-4 -right-4 p-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-700">
                  <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                  
                  <div className="text-lg font-medium text-slate-300">
                    Faster Case Filing & Resolution
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Content & Features */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7 space-y-12 pt-4"
            >
              <p className="text-xl md:text-2xl mt-9 text-slate-600 leading-relaxed font-light">
                Law Suite is an advanced <strong className="font-semibold text-slate-900">Automated Digital Workspace</strong> designed specifically for legal advocates. 
                We believe that technology should empower legal professionals to focus on what matters most—delivering justice.
              </p>

              <div className="grid sm:grid-cols-2 gap-8">
                
                {/* Vision Card */}
                <div className="p-8 sm:p-10 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-emerald-100/80 transition-all duration-500 relative overflow-hidden group sm:col-span-2">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                  <h4 className="font-bold text-slate-900 text-xl mb-4 flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    Our Vision
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Creating a future where every advocate has access to intelligent digital tools that eliminate unconscious bias and streamline the pursuit of truth.
                  </p>
                </div>

                {/* Features List */}
                <div className="sm:col-span-2 bg-slate-50/50 p-8 sm:p-10 rounded-[2rem] border border-slate-100/80">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Key Features
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
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
                        className="flex items-start text-slate-700 font-medium group text-base"
                      >
                        <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;