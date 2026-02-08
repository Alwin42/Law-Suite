import { useState } from "react";
import { Button } from "./ui/Button"; 
import { Input } from "./ui/Input"; // Importing the shadcn Input
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Toggle between Login and Register modes
  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* ----------------- THEME BACKGROUND ----------------- */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 50 Q 25 60, 50 50 T 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M0 60 Q 25 70, 50 60 T 100 60" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path d="M0 40 Q 25 50, 50 40 T 100 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* ----------------- MAIN CARD ----------------- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-10 relative"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-primary" />

        <div className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary mb-4">
              <Scale size={24} />
            </div>
            <h2 className="text-2xl font-bold text-primary tracking-tight uppercase">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-accent text-sm mt-2">
              {isLogin 
                ? "Enter your credentials to access the workspace." 
                : "Join the automated digital workspace for advocates."}
            </p>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm key="login" />
              ) : (
                <RegisterForm key="register" />
              )}
            </AnimatePresence>

            {/* Toggle Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-accent">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-medium text-primary hover:underline focus:outline-none transition-colors"
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

const LoginForm = () => (
  <motion.form
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
    onSubmit={(e) => e.preventDefault()}
  >
    <InputGroup icon={Mail} name="username" type="text" placeholder="Username / Email" />
    <InputGroup icon={Lock} name="password" type="password" placeholder="Password" />
    
    <div className="flex items-center justify-between text-xs">
      <label className="flex items-center space-x-2 cursor-pointer text-accent hover:text-primary transition-colors">
        <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
            <Check size={10} className="text-primary opacity-0 hover:opacity-100" />
        </div>
        <span>Remember me</span>
      </label>
      <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
    </div>

    <Button className="w-full mt-2 group">
      Sign In
      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </motion.form>
);

const RegisterForm = () => (
  <motion.form
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
    onSubmit={(e) => e.preventDefault()}
  >
    <div className="grid grid-cols-2 gap-4">
      <InputGroup icon={User} name="first_name" type="text" placeholder="First Name" />
      <InputGroup icon={User} name="last_name" type="text" placeholder="Last Name" />
    </div>
    
    <InputGroup icon={User} name="username" type="text" placeholder="Username" />
    <InputGroup icon={Mail} name="email" type="email" placeholder="Email Address" />
    <InputGroup icon={Lock} name="password" type="password" placeholder="Create Password" />
    
    <div className="text-xs text-accent leading-relaxed">
      By registering, you agree to the <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
    </div>

    <Button className="w-full mt-2 group">
      Create Account
      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </motion.form>
);

// Correctly defined InputGroup using the imported shadcn Input
const InputGroup = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10">
      <Icon size={16} />
    </div>
    <Input 
      className="pl-10" // Padding left to make room for the icon
      {...props}
    />
  </div>
);

export default AuthPage;