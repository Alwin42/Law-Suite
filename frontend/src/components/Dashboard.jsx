import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// SAFE IMPORT: Using your manual Button component
import { Button } from "./ui/Button"; 
import { 
  LayoutDashboard, Users, FileText, Gavel, Calendar, 
  Settings, LogOut, Bell, Search, Plus 
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Advocate", role: "Loading..." });

  // 1. Check Authentication on Load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedName = localStorage.getItem("user_name");
    const storedRole = localStorage.getItem("user_role");

    if (!token) {
      navigate("/login"); // Redirect if not logged in
    } else {
      // Set user from local storage or simulate fetch
      setUser({ 
        name: storedName || "Adv. Alwin", 
        role: storedRole || "Administrator" 
      });
    }
  }, [navigate]);

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.clear(); // Clear all auth data
    navigate("/login");
  };

  return (
    // Added pt-16 to push content below the fixed Navbar from App.jsx
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 pt-16">
      
      {/* --- DASHBOARD SIDEBAR (Fixed to left, below Navbar) --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed top-16 bottom-0 z-10 overflow-y-auto">
        
        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" isActive={true} />
          <NavItem icon={Users} label="Clients" />
          <NavItem icon={FileText} label="Cases" />
          <NavItem icon={Gavel} label="Hearings" />
          <NavItem icon={Calendar} label="Calendar" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem icon={Settings} label="Settings" />
          </div>
        </nav>

        {/* Sidebar Footer (User Profile & Logout) */}
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
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 pl-0"
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
        
        {/* Dashboard Header (Sticky below main Navbar) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-slate-800">Dashboard Overview</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search cases, clients..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-64 transition-all"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Widgets Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Active Cases" value="12" trend="+2 this month" />
            <StatCard label="Pending Hearings" value="4" trend="Next: Tomorrow" />
            <StatCard label="Total Clients" value="48" trend="+5 new" />
            <StatCard label="Documents" value="156" trend="Updated 2h ago" />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Activity (Left 2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-slate-900">Recent Cases</h3>
                <Button size="sm" className="gap-2 text-xs">
                  <Plus size={16} /> New Case
                </Button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">State vs. John Doe</p>
                        <p className="text-xs text-slate-500">Case #2024-{100+i} • Civil Litigation</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming (Right 1/3) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-semibold text-lg mb-6 text-slate-900">Upcoming Hearings</h3>
              <div className="space-y-6 relative pl-2">
                 {/* Vertical Line */}
                 <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-200"></div>
                 
                 {[1, 2].map((i) => (
                   <div key={i} className="relative pl-8">
                     {/* Timeline Dot */}
                     <span className="absolute left-[4px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-4 border-white shadow-sm z-10"></span>
                     
                     <p className="text-sm font-medium text-slate-900">High Court hearing</p>
                     <p className="text-xs text-slate-500 mt-0.5">Tomorrow, 10:00 AM</p>
                     <p className="text-xs text-slate-400 mt-1 font-medium bg-slate-50 inline-block px-1.5 rounded">Room 304</p>
                   </div>
                 ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavItem = ({ icon: Icon, label, isActive }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive 
      ? "bg-slate-900 text-white shadow-sm" 
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  }`}>
    <Icon size={18} />
    {label}
  </button>
);

const StatCard = ({ label, value, trend }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <div className="mt-3 flex items-baseline justify-between">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
        {trend}
      </span>
    </div>
  </div>
);

export default Dashboard;