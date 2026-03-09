import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { 
  CreditCard, Loader2, ArrowLeft, CheckCircle, 
  Clock, AlertCircle, IndianRupee, Receipt, ExternalLink 
} from 'lucide-react';

export default function ClientPaymentsList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // This matches the 'client/payments/' path in your urls.py
        const response = await api.get('client/payments/'); 
        setPayments(response.data);
      } catch (error) {
        console.error("Failed to load payment history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // --- FIXED: Added Fallbacks for Decimal strings and missing data ---
  const outstandingBalance = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const totalPaid = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Loading billing history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 p-4 sm:p-8 md:p-12 pt-16">
      <div className="max-w-5xl mx-auto">
        
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-600" /> Billing & Payments
          </h1>
          <p className="text-slate-500 mt-2">Track your legal expenses and manage outstanding invoices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="text-amber-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
              <h2 className="text-3xl font-black text-slate-900 flex items-center mt-1">
                <IndianRupee className="w-6 h-6 mr-1 text-slate-400" /> {outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
              <h2 className="text-3xl font-black text-slate-900 flex items-center mt-1">
                <IndianRupee className="w-6 h-6 mr-1 text-slate-400" /> {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800">Payment History</h3>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No billing records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(payment => (
                <div key={payment.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {/* FIXED: Standardized to 'title' to match your Payment Manage form */}
                      <h4 className="font-bold text-lg text-slate-900">{payment.title || "Legal Services"}</h4>
                      
                      {payment.status === 'Completed' && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Paid
                        </span>
                      )}
                      {payment.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      {/* FIXED: Uses due_date to match the Payment Model */}
                      <span>Due: {new Date(payment.due_date).toLocaleDateString()}</span>
                      {payment.payment_mode && payment.status === 'Completed' && (
                        <>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>Via {payment.payment_mode}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                    <div className="text-xl font-black text-slate-900 flex items-center">
                      <IndianRupee size={18} className="mr-0.5 text-slate-500" />{payment.amount}
                    </div>
                    
                    {/* Routes to /pay/:paymentId as defined in your App.jsx routes */}
                    {payment.status === 'Pending' && (
                      <button 
                        onClick={() => navigate(`/pay/${payment.id}`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        Pay Now <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}