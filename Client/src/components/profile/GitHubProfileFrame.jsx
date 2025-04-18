import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './GitHubProfileFrame.css'; // CSS in public directory

const GitHubProfileFrame = ({ imageUrl, name, premium = false }) => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(false);
  const frameRef = useRef(null);
  
  // Start animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="relative w-full h-full royal-frame-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={frameRef}
    >
      {/* Animated background particles */}
      <div className="royal-particles"></div>
      
      {/* Royal ornamental frame */}
      <div className={`absolute inset-0 z-10 ${animate ? 'frame-animated' : ''}`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full royal-container"
        >
          {/* Base circle */}
          <circle 
            cx="50" cy="50" r="49" 
            className="royal-base"
          />
          
          {/* Animated royal border */}
          <circle 
            cx="50" cy="50" r="49" 
            className="royal-border"
          />
          
          {/* Golden ornaments */}
          <g className="royal-ornaments">
            {[...Array(12)].map((_, i) => (
              <path 
                key={i}
                d={`M 50,50 L 50,5 Q ${55 + i % 3 * 3},${15 - i % 2 * 5} ${60 + i % 4 * 2},20 Z`} 
                transform={`rotate(${i * 30} 50 50)`}
                className={`ornament-${i % 4}`}
              />
            ))}
          </g>
          
          {/* Sparkling gems */}
          <g className="royal-gems">
            {[...Array(8)].map((_, i) => (
              <circle 
                key={i}
                cx={50 + 42 * Math.cos(i * Math.PI / 4)}
                cy={50 + 42 * Math.sin(i * Math.PI / 4)}
                r="3"
                className={`gem-${i % 4}`}
              />
            ))}
          </g>
          
          {/* Premium crown if user has premium status */}
          {premium && (
            <path
              d="M 50,10 L 60,15 L 65,5 L 70,15 L 80,10 L 75,20 L 75,25 L 25,25 L 25,20 L 20,10 L 30,15 L 35,5 L 40,15 Z"
              className="royal-crown"
            />
          )}
        </svg>
      </div>

      {/* Radial glow pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-full">
        <div className={`royal-glow ${animate ? 'glow-animated' : ''}`}></div>
      </div>

      {/* Inner profile picture */}
      <div className="absolute inset-0 z-20 m-3 rounded-full overflow-hidden royal-portrait-shadow">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${name}'s profile`} 
            className={`w-full h-full object-cover transition-transform ${hovered ? 'scale-105' : ''}`} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 text-4xl font-serif">
            {name?.charAt(0).toUpperCase() || 'R'}
          </div>
        )}
        
        {/* Overlay with royal pattern on hover */}
        <div className={`absolute inset-0 bg-royal-overlay opacity-0 ${hovered ? 'royal-hover-reveal' : ''}`}>
          <div className="royal-pattern"></div>
        </div>
      </div>
      
      {/* Premium badge */}
      {premium && (
        <div className={`absolute -top-1 -right-1 z-30 royal-badge ${animate ? 'badge-animated' : 'opacity-0'}`}>
          <div className="premium-badge">
            <svg viewBox="0 0 24 24" className="premium-icon" fill="currentColor">
              <path d="M12 2L8.5 8.5 2 9.5 7 14l-1.5 7.5L12 18l6.5 3.5L17 14l5-4.5-6.5-1L12 2z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Name plate that appears on hover */}
      <div className={`absolute bottom-0 left-0 right-0 z-30 royal-nameplate ${hovered ? 'nameplate-visible' : 'nameplate-hidden'}`}>
        <div className="nameplate-container">
          <div className="flex items-center justify-center">
            <span className="nameplate-text">{name || 'Royalty'}</span>
          </div>
        </div>
      </div>
      
      {/* Decorative flourish at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-2 z-20 overflow-hidden ${animate ? 'flourish-visible' : 'flourish-hidden'}`}>
        <div className="royal-flourish">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0,10 C20,0 40,15 50,5 C60,-5 80,15 100,5 L100,10 L0,10 Z" 
              className="flourish-path" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

GitHubProfileFrame.propTypes = {
  imageUrl: PropTypes.string,
  name: PropTypes.string,
  premium: PropTypes.bool
};
export default GitHubProfileFrame;