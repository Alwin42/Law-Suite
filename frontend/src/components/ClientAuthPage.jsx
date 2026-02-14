import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button"; // Manual Button
import { Input } from "./ui/input";   // Manual Input
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, MapPin, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { registerClient, requestOTP, verifyOTP } from "../api";

const ClientAuthPage = () => {
  const [view, setView] = useState("LOGIN"); // "LOGIN" | "REGISTER"
  const [step, setStep] = useState(1);       // 1 = Email, 2 = OTP (For Login)
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // --- 1. HANDLE REGISTRATION (No Password) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Construct payload
    const payload = {
        username: data.username, // Using email or specific username
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        contact_number: data.contact_number,
        address: data.address,
        notes: data.notes
    };

    try {
        await registerClient(payload);
        alert("Registration Successful! Please login with your email.");
        setView("LOGIN");
    } catch (err) {
        alert("Registration failed. Email or Username might be taken.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- 2. HANDLE LOGIN STEP 1 (Request OTP) ---
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await requestOTP(email);
        setStep(2); // Move to OTP input
        alert(`OTP sent to ${email} (Check backend console)`);
    } catch (err) {
        alert("Client not found or error sending OTP.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- 3. HANDLE LOGIN STEP 2 (Verify OTP) ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const otp = formData.get("otp");

    try {
        const response = await verifyOTP({ email, otp });
        
        // Save tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('user_name', response.data.full_name);
        
        navigate('/client-dashboard');
    } catch (err) {
        alert("Invalid OTP.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="h-2 w-full bg-emerald-600" /> {/* Different color for Clients */}
        
        <div className="p-8">
            <div className="text-center mb-8">
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
                                <Button disabled={isLoading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                                    {isLoading ? "Sending OTP..." : "Get OTP Code"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="text-center text-sm text-slate-500 mb-4">
                                    Enter code sent to <strong>{email}</strong>
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
                        setError("");
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
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon size={16} />
    </div>
    <Input className="pl-10 border-slate-200 focus:ring-emerald-500" {...props} />
  </div>
);

export default ClientAuthPage;