import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, Gavel, CreditCard, FileText, 
  ChevronRight, Loader2, CalendarDays, Clock, MapPin, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api"; 
import { cn } from "@/lib/utils";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ClientHearingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hearings, setHearings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHearings = async () => {
      try {
        const response = await api.get('client/hearings/');
        setHearings(response.data);
      } catch (error) {
        console.error("Failed to load hearings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHearings();
  }, []);

  const safeDate = (dateString, type) => {
    if (!dateString) return "TBD";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "TBD"; 
    if (type === 'month') return d.toLocaleString('default', { month: 'short' });
    if (type === 'day') return d.getDate();
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pt-16">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-100 flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto mt-6">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={location.pathname === "/client-dashboard"} onClick={() => navigate("/client-dashboard")} />
          <SidebarItem icon={Briefcase} label="My Cases" active={location.pathname.includes("/cases")} onClick={() => navigate("/client-dashboard/cases")} />
          <SidebarItem icon={Gavel} label="Hearings" active={location.pathname.includes("/hearings")} onClick={() => navigate("/client-dashboard/hearings")} />
          <SidebarItem icon={CreditCard} label="Billing & Payments" active={location.pathname.includes("/payments")} onClick={() => navigate("/client-dashboard/payments")} />
          <SidebarItem icon={FileText} label="Documents" active={location.pathname.includes("/documents")} onClick={() => navigate("/client-dashboard/documents")} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-8 lg:p-12 overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto">
            
            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upcoming Hearings</h1>
              <p className="text-slate-500 mt-2">Track your court dates and scheduled appearances.</p>
            </motion.header>

            <motion.div 
                variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {hearings.length > 0 ? hearings.map((h) => (
                <motion.div 
                  variants={itemVariants}
                  key={h.id} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col"
                >
                  {/* Premium Ticket Header */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center gap-6 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                    
                    <div className="text-center bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 min-w-[80px]">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{safeDate(h.date, 'month')}</p>
                      <p className="text-3xl font-black leading-none mt-1">{safeDate(h.date, 'day')}</p>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="font-bold text-lg leading-tight text-white mb-2">{h.case_title}</p>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                         <CalendarDays size={14} className="text-emerald-400"/>
                         {safeDate(h.date, 'full')}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 bg-slate-50 text-slate-400 rounded-lg">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Court Location</p>
                                <p className="text-sm font-medium text-slate-900 mt-0.5">{h.court_name}</p>
                            </div>
                        </div>
                        
                      </div>

                      <button 
                         onClick={() => navigate(`/client-dashboard/cases/${h.id}`)}
                         className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                         View Related Case <ArrowRight size={16} />
                      </button>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-white">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Gavel size={32} />
                    </div>
                    <p className="text-lg font-bold text-slate-900">No Upcoming Hearings</p>
                    <p className="text-slate-500 mt-1">You currently do not have any court dates scheduled.</p>
                </div>
              )}
            </motion.div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Helper
function SidebarItem({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={cn("group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden", active ? "text-emerald-700 bg-emerald-50/50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
            {active && <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />}
            <div className="flex items-center gap-3 relative z-10">
                <Icon size={18} className={cn("transition-colors duration-300", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700")} />
                {label}
            </div>
            {active && <ChevronRight size={14} className="text-emerald-600/50" />}
        </button>
    )
}