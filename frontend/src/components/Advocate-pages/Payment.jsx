import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- NEW: Imported useNavigate
import api from '../../api';
import { 
  CreditCard, QrCode, Trash2, Save, 
  History, Plus, Edit, Loader2, IndianRupee, Mail, AlertCircle, CheckCircle, ArrowLeft, X // <-- NEW: Added ArrowLeft and X
} from 'lucide-react';

// <-- Import Alert & Button Components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // <-- NEW: Imported Button

const PaymentManage = () => {
  const navigate = useNavigate(); // <-- NEW: Initialized navigate

  // --- STATE ---
  const [upiId, setUpiId] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPayments, setClientPayments] = useState([]);
  
  // Processing & Form States
  const [processingId, setProcessingId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ title: '', amount: '', due_date: '' });

  // --- Alert State ---
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  // --- Helper function to trigger alerts and auto-hide them ---
  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchAdvocateProfile(); 
    fetchClients();
  }, []);

  const fetchAdvocateProfile = async () => {
    try {
      const response = await api.get('user/profile/');
      if (response.data.upi_id) {
        setUpiId(response.data.upi_id);
      }
    } catch (error) {
      console.error("Error fetching advocate profile:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('clients/');
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DATABASE UPI ID MANAGEMENT ---
  const handleSaveUpi = async () => {
    if (!upiId) {
      return showAlert("destructive", "Please enter a valid UPI ID");
    }
    
    try {
      await api.patch('user/profile/', { upi_id: upiId });
      showAlert("default", "UPI ID Saved! This will be used for all future payment requests.");
    } catch (error) {
      console.error("Error saving UPI ID:", error);
      showAlert("destructive", "Failed to save UPI ID to database.");
    }
  };

  const handleDeleteUpi = async () => {
    try {
      await api.patch('user/profile/', { upi_id: "" });
      setUpiId('');
      showAlert("default", "UPI ID Removed from Database.");
    } catch (error) {
      console.error("Error deleting UPI ID:", error);
      showAlert("destructive", "Failed to remove UPI ID from database.");
    }
  };

  // --- ACTIONS: ADD PAYMENT REQUEST ---
  const openAddModal = (client) => {
    if (!upiId) {
      return showAlert("destructive", "Please save your UPI ID in the configuration box first before requesting payments.");
    }
    setSelectedClient(client);
    setPaymentForm({ title: 'Legal Consultation Fee', amount: '', due_date: '' });
    setIsAddModalOpen(true);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setProcessingId('sending');
    try {
      await api.post('payments/request-upi/', {
        client_id: selectedClient.id,
        title: paymentForm.title,
        amount: paymentForm.amount,
        due_date: paymentForm.due_date,
        upi_id: upiId 
      });
      
      showAlert("default", "Payment Request & QR Code sent to client's email!");
      setIsAddModalOpen(false);
    } catch (error) {
      showAlert("destructive", "Failed to send request.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- ACTIONS: HISTORY, UPDATE, DELETE ---
  const openHistoryModal = async (client) => {
    setSelectedClient(client);
    setIsHistoryModalOpen(true);
    fetchClientPayments(client.id);
  };

  const fetchClientPayments = async (clientId) => {
    setProcessingId('fetching_history');
    try {
      const response = await api.get(`clients/${clientId}/payments/`);
      setClientPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      await api.patch(`payments/${paymentId}/`, { status: newStatus });
      setClientPayments(clientPayments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
      showAlert("default", `Payment status updated to ${newStatus}`);
    } catch (error) {
      showAlert("destructive", "Failed to update status");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await api.delete(`payments/${paymentId}/`);
      setClientPayments(clientPayments.filter(p => p.id !== paymentId));
      showAlert("default", "Payment record deleted.");
    } catch (error) {
      showAlert("destructive", "Failed to delete payment");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    // FIXED: Adjusted padding to scale from mobile to desktop securely
    <div className="p-4 sm:p-8 md:p-12 mt-19 pt-20 max-w-7xl mx-auto font-sans bg-zinc-50/30 min-h-screen">
      
      {/* --- RESPONSIVE BACK BUTTON --- */}
      <Button 
        variant="ghost" 
        className="mb-4 sm:mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 w-fit transition-colors -ml-2 sm:-ml-4" 
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      {/* --- ALERT NOTIFICATION BAR --- */}
      {alertInfo.show && (
        <div className="mb-6">
          <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm border-zinc-200">
            {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>
              {alertInfo.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="mb-8 animate-in fade-in slide-in-from-top-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
          <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-black shrink-0" /> Payment Management
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Configure your UPI ID and issue digital payment requests to clients.</p>
      </div>

      {/* UPI CONFIGURATION CARD */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" /> Receiving UPI ID
          </h3>
          <p className="text-sm text-zinc-500 mt-1">Payments from QR codes will be routed to this UPI address.</p>
        </div>
        
        {/* FIXED: Input fields stretch to 100% width on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="e.g., advocate@okhdfcbank" 
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="flex-1 md:w-80 px-3 sm:px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm sm:text-base"
          />
          <button onClick={handleSaveUpi} className="p-2.5 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10 shrink-0" title="Save UPI ID">
            <Save className="w-5 h-5" />
          </button>
          <button onClick={handleDeleteUpi} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100 shrink-0" title="Remove UPI ID">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CLIENT LIST TABLE */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px] sm:min-w-full">
          <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4 sm:p-5">Client Name</th>
              <th className="p-4 sm:p-5">Contact & Email</th>
              <th className="p-4 sm:p-5 text-right">Payment Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-900 text-sm sm:text-base">{client.full_name}</td>
                <td className="p-4 sm:p-5">
                  <div className="text-zinc-800 font-medium">{client.contact_number}</div>
                  <div className="text-zinc-500 text-xs mt-1 truncate max-w-[150px] sm:max-w-xs">{client.email}</div>
                </td>
                <td className="p-4 sm:p-5 text-right">
                  <div className="flex justify-end gap-2 sm:gap-3">
                    <button 
                      onClick={() => openHistoryModal(client)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-zinc-100 text-zinc-700 font-bold rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm"
                    >
                      <History className="w-4 h-4" /> <span className="hidden sm:inline">History</span>
                    </button>
                    <button 
                      onClick={() => openAddModal(client)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold rounded-lg hover:bg-indigo-100 transition-colors text-xs sm:text-sm"
                    >
                      <Plus className="w-4 h-4" /> Request
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan="3" className="p-10 text-center text-zinc-500">No clients found. Add a client to request payments.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD NEW PAYMENT REQUEST */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="text-xl font-bold text-zinc-900">Issue Payment Request</h3>
              <p className="text-sm text-zinc-500 mt-1">An email with a UPI QR Code will be sent to <span className="font-semibold">{selectedClient?.full_name}</span></p>
            </div>
            <form onSubmit={handleSendRequest} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Payment Title</label>
                <input required type="text" value={paymentForm.title} onChange={e => setPaymentForm({...paymentForm, title: e.target.value})} className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl" placeholder="e.g., Drafting Legal Notice" />
              </div>
              {/* FIXED: Inputs stack vertically on phones, side-by-side on sm+ screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Amount (₹)</label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
                    <input required type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full pl-9 pr-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl" placeholder="5000" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Last Date</label>
                  <input required type="date" value={paymentForm.due_date} onChange={e => setPaymentForm({...paymentForm, due_date: e.target.value})} className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-100 mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold text-zinc-600 hover:bg-zinc-200">Cancel</button>
                <button type="submit" disabled={processingId === 'sending'} className="flex-1 py-3 bg-black text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-black/10 hover:bg-zinc-800">
                  {processingId === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Invoice</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT HISTORY & MANAGEMENT */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900">{selectedClient?.full_name}'s Payments</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">Manage, update, and track payment statuses.</p>
              </div>
              {/* FIXED: Replaced absolute text with a proper icon button */}
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors shrink-0">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto bg-zinc-50/30 flex-1">
              {processingId === 'fetching_history' ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
              ) : clientPayments.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 flex flex-col items-center">
                  <AlertCircle className="w-8 h-8 mb-2 text-zinc-300" />
                  No payment history found for this client.
                </div>
              ) : (
                <div className="space-y-4">
                  {clientPayments.map(payment => (
                    // FIXED: Payment blocks adapt smoothly from column to row layout
                    <div key={payment.id} className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-sm">
                      
                      <div>
                        <div className="font-bold text-lg text-zinc-900">₹{payment.amount}</div>
                        <div className="text-xs text-zinc-500 mt-1">Due: {payment.payment_date}</div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Status Dropdown */}
                        <select 
                          value={payment.status}
                          onChange={(e) => handleStatusUpdate(payment.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg border focus:outline-none cursor-pointer w-full sm:w-auto
                            ${payment.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              payment.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              'bg-red-50 text-red-700 border-red-200'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Canceled / Failed</option>
                        </select>

                        {/* Actions */}
                        <button onClick={() => handleDeletePayment(payment.id)} className="p-2 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 shrink-0" title="Delete Invoice">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentManage;