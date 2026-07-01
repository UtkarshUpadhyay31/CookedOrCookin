import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const INITIAL_LOGS = [
  "Initializing CookedOrCookin AI Engine...",
  "Loading neural weights for YuNet face detector...",
  "Initializing MediaPipe Face Mesh subsystem...",
  "Configuring blink tracker and head pose models...",
  "Securing Environment Integrity Validation Layer...",
  "Connecting to WebSocket camera stream at ws://localhost:8000/ws...",
  "Calibrating webcam feed parameters...",
  "System fully synchronized. Initializing analyzer frame loop..."
];

export default function LoadingScreen({ onComplete }) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentLogIndex = 0;
    
    // Add logs one by one
    const logInterval = setInterval(() => {
      if (currentLogIndex < INITIAL_LOGS.length) {
        const logMsg = INITIAL_LOGS[currentLogIndex];
        setLogs(prev => [...prev, `[SYSTEM] ${logMsg}`]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 450);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 400); // Small pause at 100%
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background font-mono select-none">
      <div className="w-full max-w-2xl space-y-12">
        {/* Silhouette and Scanning Box */}
        <div className="relative w-64 h-64 mx-auto border border-white/10 rounded-3xl bg-secondary/30 flex items-center justify-center overflow-hidden glow-blue">
          {/* Facial Silhouette Grid */}
          <svg className="w-48 h-48 text-[#00D4FF]/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.64-.493-8.184-1.392m16.368 0a11.954 11.954 0 01-16.368 0M12 14a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          
          {/* Scan Line */}
          <div className="absolute inset-x-0 scan-line" />
          
          {/* Neon Calibration Points */}
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-ping" />
          <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-ping" style={{ animationDelay: '0.7s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-ping" style={{ animationDelay: '0.9s' }} />
        </div>

        {/* Loading Info */}
        <div className="space-y-4 text-center">
          <div className="flex justify-between text-xs text-muted font-mono tracking-wider">
            <span>AI SCANNER CALIBRATION</span>
            <span className="text-[#00D4FF] font-bold">{progress}%</span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00D4FF] via-[#7B61FF] to-[#00FFA3]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* System Logs Console */}
        <div className="glass-panel p-5 rounded-2xl h-48 overflow-y-auto text-left text-xs font-mono border border-white/5 shadow-inner">
          <div className="space-y-2 text-[#A7AAB8]">
            {logs.map((log, index) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                key={index}
                className={index === logs.length - 1 ? "text-[#00D4FF]" : ""}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
