import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, CalendarDays, Briefcase, 
  CreditCard, Users, Settings, LogOut, 
  Clock, Mail, AlertCircle, Loader2, ChevronRight, CheckCircle,
  Menu, X
} from 'lucide-react';
import api from '../../api'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NavItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
      ${isActive ? "bg-black text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"} 
    `}
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [stats, setStats] = useState({ pending_appointments: 0, active_cases: 0, unpaid_invoices: 0 });
  const [pendingTasks, setPendingTasks] = useState([]);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => setAlertInfo({ show: false, type: 'default', message: '' }), 5000);
  };

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('staff/dashboard-stats/'); 
        setStats(response.data.stats);
        setPendingTasks(response.data.pendingTasks);
      } catch (error) {
        if (error.response?.status === 401) navigate('/staff/login'); 
        else showAlert("destructive", "Failed to load dashboard data.");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-zinc-900" size={32} /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans mt-15 text-zinc-900">
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`w-64 bg-white border-r border-zinc-200 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-zinc-100">
          <span className="font-bold text-zinc-900">Navigation</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors"><X size={20} /></button>
        </div>
        <nav className="flex-1 mt-3 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Overview" to="/staff/dashboard" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem icon={CalendarDays} label="Appointments" to="/staff/appointments" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem icon={Briefcase} label="Case Management" to="/staff/cases" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem icon={CreditCard} label="Billing & Payments" to="/staff/billing" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem icon={Users} label="Client Directory" to="/staff/clients" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </nav>
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <NavItem icon={Settings} label="Settings" to="/staff/settings" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>

      <main className={`flex-1 p-4 md:p-8 pt-8 md:pt-12 overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {alertInfo.show && (
            <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm border-zinc-200">
              {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-lg border border-zinc-200 shadow-sm text-zinc-700 hover:bg-zinc-50"><Menu size={20} /></button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Workspace Overview</h1>
                <p className="text-zinc-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard title="Pending Appointments" value={stats.pending_appointments} icon={Clock} color="amber" />
            <StatCard title="Active Cases" value={stats.active_cases} icon={Briefcase} color="blue" />
            <StatCard title="Unpaid Invoices" value={stats.unpaid_invoices} icon={AlertCircle} color="red" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 md:p-6 overflow-hidden">
              <h3 className="font-bold text-lg text-zinc-900 mb-4 md:mb-6">Action Required</h3>
              <div className="space-y-4">
                {pendingTasks.length === 0 ? <p className="text-zinc-500 text-sm py-4 text-center">No pending tasks found.</p> : pendingTasks.map(task => (
                  <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:shadow-sm transition-all bg-zinc-50/50 gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg shrink-0 ${task.type === 'payment' ? 'bg-red-50 text-red-600' : task.type === 'appointment' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {task.type === 'payment' ? <CreditCard size={18}/> : task.type === 'appointment' ? <CalendarDays size={18}/> : <Briefcase size={18}/>}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 line-clamp-1">{task.title}</p>
                        <p className="text-xs text-zinc-500 mt-1">{task.time}</p>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-100 shrink-0">
                      Review <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black text-white rounded-2xl shadow-xl p-5 md:p-6 flex flex-col relative overflow-hidden">
               <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none"><ShieldCheck size={150} /></div>
               <h3 className="font-bold text-lg relative z-10">Quick Actions</h3>
               <div className="space-y-3 mt-6 relative z-10 flex-1">
                 <QuickActionButton icon={CalendarDays} label="Manage Appointments" onClick={() => navigate('/staff/appointments')} />
                 <QuickActionButton icon={Users} label="Client Directory" onClick={() => navigate('/staff/clients')} />
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
  const colorMap = { amber: "bg-amber-50 text-amber-600 border-amber-100", blue: "bg-blue-50 text-blue-600 border-blue-100", red: "bg-red-50 text-red-600 border-red-100" };
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 md:gap-5">
      <div className={`p-3 md:p-4 rounded-xl border shrink-0 ${colorMap[color]}`}><Icon className="w-5 h-5 md:w-6 md:h-6" /></div>
      <div className="overflow-hidden"><p className="text-2xl md:text-3xl font-extrabold text-zinc-900 truncate">{value}</p><p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1 truncate">{title}</p></div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-left group">
    <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-black transition-colors shrink-0"><Icon size={16} className="text-zinc-300 group-hover:text-white" /></div>
    <span className="text-sm font-medium text-zinc-300 group-hover:text-white line-clamp-1">{label}</span>
  </button>
);

export default StaffDashboard;