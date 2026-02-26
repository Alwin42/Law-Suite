import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../../api"; 
import { Button } from "../ui/button"; 
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"; 
import { 
  LayoutDashboard, Users, FileText, Gavel, Calendar as CalendarIcon, FilePen,
  Settings, LogOut, ArrowRight, Loader, Clock, FileUser, Cloud, 
  Briefcase, Scale, ChevronRight
} from "lucide-react";

// --- REFINED NAV ITEM (Subtler Active State) ---
const NavItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
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
  
  // State
  const [stats, setStats] = useState({ active_cases: 0, pending_hearings: 0, total_clients: 0 , appointments_count: 0 });
  const [recentCases, setRecentCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [user, setUser] = useState({ name: "Advocate", role: "Loading..." });
  const [calendarDates, setCalendarDates] = useState({ hearings: [], appointments: [] });

  const parseDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d);
  };

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

  // --- CLEANER STATUS BADGES ---
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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 pt-16">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed top-16 bottom-0 z-10">
        <div className="flex-1 px-4 py-6 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" to="/dashboard" />
          <NavItem icon={Users} label="Clients" to="/clients" />
          <NavItem icon={FileText} label="Cases" to="/cases" />
          <NavItem icon={Gavel} label="Hearings" to="/advocate/hearings" />
          <NavItem icon={CalendarIcon} label="Appointments" to="/advocate/appointments" />
          <NavItem icon={FileUser} label="Case Documents" to="/documents" />
          <NavItem icon={FilePen} label="Templates" to="/templates" />
          <NavItem icon={Cloud} label="Cloud Vault" to="/cloud" />
        </div>

        <div className="p-4 border-t border-slate-100">
          <NavItem icon={Settings} label="Settings" to="/settings" />
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {user.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome Adv. {user.name}</h1>
              <p className="text-slate-500 text-sm mt-1">{today}</p>
            </div>
            <Button onClick={() => navigate('/cases/new')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
              <p class="text-2xl m-2">+</p> New Case 
            </Button>
          </div>

          {/* STATS ROW (Clean & Uniform) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Active Cases" value={stats.active_cases} icon={Briefcase} />
            <StatCard label="Pending Hearings" value={stats.pending_hearings} icon={Gavel} />
            <StatCard label="Total Clients" value={stats.total_clients} icon={Users} />
            <StatCard label="Appointments" value={stats.appointments_count} icon={Clock} />
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
            
            {/* COLUMN 1: CASES (Wider) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recent Cases Table style */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">Recent Cases</h3>
                  <button onClick={() => navigate('/cases')} className="text-sm text-blue-600 hover:underline flex items-center">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentCases.map((c) => (
                    <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.case_title}</p>
                          <p className="text-xs text-slate-500">{c.case_number}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCaseStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                  {recentCases.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No cases found.</p>}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">Appointments</h3>
                  <button onClick={() => navigate('/advocate/appointments')} className="text-sm text-blue-600 hover:underline">Manage</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div className="flex justify-between items-start">
                         <p className="text-sm font-semibold">{appt.client_name}</p>
                         <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${getApptStatusColor(appt.status)}`}>
                           {appt.status}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><CalendarIcon size={12}/> {appt.appointment_date}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {appt.appointment_time}</span>
                      </div>
                    </div>
                  ))}
                  {recentAppointments.length === 0 && <p className="text-sm text-slate-400 w-full">No appointments today.</p>}
                </div>
              </div>
            </div>

            {/* COLUMN 2: SIDE WIDGETS */}
            <div className="space-y-6">
              
              {/* CALENDAR WIDGET (Clean White Theme) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Calendar</h3>
                <ShadcnCalendar
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border border-slate-100 p-2"
                  classNames={{
                    day_selected: "bg-slate-900 text-white hover:bg-slate-800 hover:text-white",
                    day_today: "bg-slate-100 text-slate-900 font-bold",
                  }}
                  modifiers={{
                    hearing: calendarDates.hearings,
                    appointment: calendarDates.appointments,
                  }}
                  modifiersClassNames={{
                    hearing: "bg-amber-100 text-amber-700 font-bold hover:bg-amber-200",
                    appointment: "bg-blue-100 text-blue-700 font-bold hover:bg-blue-200",
                  }}
                />
                <div className="flex gap-4 mt-4 text-xs text-slate-500 justify-center">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Hearing</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Meeting</span>
                </div>
              </div>

              {/* UPCOMING HEARINGS LIST */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Upcoming Hearings</h3>
                <div className="space-y-4">
                  {upcomingHearings.map((h) => (
                     <div key={h.id} className="flex gap-3 items-start">
                        <div className="flex-shrink-0 w-10 text-center bg-slate-50 rounded p-1">
                           <span className="block text-xs font-bold text-slate-500">{new Date(h.next_hearing).getDate()}</span>
                           <span className="block text-[10px] text-slate-400 uppercase">{new Date(h.next_hearing).toLocaleDateString('en-US',{month:'short'})}</span>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-slate-900 line-clamp-1">{h.case_title}</p>
                           <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Gavel size={10}/> {h.court_name}
                           </p>
                        </div>
                     </div>
                  ))}
                  {upcomingHearings.length === 0 && <p className="text-sm text-slate-400">No hearings coming up.</p>}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// --- CLEAN STAT CARD ---
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
    <div className="h-10 w-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
      <Icon size={20} />
    </div>
  </div>
);

export default Dashboard;