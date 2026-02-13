import React from 'react';
import useParallax from '../../hooks/useParallax';

const ParallaxSection = ({ 
  backgroundImage, 
  speed, 
  children, 
  id, 
  overlayColor = "bg-black/40" 
}) => {
  const offset = useParallax(speed);

  return (
    <section id={id} className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 w-full h-[120%] z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${offset}px)`,
          willChange: 'transform'
        }}
      />
      
      {/* Dark Overlay for readability */}
      <div className={`absolute inset-0 z-10 ${overlayColor}`} />

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-20">
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;