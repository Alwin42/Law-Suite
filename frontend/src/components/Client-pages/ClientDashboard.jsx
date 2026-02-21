import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, Gavel, CreditCard, FileText, User, 
  Plus, CalendarDays, Bell, LogOut, ChevronRight, Loader2, Sparkles, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW: Animations
import api from "../../api"; 

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "@/components/ui/badge"; 

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Real Data States
  const [userData, setUserData] = useState({ name: "Client", email: "Loading..." });
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get('user/profile/'); 
        setUserData({ 
          name: profileRes.data.full_name || "Client", 
          email: profileRes.data.email 
        });

        const [casesRes, hearingsRes, paymentsRes] = await Promise.all([
            api.get('client/cases/').catch(() => ({ data: [] })),       
            api.get('client/hearings/').catch(() => ({ data: [] })),
            api.get('client/payments/').catch(() => ({ data: [] }))
        ]);

        setCases(casesRes.data);
        setHearings(hearingsRes.data);
        setPayments(paymentsRes.data);
        
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const safeDate = (dateString, type) => {
    if (!dateString) return "TBD";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "TBD"; 
    if (type === 'month') return d.toLocaleString('default', { month: 'short' });
    if (type === 'day') return d.getDate();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAFAFA]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-emerald-600 mb-4" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-slate-400 font-medium tracking-wide"
        >
          Curating your secure workspace...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pt-16">
      
      {/* --- SIDEBAR (Minimalist Floating Style) --- */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-100 flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 uppercase shrink-0">
            {userData.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-900 truncate tracking-tight">{userData.name}</h3>
            <p className="text-xs text-slate-400 truncate" title={userData.email}>
              {userData.email}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarItem icon={Briefcase} label="My Cases" active={activeTab === "cases"} onClick={() => setActiveTab("cases")} />
          <SidebarItem icon={Gavel} label="Hearings" active={activeTab === "hearings"} onClick={() => setActiveTab("hearings")} />
          <SidebarItem icon={CreditCard} label="Billing & Payments" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} />
          <SidebarItem icon={FileText} label="Documents" active={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
        </nav>

        <div className="p-4 mb-4">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-start gap-3 w-full px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span>Secure Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-72 p-8 lg:p-12 overflow-y-auto h-[calc(100vh-4rem)] relative">
        
        <div className="max-w-6xl mx-auto">
            {/* HEADER (Engaging & Personalized) */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
            <div>
                <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-1 flex items-center gap-2">
                    <Sparkles size={14} /> {today}
                </p>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {greeting}, {userData.name.split(' ')[0]}
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Here is the latest update on your legal matters.</p>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    onClick={() => navigate("/book-appointment")} 
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                <CalendarDays className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
            </div>
            </motion.header>

            {/* WIDGET GRID (Staggered Animation) */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
            >
            
            {/* CASES WIDGET */}
            <motion.div variants={itemVariants} className="xl:col-span-2">
                <DashboardCard title="Active Cases" icon={Briefcase}>
                {cases.length > 0 ? (
                    <div className="space-y-4">
                    {cases.map((c, index) => (
                        <motion.div 
                            key={c.id} 
                            whileHover={{ scale: 1.01, x: 4 }}
                            className="group flex items-center justify-between p-5 bg-white border border-slate-100/50 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer"
                        >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                <Briefcase size={18} className="text-slate-400 group-hover:text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-base">{c.title}</p>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">{c.lawyer_name || "Unassigned"}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-50/80 text-emerald-700 border-emerald-100/50 px-3 py-1 font-semibold tracking-wide">
                            {c.status}
                        </Badge>
                        </motion.div>
                    ))}
                    </div>
                ) : <EmptyState icon={Briefcase} message="No active cases at the moment." />}
                </DashboardCard>
            </motion.div>

            {/* HEARINGS WIDGET */}
            <motion.div variants={itemVariants}>
                <DashboardCard title="Upcoming Hearings" icon={Gavel}>
                {hearings.length > 0 ? (
                    <div className="space-y-4">
                    {hearings.map((h) => (
                        <motion.div 
                            key={h.id} 
                            whileHover={{ y: -2 }}
                            className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center gap-5 shadow-lg shadow-slate-900/10 text-white relative overflow-hidden"
                        >
                        {/* Decorative background circle */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                        <div className="text-center bg-white/10 backdrop-blur-sm p-3 rounded-xl min-w-[70px] border border-white/10">
                            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">{safeDate(h.date, 'month')}</p>
                            <p className="text-2xl font-black leading-none mt-1">{safeDate(h.date, 'day')}</p>
                        </div>
                        <div className="relative z-10">
                            <p className="font-bold text-white text-base leading-tight">{h.court_name}</p>
                            <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1.5 font-medium">
                                <Clock size={12} className="text-emerald-400"/> {h.time}
                            </p>
                        </div>
                        </motion.div>
                    ))}
                    </div>
                ) : <EmptyState icon={Gavel} message="No upcoming hearings scheduled." />}
                </DashboardCard>
            </motion.div>

            {/* PAYMENTS WIDGET */}
            <motion.div variants={itemVariants} className="xl:col-span-3">
                <DashboardCard title="Recent Transactions" icon={CreditCard}>
                {payments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-sm transition-shadow">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={p.description}>{p.description}</span>
                            <span className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                                <CalendarDays size={12}/> {safeDate(p.date, 'full')}
                            </span>
                        </div>
                        <span className="font-extrabold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            ₹{p.amount}
                        </span>
                        </div>
                    ))}
                    </div>
                ) : <EmptyState icon={CreditCard} message="No recent transactions found." />}
                </DashboardCard>
            </motion.div>

            </motion.div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function SidebarItem({ icon: Icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                active 
                    ? "text-emerald-700 bg-emerald-50/50" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            {active && (
                <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
            )}
            <div className="flex items-center gap-3 relative z-10">
                <Icon size={18} className={cn("transition-colors duration-300", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700")} />
                {label}
            </div>
            {active && <ChevronRight size={14} className="text-emerald-600/50" />}
        </button>
    )
}

function DashboardCard({ title, icon: Icon, children }) {
    return (
        <Card className="border-none shadow-none bg-transparent h-full flex flex-col">
            <CardHeader className="px-1 pb-5 pt-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                        <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-1 flex-1">
                {children}
            </CardContent>
        </Card>
    )
}

function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-white border border-slate-100 border-dashed rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">{message}</p>
        </div>
    )
}