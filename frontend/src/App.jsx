import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Standard Components
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";

// Authentication
import AuthPage from "./components/Advocate-pages/AuthPage";
import ClientAuthPage from "./components/Client-pages/ClientAuthPage";

// Dashboards
import Dashboard from "./components/Advocate-pages/Dashboard";
import ClientDashboard from "./components/Client-pages/ClientDashboard";

// Advocate Features
import ClientsPage from "./components/Advocate-pages/ClientsPage";
import ClientViewPage from "./components/Advocate-pages/ClientViewPage";
import CasePage from "./components/Advocate-pages/CasePage";
import CaseViewPage from './components/Advocate-pages/CaseViewPage';
import AdvocateAppointments from "./components/Advocate-pages/AdvocateAppointments";
import Hearings from "./components/Advocate-pages/Hearings";
import CaseTemplates from "./components/Advocate-pages/CaseTemplates";
import Documents from "./components/Advocate-pages/Documents";

// Client Features (Note: Based on your screenshot, BookAppointment is in Advocate-pages)
import BookAppointment from "./components/Advocate-pages/BookAppointment";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/client-login" element={<ClientAuthPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        
        {/* Client Management */}
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientViewPage />} />
        
        {/* Case & Document Management */}
        <Route path="/cases" element={<CasePage/>} />
        <Route path="/cases/:id" element={<CaseViewPage />} />
        <Route path="/templates" element={<CaseTemplates />} />
        <Route path="/documents" element={<Documents />} />

        {/* Scheduling */}
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/advocate/appointments" element={<AdvocateAppointments />} />
        <Route path="/advocate/hearings" element={<Hearings />} /> 
        
      </Routes>
    </Router>
  );
}

export default App;