import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button"; 
import { Input } from "../ui/input";   
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, MapPin, FileText, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react"; // <-- Added Alert Icons
import { registerClient, requestOTP, verifyOTP } from "../../api";

// <-- Import Alert Components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ClientAuthPage = () => {
  const [view, setView] = useState("LOGIN"); 
  const [step, setStep] = useState(1);       
  const [isLoading, setIsLoading] = useState(false);
  
  // <-- Replaced old error state with new alert state
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });
  
  // Pull previous email from local storage if it exists
  const [email, setEmail] = useState(() => localStorage.getItem("last_client_email") || "");
  const navigate = useNavigate();

  // <-- Helper function to trigger alerts and auto-hide them
  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertInfo({ show: false, type: 'default', message: '' }); // Clear previous alerts
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const payload = {
        username: data.username, 
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        contact_number: data.contact_number,
        address: data.address,
        notes: data.notes
    };

    try {
        await registerClient(payload);
        showAlert("default", "Registration Successful! Please login with your email."); // <-- Replaced native alert
        setView("LOGIN");
    } catch (err) {
        showAlert("destructive", "Registration failed. Email or Username might be taken."); // <-- Replaced error text
    } finally {
        setIsLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertInfo({ show: false, type: 'default', message: '' }); // Clear previous alerts
    
    try {
        await requestOTP(email);
        // Save email for future visits
        localStorage.setItem("last_client_email", email);
        setStep(2); 
    } catch (err) {
        showAlert("destructive", "Client not found or error sending OTP."); // <-- Replaced error text
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertInfo({ show: false, type: 'default', message: '' }); // Clear previous alerts
    const formData = new FormData(e.target);
    const otp = formData.get("otp");

    try {
        const response = await verifyOTP({ email, otp });
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('user_name', response.data.full_name);
        
        navigate('/client-dashboard');
    } catch (err) {
        showAlert("destructive", "Invalid or expired OTP."); // <-- Replaced error text
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="h-2 w-full bg-emerald-600" /> 
        
        <div className="p-8">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {view === "LOGIN" ? "Client Secure Login" : "New Client Registration"}
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    {view === "LOGIN" ? "Access your case files via OTP." : "Join Law Suite to manage your cases."}
                </p>
            </div>

            {/* --- ALERT NOTIFICATION BAR --- */}
            {alertInfo.show && (
              <div className="mb-4">
                <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-2 bg-white shadow-sm border-slate-200">
                  {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
                  <AlertDescription>
                    {alertInfo.message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <AnimatePresence mode="wait">
                {view === "LOGIN" ? (
                    <motion.div key="login" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity:0}}>
                        {step === 1 ? (
                            <form onSubmit={handleRequestOTP} className="space-y-4">
                                <InputGroup 
                                    icon={Mail} 
                                    type="email" 
                                    placeholder="Enter your registered email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                                <Button disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-800 text-white">
                                    {isLoading ? "Sending OTP..." : "Get OTP Code"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="text-center text-sm text-slate-500 mb-4">
                                    Enter code sent to <strong className="text-slate-900">{email}</strong>
                                </div>
                                <InputGroup icon={ShieldCheck} name="otp" placeholder="6-Digit OTP" required />
                                <Button disabled={isLoading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                                    {isLoading ? "Verifying..." : "Access Dashboard"}
                                </Button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-slate-400 hover:text-emerald-700 mt-2">
                                    Wrong email? Go back
                                </button>
                            </form>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="register" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity:0}}>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup icon={User} name="first_name" placeholder="First Name" required />
                                <InputGroup icon={User} name="last_name" placeholder="Last Name" required />
                            </div>
                            <InputGroup icon={User} name="username" placeholder="Username (Unique ID)" required />
                            <InputGroup icon={Mail} name="email" type="email" placeholder="Email Address" required />
                            <InputGroup icon={Phone} name="contact_number" placeholder="Phone Number" required />
                            <InputGroup icon={MapPin} name="address" placeholder="Full Address" required />
                            <InputGroup icon={FileText} name="notes" placeholder="Case Notes (Optional)" />
                            
                            <Button disabled={isLoading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white mt-2">
                                {isLoading ? "Registering..." : "Register Client"}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-6 text-center pt-6 border-t border-slate-100">
                <button 
                    onClick={() => {
                        setView(view === "LOGIN" ? "REGISTER" : "LOGIN");
                        setStep(1);
                        setAlertInfo({ show: false, type: 'default', message: '' }); // Clear alerts when toggling
                    }}
                    className="text-sm font-medium text-emerald-700 hover:underline"
                >
                    {view === "LOGIN" ? "New here? Register Account" : "Already registered? Secure Login"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-700 transition-colors">
      <Icon size={16} />
    </div>
    <Input className="pl-10 border-slate-200 focus:ring-emerald-500" {...props} />
  </div>
);

export default ClientAuthPage;