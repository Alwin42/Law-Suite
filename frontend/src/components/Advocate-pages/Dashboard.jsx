import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../../api"; 
import { Button } from "../ui/button"; 
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"; 
import { 
  LayoutDashboard, Users, FileText, Gavel, Calendar as CalendarIcon, FilePen,
  Settings, LogOut, ArrowRight, Loader, Clock, FileUser, Cloud, Banknote,
  Briefcase, ChevronRight, Menu, X, MessageCircle, Bell, CheckCircle2
} from "lucide-react";
import LegalChatbot from '@/components/LegalChatbot';

const NavItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
      ${isActive 
        ? "bg-slate-100 text-slate-900 font-semibold" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"} 
    `}
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Sidebar State (1024px breakpoint)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // State
  const [stats, setStats] = useState({ active_cases: 0, pending_hearings: 0, total_clients: 0 , appointments_count: 0 });
  const [recentCases, setRecentCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [user, setUser] = useState({ name: "Advocate", role: "Loading..." });
  const [calendarDates, setCalendarDates] = useState({ hearings: [], appointments: [] });

  // NEW: Tasks & Reminders State
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);

  const parseDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/dashboard/");
        setStats(response.data.stats);
        setRecentCases(response.data.recent_cases);
        setUpcomingHearings(response.data.upcoming_hearings);
        setRecentAppointments(response.data.recent_appointments || []);
        setUser(response.data.user_profile);
        setCalendarDates({
            hearings: response.data.calendar_data.hearings.map(parseDate),
            appointments: response.data.calendar_data.appointments.map(parseDate)
        });

        // FETCH TASKS
        try {
            const tasksRes = await api.get('/tasks/');
            const y = new Date().getFullYear();
            const m = String(new Date().getMonth() + 1).padStart(2, '0');
            const d = String(new Date().getDate()).padStart(2, '0');
            const todayStr = `${y}-${m}-${d}`;
            // Filter to only show tasks due today that aren't cancelled
            setTasks(tasksRes.data.filter(t => t.due_date === todayStr && t.status !== 'Cancelled'));
        } catch (e) { console.error("Tasks fetch failed", e); }
        
        // FETCH REMINDERS
        try {
            const remRes = await api.get('/reminders/');
            // Only show unresolved reminders in the notification bell
            setReminders(remRes.data.filter(r => !r.is_resolved));
        } catch (e) { console.error("Reminders fetch failed", e); }

      } catch (error) {
        if (error.response && error.response.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavItemClick = () => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const getApptStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'Pending': return 'text-amber-700 bg-amber-50 border border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border border-slate-100';
    }
  };

  const getCaseStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'text-blue-700 bg-blue-50';
      case 'pending': return 'text-amber-700 bg-amber-50';
      case 'closed': return 'text-slate-500 bg-slate-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'bg-red-50 text-red-600 border border-red-200';
    if (priority === 'Medium') return 'bg-amber-50 text-amber-600 border border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  };

  const getReminderTypeColor = (type) => {
    switch (type) {
      case "Payment": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Appointment": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Hearing": return "bg-red-100 text-red-700 border-red-200";
      case "Deadline": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-slate-400" /></div>;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 pt-16 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside className={`w-80 bg-white rounded-r-lg shadow-xl lg:shadow-none border-r border-slate-200 flex flex-col fixed top-16 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100 mt-2">
          <span className="font-bold text-slate-900 ml-2 uppercase tracking-widest text-xs">Workspace</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Overview" to="/dashboard" onClick={handleNavItemClick} />
          <NavItem icon={CheckCircle2} label="Tasks & Reminders" to="/tasks" onClick={handleNavItemClick} />
          <NavItem icon={Users} label="Clients" to="/clients" onClick={handleNavItemClick} />
          <NavItem icon={FileText} label="Cases" to="/cases" onClick={handleNavItemClick} />
          <NavItem icon={Gavel} label="Hearings" to="/advocate/hearings" onClick={handleNavItemClick} />
          <NavItem icon={CalendarIcon} label="Appointments" to="/advocate/appointments" onClick={handleNavItemClick} />
          <NavItem icon={FileUser} label="Case Documents" to="/documents" onClick={handleNavItemClick} />
          <NavItem icon={FilePen} label="Templates" to="/templates" onClick={handleNavItemClick} />
          <NavItem icon={Cloud} label="Cloud Vault" to="/cloud" onClick={handleNavItemClick} />
          <NavItem icon={Banknote} label="Payments" to="/payments" onClick={handleNavItemClick} />
          <NavItem icon={MessageCircle} label="AI Assistant" to="/ai-assistant" onClick={handleNavItemClick} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <NavItem icon={Settings} label="Settings" to="/settings" onClick={handleNavItemClick} />
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {user.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-zinc-900">{user.name}</p>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors mt-0.5">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-4 md:p-8 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Welcome Adv. {user.name.split(' ')[0]}</h1>
                <p className="text-slate-500 text-sm mt-1">{today}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button onClick={() => navigate('/cases/new')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg w-full sm:w-auto shadow-sm">
                    <span className="text-xl font-light mr-2 leading-none">+</span> New Case 
                </Button>

                {/* NOTIFICATION BELL */}
                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 hover:bg-slate-50 transition-colors relative">
                        <Bell size={20} />
                        {reminders.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                                {reminders.length}
                            </span>
                            </span>
                        )}
                    </button>

                    {/* NOTIFICATIONS DROPDOWN */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-widest">Alerts</h3>
                                <span onClick={() => navigate('/reminders')} className="text-[10px] text-blue-600 cursor-pointer hover:underline font-semibold">View all</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {reminders.slice(0, 5).map(rem => (
                                    <div key={rem.id} onClick={() => navigate('/reminders')} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getReminderTypeColor(rem.reminder_type)}`}>{rem.reminder_type}</span>
                                            {!rem.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 mt-2 block">{rem.title}</span>
                                        {rem.message && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{rem.message}</p>}
                                    </div>
                                ))}
                                {reminders.length === 0 && <p className="text-xs text-slate-500 text-center py-6 font-mono uppercase tracking-widest">All caught up!</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
          
          <LegalChatbot />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Active Cases" value={stats.active_cases} icon={Briefcase} />
            <StatCard label="Pending Hearings" value={stats.pending_hearings} icon={Gavel} />
            <StatCard label="Total Clients" value={stats.total_clients} icon={Users} />
            <StatCard label="Appointments" value={stats.appointments_count} icon={Clock} />
          </div>

          {/* TOP ROW: CALENDAR, TASKS, HEARINGS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CALENDAR */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 flex flex-col items-center w-full">
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-900">Calendar</h3>
                </div>
                <div className="w-auto flex justify-center pb-2">
                  <ShadcnCalendar
                    mode="single"
                    selected={new Date()}
                    className="rounded-md flex border bg-slate-50 shadow-lg border-slate-100 p-2 sm:p-4 w-auto"
                    classNames={{
                      months: "w-full flex flex-col",
                      month: "w-full space-y-4 ",
                      table: "w-full border-collapse",
                      head_row: "grid grid-cols-7 w-auto",
                      head_cell: "text-slate-500 font-medium text-[11px] sm:text-xs text-center flex items-center justify-center",
                      row: "grid grid-cols-7 w-full mt-2",
                      cell: "text-center p-0 flex items-center justify-center relative",
                      day: "h-8 w-8 sm:h-9 sm:w-9 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-xs sm:text-sm font-normal aria-selected:opacity-100 rounded-md flex items-center justify-center transition-colors hover:bg-slate-100 mx-auto",
                      day_selected: "bg-slate-900 text-white hover:bg-slate-800 hover:text-white font-semibold",
                      day_today: "bg-slate-100 text-slate-900 font-bold",
                    }}
                    modifiers={{ hearing: calendarDates.hearings, appointment: calendarDates.appointments }}
                    modifiersClassNames={{
                      hearing: "bg-amber-100 text-amber-700 font-bold hover:bg-amber-200",
                      appointment: "bg-blue-100 text-blue-700 font-bold hover:bg-blue-200",
                    }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-slate-500 justify-center">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Hearing</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Meeting</span>
                </div>
              </div>

              {/* TODAY'S TASKS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col h-[400px] lg:h-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-800">Today's Tasks</h3>
                    <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:underline flex items-center">
                    View All <ChevronRight size={14} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {tasks.map((task) => (
                    <div key={task.id} onClick={() => navigate('/tasks')} className="group p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-amber-200 hover:bg-white transition-all cursor-pointer shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        {task.due_time && <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1"><Clock size={10}/> {task.due_time.substring(0,5)}</span>}
                        </div>
                        <p className={`text-sm font-semibold text-slate-800 line-clamp-2 leading-snug ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                    </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6">
                            <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm font-mono uppercase tracking-widest text-slate-400">No tasks for today.</p>
                        </div>
                    )}
                </div>
              </div>

              {/* UPCOMING HEARINGS */}
              <div className="bg-blue-100/50 rounded-xl border border-blue-200 shadow-sm p-4 md:p-5 flex flex-col h-[400px] lg:h-auto">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Gavel size={18} className="text-blue-600"/> Urgent Hearings</h3>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {upcomingHearings.map((h) => (
                     <div key={h.id} className="flex gap-3 items-start bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex-shrink-0 w-12 text-center bg-blue-50 rounded-lg p-1.5 border border-blue-100">
                           <span className="block text-sm font-bold text-blue-700">{new Date(h.next_hearing).getDate()}</span>
                           <span className="block text-[9px] text-blue-600 uppercase font-bold tracking-widest mt-0.5">{new Date(h.next_hearing).toLocaleDateString('en-US',{month:'short'})}</span>
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-slate-900 line-clamp-1">{h.case_title}</p>
                           <p className="text-xs text-slate-500 font-mono tracking-wide mt-1 line-clamp-1">{h.court_name}</p>
                        </div>
                     </div>
                  ))}
                  {upcomingHearings.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full py-6">
                           <p className="text-sm text-blue-600 font-mono uppercase tracking-widest">No hearings coming up.</p>
                      </div>
                  )}
                </div>
              </div>

          </div>

          {/* BOTTOM ROW: RECENT CASES & APPOINTMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
              {/* RECENT CASES */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">Recent Cases</h3>
                  <button onClick={() => navigate('/cases')} className="text-sm text-blue-600 hover:underline flex items-center">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentCases.map((c) => (
                    <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.case_title}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5 tracking-wider uppercase">{c.case_number}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md w-max ${getCaseStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                  {recentCases.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No cases found.</p>}
                </div>
              </div>

              {/* RECENT APPOINTMENTS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">Appointments</h3>
                  <button onClick={() => navigate('/advocate/appointments')} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Manage <ArrowRight size={14} /> 
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                         <p className="text-sm font-bold text-slate-900 line-clamp-1">{appt.client_name}</p>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-widest ${getApptStatusColor(appt.status)}`}>
                           {appt.status}
                         </span>
                      </div>
                      <div className="flex flex-col gap-2 mt-2 text-xs text-slate-500 font-mono tracking-wider">
                        <span className="flex items-center gap-2"><CalendarIcon size={12}/> {appt.appointment_date}</span>
                        <span className="flex items-center gap-2 text-slate-600 font-semibold"><Clock size={12}/> {appt.appointment_time}</span>
                      </div>
                    </div>
                  ))}
                  {recentAppointments.length === 0 && <p className="text-sm text-slate-400 w-full col-span-2 text-center py-6">No appointments today.</p>}
                </div>
              </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors">
    <div>
      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{value}</p>
    </div>
    <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
      <Icon size={24} />
    </div>
  </div>
);

export default Dashboard;