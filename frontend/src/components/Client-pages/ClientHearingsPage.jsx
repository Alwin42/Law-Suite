import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, Gavel, CreditCard, FileText, 
  ChevronRight, Loader2, CalendarDays, Clock, MapPin, ArrowRight, Menu, X 
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api"; 
import { cn } from "@/lib/utils";

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

  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleNavClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

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
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pt-16 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* RESPONSIVE SIDEBAR */}
      <aside className={`w-72 bg-white/95 backdrop-blur-xl border-r border-slate-100 flex flex-col fixed left-0 top-16 bottom-0 z-50 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
          <span className="font-bold text-slate-900 ml-2">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto mt-2 lg:mt-6">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={location.pathname === "/client-dashboard"} onClick={() => handleNavClick("/client-dashboard")} />
          <SidebarItem icon={Briefcase} label="My Cases" active={location.pathname.includes("/cases")} onClick={() => handleNavClick("/client-dashboard/cases")} />
          <SidebarItem icon={Gavel} label="Hearings" active={location.pathname.includes("/hearings")} onClick={() => handleNavClick("/client-dashboard/hearings")} />
          <SidebarItem icon={CreditCard} label="Billing & Payments" active={location.pathname.includes("/payments")} onClick={() => handleNavClick("/client-dashboard/payments")} />
          <SidebarItem icon={FileText} label="Documents" active={location.pathname.includes("/documents")} onClick={() => handleNavClick("/client-dashboard/documents")} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <div className="max-w-5xl mx-auto">
            
            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10 flex items-start md:items-center gap-4">
              <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="lg:hidden mt-1 md:mt-0 p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
              >
                  <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Upcoming Hearings</h1>
                <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">Track your court dates and scheduled appearances.</p>
              </div>
            </motion.header>

            <motion.div 
                variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              {hearings.length > 0 ? hearings.map((h) => (
                <motion.div 
                  variants={itemVariants}
                  key={h.id} 
                  className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col"
                >
                  {/* Premium Ticket Header */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 md:p-6 flex items-center gap-4 md:gap-6 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                    
                    <div className="text-center bg-white/10 backdrop-blur-md p-2.5 md:p-3 rounded-2xl border border-white/10 min-w-[70px] md:min-w-[80px] shrink-0">
                      <p className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">{safeDate(h.date, 'month')}</p>
                      <p className="text-2xl md:text-3xl font-black leading-none mt-1">{safeDate(h.date, 'day')}</p>
                    </div>
                    
                    <div className="relative z-10 overflow-hidden">
                      <p className="font-bold text-base md:text-lg leading-tight text-white mb-2 truncate">{h.case_title}</p>
                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-medium text-slate-300">
                         <CalendarDays size={14} className="text-emerald-400 shrink-0"/>
                         <span className="truncate">{safeDate(h.date, 'full')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 bg-slate-50 text-slate-400 rounded-lg shrink-0">
                                <MapPin size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Court Location</p>
                                <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{h.court_name}</p>
                            </div>
                        </div>
                      </div>

                      <button 
                         onClick={() => navigate(`/client-dashboard/cases/${h.id}`)}
                         className="w-full py-2.5 md:py-3 px-4 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                         View Related Case <ArrowRight size={16} />
                      </button>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-white px-4 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Gavel size={32} />
                    </div>
                    <p className="text-lg font-bold text-slate-900">No Upcoming Hearings</p>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">You currently do not have any court dates scheduled.</p>
                </div>
              )}
            </motion.div>
        </div>
      </main>
    </div>
  );
}

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