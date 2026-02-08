import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans text-primary selection:bg-primary/10">
        <Routes>
          
          <Route 
            path="/" 
            element={
              <>
                <Navbar />
                <main>
                  <LandingPage />
                </main>
              </>
            } 
          />

          {/* Route 2: The Login / Register Page */}
          <Route path="/login" element={<AuthPage />} />

          {/* Route 3: Dashboard (Placeholder for later) */}
          <Route 
            path="/dashboard" 
            element={<div className="p-10 text-center text-2xl">Dashboard Coming Soon</div>} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;