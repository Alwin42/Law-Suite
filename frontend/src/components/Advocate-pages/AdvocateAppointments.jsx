import React, { useState, useEffect } from 'react';
import { getAdvocateAppointments, updateAppointmentStatus } from '../../api'; // <-- Added new API import
import { 
  Calendar, Clock, User, Phone, Mail, FileText, 
  CheckCircle, XCircle, Eye, Loader2, CheckSquare 
} from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

export default function AdvocateAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getAdvocateAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle Status Updates ---
  const handleStatusUpdate = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      await updateAppointmentStatus(id, { status: newStatus });
      
      // Instantly update the UI table
      setAppointments(prev => prev.map(appt => 
        appt.id === id ? { ...appt, status: newStatus } : appt
      ));
      
      // Update the modal if it is currently open
      if (selectedAppt && selectedAppt.id === id) {
        setSelectedAppt({ ...selectedAppt, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update appointment status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function for Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your client consultations and schedules.</p>
        </div>

        {/* APPOINTMENTS TABLE */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No appointments scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appt) => (
                  <TableRow key={appt.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-slate-900">
                          <Calendar size={14} className="text-slate-400" />
                          {appt.appointment_date}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Clock size={14} className="text-slate-400" />
                          {appt.appointment_time}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{appt.client_name}</span>
                        <span className="text-xs text-slate-500">{appt.client_contact}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-slate-600">{appt.duration}</TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(appt.status)}>
                        {appt.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAppt(appt)}>
                        <Eye className="mr-2 h-4 w-4" /> Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* FULL DETAILS & STATUS MANAGER MODAL */}
      <Dialog open={!!selectedAppt} onOpenChange={() => setSelectedAppt(null)}>
        {selectedAppt && (
          <DialogContent className="sm:max-w-[550px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl flex justify-between items-center pr-4">
                Consultation Details
                <Badge variant="outline" className={getStatusColor(selectedAppt.status)}>
                  {selectedAppt.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Client Info Card */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client Information</h4>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <User size={16} className="text-slate-400" /> <span className="font-medium">{selectedAppt.client_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone size={16} className="text-slate-400" /> {selectedAppt.client_contact}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail size={16} className="text-slate-400" /> {selectedAppt.client_email}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Date & Time</p>
                  <p className="text-sm font-medium text-slate-900">{selectedAppt.appointment_date} at {selectedAppt.appointment_time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Duration</p>
                  <p className="text-sm font-medium text-slate-900">{selectedAppt.duration}</p>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <FileText size={14} /> Stated Purpose
                </p>
                <div className="bg-white p-3 rounded-md border border-slate-200 text-sm text-slate-700 leading-relaxed min-h-[80px]">
                  {selectedAppt.purpose}
                </div>
              </div>
            </div>

            {/* --- NEW: STATUS ACTION BUTTONS --- */}
            <DialogFooter className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-2 sm:justify-between items-center w-full">
              
              <div className="flex gap-2 w-full sm:w-auto">
                {selectedAppt.status === 'Pending' && (
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedAppt.id, 'Confirmed')}
                  >
                    Confirm Appointment
                  </Button>
                )}
                
                {['Pending', 'Confirmed'].includes(selectedAppt.status) && (
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate(selectedAppt.id, 'Cancelled')}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                )}
              </div>

              {/* The Green "Completed" Checkbox Button */}
              {['Pending', 'Confirmed'].includes(selectedAppt.status) && (
                <Button 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all"
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(selectedAppt.id, 'Completed')}
                >
                  <CheckSquare className="mr-2 h-4 w-4" /> Mark as Completed
                </Button>
              )}
            </DialogFooter>

          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}