import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Search, Filter, Edit2, X, AlertCircle, Loader2, Banknote, 
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

const StaffBillingView = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [updateData, setUpdateData] = useState({ status: "" });
  const [updating, setUpdating] = useState(false);

  const handleLogout = () => { localStorage.clear(); navigate('/staff/login'); };

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchPayments = async () => {
    try { 
      setLoading(true); 
      const response = await api.get("staff/payments/"); 
      setPayments(response.data); 
    } 
    catch (err) { setError("Failed to load payments."); } 
    finally { setLoading(false); }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.case_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenUpdate = (payment) => { 
    setCurrentPayment(payment); 
    setUpdateData({ status: payment.status || "Pending" }); 
    setIsUpdateModalOpen(true); 
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true); 
      await api.patch(`staff/payments/${currentPayment.id}/`, updateData);
      setPayments((prev) => prev.map((p) => (p.id === currentPayment.id ? { ...p, ...updateData } : p)));
      setIsUpdateModalOpen(false);
    } catch (err) { 
      alert("Failed to update payment."); 
    } finally { 
      setUpdating(false); 
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="min-h-screen flex font-sans bg-[#F8FAFC] mt-15 text-slate-900">
      
      {/* MOBILE SIDEBAR OVERLAY */}
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
      
      {/* FIXED: Added `w-full` and `overflow-x-hidden` here */}
      <main className={`flex-1 w-full overflow-x-hidden p-4 md:p-8 pt-6 md:pt-12 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        
        {/* FIXED: Wrapped content in a max-w container */}
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-lg border border-zinc-200 shadow-sm text-zinc-700 hover:bg-zinc-50"><Menu size={20} /></button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><Banknote className="text-slate-400" /> Billing & Payments</h1>
                <p className="text-sm text-slate-500 mt-1">Manage all client invoices and transactions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search client or case..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40 px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer appearance-none">
                <option value="All">All Statuses</option><option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Completed">Completed</option><option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {error && <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg"><AlertCircle size={16} />{error}</div>}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr><th className="px-6 py-4">Invoice / Case</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Mode</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length > 0 ? filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">INV-{p.id.toString().padStart(4, '0')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.case_title || "General Consultation"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.client_name || "Unknown"}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.payment_mode || "N/A"}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(p.status)}`}>{p.status || "Pending"}</span></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenUpdate(p)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"><Edit2 size={16} /></button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No billing records found matching your criteria.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* UPDATE MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[95%] sm:max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 bg-slate-50/50">
              <div><h3 className="font-bold text-lg">Update Payment</h3><p className="text-xs text-slate-500">INV-{currentPayment?.id.toString().padStart(4, '0')}</p></div>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-md"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-5 md:p-6 space-y-4 md:space-y-5">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Status</label>
                <select value={updateData.status} onChange={(e) => setUpdateData({ status: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Completed">Completed</option><option value="Failed">Failed</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="w-full sm:flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={updating} className="w-full sm:flex-1 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors">{updating ? <Loader2 size={16} className="animate-spin mx-auto"/> : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBillingView;