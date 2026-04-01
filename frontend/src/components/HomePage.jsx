import React, { useState, useEffect, useRef } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { motion, useScroll, useMotionValue, useMotionValueEvent, animate, AnimatePresence } from 'framer-motion'; 
import api from '../api';
import { 
  ChevronDown, Calendar, Gavel, CheckCircle, 
  AlertCircle, DollarSign, Activity, Users, Briefcase, ArrowRight,
  FileText
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const fadeUpSpring = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 1 } }
};

const fadeLeftSpring = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.3, duration: 1 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardSpring = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

// ============================================================
// COMPONENT: Reordering Animation (Premium Live Widgets)
// ============================================================
const initialOrder = [
    { id: 1, bg: "#ffffff", border: "border-amber-200", icon: <Briefcase size={28} className="text-amber-500"/>, label: "Active" },
    { id: 2, bg: "#f8fafc", border: "border-slate-200", icon: <CheckCircle size={28} className="text-emerald-500"/>, label: "Resolved" },
    { id: 3, bg: "#ffffff", border: "border-amber-200", icon: <FileText size={28} className="text-amber-500"/>, label: "Drafts" },
    { id: 4, bg: "#f8fafc", border: "border-slate-200", icon: <Activity size={28} className="text-blue-500"/>, label: "Live" },
];

function shuffle([...array]) {
    return array.sort(() => Math.random() - 0.5);
}

