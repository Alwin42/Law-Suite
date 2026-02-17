import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import { Button } from "./ui/button"; 
import { 
  LayoutDashboard, Users, FileText, Gavel, Calendar, 
  Settings, LogOut, Bell, Search, ArrowRight, Loader 
} from "lucide-react";
import { NavLink } from "react-router-dom";
const NavItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors 
      ${isActive 
        ? "bg-slate-900 text-white shadow-sm" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"} // Inactive styling
    `}
  >
    <Icon size={18} />
    {label}
  </NavLink>
);
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State Real Data
  const [stats, setStats] = useState({ active_cases: 0, pending_hearings: 0, total_clients: 0 , appointments_count: 0, });
  const [recentCases, setRecentCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [user, setUser] = useState({ name: "Advocate", role: "Loading..." });

  // Fetch Dashboard Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/dashboard/");
        
        // Update State with Real Backend Data
        setStats(response.data.stats);
        setRecentCases(response.data.recent_cases);
        setUpcomingHearings(response.data.upcoming_hearings);
        setUser(response.data.user_profile);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Optional: Redirect to login if unauthorized
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="animate-spin text-slate-900" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 pt-16">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed top-16 bottom-0 z-10 overflow-y-auto">
        <nav className="flex-1 p-4 space-y-1">
          {/* Use the 'to' prop to define the route path */}
          <NavItem icon={LayoutDashboard} label="Overview" to="/dashboard" />
          <NavItem icon={Users} label="Clients" to="/clients" />
          <NavItem icon={FileText} label="Cases" to="/cases" />
          <NavItem icon={Gavel} label="Hearings" to="/hearings" />
          <NavItem icon={Calendar} label="Appointments" to="/advocate/appointments" />
          

          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem icon={Settings} label="Settings" to="/settings" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
              {user.name?.[0] || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 pl-0">
            <LogOut size={18} className="mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-slate-800">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-64" />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* STATS ROW (REAL DATA) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Active Cases" value={stats.active_cases} trend="Current" />
            <StatCard label="Pending Hearings" value={stats.pending_hearings} trend="Upcoming" />
            <StatCard label="Total Clients" value={stats.total_clients} trend="Total" />
            <StatCard label="Appointments" value={stats.appointments_count} trend="Total" />
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* RECENT CASES (REAL DATA) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-slate-900">Recent Cases</h3>
                <Button size="sm" onClick={() => navigate('/cases')} className="gap-2 text-xs">
                   View All <ArrowRight size={16} />
                </Button>
              </div>
              
              <div className="space-y-4 overflow-y-auto">
                {recentCases.length > 0 ? (
                  recentCases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{c.case_title}</p>
                          <p className="text-xs text-slate-500">#{c.case_number} • {c.case_type}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        {c.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <p className="text-slate-400 text-sm">No cases found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* UPCOMING HEARINGS (REAL DATA) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
              <h3 className="font-semibold text-lg mb-6 text-slate-900">Upcoming Hearings</h3>
              
              <div className="space-y-6 relative pl-2 overflow-y-auto">
                {upcomingHearings.length > 0 ? (
                  <>
                    <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-200"></div>
                    {upcomingHearings.map((h) => (
                      <div key={h.id} className="relative pl-8">
                        <span className="absolute left-[-3px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-4 border-white shadow-sm z-10"></span>
                        <p className="text-sm font-medium text-slate-900">{h.case_title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                           {new Date(h.next_hearing).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium bg-slate-50 inline-block px-1.5 rounded">
                          {h.court_name}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <p className="text-slate-400 text-sm">No hearings scheduled.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};



const StatCard = ({ label, value, trend }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <div className="mt-3 flex items-baseline justify-between">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">{trend}</span>
    </div>
  </div>
);

export default Dashboard;