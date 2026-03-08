import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Search, Filter, Edit2, X, AlertCircle, Loader2, 
  LayoutDashboard, CalendarDays, Briefcase, CreditCard, Users, Settings, LogOut, Menu 
} from "lucide-react";
import api from "../../api"; 

const NavItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-black text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
  >
    <Icon size={18} />{label}
  </NavLink>
);

const StaffCaseView = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvocate, setSelectedAdvocate] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState(null);
  const [updateData, setUpdateData] = useState({ status: "", next_hearing: "" });
  const [updating, setUpdating] = useState(false);

  const handleLogout = () => { localStorage.clear(); navigate('/staff/login'); };

  useEffect(() => { fetchCases(); }, []);

  const fetchCases = async () => {
    try { 
      setLoading(true); 
      // FIXED: Removed the leading slash so Axios uses the correct base URL
      const response = await api.get("staff/cases/"); 
      setCases(response.data); 
    } 
    catch (err) { setError("Failed to load cases."); } 
    finally { setLoading(false); }
  };

  const uniqueAdvocates = ["All", ...new Set(cases.map((c) => c.advocate_name).filter(Boolean))];

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.case_title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) || c.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAdvocate = selectedAdvocate === "All" || c.advocate_name === selectedAdvocate;
    return matchesSearch && matchesAdvocate;
  });

  const handleOpenUpdate = (caseItem) => { setCurrentCase(caseItem); setUpdateData({ status: caseItem.status || "Pending", next_hearing: caseItem.next_hearing || "" }); setIsUpdateModalOpen(true); };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true); 
      // FIXED: Removed the leading slash
      await api.patch(`staff/cases/${currentCase.id}/`, updateData);
      setCases((prev) => prev.map((c) => (c.id === currentCase.id ? { ...c, ...updateData } : c)));
      setIsUpdateModalOpen(false);
    } catch (err) { alert("Failed to update case."); } finally { setUpdating(false); }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open": return "bg-blue-50 text-blue-700";
      case "pending": return "bg-amber-50 text-amber-700";
      case "closed": return "bg-slate-100 text-slate-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="min-h-screen flex font-sans bg-[#F8FAFC] text-slate-900">
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`w-64 bg-white border-r mt-0 md:mt-16 border-zinc-200 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 md:hidden border-b border-zinc-100">
          <span className="font-bold text-zinc-900">Navigation</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors"><X size={20} /></button>
        </div>
        <nav className="flex-1 mt-3 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Overview" to="/staff/dashboard" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={CalendarDays} label="Appointments" to="/staff/appointments" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={Briefcase} label="Case Management" to="/staff/cases" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={CreditCard} label="Billing & Payments" to="/staff/billing" onClick={() => setIsSidebarOpen(false)} />
          <NavItem icon={Users} label="Client Directory" to="/staff/clients" onClick={() => setIsSidebarOpen(false)} />
        </nav>
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <NavItem icon={Settings} label="Settings" to="/staff/settings" onClick={() => setIsSidebarOpen(false)} />
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white rounded-lg border border-zinc-200 shadow-sm text-zinc-700 hover:bg-zinc-50"><Menu size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Case Master</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and track all advocate cases</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search cases or clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select value={selectedAdvocate} onChange={(e) => setSelectedAdvocate(e.target.value)} className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white cursor-pointer">
                {uniqueAdvocates.map((adv) => <option key={adv} value={adv}>{adv === "All" ? "All Advocates" : adv}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg"><AlertCircle size={16} />{error}</div>}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr><th className="px-6 py-4">Case Details</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Assigned Advocate</th><th className="px-6 py-4">Next Hearing</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4"><p className="font-semibold text-slate-900">{c.case_title}</p><p className="text-xs text-slate-500 mt-0.5">{c.case_number || "Unassigned No."}</p></td>
                    <td className="px-6 py-4 text-slate-600">{c.client_name || "Unknown"}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">{c.advocate_name || "Unassigned"}</span></td>
                    <td className="px-6 py-4 text-slate-600">{c.next_hearing ? new Date(c.next_hearing).toLocaleDateString() : "Not Scheduled"}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(c.status)}`}>{c.status || "Pending"}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleOpenUpdate(c)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* UPDATE MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div><h3 className="font-bold">Update Case</h3><p className="text-xs text-slate-500">{currentCase?.case_title}</p></div>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select value={updateData.status} onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white"><option value="Open">Open</option><option value="Pending">Pending</option><option value="Closed">Closed</option></select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Next Hearing Date</label>
                <input type="date" value={updateData.next_hearing} onChange={(e) => setUpdateData({ ...updateData, next_hearing: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">{updating ? <Loader2 size={16} className="animate-spin mx-auto"/> : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCaseView;