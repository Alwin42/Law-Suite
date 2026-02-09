import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { 
  LayoutDashboard, Users, FileText, Gavel, Calendar, 
  Settings, LogOut, Bell, Search, Plus 
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 1. Check Authentication on Load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login"); // Redirect if not logged in
    } else {
      // In a real app, you'd fetch user details here. 
      // For now, we'll simulate it.
      setUser({ name: "Adv. Alwin", role: "Administrator" });
    }
  }, [navigate]);

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-primary">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <h1 className="text-xl font-bold tracking-tight uppercase">Law Suite</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" active />
          <NavItem icon={Users} label="Clients" />
          <NavItem icon={FileText} label="Cases" />
          <NavItem icon={Gavel} label="Hearings" />
          <NavItem icon={Calendar} label="Calendar" />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <NavItem icon={Settings} label="Settings" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {user?.name?.[0] || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-accent">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h2 className="text-lg font-semibold">Dashboard Overview</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search cases, clients..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <button className="p-2 text-accent hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Widgets */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Active Cases" value="12" trend="+2 this month" />
            <StatCard label="Pending Hearings" value="4" trend="Next: Tomorrow" />
            <StatCard label="Total Clients" value="48" trend="+5 new" />
            <StatCard label="Documents" value="156" trend="Updated 2h ago" />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Activity (Left 2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Recent Cases</h3>
                <Button size="sm" className="gap-2">
                  <Plus size={16} /> New Case
                </Button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">State vs. John Doe</p>
                        <p className="text-xs text-accent">Case #2024-{100+i} • Civil Litigation</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming (Right 1/3) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-lg mb-6">Upcoming Hearings</h3>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:h-full before:w-[1px] before:bg-gray-200">
                 {[1, 2].map((i) => (
                   <div key={i} className="relative pl-6">
                     <span className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-white"></span>
                     <p className="text-sm font-medium">High Court hearing</p>
                     <p className="text-xs text-accent mt-1">Tomorrow, 10:00 AM</p>
                     <p className="text-xs text-gray-400 mt-1">Room 304</p>
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

const NavItem = ({ icon: Icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    active 
      ? "bg-primary text-white" 
      : "text-accent hover:bg-gray-100 hover:text-primary"
  }`}>
    <Icon size={18} />
    {label}
  </button>
);

const StatCard = ({ label, value, trend }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-xs font-medium text-accent uppercase tracking-wider">{label}</p>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-2xl font-bold text-primary">{value}</span>
      <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">{trend}</span>
    </div>
  </div>
);

export default Dashboard;