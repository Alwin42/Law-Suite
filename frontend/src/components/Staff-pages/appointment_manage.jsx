import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { 
  CalendarDays, Clock, User, CheckCircle, XCircle, CalendarClock, Loader2, Search, 
  Plus, FileText, Briefcase, AlertCircle, LayoutDashboard, CreditCard, Users, Settings, LogOut, Menu, X 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NavItem = ({ icon: Icon, label, to, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-black text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
  >
    <Icon size={18} />{label}
  </NavLink>
);

const AppointmentManage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newAppt, setNewAppt] = useState({ client: '', advocate: '', appointment_date: '', appointment_time: '', duration: '30 Mins', purpose: '' });
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  const showAlert = (type, message) => { setAlertInfo({ show: true, type, message }); setTimeout(() => { setAlertInfo({ show: false, type: 'default', message: '' }); }, 5000); };
  
  const handleLogout = () => { localStorage.clear(); navigate('/staff/login'); };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // FIXED: Using staff endpoints
        const apptRes = await api.get('staff/appointments/');
        setAppointments(apptRes.data);
        
        // FIXED: Using staff endpoints so the dropdown populates!
        const clientRes = await api.get('staff/clients/');
        setClients(clientRes.data);
      } catch (error) {
        showAlert("destructive", "Failed to load data.");
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setProcessingId(id);
    try {
      // FIXED: Using staff endpoints
      await api.patch(`staff/appointments/${id}/`, { status: newStatus });
      setAppointments(appointments.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt));
      showAlert("default", `Status updated to ${newStatus}.`);
    } catch (error) { showAlert("destructive", "Failed to update status."); } finally { setProcessingId(null); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setProcessingId(selectedAppt.id);
    try {
      // FIXED: Using staff endpoints
      await api.patch(`staff/appointments/${selectedAppt.id}/`, { appointment_date: newDate, appointment_time: newTime, status: 'Pending' });
      const apptRes = await api.get('staff/appointments/'); 
      setAppointments(apptRes.data); 
      setIsRescheduleModalOpen(false); 
      showAlert("default", "Appointment rescheduled.");
    } catch (error) { showAlert("destructive", "Failed to reschedule."); } finally { setProcessingId(null); }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setProcessingId('creating');
    try {
      // FIXED: Using staff endpoints
      await api.post('staff/appointments/', newAppt);
      const apptRes = await api.get('staff/appointments/'); 
      setAppointments(apptRes.data); 
      setIsAddModalOpen(false); 
      setNewAppt({ client: '', advocate: '', appointment_date: '', appointment_time: '', duration: '30 Mins', purpose: '' });
      showAlert("default", "New appointment booked!");
    } catch (error) { showAlert("destructive", "Failed to create appointment."); } finally { setProcessingId(null); }
  };

  const openRescheduleModal = (appt) => { setSelectedAppt(appt); setNewDate(appt.appointment_date); setNewTime(appt.appointment_time); setIsRescheduleModalOpen(true); };

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || appt.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-zinc-900 w-8 h-8" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      
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

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          {alertInfo.show && (
            <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm border-zinc-200">
              {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white rounded-lg border border-zinc-200 shadow-sm text-zinc-700 hover:bg-zinc-50"><Menu size={20} /></button>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Appointments</h1>
                <p className="text-zinc-500 text-sm mt-1">Manage schedules, approve bookings, and coordinate clients.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
                <input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 pl-4 pr-10 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer appearance-none">
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
                <Plus className="w-4 h-4" /> New Booking
              </button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-5">Client details</th><th className="p-5">Schedule</th><th className="p-5">Assigned To</th><th className="p-5">Status</th><th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="p-5">
                        <div className="font-bold text-zinc-900 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border"><User className="w-4 h-4 text-zinc-500" /></div>{appt.client?.full_name || 'Unknown Client'}</div>
                        <div className="text-zinc-500 text-xs mt-1 ml-10 flex items-center gap-1"><FileText className="w-3 h-3" />{appt.purpose}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-zinc-900 font-semibold"><CalendarDays className="w-4 h-4 text-zinc-400" />{new Date(appt.appointment_date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1"><Clock className="w-3 h-3" />{appt.appointment_time} • {appt.duration}</div>
                      </td>
                      <td className="p-5"><div className="flex items-center gap-2 text-zinc-600 font-medium"><Briefcase className="w-4 h-4" />{appt.advocate?.full_name || 'Unassigned'}</div></td>
                      <td className="p-5"><span className={`px-3 py-1 rounded-md text-xs font-bold border shadow-sm ${getStatusStyle(appt.status)}`}>{appt.status}</span></td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {appt.status === 'Pending' && <button onClick={() => handleStatusChange(appt.id, 'Confirmed')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-4 h-4" /></button>}
                          {appt.status !== 'Cancelled' && appt.status !== 'Completed' && <button onClick={() => openRescheduleModal(appt)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CalendarClock className="w-4 h-4" /></button>}
                          {appt.status !== 'Cancelled' && <button onClick={() => handleStatusChange(appt.id, 'Cancelled')} className="p-2 bg-red-50 text-red-600 rounded-lg"><XCircle className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50"><h3 className="text-xl font-bold">Schedule Appointment</h3></div>
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-xs font-bold text-zinc-500 uppercase">Client</label><select value={newAppt.client} onChange={(e) => setNewAppt({...newAppt, client: e.target.value})} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required><option value="">Select...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></div>
                <div className="col-span-2"><label className="text-xs font-bold text-zinc-500 uppercase">Advocate ID</label><input type="number" value={newAppt.advocate} onChange={(e) => setNewAppt({...newAppt, advocate: e.target.value})} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required /></div>
                <div><label className="text-xs font-bold text-zinc-500 uppercase">Date</label><input type="date" value={newAppt.appointment_date} onChange={(e) => setNewAppt({...newAppt, appointment_date: e.target.value})} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required /></div>
                <div><label className="text-xs font-bold text-zinc-500 uppercase">Time</label><input type="time" value={newAppt.appointment_time} onChange={(e) => setNewAppt({...newAppt, appointment_time: e.target.value})} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required /></div>
                <div className="col-span-2"><label className="text-xs font-bold text-zinc-500 uppercase">Purpose</label><textarea value={newAppt.purpose} onChange={(e) => setNewAppt({...newAppt, purpose: e.target.value})} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required /></div>
              </div>
              <div className="flex gap-3"><button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold">Cancel</button><button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">{processingId === 'creating' ? <Loader2 className="animate-spin mx-auto w-4 h-4"/> : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESCHEDULE MODAL --- */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50"><h3 className="text-xl font-bold">Reschedule</h3></div>
            <form onSubmit={handleReschedule} className="p-6 space-y-5">
              <div><label className="text-xs font-bold text-zinc-500 uppercase">New Date</label><input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required /></div>
              <div><label className="text-xs font-bold text-zinc-500 uppercase">New Time</label><input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full mt-1.5 p-3 bg-zinc-50 border rounded-xl" required /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold">Cancel</button><button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold">{processingId === selectedAppt?.id ? <Loader2 className="animate-spin mx-auto w-4 h-4"/> : 'Confirm Update'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManage;