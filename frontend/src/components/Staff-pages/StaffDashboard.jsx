import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, CalendarDays, Briefcase, 
  CreditCard, Users, Settings, LogOut, CheckCircle2, 
  Clock, Mail, AlertCircle, Loader2, ChevronRight 
} from 'lucide-react';
import axios from 'axios';

// --- Sidebar Navigation Item ---
const NavItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
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
  const [user, setUser] = useState({ name: "Staff Member", email: "" });
  
  // Dummy data for the UI structure (You will replace this with an API call later)
  const [stats, setStats] = useState({
    pending_appointments: 5,
    active_cases: 24,
    unpaid_invoices: 8,
  });

  const [pendingTasks, setPendingTasks] = useState([
    { id: 1, type: "appointment", title: "Approve consultation for John Doe", time: "Today, 2:00 PM" },
    { id: 2, type: "payment", title: "Send payment reminder to Sarah Smith", time: "Overdue by 2 days" },
    { id: 3, type: "case", title: "Update hearing date for Case #MC-24", time: "Requires action" },
  ]);

  useEffect(() => {
    // 1. Check if user is logged in
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'STAFF') {
      navigate('/staff/login');
      return;
    }

    // 2. Fetch Dashboard Data (Placeholder for your future API)
    // In the future, you'll do: axios.get('/api/staff/dashboard/', { headers: ... })
    setTimeout(() => {
      setLoading(false);
    }, 800);

  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/staff/login');
  };

  const handleSendReminder = (id) => {
    alert(`Triggering email reminder for task ${id}...`);
    // Future API call to the SendPaymentReminderView we discussed
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
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col fixed inset-y-0 z-10">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Staff Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Overview" to="/staff/dashboard" />
          <NavItem icon={CalendarDays} label="Appointments" to="/staff/appointments" />
          <NavItem icon={Briefcase} label="Case Management" to="/staff/cases" />
          <NavItem icon={CreditCard} label="Billing & Payments" to="/staff/billing" />
          <NavItem icon={Users} label="Client Directory" to="/staff/clients" />
        </nav>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <NavItem icon={Settings} label="Settings" to="/staff/settings" />
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
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Workspace Overview</h1>
              <p className="text-zinc-500 text-sm mt-1">{today}</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">System Online</span>
            </div>
          </div>

          {/* KPI Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Pending Appointments" 
              value={stats.pending_appointments} 
              icon={Clock} 
              color="amber" 
            />
            <StatCard 
              title="Active Cases" 
              value={stats.active_cases} 
              icon={Briefcase} 
              color="blue" 
            />
            <StatCard 
              title="Unpaid Invoices" 
              value={stats.unpaid_invoices} 
              icon={AlertCircle} 
              color="red" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Action Required List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-zinc-900">Action Required</h3>
                <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:shadow-sm transition-all bg-zinc-50/50">
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

                    {/* Dynamic Action Button based on task type */}
                    {task.type === 'payment' ? (
                      <button onClick={() => handleSendReminder(task.id)} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                        <Mail size={14} /> Send Reminder
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors">
                        Review <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-black text-white rounded-2xl shadow-xl p-6 flex flex-col relative overflow-hidden">
               <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                 <ShieldCheck size={150} />
               </div>
               
               <h3 className="font-bold text-lg relative z-10">Quick Actions</h3>
               <p className="text-zinc-400 text-sm mt-1 mb-6 relative z-10">Common staff operations</p>

               <div className="space-y-3 relative z-10 flex-1">
                 <QuickActionButton icon={CalendarDays} label="Schedule New Appointment" />
                 <QuickActionButton icon={Users} label="Register New Client" />
                 <QuickActionButton icon={CreditCard} label="Record Payment Receipt" />
                 <QuickActionButton icon={Briefcase} label="Update Case Status" />
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- Subcomponents for clean code ---

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

const QuickActionButton = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-left group">
    <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-black transition-colors">
      <Icon size={16} className="text-zinc-300 group-hover:text-white" />
    </div>
    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{label}</span>
  </button>
);

export default StaffDashboard;