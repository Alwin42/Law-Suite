import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, CalendarDays, Briefcase, 
  CreditCard, Users, Settings, LogOut, 
  Clock, Mail, AlertCircle, Loader2, ChevronRight, CheckCircle,
  Menu, X // <-- NEW: Added icons for mobile sidebar
} from 'lucide-react';
import api from '../../api'; 

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Sidebar Navigation Item ---
const NavItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick} // <-- Added onClick to close sidebar on mobile after clicking
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
      ${isActive 
        ? "bg-black text-white shadow-md" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"} 
    `}
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // <-- NEW: Mobile Sidebar State -->
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // States to hold the real database data
  const [stats, setStats] = useState({
    pending_appointments: 0,
    active_cases: 0,
    unpaid_invoices: 0,
  });
  const [pendingTasks, setPendingTasks] = useState([]);

  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'STAFF') {
      navigate('/staff/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('staff/dashboard-stats/'); 
        setStats(response.data.stats);
        setPendingTasks(response.data.pendingTasks);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
            navigate('/staff/login'); 
        } else {
            showAlert("destructive", "Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/staff/login');
  };

  const handleSendReminder = (realId) => {
    showAlert("default", `Email reminder triggered for payment ID: ${realId}`); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      
      {/* --- NEW: MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`w-64 bg-white border-r mt-9 border-zinc-200 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* NEW: Mobile Header inside Sidebar */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-zinc-100">
          <span className="font-bold text-zinc-900">Navigation</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Overview" to="/staff/dashboard" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={CalendarDays} label="Appointments" to="/staff/appointments" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={Briefcase} label="Case Management" to="/staff/cases" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={CreditCard} label="Billing & Payments" to="/staff/billing" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={Users} label="Client Directory" to="/staff/clients" onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <NavItem icon={Settings} label="Settings" to="/staff/settings" onClick={() => setIsSidebarOpen(false)} />
          <button 
            onClick={handleLogout} 
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in mt-9 slide-in-from-bottom-4 duration-500">
          
          {alertInfo.show && (
            <div className="mb-6">
              <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm border-zinc-200">
                {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
                <AlertDescription>
                  {alertInfo.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* --- NEW: Responsive Header with Hamburger Menu --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="md:hidden p-2 bg-white rounded-lg border border-zinc-200 shadow-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Workspace Overview</h1>
                <p className="text-zinc-500 text-sm mt-1">{today}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm self-start sm:self-auto">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Pending Appointments" value={stats.pending_appointments} icon={Clock} color="amber" />
            <StatCard title="Active Cases" value={stats.active_cases} icon={Briefcase} color="blue" />
            <StatCard title="Unpaid Invoices" value={stats.unpaid_invoices} icon={AlertCircle} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-zinc-900">Action Required</h3>
              </div>

              <div className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4 text-center">No pending tasks found.</p>
                ) : (
                  pendingTasks.map(task => (
                    <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:shadow-sm transition-all bg-zinc-50/50 gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-lg ${
                          task.type === 'payment' ? 'bg-red-50 text-red-600' : 
                          task.type === 'appointment' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {task.type === 'payment' ? <CreditCard size={18}/> : 
                           task.type === 'appointment' ? <CalendarDays size={18}/> : <Briefcase size={18}/>}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{task.title}</p>
                          <p className="text-xs text-zinc-500 mt-1">{task.time}</p>
                        </div>
                      </div>

                      {task.type === 'payment' ? (
                        <button onClick={() => handleSendReminder(task.real_id)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors shrink-0">
                          <Mail size={14} /> Send Reminder
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate('/staff/appointments')}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors shrink-0"
                        >
                          Review <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-black text-white rounded-2xl shadow-xl p-6 flex flex-col relative overflow-hidden">
               <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                 <ShieldCheck size={150} />
               </div>
               
               <h3 className="font-bold text-lg relative z-10">Quick Actions</h3>
               <p className="text-zinc-400 text-sm mt-1 mb-6 relative z-10">Common staff operations</p>

               <div className="space-y-3 relative z-10 flex-1">
                 <QuickActionButton icon={CalendarDays} label="Manage Appointments" onClick={() => navigate('/staff/appointments')} />
                 <QuickActionButton icon={Users} label="Payment" onClick={() => navigate('/staff/clients')} />
                 <QuickActionButton icon={Briefcase} label="Update Case Status" onClick={() => navigate('/staff/cases')} />
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-xl border ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-zinc-900">{value}</p>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">{title}</p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-left group"
  >
    <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-black transition-colors">
      <Icon size={16} className="text-zinc-300 group-hover:text-white" />
    </div>
    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{label}</span>
  </button>
);

export default StaffDashboard;