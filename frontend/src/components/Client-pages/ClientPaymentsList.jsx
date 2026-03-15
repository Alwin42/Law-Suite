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
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 p-4 sm:p-8 md:p-12 mt-19 pt-20 md:pt-16">
      <div className="max-w-5xl mx-auto">
        
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 md:mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Receipt className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" /> Billing & Payments
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-2">Track your legal expenses and manage outstanding invoices.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 md:gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="text-amber-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center mt-1">
                <IndianRupee className="w-5 h-5 md:w-6 md:h-6 mr-1 text-slate-400 shrink-0" /> {outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 md:gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center mt-1">
                <IndianRupee className="w-5 h-5 md:w-6 md:h-6 mr-1 text-slate-400 shrink-0" /> {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-base md:text-lg text-slate-800">Payment History</h3>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
              </div>
              <p className="text-sm md:text-base text-slate-500 font-medium">No billing records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(payment => (
                <div key={payment.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                      <h4 className="font-bold text-base md:text-lg text-slate-900 truncate">{payment.title || "Legal Services"}</h4>
                      
                      {payment.status === 'Completed' && (
                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle size={12} /> Paid
                        </span>
                      )}
                      {payment.status === 'Pending' && (
                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] md:text-xs font-bold flex items-center gap-1 shrink-0">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Due: {new Date(payment.due_date).toLocaleDateString()}</span>
                      {payment.payment_mode && payment.status === 'Completed' && (
                        <>
                          <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>Via {payment.payment_mode}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 sm:w-auto w-full border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                    <div className="text-lg md:text-xl font-black text-slate-900 flex items-center">
                      <IndianRupee size={16} className="mr-0.5 text-slate-500 md:w-[18px] md:h-[18px]" />{payment.amount}
                    </div>
                    
                    {payment.status === 'Pending' && (
                      <button 
                        onClick={() => navigate(`/pay/${payment.id}`)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 md:px-5 py-2 md:py-2.5 bg-slate-900 text-white font-bold text-sm md:text-base rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all"
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