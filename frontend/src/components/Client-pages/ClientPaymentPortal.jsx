import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { 
  CreditCard, Loader2, CheckCircle, ShieldCheck, 
  IndianRupee, QrCode, AlertCircle, ArrowLeft 
} from 'lucide-react';

const ClientPaymentPortal = () => {
  const { paymentId } = useParams(); 
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); 

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`payments/public/${paymentId}/`); 
        setInvoice(response.data);
        if (response.data.status === 'Completed' || response.data.status === 'Paid') {
          setPaymentStatus('success');
        }
      } catch (error) {
        console.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [paymentId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      alert("Payment gateway failed to load. Please check your connection.");
      setProcessing(false);
      return;
    }

    try {
      const orderRes = await api.post('payments/create-order/', { 
        amount: invoice.amount,
        payment_record_id: invoice.id 
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_TEST_KEY_ID_HERE",
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Law Suite Services",
        description: invoice.title,
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            await api.post('payments/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_record_id: invoice.id
            });
            
            setPaymentStatus('success');
          } catch (err) {
            setPaymentStatus('failed');
          }
        },
        theme: { color: "#0f172a" } 
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setPaymentStatus('failed');
      });
      rzp.open();

    } catch (error) {
      alert("Could not initiate payment. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;
  }

  if (!invoice) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center text-slate-500 px-4 text-center">Invoice not found or link is invalid.</div>;
  }

  const generateQrUrl = () => {
    if (!invoice.upi_id) return null;
    const encodedTitle = encodeURIComponent(invoice.title);
    const upiString = `upi://pay?pa=${invoice.upi_id}&pn=Advocate&am=${invoice.amount}&cu=INR&tn=${encodedTitle}`;
    return `https://quickchart.io/qr?size=250&text=${encodeURIComponent(upiString)}`;
  };

  const qrImageUrl = generateQrUrl();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans py-8 md:py-10">
      
      {/* Top Back Button (Hidden during printing) */}
      <div className="w-full max-w-2xl mb-4 print:hidden">
         <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
         </button>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:bg-transparent">
        
        {/* Header (Hidden during printing) */}
        <div className="bg-slate-900 p-5 md:p-6 text-center print:hidden">
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">Law Suite</h1>
          <p className="text-slate-300 text-sm md:text-base mt-1">Secure Client Payment Portal</p>
        </div>

        <div className="p-5 md:p-8 print:p-0">
          
          {/* ================= SUCCESS STATE & RECEIPT ================= */}
          {paymentStatus === 'success' ? (
            <div className="py-2 animate-in fade-in">
              
              {/* Screen View Message & Buttons (Hidden on PDF) */}
              <div className="text-center print:hidden mb-10">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Payment Successful</h2>
                <p className="text-slate-500 text-xs md:text-sm mb-6">
                  Your payment has been securely processed and recorded.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => window.print()} 
                    className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Download Receipt
                  </button>
                  <button 
                    onClick={() => navigate('/client/payments')} 
                    className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>

              {/* The Actual Receipt (Visible on screen and paper) */}
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm print:shadow-none print:border-none print:p-0">
                
                {/* Receipt Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">Law Suite</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Official Receipt</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">Receipt #{invoice.id || Math.floor(Math.random() * 10000)}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Billed To:</span>
                    <span className="font-bold text-slate-900">{invoice.client_name || "Client Name"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Description:</span>
                    {/* FIXED: Removed max-w-[200px] and used canonical max-w-50 */}
                    <span className="font-semibold text-slate-900 text-right max-w-50 truncate">
                      {invoice.title || "Legal Consultation & Services"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Payment Status:</span>
                    <span className="font-bold text-emerald-600 uppercase tracking-wider text-xs bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">Paid</span>
                  </div>

                  {invoice.case_title && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Case Reference:</span>
                      <span className="font-semibold text-slate-900">{invoice.case_title}</span>
                    </div>
                  )}
                </div>

                {/* Total Row */}
                <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-2">
                  <span className="font-black text-slate-900 uppercase tracking-widest">Total Paid</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    ₹{parseFloat(invoice.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                
                {/* Footer Note */}
                <div className="mt-12 text-center text-xs text-slate-400 font-mono uppercase tracking-widest print:block hidden">
                  This is a computer-generated receipt and requires no signature.
                </div>
                
              </div>
            </div>
          
          ) : paymentStatus === 'failed' ? (
            /* ================= FAILED STATE ================= */
            <div className="text-center py-10 animate-in fade-in">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                Unfortunately, your transaction could not be completed. Your card was not charged.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setPaymentStatus(null)} 
                  className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Go Back
                </button>
              </div>
            </div>

          ) : (
            /* ================= PENDING STATE (PAYMENT OPTIONS) ================= */
            <div className="max-w-md mx-auto">
              {/* Invoice Details */}
              <div className="mb-6 md:mb-8 text-center">
                <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Details</p>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">{invoice.title}</h2>
                <div className="flex justify-center items-center text-slate-500 text-xs md:text-sm mt-2">
                  <span>Due by: {new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 md:p-5 mb-6 md:mb-8 flex items-center justify-between border border-slate-200 shadow-inner">
                <span className="font-semibold text-sm md:text-base text-slate-700">Total Amount Due</span>
                <span className="text-2xl md:text-3xl font-black text-slate-900 flex items-center tracking-tighter">
                  <IndianRupee className="w-5 h-5 md:w-6 md:h-6 mr-1" />{parseFloat(invoice.amount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Razorpay Option */}
              <button 
                onClick={handlePayment} 
                disabled={processing}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm md:text-base flex justify-center items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-70 shadow-md"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Pay via Cards / NetBanking</>}
              </button>

              <div className="mt-3 mb-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                <span className="text-center">Payments are encrypted and processed by Razorpay</span>
              </div>

              {/* Visual Divider */}
              <div className="relative flex py-4 md:py-5 items-center">
                {/* FIXED: Replaced flex-grow with canonical grow */}
                <div className="grow border-t border-slate-200"></div>
                {/* FIXED: Replaced flex-shrink-0 with canonical shrink-0 */}
                <span className="shrink-0 mx-4 text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wider">OR</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              {/* UPI QR Option */}
              {invoice.upi_id ? (
                <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 text-center shadow-sm">
                  <div className="flex justify-center items-center gap-2 mb-4 text-slate-700 font-bold text-sm md:text-base">
                    <QrCode className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                    <span>Scan & Pay with UPI Apps</span>
                  </div>
                  
                  <img 
                    src={qrImageUrl} 
                    alt="UPI QR Code" 
                    className="mx-auto rounded-xl shadow-sm border border-slate-200 bg-white p-2 w-40 h-40 md:w-48 md:h-48 mb-4 transition-transform hover:scale-105" 
                  />
                  
                  <p className="text-xs md:text-sm text-slate-500">
                    Scan using GPay, PhonePe, or Paytm.<br/>
                    <span className="mt-2 block">
                      UPI ID: <strong className="text-slate-900 tracking-wide break-all">{invoice.upi_id}</strong>
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs md:text-sm text-slate-400 italic">Direct UPI payment is not configured by the advocate.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPaymentPortal;