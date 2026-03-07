import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button"; 
import { Input } from "../ui/input"; 
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Mail, Lock, User, ArrowRight, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { loginUser, registerAdvocate } from "../../api"; 

// --- NEW: Import Alert Components ---
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW: Unified Alert State ---
  const [alertInfo, setAlertInfo] = useState(null);
  
  const navigate = useNavigate();

  // Auto-hide success alerts after 5 seconds so they don't stay forever
  useEffect(() => {
    if (alertInfo?.variant === "default") {
      const timer = setTimeout(() => setAlertInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setAlertInfo(null); // Clear alerts when switching modes
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertInfo(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await loginUser(data);
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', response.data.role);
      localStorage.setItem('user_name', response.data.full_name);

      if (response.data.role === 'CLIENT') {
          navigate('/client-dashboard');
      } else {
          navigate('/dashboard'); 
      }
    } catch (err) {
      console.error("Login Error:", err);
      // --- NEW: Trigger Error Alert ---
      setAlertInfo({
        variant: "destructive",
        title: "Login Failed",
        desc: "Invalid username or password. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertInfo(null);

    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData);

    const payload = {
        username: rawData.username,
        email: rawData.email,
        password: rawData.password,
        contact_number: rawData.contact_number,
        full_name: `${rawData.first_name} ${rawData.last_name}`.trim(),
    };

    try {
      await registerAdvocate(payload);
      // --- NEW: Trigger Success Alert & switch to Login form ---
      setAlertInfo({
        variant: "default",
        title: "Account Created!",
        desc: "Your advocate account is ready. Please sign in."
      });
      setIsLogin(true); // Switch to login form so they can immediately log in
    } catch (err) {
      console.error("Registration Error:", err.response?.data);
      // --- NEW: Trigger Error Alert ---
      setAlertInfo({
        variant: "destructive",
        title: "Registration Failed",
        desc: "Username or Email might be taken. Please try another."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-10 relative"
      >
        <div className="h-2 w-full bg-slate-900" />

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-900 mb-4">
              <Scale size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
              {isLogin ? "Advocate Login" : "Advocate Registration"}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isLogin ? "Secure access for legal professionals." : "Join the digital workspace."}
            </p>
          </div>

          {/* --- NEW: ALERT COMPONENT RENDER --- */}
          {alertInfo && (
            <Alert 
              variant={alertInfo.variant} 
              className={`mb-6 transition-all duration-300 ${alertInfo.variant === 'default' ? 'border-green-200 bg-green-50 text-green-800' : ''}`}
            >
              {alertInfo.variant === "destructive" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle>{alertInfo.title}</AlertTitle>
              <AlertDescription>{alertInfo.desc}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm key="login" onSubmit={handleLogin} isLoading={isLoading} />
              ) : (
                <AdvocateRegisterForm key="register" onSubmit={handleRegister} isLoading={isLoading} />
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {isLogin ? "New Advocate? " : "Already have an account? "}
                <button type="button" onClick={toggleMode} className="font-medium text-slate-900 hover:underline">
                  {isLogin ? "Register here" : "Sign in"}
                </button>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center space-y-2">
                <Link to="/client-login" className="text-md font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-1">
                    Are you a Client? Login with OTP <ArrowRight size={12}/>
                </Link>
                <Link to="/staff/login" className="text-md font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-1">
                    Are you a Staff? <ArrowRight size={12}/>
                </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const LoginForm = ({ onSubmit, isLoading }) => (
  <motion.form
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    onSubmit={onSubmit}
    className="space-y-4"
  >
    <InputGroup icon={Mail} name="username" type="text" placeholder="Username" required />
    <InputGroup icon={Lock} name="password" type="password" placeholder="Password" required />
    
    <Button disabled={isLoading} className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800">
      {isLoading ? "Signing in..." : "Sign In"}
      {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
    </Button>
  </motion.form>
);

const AdvocateRegisterForm = ({ onSubmit, isLoading }) => (
  <motion.form 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    onSubmit={onSubmit} 
    className="space-y-4"
  >
    <div className="grid grid-cols-2 gap-4">
      <InputGroup icon={User} name="first_name" type="text" placeholder="First Name" required />
      <InputGroup icon={User} name="last_name" type="text" placeholder="Last Name" required />
    </div>
    <InputGroup icon={User} name="username" type="text" placeholder="Username" required />
    <InputGroup icon={Mail} name="email" type="email" placeholder="Email Address" required />
    <InputGroup icon={Phone} name="contact_number" type="tel" placeholder="Contact Number" required />
    <InputGroup icon={Lock} name="password" type="password" placeholder="Create Password" required />

    <Button disabled={isLoading} className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800">
       {isLoading ? "Creating Account..." : "Create Account"}
       {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
    </Button>
  </motion.form>
);

const InputGroup = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-900 transition-colors z-10">
      <Icon size={16} />
    </div>
    <Input className="pl-10" {...props} />
  </div>
);

export default AuthPage;