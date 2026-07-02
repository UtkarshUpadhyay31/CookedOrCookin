import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert, Cpu, Award, Sun, Moon, Laptop, Palette } from 'lucide-react';

export default function StartScreen({ onStart, theme, setTheme, accent, setAccent }) {
  const [particles, setParticles] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Generate random particles for floating background
  useEffect(() => {
    const items = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${12 + Math.random() * 15}s`,
      size: `${Math.random() * 10 + 5}px`,
    }));
    setParticles(items);

    // Simulate loading for skeleton loader demonstration
    const timer = setTimeout(() => setContentLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop }
  ];

  const accentPresets = [
    { id: 'blue', color: 'bg-[#2563EB] dark:bg-[#00D4FF]', glow: 'shadow-[0_0_10px_#2563EB]' },
    { id: 'purple', color: 'bg-[#7C3AED] dark:bg-[#7B61FF]', glow: 'shadow-[0_0_10px_#7C3AED]' },
    { id: 'emerald', color: 'bg-[#10B981] dark:bg-[#00FFA3]', glow: 'shadow-[0_0_10px_#10B981]' },
    { id: 'orange', color: 'bg-[#EA580C] dark:bg-[#FF9F1C]', glow: 'shadow-[0_0_10px_#EA580C]' },
    { id: 'rose', color: 'bg-[#E11D48] dark:bg-[#FF4D6D]', glow: 'shadow-[0_0_10px_#E11D48]' }
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden select-none bg-background text-textMain theme-transition">
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
              background: 'var(--accent-primary)',
              opacity: theme === 'light' ? 0.07 : 0.15,
            }}
          />
        ))}
      </div>

      {/* TOP FLOATING SETTINGS CONTROLLER */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3.5 rounded-2xl glass-panel hover:border-accentPrimary hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group text-textMuted hover:text-textMain shadow-soft"
          aria-label="Customize interface settings"
        >
          <Palette className="w-5 h-5 text-accentPrimary group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold font-space hidden sm:inline">Customize UI</span>
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-72 glass-panel p-5 rounded-3xl border border-borderPrimary shadow-2xl space-y-5 text-left"
            >
              {/* Theme Settings */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold font-mono tracking-widest text-textMuted uppercase">THEME</span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-borderPrimary">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-space font-bold transition-all ${
                          isActive 
                            ? 'bg-white dark:bg-secondary text-accentPrimary shadow-card border border-borderPrimary' 
                            : 'text-textMuted hover:text-textMain'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent presets settings */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold font-mono tracking-widest text-textMuted uppercase">ACCENT PRESETS</span>
                <div className="flex gap-3 justify-center items-center py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-borderPrimary">
                  {accentPresets.map((pr) => {
                    const isSelected = accent === pr.id;
                    return (
                      <button
                        key={pr.id}
                        onClick={() => setAccent(pr.id)}
                        className={`w-6 h-6 rounded-full ${pr.color} transition-all duration-300 relative hover:scale-110 ${
                          isSelected ? `${pr.glow} scale-110 ring-2 ring-offset-2 ring-offset-background ring-textMain` : ''
                        }`}
                        aria-label={`Select ${pr.id} accent color preset`}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CENTER CARD TITLE PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl text-center z-10 space-y-12"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-accentPrimary/20 bg-accentPrimary/5 text-accentPrimary text-xs font-semibold tracking-wider font-space uppercase mb-4 shadow-[0_0_15px_var(--accent-glow)]"
          >
            <Cpu className="w-4 h-4 animate-pulse text-accentPrimary" />
            Computer Vision Powered AI Assessor
          </motion.div>
          
          <h1 className="text-clamp-title font-bold tracking-tight font-space text-textMain leading-none">
            CookedOr<span className="text-accentPrimary transition-colors duration-300">Cookin</span>
          </h1>
          <p className="text-clamp-subtitle text-textMuted max-w-2xl mx-auto font-light leading-relaxed">
            Are You Ready For The Interview, Or Are You <span className="text-danger font-medium">Cooked?</span>
          </p>
        </div>

        {/* Start button */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="relative inline-block group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-accentPrimary via-[#7B61FF] to-accentPrimary rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition duration-300"></div>
          <button
            onClick={onStart}
            className="relative px-10 py-5 bg-background text-textMain border border-borderPrimary rounded-2xl font-space text-lg font-bold tracking-wider hover:border-accentPrimary transition-all flex items-center gap-3 shadow-2xl"
          >
            START ANALYZER SESSION
            <span className="text-accentPrimary transition-colors">→</span>
          </button>
        </motion.div>

        {/* Features Grids (Supports Skeleton Placeholders on initial transition) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          {[
            { 
              title: "Attention Tracking", 
              icon: Eye, 
              color: "text-accentPrimary bg-accentPrimary/5 border-accentPrimary/10 shadow-[0_0_15px_var(--accent-glow)]",
              desc: "Real-time eye contact mapping, head pose estimation, and attention scoring to ensure candidate focus and engagement."
            },
            { 
              title: "Readiness Score", 
              icon: Award, 
              color: "text-[#7B61FF] bg-[#7B61FF]/5 border-[#7B61FF]/10 shadow-[0_0_15px_rgba(123,97,255,0.08)]",
              desc: "Calculates overall preparedness using micro-expressions, blink rate analysis, and stability metrics to see if you're cooked." 
            },
            { 
              title: "Integrity Shield", 
              icon: ShieldAlert, 
              color: "text-danger bg-danger/5 border-danger/10 shadow-[0_0_15px_rgba(255,77,109,0.08)]",
              desc: "Advanced presence verification and multiple-face detection to validate mock interview session authenticity." 
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                className="glass-card p-6 rounded-[24px] border border-borderPrimary flex flex-col justify-between"
              >
                {!contentLoaded ? (
                  // Skeleton Loader State
                  <div className="space-y-4 w-full">
                    <div className={`w-12 h-12 rounded-2xl ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                    <div className={`h-6 w-3/4 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                    <div className="space-y-2">
                      <div className={`h-3 w-full ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                      <div className={`h-3 w-full ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                      <div className={`h-3 w-2/3 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                    </div>
                  </div>
                ) : (
                  // Full Content State
                  <>
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold font-space text-textMain mb-2">{card.title}</h3>
                    <p className="text-sm text-textMuted leading-relaxed">
                      {card.desc}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
