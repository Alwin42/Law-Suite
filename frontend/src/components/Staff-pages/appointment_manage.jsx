import React, { useState, useEffect } from 'react';
import api from '../api'; // <-- Using centralized API
import { 
  CalendarDays, Clock, User, CheckCircle, 
  XCircle, CalendarClock, Loader2, Search, Plus, FileText, Briefcase,
  AlertCircle // <-- Added for error alerts
} from 'lucide-react';

// <-- Import Alert Components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AppointmentManage = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]); // To populate the dropdown
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Form States
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  
  const [newAppt, setNewAppt] = useState({
    client: '',
    advocate: '', 
    appointment_date: '',
    appointment_time: '',
    duration: '30 Mins',
    purpose: ''
  });

  // --- NEW: Alert State ---
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  // --- NEW: Helper function to trigger alerts and auto-hide them ---
  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Appointments using API instance (no manual token needed)
      const apptRes = await api.get('appointments/');
      setAppointments(apptRes.data);

      // Fetch Clients for the dropdown
      try {
        const clientRes = await api.get('clients/');
        setClients(clientRes.data);
      } catch (clientErr) {
        console.warn("Could not load clients list. Please ensure the endpoint exists.");
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("destructive", "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleStatusChange = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await api.patch(`appointments/${id}/`, { status: newStatus });
      
      setAppointments(appointments.map(appt => 
        appt.id === id ? { ...appt, status: newStatus } : appt
      ));
      showAlert("default", `Appointment status updated to ${newStatus}.`);
    } catch (error) {
      showAlert("destructive", "Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setProcessingId(selectedAppt.id);
    try {
      await api.patch(`appointments/${selectedAppt.id}/`, { 
        appointment_date: newDate, 
        appointment_time: newTime,
        status: 'Pending'
      });
      
      fetchData(); 
      setIsRescheduleModalOpen(false);
      showAlert("default", "Appointment successfully rescheduled.");
    } catch (error) {
      showAlert("destructive", "Failed to reschedule appointment.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setProcessingId('creating');
    try {
      await api.post('appointments/', newAppt);
      
      fetchData(); // Refresh list
      setIsAddModalOpen(false);
      setNewAppt({ client: '', advocate: '', appointment_date: '', appointment_time: '', duration: '30 Mins', purpose: '' });
      showAlert("default", "New appointment successfully booked!");
    } catch (error) {
      showAlert("destructive", "Failed to create appointment. Please check required fields.");
      console.error(error.response?.data);
    } finally {
      setProcessingId(null);
    }
  };

  // --- HELPERS & FILTERS ---

  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setNewDate(appt.appointment_date);
    setNewTime(appt.appointment_time);
    setIsRescheduleModalOpen(true);
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          appt.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200 shadow-red-100';
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-zinc-900 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-zinc-50/30 min-h-screen">
      
      {/* --- ALERT NOTIFICATION BAR --- */}
      {alertInfo.show && (
        <div className="mt-9 mb-6">
          <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm border-zinc-200">
            {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>
              {alertInfo.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* HEADER */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5 animate-in fade-in slide-in-from-top-4 duration-500 ${!alertInfo.show ? 'mt-9' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Appointments</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage schedules, approve bookings, and coordinate clients.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search clients or purpose..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 pl-4 pr-10 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Booking
          </button>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-700">
        {filteredAppointments.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <CalendarClock className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No appointments found</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm">There are no appointments matching your current filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-5">Client details</th>
                  <th className="p-5">Schedule</th>
                  <th className="p-5">Assigned To</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-zinc-900 flex items-center gap-2 text-base">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                          <User className="w-4 h-4 text-zinc-500" />
                        </div>
                        {appt.client?.full_name || 'Unknown Client'}
                      </div>
                      <div className="text-zinc-500 text-xs mt-1.5 ml-10 flex items-center gap-1.5 truncate max-w-[200px]">
                        <FileText className="w-3 h-3" />
                        {appt.purpose}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                        <CalendarDays className="w-4 h-4 text-zinc-400" />
                        {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {appt.appointment_time} • {appt.duration}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-zinc-600 font-medium">
                        <Briefcase className="w-4 h-4 text-zinc-400" />
                        {appt.advocate?.full_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold border shadow-sm ${getStatusStyle(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {appt.status === 'Pending' && (
                          <button 
                            onClick={() => handleStatusChange(appt.id, 'Confirmed')}
                            disabled={processingId === appt.id}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                          <button 
                            onClick={() => openRescheduleModal(appt)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                            title="Reschedule"
                          >
                            <CalendarClock className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && (
                          <button 
                            onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                            disabled={processingId === appt.id}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD APPOINTMENT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="text-xl font-bold text-zinc-900">Schedule Appointment</h3>
              <p className="text-sm text-zinc-500 mt-1">Create a new booking in the system.</p>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Client</label>
                  <select 
                    value={newAppt.client}
                    onChange={(e) => setNewAppt({...newAppt, client: e.target.value})}
                    className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* NOTE: You may need to fetch advocates dynamically. Using an ID input as a robust fallback for now */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Advocate ID</label>
                  <input 
                    type="number"
                    placeholder="Enter Advocate User ID"
                    value={newAppt.advocate}
                    onChange={(e) => setNewAppt({...newAppt, advocate: e.target.value})}
                    className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" 
                    value={newAppt.appointment_date}
                    onChange={(e) => setNewAppt({...newAppt, appointment_date: e.target.value})}
                    className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Time</label>
                  <input 
                    type="time" 
                    value={newAppt.appointment_time}
                    onChange={(e) => setNewAppt({...newAppt, appointment_time: e.target.value})}
                    className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration</label>
                  <select 
                    value={newAppt.duration}
                    onChange={(e) => setNewAppt({...newAppt, duration: e.target.value})}
                    className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  >
                    <option value="15 Mins">15 Minutes</option>
                    <option value="30 Mins">30 Minutes</option>
                    <option value="45 Mins">45 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Purpose</label>
                  <textarea 
                    rows="3"
                    value={newAppt.purpose}
                    onChange={(e) => setNewAppt({...newAppt, purpose: e.target.value})}
                    className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                    placeholder="Brief description of the appointment..."
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processingId === 'creating'}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-black/10"
                >
                  {processingId === 'creating' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESCHEDULE MODAL --- */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="text-xl font-bold text-zinc-900">Reschedule</h3>
              <p className="text-sm text-zinc-500 mt-1">Select a new date and time for <span className="font-semibold text-zinc-900">{selectedAppt?.client?.full_name}</span></p>
            </div>
            <form onSubmit={handleReschedule} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Date</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Time</label>
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processingId === selectedAppt?.id}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-black/10"
                >
                  {processingId === selectedAppt?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentManage;