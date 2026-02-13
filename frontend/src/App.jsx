import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import ClientAuthPage from "./components/ClientAuthPage";
import BookAppointment from "./components/BookAppointment";
import ClientDashboard from "./components/ClientDashboard";
import ClientsPage from "./components/ClientsPage";
import CasePage from "./components/CasePage";
import HomePage from "./components/HomePage";
function App() {
  
  return (
    <Router>
      
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/client-login" element={<ClientAuthPage />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/cases" element={<CasePage/>} />
        
        
      </Routes>
    </Router>
  );
}

export default App;