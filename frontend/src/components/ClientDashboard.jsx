import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Gavel, 
  CreditCard, 
  FileText, 
  User, 
  Plus, 
  CalendarDays, 
  Bell, 
  LogOut,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../api"; // Import your axios instance

// --- UI COMPONENTS ---
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "@/components/ui/badge"; 

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- REAL DATA STATES ---
  const [userData, setUserData] = useState({ name: "Client", email: "Loading..." });
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch User Profile Data (You will need to create this endpoint in Django if it doesn't exist)
        const profileRes = await api.get('user/profile/'); 
        setUserData({ 
          name: profileRes.data.full_name || "Client", 
          email: profileRes.data.email 
        });

        // Fetch Client-specific Data
        // Promise.all runs these requests simultaneously for faster loading
        const [casesRes, hearingsRes, paymentsRes] = await Promise.all([
            api.get('client/cases/').catch(() => ({ data: [] })),       // Catch prevents whole page crash if endpoint is missing
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900 mb-4" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 pt-16">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-10 transition-all duration-300">
        
        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shrink-0 uppercase">
            {userData.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-slate-900 truncate">{userData.name}</h3>
            <p className="text-xs text-slate-500 truncate" title={userData.email}>
              {userData.email}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarItem icon={Briefcase} label="My Cases" active={activeTab === "cases"} onClick={() => setActiveTab("cases")} />
          <SidebarItem icon={Gavel} label="Hearings" active={activeTab === "hearings"} onClick={() => setActiveTab("hearings")} />
          <SidebarItem icon={CreditCard} label="Payments" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} />
          <SidebarItem icon={FileText} label="Documents" active={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
          <SidebarItem icon={User} label="Profile Settings" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <LogOut size={18} className="group-hover:stroke-red-700" />
            <span className="group-hover:text-red-700">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-72 p-8 lg:p-12 overflow-y-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your legal journey efficiently.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                onClick={() => navigate("/book-appointment")} 
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
            >
              <CalendarDays className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700">
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          </div>
        </header>

        {/* WIDGET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          
          <DashboardCard title="Active Cases" icon={Briefcase}>
            {cases.length > 0 ? (
               <div className="space-y-3">
                {cases.map((c) => (
                  <div key={c.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.lawyer_name || "Unassigned"}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No active cases." />}
          </DashboardCard>

          <DashboardCard title="Upcoming Hearings" icon={Gavel}>
             {hearings.length > 0 ? (
               <div className="space-y-3">
                 {hearings.map((h) => (
                    <div key={h.id} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                      <div className="text-center bg-slate-50 p-2 rounded-lg min-w-[60px] border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(h.date).toLocaleString('default', { month: 'short' })}</p>
                         <p className="text-lg font-bold text-slate-900">{new Date(h.date).getDate()}</p>
                      </div>
                      <div>
                         <p className="font-semibold text-slate-900 text-sm">{h.court_name}</p>
                         <p className="text-xs text-slate-500 mt-0.5">{h.time}</p>
                      </div>
                    </div>
                 ))}
               </div>
             ) : <EmptyState message="No hearings scheduled." />}
          </DashboardCard>

          <DashboardCard title="Recent Transactions" icon={CreditCard}>
             {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{p.description}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{p.date}</span>
                    </div>
                    <span className="font-semibold text-slate-900">₹{p.amount}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No payment history." />}
          </DashboardCard>

          {/* Notifications */}
          <Card className="col-span-1 md:col-span-2 xl:col-span-3 border border-slate-200 shadow-none bg-white rounded-xl">
            <CardHeader className="pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Bell className="h-5 w-5 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Notifications</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
               {notifications.length > 0 ? (
                    <ul className="space-y-4">
                        {notifications.map((n, i) => (
                            <li key={i} className="text-sm text-slate-600 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                {n.message}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-400 text-sm">You're all caught up!</p>
                    </div>
                )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS (Unchanged) ---
function SidebarItem({ icon: Icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                active 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={cn("transition-colors", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                {label}
            </div>
            {active && <ChevronRight size={14} className="text-slate-400 opacity-50" />}
        </button>
    )
}

function DashboardCard({ title, icon: Icon, children }) {
    return (
        <Card className="border border-slate-200 shadow-none bg-white rounded-xl h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-slate-400" />
                </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
                {children}
            </CardContent>
        </Card>
    )
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center px-4">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <span className="text-slate-300 text-lg">?</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">{message}</p>
        </div>
    )
}