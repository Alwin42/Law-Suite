// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard"; // <--- Import this

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans text-primary selection:bg-primary/10">
        <Routes>
          <Route path="/" element={<><Navbar /><main><LandingPage /></main></>} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Add the Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;