import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button"; 
import { Input } from "./ui/Input"; 
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Mail, Lock, User, ArrowRight, Check, Phone } from "lucide-react";
import { loginUser, registerUser } from "../api"; // Import the API functions

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(""); // Clear errors when switching
  };

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await loginUser(data);
      // Save Tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Navigate to Dashboard
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- REGISTER LOGIC ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData);

    // FIX: Combine names for backend compatibility
    const payload = {
        username: rawData.username,
        email: rawData.email,
        password: rawData.password,
        contact_number: rawData.contact_number,
        full_name: `${rawData.first_name} ${rawData.last_name}`.trim(),
        role: 'ADVOCATE' // Defaulting to Advocate for this workspace
    };

    try {
      await registerUser(payload);
      alert("Registration Successful! Please login.");
      toggleMode(); // Switch to login screen
    } catch (err) {
      console.error("Registration Error:", err.response?.data);
      // specific error message from backend or generic one
      setError(err.response?.data?.username ? "Username already exists." : "Registration failed. Check your data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 50 Q 25 60, 50 50 T 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M0 60 Q 25 70, 50 60 T 100 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-10 relative"
      >
        <div className="h-2 w-full bg-primary" />

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary mb-4">
              <Scale size={24} />
            </div>
            <h2 className="text-2xl font-bold text-primary tracking-tight uppercase">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-accent text-sm mt-2">
              {isLogin ? "Enter your credentials." : "Join the digital workspace."}
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-3 text-xs text-red-500 bg-red-50 rounded-md border border-red-100 text-center">
                {error}
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm key="login" onSubmit={handleLogin} isLoading={isLoading} />
              ) : (
                <RegisterForm key="register" onSubmit={handleRegister} isLoading={isLoading} />
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-sm text-accent">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-medium text-primary hover:underline"
                >
                  {isLogin ? "Register now" : "Sign in"}
                </button>
              </p>
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
    
    <div className="flex items-center justify-between text-xs">
      <label className="flex items-center space-x-2 cursor-pointer text-accent hover:text-primary">
        <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
            <Check size={10} className="text-primary opacity-0 hover:opacity-100" />
        </div>
        <span>Remember me</span>
      </label>
      <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
    </div>

    <Button disabled={isLoading} className="w-full mt-2 group bg-slate-900 text-white hover:bg-slate-800">
      {isLoading ? "Signing in..." : "Sign In"}
      {!isLoading && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
    </Button>
  </motion.form>
);

const RegisterForm = ({ onSubmit, isLoading }) => (
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

    <Button disabled={isLoading} className="w-full mt-2 group bg-slate-900 text-white hover:bg-slate-800">
       {isLoading ? "Creating Account..." : "Create Account"}
       {!isLoading && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
    </Button>
  </motion.form>
);

const InputGroup = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10">
      <Icon size={16} />
    </div>
    <Input className="pl-10" {...props} />
  </div>
);

export default AuthPage;