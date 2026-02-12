
import React, { Suspense } from 'react';
import Navbar from './ui/Navbar'; 

// Lazy load the sections
const HeroSection = React.lazy(() => import('./sections/HeroSection'));
const ProblemSection = React.lazy(() => import('./sections/ProblemSection'));
const SolutionSection = React.lazy(() => import('./sections/SolutionSection'));
const FeaturesSection = React.lazy(() => import('./sections/FeaturesSection'));
const CTASection = React.lazy(() => import('./sections/CTASection'));

const HomePage = () => {
  return (
    // The main container for the scroll-snap storytelling experience
    <div className="bg-background min-h-screen text-primary font-sans selection:bg-accent selection:text-white snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
      
      
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-accent">Loading...</div>}>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <CTASection />
      </Suspense>
    </div>
  );
};

export default HomePage;