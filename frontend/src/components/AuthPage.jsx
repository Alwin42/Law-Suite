import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// SAFE IMPORTS: Using your manual components
import { Button } from "./ui/button"; 
import { Input } from "./ui/input"; 
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Mail, Lock, User, ArrowRight, Check, Phone, Briefcase } from "lucide-react";
// FIX: Imported registerAdvocate instead of registerUser
import { loginUser, registerAdvocate } from "../api"; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  // --- LOGIN LOGIC (Advocates/Admins) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await loginUser(data);
      
      // Store Token & Role
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', response.data.role);
      localStorage.setItem('user_name', response.data.full_name);

      // Redirect based on role
      if (response.data.role === 'CLIENT') {
          navigate('/client-dashboard');
      } else {
          navigate('/dashboard'); 
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- REGISTER LOGIC (Advocates Only) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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
      // FIX: Using registerAdvocate
      await registerAdvocate(payload);
      alert("Advocate Account Created! Please login.");
      toggleMode(); // Switch to login screen
    } catch (err) {
      console.error("Registration Error:", err.response?.data);
      setError("Registration failed. Username or Email might be taken.");
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 text-xs text-red-500 bg-red-50 rounded-md border border-red-100 text-center">
                {error}
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isLogin ? (
                // --- LOGIN FORM ---
                <LoginForm key="login" onSubmit={handleLogin} isLoading={isLoading} />
              ) : (
                // --- REGISTER FORM ---
                <AdvocateRegisterForm key="register" onSubmit={handleRegister} isLoading={isLoading} />
              )}
            </AnimatePresence>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {isLogin ? "New Advocate? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {isLogin ? "Register here" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Link to Client Login */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <Link to="/client-login" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-1">
                    Are you a Client? Login with OTP <ArrowRight size={12}/>
                </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

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