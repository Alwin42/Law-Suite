import React, { useState, useEffect, useRef } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { motion } from 'framer-motion'; // Imported framer-motion
import api from '../api';
import { 
  ChevronDown, Calendar, Gavel, CheckCircle, 
  AlertCircle, DollarSign, Clock, Users, Briefcase, ArrowRight 
} from 'lucide-react';

// --- IMAGES ---
const IMAGES = {
  entrance: "/parallax.jpg",
  reception: "parallax2.jpg",
  conference: "parallax3.jpg",
  locker: "locker.png"
};

// --- ANIMATION VARIANTS (Adapted from your snippet) ---
const fadeUpSpring = {
  hidden: { opacity: 0, y: 150 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", bounce: 0.4, duration: 0.8 } 
  }
};

const fadeLeftSpring = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", bounce: 0.4, duration: 0.8 } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// Variant for sticky notes to maintain their rotation
const cardSpring = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", bounce: 0.5, duration: 0.8 } 
  }
};


export default function HomePage() {
  const parallaxRef = useRef(null);
  const [cases, setCases] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const casesRes = await api.get('/cases/');
        setCases(casesRes.data);

        const today = new Date();
        const upcoming = casesRes.data
          .filter(c => c.next_hearing && new Date(c.next_hearing) >= today)
          .sort((a, b) => new Date(a.next_hearing) - new Date(b.next_hearing))
          .slice(0, 3)
          .map(c => ({
            id: c.id,
            title: `Hearing: ${c.case_title}`,
            date: c.next_hearing,
            priority: c.status === 'Open' ? 'High' : 'Medium'
          }));
        setReminders(upcoming);

        setPayments([
          { id: 1, client: "John Doe", amount: 15000, status: "Paid", date: "2024-02-10" },
          { id: 2, client: "Sarah Smith", amount: 5000, status: "Pending", date: "2024-02-14" },
          { id: 3, client: "Tech Corp", amount: 45000, status: "Pending", date: "2024-02-20" },
        ]);
      } catch (error) {
        console.error("Failed to load workspace data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-amber-500">
      <Briefcase className="animate-bounce mb-4" size={48} />
      <span className="text-xl font-light tracking-widest uppercase">Loading Office...</span>
    </div>
  );

  return (
    <div className="h-screen w-full bg-black font-sans text-slate-100 overflow-hidden">
      
      <Parallax pages={4} ref={parallaxRef} className="scrollbar-hide">

        {/* ============================================================
            SECTION 1: THE ENTRANCE 
           ============================================================ */}
        <ParallaxLayer offset={0} speed={0.2} factor={1.5} style={{ backgroundImage: `url(${IMAGES.entrance})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.9)' }} />
        <ParallaxLayer offset={0} speed={0.2} className="bg-gradient-to-t from-slate-950 via-transparent to-black/60 opacity-80" />

        <ParallaxLayer offset={0} speed={0.8} className="flex flex-col items-center justify-center z-10">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="text-center px-4 relative"
          >
            <motion.div variants={fadeUpSpring} className="inline-block mb-4 px-4 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md text-amber-400 text-xs tracking-[0.3em] uppercase">
              Digital Legal Workspace
            </motion.div>
            <motion.h1 variants={fadeUpSpring} className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl mb-6">
              ALWIN
            </motion.h1>
            <motion.p variants={fadeUpSpring} className="text-xl md:text-2xl text-slate-300 font-light tracking-wide max-w-2xl mx-auto mb-12 border-l-2 border-amber-500 pl-6 text-left glass-panel">
              "Justice delayed is justice denied."<br/> 
              <span className="text-sm text-slate-500 mt-2 block font-mono">Status: Online • {cases.length} Active Cases</span>
            </motion.p>
            
            <motion.button 
              variants={fadeUpSpring}
              onClick={() => parallaxRef.current.scrollTo(1)}
              className="group flex flex-col items-center gap-2 text-white/50 hover:text-amber-400 transition-all duration-300 mx-auto"
            >
              <span className="text-[10px] uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">Step Inside</span>
              <ChevronDown size={32} className="animate-bounce" />
            </motion.button>
          </motion.div>
        </ParallaxLayer>


        {/* ============================================================
            SECTION 2: RECEPTION (Animated)
           ============================================================ */}
        <ParallaxLayer offset={1} speed={0.3} factor={1.5} style={{ backgroundImage: `url(${IMAGES.reception})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.5) contrast(1.1)' }} />

        <ParallaxLayer offset={1} speed={0.6} className="flex items-center justify-center px-4 md:pl-20">
          <div className="w-full max-w-5xl">
            
            {/* ANIMATED HEADER */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }} variants={fadeLeftSpring}
              className="flex items-end gap-4 mb-8"
            >
              <h2 className="text-6xl font-bold text-white/10 absolute -z-10 select-none">SCHEDULE</h2>
              <div className="bg-amber-500 w-2 h-12 mr-2"></div>
              <div>
                <h2 className="text-4xl font-bold text-white tracking-tight">Reception Desk</h2>
                <p className="text-amber-400/80 font-mono text-sm">Today's Priorities & Reminders</p>
              </div>
            </motion.div>

            {/* ANIMATED CONTENT CARDS */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Left: Blackboard Reminders */}
              <motion.div variants={cardSpring} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-amber-500" size={24} />
                    <span className="font-semibold tracking-wide">Hearing Schedule</span>
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300">{reminders.length} Upcoming</span>
                </div>

                <div className="space-y-3">
                  {reminders.map((item, idx) => (
                    <div key={idx} className="group flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-center min-w-[50px] bg-black/30 rounded p-1">
                        <span className="block text-xl font-bold text-white">{new Date(item.date).getDate()}</span>
                        <span className="text-[10px] uppercase text-slate-400">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-200 line-clamp-1">{item.title}</h4>
                      </div>
                      <ArrowRight size={16} className="text-white/20 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                  {reminders.length === 0 && <div className="text-center text-slate-500 py-8">No upcoming hearings.</div>}
                </div>
              </motion.div>

              {/* Right: Quick Actions */}
              <div className="grid gap-4 content-start">
                 <motion.div variants={cardSpring} className="bg-amber-100 text-amber-900 p-5 rounded-xl shadow-lg -rotate-1 hover:rotate-0 transition-transform cursor-pointer">
                    <h3 className="font-bold flex items-center gap-2"><Clock size={18}/> Urgent Tasks</h3>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 opacity-80">
                       <li>File Affidavit for Case #420</li>
                       <li>Call Client Mr. Sharma</li>
                    </ul>
                 </motion.div>
                 <motion.div variants={cardSpring} className="bg-blue-100 text-blue-900 p-5 rounded-xl shadow-lg rotate-1 hover:rotate-0 transition-transform cursor-pointer">
                    <h3 className="font-bold flex items-center gap-2"><Users size={18}/> New Client</h3>
                    <p className="text-sm mt-2 opacity-80">Meeting scheduled at 4:00 PM regarding Property Dispute.</p>
                 </motion.div>
              </div>
            </motion.div>
          </div>
        </ParallaxLayer>


        {/* ============================================================
            SECTION 3: CONFERENCE ROOM (Animated)
           ============================================================ */}
        <ParallaxLayer offset={2} speed={0.25} factor={1.5} style={{ backgroundImage: `url(${IMAGES.conference})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4) blur(2px)' }} />

        <ParallaxLayer offset={2} speed={0.7} className="flex items-center justify-center">
          <div className="w-full max-w-6xl px-6">
            
            {/* ANIMATED HEADER */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }} variants={fadeUpSpring}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-bold text-white mb-2">Active Cases</h2>
              <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full"></div>
            </motion.div>

            {/* ANIMATED CARDS */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {cases.slice(0, 3).map((c, i) => (
                <motion.div key={c.id} variants={cardSpring} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                      <Gavel className="text-slate-400" size={20} />
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${c.status === 'Open' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>{c.status}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{c.case_title}</h3>
                  <p className="text-xs font-mono text-slate-400 mb-6">#{c.case_number}</p>
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Client</span><span className="text-slate-200">{c.client_name}</span></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* ANIMATED BUTTON */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.8 }} variants={fadeUpSpring}
              className="mt-12 text-center"
            >
              <button className="px-8 py-3 rounded-full bg-slate-800 hover:bg-amber-600 text-white font-medium transition-colors border border-slate-600 hover:border-amber-500 shadow-lg flex items-center gap-2 mx-auto">
                View All Case Files <ArrowRight size={16}/>
              </button>
            </motion.div>
          </div>
        </ParallaxLayer>


        {/* ============================================================
            SECTION 4: FINANCIAL LOCKER (Animated)
           ============================================================ */}
        <ParallaxLayer offset={3} speed={0.2} factor={1.5} style={{ backgroundImage: `url(${IMAGES.locker})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(0.6) brightness(0.4)' }} />

        <ParallaxLayer offset={3} speed={0.5} className="flex items-center justify-center">
          <div className="w-full max-w-5xl px-4">
            
            {/* ANIMATED HEADER */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }} variants={fadeLeftSpring}
              className="flex items-center gap-4 mb-10"
            >
              <div className="p-3 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/20">
                <DollarSign className="text-slate-900" size={32} />
              </div>
              <h2 className="text-4xl font-bold text-white tracking-wide">Financial Vault</h2>
            </motion.div>

            {/* ANIMATED CONTENT */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 items-start"
            >
              {/* Payment Cards Stack */}
              <div className="md:col-span-2 grid gap-4">
                {payments.map((pay) => (
                  <motion.div key={pay.id} variants={cardSpring} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${pay.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {pay.status === 'Paid' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{pay.client}</h4>
                        <p className="text-xs text-slate-500 font-mono">{pay.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">₹{pay.amount.toLocaleString()}</div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${pay.status === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>{pay.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary Widget */}
              <motion.div variants={cardSpring} className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Total Receivables</h3>
                <div className="text-5xl font-bold text-white mb-8 tracking-tight">₹{payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
                <button className="w-full mt-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-lg shadow-lg">
                  Generate Invoice
                </button>
              </motion.div>
            </motion.div>
          </div>
        </ParallaxLayer>

      </Parallax>
    </div>
  );
}