import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShieldAlert, Cpu, Award } from 'lucide-react';

export default function StartScreen({ onStart }) {
  const [particles, setParticles] = useState([]);

  // Generate random particles for floating background effect
  useEffect(() => {
    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: `${Math.random() * 12 + 6}px`,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden select-none">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="w-full max-w-4xl text-center z-10 space-y-12"
      >
        {/* Header Branding */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#7B61FF]/30 bg-[#7B61FF]/10 text-[#7B61FF] text-sm font-semibold tracking-wider font-space uppercase mb-4 shadow-[0_0_15px_rgba(123,97,255,0.15)]"
          >
            <Cpu className="w-4 h-4 animate-pulse" />
            Computer Vision Powered AI
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight font-space bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#00D4FF]">
            CookedOr<span className="text-[#7B61FF]">Cookin</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-light leading-relaxed">
            Are You Ready For The Interview, Or Are You <span className="text-[#FF4D6D] font-medium">Cooked?</span>
          </p>
        </div>

        {/* Start Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative inline-block group"
        >
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00D4FF] via-[#7B61FF] to-[#00FFA3] rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <button
            onClick={onStart}
            className="relative px-10 py-5 bg-background border border-white/10 rounded-2xl text-white font-space text-lg font-bold tracking-wider hover:border-white/30 transition-all flex items-center gap-3 shadow-2xl"
          >
            START ANALYZER SESSION
            <span className="text-[#00D4FF]">→</span>
          </button>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="glass-card p-6 rounded-[24px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] mb-5 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-space text-white mb-2">Attention Tracking</h3>
            <p className="text-sm text-muted leading-relaxed">
              Real-time eye contact mapping, head pose estimation, and attention scoring to ensure candidate focus and engagement.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="glass-card p-6 rounded-[24px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] mb-5 shadow-[0_0_15px_rgba(123,97,255,0.1)]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-space text-white mb-2">Readiness Score</h3>
            <p className="text-sm text-muted leading-relaxed">
              Calculates overall preparedness using micro-expressions, blink rate analysis, and stability metrics to see if you're cooked.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="glass-card p-6 rounded-[24px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center text-[#00FFA3] mb-5 shadow-[0_0_15px_rgba(0,255,163,0.1)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-space text-white mb-2">Integrity Shield</h3>
            <p className="text-sm text-muted leading-relaxed">
              Advanced presence verification and multiple-face detection to validate mock interview session authenticity.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