const DynamicWidgets = () => {
    const [order, setOrder] = useState(initialOrder);

    useEffect(() => {
        const timeout = setTimeout(() => setOrder(shuffle(order)), 2500); 
        return () => clearTimeout(timeout);
    }, [order]);

    return (
        <ul className="flex flex-wrap justify-center items-center gap-3 w-full max-w-[250px] mx-auto m-0 p-0 relative">
            {order.map((item) => (
                <motion.li
                    key={item.id}
                    layout
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center border shadow-sm list-none m-0 ${item.border}`}
                    style={{ backgroundColor: item.bg }}
                >
                    {item.icon}
                    <span className="text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-widest">{item.label}</span>
                </motion.li>
            ))}
        </ul>
    );
};

// ============================================================
// COMPONENT: Live Activity Feed (Real Data Animation)
// ============================================================
const LiveActivityFeed = ({ activities }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!activities || activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 3000); 
        return () => clearInterval(interval);
    }, [activities]);

    if (!activities || activities.length === 0) {
        return <p className="text-slate-400 font-mono text-xs uppercase tracking-widest text-center">No recent activity detected.</p>;
    }

    const current = activities[currentIndex];

    return (
        // FIXED: Expanded from max-w-sm to max-w-lg and increased height to h-48
        <div className="w-full max-w-lg relative h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    // FIXED: Increased padding to p-8, rounded to 3xl, gap to 6
                    className="absolute w-full bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl p-8 flex items-start gap-6"
                >
                    <div className={`p-4 rounded-2xl shrink-0 ${current.type === 'case' ? 'bg-amber-50 border border-amber-100 text-amber-500' : 'bg-emerald-50 border border-emerald-100 text-emerald-500'}`}>
                        {/* FIXED: Increased icon size to 28 */}
                        {current.type === 'case' ? <Briefcase size={28} /> : <Calendar size={28} />}
                    </div>
                    <div className="overflow-hidden">
                        {/* FIXED: Increased text size to text-lg and base */}
                        <h4 className="text-lg font-extrabold text-slate-900 mb-1 truncate">{current.title}</h4>
                        <p className="text-sm font-mono text-slate-500 truncate">{current.detail}</p>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-4 block">
                            {current.type === 'case' ? 'Recent Case Update' : 'Upcoming Appointment'}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// COMPONENT: Scroll-Linked Animation (Case Carousel)
// ============================================================
const opaque = `#000`;
const transparent = `#0000`;

function useScrollOverflowMask(scrollXProgress) {
    const maskImage = useMotionValue(`linear-gradient(90deg, ${opaque}, ${opaque} 85%, ${transparent})`);

    useMotionValueEvent(scrollXProgress, "change", (value) => {
        if (value === 0) {
            animate(maskImage, `linear-gradient(90deg, ${opaque}, ${opaque} 85%, ${transparent})`);
        } else if (value === 1) {
            animate(maskImage, `linear-gradient(90deg, ${transparent}, ${opaque} 15%, ${opaque})`);
        } else if (scrollXProgress.getPrevious() === 0 || scrollXProgress.getPrevious() === 1) {
            animate(maskImage, `linear-gradient(90deg, ${transparent} 0%, ${opaque} 10%, ${opaque} 90%, ${transparent} 100%)`);
        }
    });
    return maskImage;
}

const ActiveCasesCarousel = ({ cases }) => {
    const ref = useRef(null);
    const { scrollXProgress } = useScroll({ container: ref });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    if (!cases || cases.length === 0) return <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">No active files found.</p>;

    return (
        <div className="relative w-full max-w-7xl mx-auto pb-10">
            <div className="flex justify-end items-center mb-2 pr-4 sm:pr-8">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swipe Progress</span>
                    <svg width="24" height="24" viewBox="0 0 100 100" className="transform -rotate-90">
                        <circle cx="50" cy="50" r="30" className="stroke-slate-100" strokeWidth="12" fill="none" />
                        <motion.circle
                            cx="50" cy="50" r="30"
                            className="stroke-amber-500"
                            strokeWidth="12" fill="none" strokeLinecap="round"
                            style={{ pathLength: scrollXProgress, strokeDashoffset: 0 }}
                        />
                    </svg>
                </div>
            </div>

            <motion.ul
                ref={ref}
                style={{ maskImage }}
                className="flex list-none overflow-x-auto gap-6 py-6 px-4 sm:px-8 hide-scroll snap-x snap-mandatory"
            >
                {cases.map((c) => (
                    <li key={c.id} className="flex-shrink-0 w-[280px] sm:w-[340px] bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm snap-center relative overflow-hidden group transition-all hover:-translate-y-2 hover:border-amber-400 hover:shadow-xl cursor-grab active:cursor-grabbing">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-100 transition-all duration-700"></div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-amber-300 transition-colors">
                                <Gavel className="text-amber-500" size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{c.status}</span>
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-1 relative z-10 tracking-tight">{c.case_title}</h3>
                        <p className="text-xs font-bold text-slate-400 mb-8 relative z-10 uppercase tracking-widest">REF: {c.case_number}</p>
                        
                        <div className="space-y-4 border-t border-slate-100 pt-6 relative z-10">
                            <div className="flex justify-between items-center text-xs tracking-wider"><span className="text-slate-400 font-bold uppercase">Client</span><span className="text-slate-700 font-semibold line-clamp-1 ml-2">{c.client_name}</span></div>
                            {c.next_hearing && <div className="flex justify-between items-center text-xs tracking-wider"><span className="text-slate-400 font-bold uppercase">Hearing</span><span className="text-amber-600 font-bold">{new Date(c.next_hearing).toLocaleDateString()}</span></div>}
                        </div>
                    </li>
                ))}
            </motion.ul>
            
            <style>{`
                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

// ============================================================
// MAIN HOMEPAGE COMPONENT
// ============================================================
export default function HomePage() {
  const parallaxRef = useRef(null);
  
  const [advocateName, setAdvocateName] = useState("ADVOCATE"); 
  const [cases, setCases] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [liveActivities, setLiveActivities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. FIRE ALL REQUESTS AT THE SAME TIME
        const [casesRes, profileRes, paymentsRes] = await Promise.all([
          api.get('/cases/'),
          api.get('/dashboard/'),
          // If payments fail, catch it here so it doesn't break the whole dashboard
          api.get('/payments/').catch(err => {
              console.error("Failed to load payments:", err);
              return { data: [] }; 
          })
        ]);

        // 2. PROCESS CASES & REMINDERS
        setCases(casesRes.data);
        const today = new Date();
        const upcoming = casesRes.data
          .filter(c => c.next_hearing && new Date(c.next_hearing) >= today)
          .sort((a, b) => new Date(a.next_hearing) - new Date(b.next_hearing))
          .slice(0, 4)
          .map(c => ({
            id: c.id,
            title: `Hearing: ${c.case_title}`,
            date: c.next_hearing,
            priority: c.status === 'Open' ? 'High' : 'Medium'
          }));
        setReminders(upcoming);
        
        // 3. PROCESS PROFILE & LIVE ACTIVITIES
        setAdvocateName(profileRes.data.user_profile?.name || "ADVOCATE");
        const activities = [];
        if (profileRes.data.recent_cases) {
            activities.push(...profileRes.data.recent_cases.map(c => ({
                id: `case-${c.id}`,
                type: 'case',
                title: c.case_title,
                detail: `Status: ${c.status}`
            })));
        }
        if (profileRes.data.recent_appointments) {
            activities.push(...profileRes.data.recent_appointments.map(a => ({
                id: `appt-${a.id}`,
                type: 'appointment',
                title: `Meeting with ${a.client_name}`,
                detail: `${a.appointment_date} at ${a.appointment_time}`
            })));
        }
        setLiveActivities(activities);
        
        // 4. PROCESS PAYMENTS
        const sortedPayments = paymentsRes.data.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return new Date(b.due_date || b.created_at) - new Date(a.due_date || a.created_at);
        });

        const mappedPayments = sortedPayments.map(p => ({
            id: p.id,
            client_name: p.client_name || (p.client && p.client.full_name) || "Unknown Client",
            title: p.title || p.description || "Legal Services",
            amount: parseFloat(p.amount || 0),
            status: p.status || "Pending",
            date: new Date(p.due_date || p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        }));
        setPayments(mappedPayments);

      } catch (error) {
        console.error("Failed to load workspace data", error);
      } finally {
        // Hide loading screen instantly once everything is processed
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-amber-600">
      <Briefcase className="animate-pulse mb-4 opacity-80" size={40} />
      <span className="text-xs font-medium tracking-[0.3em] uppercase text-slate-400">Initializing Workspace...</span>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      <Parallax pages={4} ref={parallaxRef} className="hide-scroll bg-slate-50">

        {/* ============================================================
            SECTION 1: THE ENTRANCE 
           ============================================================ */}
        <ParallaxLayer offset={0} speed={0.1} className="bg-slate-50" />
        <ParallaxLayer offset={0} speed={0.2} className="flex justify-center items-center pointer-events-none">
            <div className="w-[60vw] h-[60vw] bg-amber-100/50 rounded-full blur-[120px]"></div>
        </ParallaxLayer>

        <ParallaxLayer offset={0} speed={0.5} className="flex flex-col items-center justify-center z-10">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="text-center px-4 relative w-full max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUpSpring} className="inline-block mb-8 px-5 py-2 rounded-full border border-amber-200 bg-amber-50 backdrop-blur-md text-amber-600 text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase">
              Secure Legal Environment
            </motion.div>
            
            <motion.h1 variants={fadeUpSpring} className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-slate-900 mb-6">
              Adv. {advocateName.toUpperCase()}
            </motion.h1>
            
            <motion.div variants={fadeUpSpring} className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-10 opacity-70"></motion.div>
            
            <motion.p variants={fadeUpSpring} className="text-sm sm:text-base md:text-lg text-slate-500 font-light tracking-widest max-w-xl mx-auto mb-16 uppercase">
              "Justice delayed is justice denied."
            </motion.p>
            
            <motion.button 
              variants={fadeUpSpring}
              onClick={() => parallaxRef.current.scrollTo(1)}
              className="group flex flex-col items-center gap-4 text-slate-400 hover:text-amber-500 transition-all duration-500 mx-auto mt-10"
            >
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] group-hover:tracking-[0.5em] transition-all text-slate-500">Enter Workspace</span>
              <ChevronDown size={24} className="animate-bounce opacity-50 group-hover:opacity-100 text-slate-400" />
            </motion.button>
          </motion.div>
        </ParallaxLayer>


        {/* ============================================================
            SECTION 2: DIGITAL RECEPTION 
           ============================================================ */}
        <ParallaxLayer offset={1} speed={0.1} className="bg-white" />

        <ParallaxLayer offset={1} speed={0.4} className="flex items-center justify-center px-4 md:px-12 lg:px-24">
          <div className="w-full max-w-7xl">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }} variants={fadeLeftSpring}
              className="flex items-center gap-6 mb-16 relative"
            >
              <div className="bg-amber-400 w-1 h-16 rounded-full shadow-sm"></div>
              <div>
                <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">OFFICE</h2>
                <p className="text-slate-500 font-mono text-xs sm:text-sm mt-2 tracking-widest uppercase">Workspace Briefing & office Status</p>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              <motion.div variants={cardSpring} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-amber-500" size={24} />
                    <span className="text-lg font-bold tracking-wide text-slate-900">Upcoming Hearings</span>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  {reminders.map((item, idx) => (
                    <div key={idx} className="group flex items-center gap-5 p-4 rounded-2xl bg-white hover:bg-slate-50 transition-all border border-slate-100 hover:border-slate-300 shadow-sm cursor-pointer">
                      <div className="text-center min-w-[55px] bg-slate-50 rounded-xl p-2 border border-slate-200">
                        <span className="block text-xl font-black text-slate-900">{new Date(item.date).getDate()}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-mono tracking-wider">Priority: {item.priority}</p>
                      </div>
                      <ArrowRight size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                  ))}
                  {reminders.length === 0 && <div className="text-center text-slate-400 font-mono text-sm tracking-widest uppercase py-10">No upcoming hearings.</div>}
                </div>
              </motion.div>

              {/* FIXED: Added w-full so it takes up more space */}
              <motion.div variants={cardSpring} className="w-full flex flex-col items-center justify-center py-8">
                 <h3 className="text-slate-400 font-bold text-xs tracking-[0.3em] uppercase mb-10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Office Activity Feed
                 </h3>
                 <LiveActivityFeed activities={liveActivities} />
              </motion.div>
            </motion.div>
          </div>
        </ParallaxLayer>


        {/* ============================================================
            SECTION 3: CONFERENCE ROOM (Scroll-Linked Carousel)
           ============================================================ */}
        <ParallaxLayer offset={2} speed={0.1} className="bg-slate-50" />

        <ParallaxLayer offset={2} speed={0.5} className="flex items-center justify-center">
          <div className="w-full max-w-[1400px] px-4 sm:px-8 md:px-16">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }} variants={fadeUpSpring}
              className="text-center mb-12"
            >
              <h2 className="text-sm font-bold text-amber-600 tracking-[0.4em] uppercase mb-4">Master Roster</h2>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Active Case Files</h3>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={fadeUpSpring}>
                <ActiveCasesCarousel cases={cases} />
            </motion.div>
            
          </div>
        </ParallaxLayer>


        {/* ============================================================
            SECTION 4: Payment Dashboard
           ============================================================ */}
        <ParallaxLayer offset={3} speed={0.1} className="bg-white" />

        <ParallaxLayer offset={3} speed={0.4} className="flex items-center justify-center">
          <div className="w-full max-w-6xl px-4 md:px-12">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }} variants={fadeLeftSpring}
              className="flex items-center gap-5 mb-16"
            >
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <DollarSign className="text-amber-500" size={32} />
              </div>
              <div>
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Payment History</h2>
                 <p className="text-slate-500 font-mono text-xs sm:text-sm mt-2 tracking-widest uppercase">Accounts Receivable</p>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}
              className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start"
            >
              {/* Payment Cards Stack (Filtered top 4) */}
              <div className="lg:col-span-2 grid gap-4">
                {payments.length > 0 ? payments.slice(0, 4).map((pay) => (
                  <motion.div key={pay.id} variants={cardSpring} className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 bg-white border border-slate-200 hover:border-amber-300 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-xl border ${pay.status === 'Paid' || pay.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                        {pay.status === 'Paid' || pay.status === 'Completed' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 text-base tracking-wide truncate max-w-[150px] sm:max-w-[200px]">{pay.client_name || "Unknown Client"}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1 tracking-wider truncate">{pay.title || "Legal Services"}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right border-t border-slate-100 sm:border-0 pt-4 sm:pt-0 shrink-0">
                      <div className="text-xl font-bold text-slate-900 tracking-tight">₹{parseFloat(pay.amount).toLocaleString('en-IN')}</div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase mt-1 block ${pay.status === 'Paid' || pay.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{pay.status}</span>
                    </div>
                  </motion.div>
                )) : (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center">
                        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">No recent payments.</p>
                    </div>
                )}
              </div>

              {/* Minimalist Summary Widget */}
              <motion.div variants={cardSpring} className="bg-amber-50 border border-amber-200 p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-700"></div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-4 relative z-10">Total Outstanding</h3>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 mb-10 tracking-tighter relative z-10">
                    ₹{payments.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
                
              </motion.div>
            </motion.div>
          </div>
        </ParallaxLayer>

      </Parallax>
    </div>
  );
}