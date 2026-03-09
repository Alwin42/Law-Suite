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
import ClientCasesPage from "./components/Client-pages/ClientCasesPage";
import ClientCaseView from "./components/Client-pages/ClientCaseView";
import ClientHearingsPage from "./components/Client-pages/ClientHearingsPage";
import ClientDocumentsPage from "./components/Client-pages/ClientDocumentsPage";
import ClientPaymentPortal from './components/Client-pages/ClientPaymentPortal';

import CloudPage from "./components/Advocate-pages/Cloud"

import StaffClientView from './components/Staff-pages/StaffClientView';
import StaffAuth from './components/Staff-pages/StaffAuth';
import StaffDashboard from './components/Staff-pages/StaffDashboard';
import AppointmentManage from './components/Staff-pages/appointment_manage';
import StaffCaseView from './components/Staff-pages/StaffCaseView';
import PaymentManage from './components/Advocate-pages/Payment';
import StaffBillingView from './components/Staff-pages/StaffBillingView';

import AIChat from './components/Advocate-pages/AI_Chat';

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
        {/* CLient path */}
        <Route path="/client-dashboard/cases" element={<ClientCasesPage />} />
        <Route path="/client-dashboard/cases/:id" element={<ClientCaseView />} />
        <Route path="/client-dashboard/hearings" element={<ClientHearingsPage />} />
        <Route path="/client-dashboard/documents" element={<ClientDocumentsPage />} />
        {/* Cloud */}
        <Route path="/cloud" element={<CloudPage/>} />
        {/* Staff */}
        <Route path="/staff/login" element={<StaffAuth />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/appointments" element={<AppointmentManage />} />
        <Route path="/staff/cases" element={<StaffCaseView />} />
        <Route path="/payments" element={<PaymentManage />} />
        <Route path="/staff/billing" element={<StaffBillingView />} />
        <Route path="/staff/clients" element={<StaffClientView />} />
        {/* Ai */}
        <Route path="/ai-assistant" element={<AIChat />} />
        <Route path="/pay/:paymentId" element={<ClientPaymentPortal />} />

        <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium">
                404 - Oops.. Page Not Found
              </div>
            } 
          />
      </Routes>
    </Router>
  );
}

export default App;