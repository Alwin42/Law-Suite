import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Search, Filter, Edit2, Trash2, X, AlertCircle, Loader2, Users, Plus, 
  LayoutDashboard, CalendarDays, Briefcase, CreditCard, Settings, LogOut, Menu 
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

const StaffClientView = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null); 
  const [formData, setFormData] = useState({ full_name: "", email: "", contact_number: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => { localStorage.clear(); navigate('/staff/login'); };

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try { setLoading(true); const response = await api.get("staff/clients/"); setClients(response.data); } 
    catch (err) { setError("Failed to load clients."); } 
    finally { setLoading(false); }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || (statusFilter === "Active" ? c.is_active : !c.is_active);
    return matchesSearch && matchesStatus;
  });

  const openModal = (client = null) => {
    setCurrentClient(client);
    setFormData(client ? { full_name: client.full_name, email: client.email, contact_number: client.contact_number, is_active: client.is_active } : { full_name: "", email: "", contact_number: "", is_active: true });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentClient) await api.patch(`staff/clients/${currentClient.id}/`, formData);
      else await api.post(`staff/clients/`, formData);
      fetchClients(); setIsModalOpen(false);
    } catch (err) { alert("Failed to save client. Ensure email is unique."); } 
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this client?")) return;
    try { await api.delete(`staff/clients/${id}/`); setClients(clients.filter(c => c.id !== id)); } 
    catch (err) { alert("Failed to delete client."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="min-h-screen mt-3 flex font-sans bg-[#F8FAFC] text-slate-900">
      
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><Users className="text-slate-400" /> Client Directory</h1>
              <p className="text-sm text-slate-500 mt-1">Manage all clients, statuses, and history</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none">
              <option value="All">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
            <button onClick={() => openModal()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 justify-center">
              <Plus size={16} /> Add Client
            </button>
          </div>
        </div>

        {error && <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg"><AlertCircle size={16} />{error}</div>}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr><th className="px-6 py-4">Client Info</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Case Overview</th><th className="px-6 py-4">Upcoming Hearings</th><th className="px-6 py-4">Payments</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4"><p className="font-semibold text-slate-900">{c.full_name}</p><p className="text-xs text-slate-500">{c.email}</p><p className="text-[10px] text-slate-400 mt-0.5">{c.contact_number}</p></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="px-6 py-4"><p className="text-slate-700 font-medium">{c.case_status}</p><p className="text-[10px] text-slate-400">Adv: {c.advocate_name}</p></td>
                    <td className="px-6 py-4">
                      {c.hearings.length > 0 ? <div className="flex flex-wrap gap-1 w-48">{c.hearings.map((h, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100">{h}</span>)}</div> : <span className="text-slate-400 text-xs">None Scheduled</span>}
                    </td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.payment_status === 'Clear' ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-red-50 text-red-700 border-red-200"}`}>{c.payment_status}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(c)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{currentClient ? "Edit Client" : "New Client"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-md"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase">Full Name</label><input required type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase">Email Address</label><input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase">Contact Number</label><input required type="text" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="activeToggle" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded border-slate-300" />
                <label htmlFor="activeToggle" className="text-sm text-slate-700 font-medium cursor-pointer">Client is Active</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">{saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Client"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffClientView;