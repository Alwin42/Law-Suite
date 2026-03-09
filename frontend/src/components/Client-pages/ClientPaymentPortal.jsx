import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api'; // Assuming this is your axios instance
import { CreditCard, Loader2, CheckCircle, ShieldCheck, IndianRupee, QrCode } from 'lucide-react';

const ClientPaymentPortal = () => {
  const { paymentId } = useParams(); // Gets the ID from the URL (e.g., /pay/123)
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'failed'

  useEffect(() => {
    // Fetch the specific invoice details when the client opens the link
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`payments/public/${paymentId}/`); // Adjusted to match the public path
        setInvoice(response.data);
        if (response.data.status === 'Completed') {
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
      // 1. Create Order on Django
      const orderRes = await api.post('payments/create-order/', { 
        amount: invoice.amount,
        payment_record_id: invoice.id 
      });

      // 2. Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_TEST_KEY_ID_HERE",
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Law Suite Services",
        description: invoice.title,
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            await api.post('payments/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_record_id: invoice.id
            });
            
            setPaymentStatus('success');
          } catch (err) {
            setPaymentStatus('failed');
            alert("Payment verification failed. Please contact your advocate.");
          }
        },
        theme: { color: "#1A1A1A" } // Your primary charcoal black
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
    return <div className="min-h-screen bg-background flex justify-center items-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  if (!invoice) {
    return <div className="min-h-screen bg-background flex justify-center items-center text-accent">Invoice not found or link is invalid.</div>;
  }

  // --- Generate the QR Code URL dynamically ---
  const generateQrUrl = () => {
    if (!invoice.upi_id) return null;
    const encodedTitle = encodeURIComponent(invoice.title);
    const upiString = `upi://pay?pa=${invoice.upi_id}&pn=Advocate&am=${invoice.amount}&cu=INR&tn=${encodedTitle}`;
    return `https://quickchart.io/qr?size=250&text=${encodeURIComponent(upiString)}`;
  };

  const qrImageUrl = generateQrUrl();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans py-10">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-center">
          <h1 className="text-xl font-bold text-gray-600 tracking-tight">Law Suite</h1>
          <p className="text-gray-700 text-lg mt-1">Secure Client Payment Portal</p>
        </div>

        <div className="p-8">
          {paymentStatus === 'success' ? (
            <div className="text-center py-6 animate-in fade-in">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Payment Successful</h2>
              <p className="text-accent text-sm mb-6">Your payment of ₹{invoice.amount} has been securely processed and recorded by your advocate.</p>
              <button onClick={() => window.print()} className="text-sm font-semibold text-primary hover:underline">
                Download Receipt
              </button>
            </div>
          ) : (
            <>
              {/* Invoice Details */}
              <div className="mb-8">
                <p className="text-sm font-bold text-accent uppercase tracking-wider mb-1">Invoice Details</p>
                <h2 className="text-xl font-bold text-primary">{invoice.title}</h2>
                <div className="flex items-center text-accent text-sm mt-2">
                  <span>Due by: {new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-secondary shadow-lg rounded-xl p-5 mb-8 flex items-center justify-between border border-gray-300">
                <span className="font-semibold ">Total Amount Due</span>
                <span className="text-2xl  font-bold text-primary flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />{invoice.amount}
                </span>
              </div>

              {/* Razorpay Option */}
              <button 
                onClick={handlePayment} 
                disabled={processing}
                className="w-full py-4 bg-black text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-70 shadow-lg shadow-primary/10"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Pay via Cards / NetBanking</>}
              </button>

              <div className="mt-3 mb-6 flex items-center justify-center gap-2 text-xs text-accent">
                <ShieldCheck className="w-4 h-4" />
                <span>Payments are encrypted and processed by Razorpay</span>
              </div>

              {/* Visual Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-accent text-sm font-medium uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* UPI QR Option */}
              {invoice.upi_id ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center shadow-sm">
                  <div className="flex justify-center items-center gap-2 mb-4 text-primary font-bold">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span>Scan & Pay with UPI Apps</span>
                  </div>
                  
                  <img 
                    src={qrImageUrl} 
                    alt="UPI QR Code" 
                    className="mx-auto rounded-xl shadow-sm border border-gray-200 bg-white p-2 w-48 h-48 mb-4 transition-transform hover:scale-105" 
                  />
                  
                  <p className="text-sm text-accent">
                    Scan using GPay, PhonePe, or Paytm.<br/>
                    <span className="mt-2 block">
                      UPI ID: <strong className="text-primary tracking-wide">{invoice.upi_id}</strong>
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-accent italic">Direct UPI payment is not configured by the advocate.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPaymentPortal;