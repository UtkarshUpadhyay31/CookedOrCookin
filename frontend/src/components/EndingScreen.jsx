import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, RefreshCw, ThumbsUp, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

export default function EndingScreen({ summaryData, onRestart, theme, accent }) {
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Simulate short loader delay for skeleton loaders
    const timer = setTimeout(() => setContentLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!summaryData) return null;

  const {
    pdf_report,
    readiness,
    eye_contact,
    stability,
    attention,
    presence,
    integrity,
    face_events,
    session_status,
    auto_ended,
    verdict,
    strengths,
    weaknesses,
    duration
  } = summaryData;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getVerdictDetails = (ver) => {
    switch (ver) {
      case 'COOKIN':
        return { text: 'COOKIN 🔥', color: 'text-[#10B981] dark:text-[#00FFA3]', bg: 'bg-[#10B981]/10 dark:bg-[#00FFA3]/10', border: 'border-[#10B981]/30 dark:border-[#00FFA3]/30', glow: 'glow-emerald' };
      case 'GOOD':
        return { text: 'GOOD 👍', color: 'text-[#2563EB] dark:text-[#00D4FF]', bg: 'bg-[#2563EB]/10 dark:bg-[#00D4FF]/10', border: 'border-[#2563EB]/30 dark:border-[#00D4FF]/30', glow: 'glow-blue' };
      case 'NEEDS PRACTICE':
        return { text: 'NEEDS PRACTICE ⚠️', color: 'text-[#FFC857]', bg: 'bg-[#FFC857]/10 border-[#FFC857]/30', glow: 'glow-warning' };
      case 'COOKED':
        return { text: 'COOKED 💀', color: 'text-[#FF4D6D]', bg: 'bg-[#FF4D6D]/10 border-[#FF4D6D]/30', glow: 'glow-danger' };
      default:
        return { text: 'COMPLETED', color: 'text-textMuted/60 border-borderPrimary', bg: 'bg-black/5 dark:bg-white/5', glow: '' };
    }
  };

  const vd = getVerdictDetails(verdict);

  return (
    <div className="min-h-screen py-8 sm:py-16 px-4 flex justify-center items-center relative overflow-hidden select-none bg-background text-textMain theme-transition">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl glass-panel p-6 sm:p-10 rounded-[32px] border border-borderPrimary shadow-2xl relative z-10 space-y-8 sm:space-y-10"
      >
        
        {/* TOP STATUS HEADER PANEL */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-borderPrimary pb-6 sm:pb-8 gap-6">
          <div>
            <span className="text-[10px] text-textMuted tracking-widest font-mono uppercase block mb-1">INTERVIEW SESSION COMPLETED</span>
            <h1 className="text-2xl sm:text-3xl font-bold font-space">Performance Assessment</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-textMuted tracking-widest font-mono uppercase block">SESSION STATUS</span>
              <span className={`text-xs font-bold font-mono ${session_status === 'VALID' ? 'text-[#10B981] dark:text-[#00FFA3]' : 'text-danger'}`}>
                {session_status} SESSION
              </span>
            </div>
            <div className="h-8 w-px bg-borderPrimary" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-textMuted tracking-widest uppercase block">DURATION</span>
              <span className="text-sm font-bold">{durationStr}</span>
            </div>
          </div>
        </div>

        {/* ASSESSMENT MATRIX GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          
          {/* Circular Score dial & verdict */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-40 h-40 sm:w-48 sm:h-48 relative">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-20 dark:opacity-35 transition-all duration-500 ${vd.glow}`} />
              <CircularProgressbar
                value={readiness}
                text={`${Math.round(readiness)}%`}
                styles={buildStyles({
                  textSize: '18px',
                  pathColor: 'var(--accent-primary)',
                  textColor: 'var(--text-main)',
                  trailColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                })}
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] text-textMuted tracking-widest font-mono uppercase block">READINESS VERDICT</span>
              <div className={`inline-block px-6 py-3 rounded-2xl border font-space font-extrabold text-base ${vd.color} ${vd.bg} ${vd.border} ${vd.glow}`}>
                {vd.text}
              </div>
            </div>
          </div>

          {/* Performance matrix grid of sub-scores */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-lg font-bold font-space">Assessment Analytics Matrix</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'EYE CONTACT', value: eye_contact, color: 'bg-[#10B981]', percent: true },
                { label: 'ATTENTION', value: attention, color: 'bg-accentPrimary', percent: true },
                { label: 'STABILITY', value: stability, color: 'bg-[#FFC857]', percent: true },
                { label: 'PRESENCE SCORE', value: presence, color: 'bg-textMain', percent: true },
                { label: 'INTEGRITY SCORE', value: integrity, color: integrity >= 70 ? 'bg-[#10B981]' : 'bg-danger', percent: false, max: '/100' },
                { label: 'FACE EVENTS', value: face_events, color: 'bg-danger', percent: false, textMuted: 'MULTIPLE FACES' }
              ].map((item, idx) => (
                <div key={item.label} className="glass-card p-5 rounded-2xl border border-borderPrimary">
                  {!contentLoaded ? (
                    // Skeleton shimmers
                    <div className="space-y-3">
                      <div className={`h-2.5 w-16 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                      <div className={`h-6 w-12 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                      <div className={`h-1.5 w-full ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                    </div>
                  ) : (
                    // Content
                    <>
                      <span className="text-[10px] font-mono text-textMuted block mb-1 uppercase">{item.label}</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-textMain">
                        {item.value}{item.percent ? '%' : ''}{item.max || ''}
                      </span>
                      
                      {item.percent ? (
                        <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                      ) : (
                        <span className="text-[9px] text-textMuted font-mono block mt-1.5 uppercase">
                          {item.textMuted || 'ABSOLUTE COUNT'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* STRENGTHS & AREAS OF IMPROVEMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
          
          {/* Strengths card */}
          <div className="glass-card p-6 rounded-[24px] border border-borderPrimary">
            <h4 className="flex items-center gap-2.5 text-base font-bold font-space text-[#10B981] dark:text-[#00FFA3] mb-4">
              <ThumbsUp className="w-5 h-5 shrink-0" />
              Identified Strengths
            </h4>
            
            {!contentLoaded ? (
              <div className="space-y-3">
                <div className={`h-3 w-full ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                <div className={`h-3 w-5/6 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                <div className={`h-3 w-4/5 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
              </div>
            ) : (
              strengths.length > 0 ? (
                <ul className="space-y-3 font-mono text-xs text-textMuted">
                  {strengths.map((str, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-[#10B981] dark:text-[#00FFA3] font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-mono text-textMuted leading-relaxed">No key behavioral strengths detected during this session.</p>
              )
            )}
          </div>

          {/* Weaknesses card */}
          <div className="glass-card p-6 rounded-[24px] border border-borderPrimary">
            <h4 className="flex items-center gap-2.5 text-base font-bold font-space text-danger mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
              Areas of Improvement
            </h4>
            
            {!contentLoaded ? (
              <div className="space-y-3">
                <div className={`h-3 w-full ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                <div className={`h-3 w-5/6 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                <div className={`h-3 w-3/4 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
              </div>
            ) : (
              weaknesses.length > 0 ? (
                <ul className="space-y-3 font-mono text-xs text-textMuted">
                  {weaknesses.map((weak, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-danger font-bold">!</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-mono text-[#10B981] dark:text-[#00FFA3] leading-relaxed">✓ Ideal assessment metrics. Keep up the high standard!</p>
              )
            )}
          </div>
        </div>

        {/* BOTTOM ACTION TRIGGERS */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-borderPrimary">
          <a
            href={`http://localhost:8000/api/reports/download/${pdf_report}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accentPrimary to-[#7B61FF] text-white rounded-2xl font-space font-bold hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-3 shadow-accent"
          >
            <Download className="w-5 h-5 text-white" />
            DOWNLOAD FULL PDF REPORT
          </a>
          
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-4 bg-black/5 dark:bg-white/5 border border-borderPrimary hover:bg-black/10 dark:hover:bg-white/10 hover:border-accentPrimary rounded-2xl text-textMain font-space font-bold transition-all flex justify-center items-center gap-3"
          >
            <RefreshCw className="w-5 h-5" />
            START NEW INTERVIEW
          </button>
        </div>

      </motion.div>
    </div>
  );
}
