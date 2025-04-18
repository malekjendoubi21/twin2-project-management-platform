import React, { useState, useEffect } from 'react';

const GitHubCrownBadge = () => {
  const [animated, setAnimated] = useState(false);
  
  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="tooltip tooltip-right" data-tip="GitHub Verified Developer">
      <div className={`relative flex items-center justify-center ${animated ? 'animate-bounce-mini' : ''}`}>
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-30"></div>
        
        {/* GitHub badge with gold border */}
        <div className="relative flex items-center justify-center h-6 w-6 bg-gradient-to-br from-gray-800 to-black rounded-full border-2 border-amber-300 shadow-lg">
          {/* GitHub logo */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Crown emblem on top */}
        <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className={`transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  d="M12 1l2.5 6.5L20 9l-5 4.5L16.5 20 12 16.5 7.5 20 9 13.5 4 9l5.5-1.5L12 1z"
                  fill="url(#crown-gradient)"
                  stroke="#8B4513"
                  strokeWidth="0.5"
                />
                <defs>
                  <linearGradient id="crown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Small gem in crown */}
            <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${animated ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add the CSS for the new animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
        @keyframes bounce-mini {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        .animate-bounce-mini {
          animation: bounce-mini 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GitHubCrownBadge;