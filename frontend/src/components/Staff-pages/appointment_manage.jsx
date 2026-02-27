import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarDays, Clock, User, CheckCircle, 
  XCircle, CalendarClock, Loader2, Search, Filter
} from 'lucide-react';

const AppointmentManage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Reschedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Fetch all appointments (Requires staff token)
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Pointing to a staff-specific or general appointment endpoint
      const response = await axios.get('http://127.0.0.1:8000/api/appointments/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Status Changes (Confirm, Cancel, Complete)
  const handleStatusChange = async (id, newStatus) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`http://127.0.0.1:8000/api/appointments/${id}/`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state to reflect change instantly
      setAppointments(appointments.map(appt => 
        appt.id === id ? { ...appt, status: newStatus } : appt
      ));
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setNewDate(appt.appointment_date);
    setNewTime(appt.appointment_time);
    setIsModalOpen(true);
  };

  // Submit Reschedule
  const handleReschedule = async (e) => {
    e.preventDefault();
    setProcessingId(selectedAppt.id);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`http://127.0.0.1:8000/api/appointments/${selectedAppt.id}/`, 
        { 
          appointment_date: newDate, 
          appointment_time: newTime,
          status: 'Pending' // Usually rescheduling resets it to pending
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchAppointments(); // Refresh list
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to reschedule.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtering Logic
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          appt.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper for Status Badge Colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-zinc-900 w-8 h-8" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Appointment Management</h1>
          <p className="text-zinc-500 text-sm mt-1">View, reschedule, and manage client bookings.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-zinc-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search clients or purpose..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                <tr>
                  <th className="p-4">Client & Purpose</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Advocate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        {appt.client?.full_name || 'Unknown Client'}
                      </div>
                      <div className="text-zinc-500 text-xs mt-1 line-clamp-1">{appt.purpose}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-zinc-800 font-medium">
                        <CalendarDays className="w-4 h-4 text-zinc-400" />
                        {appt.appointment_date}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appt.appointment_time} ({appt.duration})
                      </div>
                    </td>
                    <td className="p-4 text-zinc-600">{appt.advocate?.full_name || 'Not assigned'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {appt.status === 'Pending' && (
                          <button 
                            onClick={() => handleStatusChange(appt.id, 'Confirmed')}
                            disabled={processingId === appt.id}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                          <button 
                            onClick={() => openRescheduleModal(appt)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Reschedule"
                          >
                            <CalendarClock className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && (
                          <button 
                            onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                            disabled={processingId === appt.id}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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

      {/* Reschedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900">Reschedule Appointment</h3>
              <p className="text-sm text-zinc-500 mt-1">Select a new date and time for {selectedAppt?.client?.full_name}</p>
            </div>
            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">New Date</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">New Time</label>
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processingId === selectedAppt?.id}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-black hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2"
                >
                  {processingId === selectedAppt?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Change'}
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