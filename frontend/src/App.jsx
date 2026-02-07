import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-primary selection:bg-primary/10">
      <Navbar />
      <main>
        {/* LandingPage contains both Hero and About sections with the scroll animation */}
        <LandingPage />
      </main>
    </div>
  );
}

export default App;