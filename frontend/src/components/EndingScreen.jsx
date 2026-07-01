import React from 'react';
import { motion } from 'framer-motion';
import { Award, Download, RefreshCw, ThumbsUp, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

export default function EndingScreen({ summaryData, onRestart }) {
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
        return { text: 'COOKIN 🔥', color: 'text-[#00FFA3]', bg: 'bg-[#00FFA3]/10', border: 'border-[#00FFA3]/30', glow: 'glow-emerald' };
      case 'GOOD':
        return { text: 'GOOD 👍', color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]/30', glow: 'glow-blue' };
      case 'NEEDS PRACTICE':
        return { text: 'NEEDS PRACTICE ⚠️', color: 'text-[#FFC857]', bg: 'bg-[#FFC857]/10', border: 'border-[#FFC857]/30', glow: 'glow-warning' };
      case 'COOKED':
        return { text: 'COOKED 💀', color: 'text-[#FF4D6D]', bg: 'bg-[#FF4D6D]/10', border: 'border-[#FF4D6D]/30', glow: 'glow-danger' };
      default:
        return { text: 'COMPLETED', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', glow: '' };
    }
  };

  const vd = getVerdictDetails(verdict);

  return (
    <div className="min-h-screen py-16 px-4 flex justify-center items-center relative overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl glass-panel p-10 rounded-[32px] border border-white/5 shadow-2xl relative z-10 space-y-10"
      >
        
        {/* TOP STATUS */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-white/5 pb-8 gap-6">
          <div>
            <span className="text-[10px] text-muted tracking-widest font-mono uppercase block mb-1">INTERVIEW SESSION COMPLETED</span>
            <h1 className="text-3xl font-bold font-space">Performance Assessment</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-muted tracking-widest font-mono uppercase block">SESSION STATUS</span>
              <span className={`text-xs font-bold font-mono ${session_status === 'VALID' ? 'text-[#00FFA3]' : 'text-[#FF4D6D]'}`}>
                {session_status} SESSION
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-muted tracking-widest uppercase block">DURATION</span>
              <span className="text-sm font-bold text-white">{durationStr}</span>
            </div>
          </div>
        </div>

        {/* ASSESSMENT MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Circular Score & Verdict */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-48 h-48 relative">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-35 transition-all duration-500 ${vd.glow}`} />
              <CircularProgressbar
                value={readiness}
                text={`${Math.round(readiness)}%`}
                styles={buildStyles({
                  textSize: '18px',
                  pathColor: '#7B61FF',
                  textColor: '#ffffff',
                  trailColor: 'rgba(255,255,255,0.03)',
                })}
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] text-[#A7AAB8] tracking-widest font-mono uppercase block">READINESS VERDICT</span>
              <div className={`inline-block px-6 py-3 rounded-2xl border font-space font-extrabold text-base ${vd.color} ${vd.bg} ${vd.border} ${vd.glow}`}>
                {vd.text}
              </div>
            </div>
          </div>

          {/* Performance stats grid */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-lg font-bold font-space">Assessment Analytics Matrix</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              
              {/* Stat 1 */}
              <div className="glass-card p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-muted block mb-1">EYE CONTACT</span>
                <span className="text-xl font-bold font-mono">{eye_contact}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#00FFA3]" style={{ width: `${eye_contact}%` }} />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="glass-card p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-muted block mb-1">ATTENTION</span>
                <span className="text-xl font-bold font-mono">{attention}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#00D4FF]" style={{ width: `${attention}%` }} />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="glass-card p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-muted block mb-1">STABILITY</span>
                <span className="text-xl font-bold font-mono">{stability}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#FFC857]" style={{ width: `${stability}%` }} />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="glass-card p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-muted block mb-1">PRESENCE SCORE</span>
                <span className="text-xl font-bold font-mono">{presence}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-white" style={{ width: `${presence}%` }} />
                </div>
              </div>

              {/* Stat 5 */}
              <div className="glass-card p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-muted block mb-1">INTEGRITY SCORE</span>
                <span className="text-xl font-bold font-mono">{integrity}/100</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${integrity >= 70 ? 'bg-[#00FFA3]' : 'bg-[#FF4D6D]'}`} style={{ width: `${integrity}%` }} />
                </div>
              </div>

              {/* Stat 6 */}
              <div className="glass-card p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-muted block mb-1">FACE EVENTS</span>
                <span className="text-xl font-bold font-mono text-[#FF4D6D]">{face_events}</span>
                <span className="text-[9px] text-[#A7AAB8] font-mono block mt-1.5 uppercase">MULTIPLE FACES</span>
              </div>

            </div>
          </div>

        </div>

        {/* STRENGTHS & WEAKNESSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Strengths card */}
          <div className="glass-card p-6 rounded-[24px]">
            <h4 className="flex items-center gap-2 text-base font-bold font-space text-[#00FFA3] mb-4">
              <ThumbsUp className="w-5 h-5" />
              Identified Strengths
            </h4>
            {strengths.length > 0 ? (
              <ul className="space-y-3 font-mono text-xs text-[#A7AAB8]">
                {strengths.map((str, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-[#00FFA3] font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-muted leading-relaxed">No key behavioral strengths detected during this session.</p>
            )}
          </div>

          {/* Weaknesses card */}
          <div className="glass-card p-6 rounded-[24px]">
            <h4 className="flex items-center gap-2 text-base font-bold font-space text-[#FF4D6D] mb-4">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              Areas of Improvement
            </h4>
            {weaknesses.length > 0 ? (
              <ul className="space-y-3 font-mono text-xs text-[#A7AAB8]">
                {weaknesses.map((weak, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-[#FF4D6D] font-bold">!</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-[#00FFA3] leading-relaxed">✓ Ideal assessment metrics. Keep up the high standard!</p>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-white/5">
          <a
            href={`http://localhost:8000/api/reports/download/${pdf_report}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] rounded-2xl text-white font-space font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-3 shadow-lg"
          >
            <Download className="w-5 h-5" />
            DOWNLOAD FULL PDF REPORT
          </a>
          
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-4 bg-secondary border border-white/5 hover:bg-white/5 rounded-2xl text-white font-space font-bold transition-colors flex justify-center items-center gap-3"
          >
            <RefreshCw className="w-5 h-5" />
            START NEW INTERVIEW
          </button>
        </div>

      </motion.div>
    </div>
  );
}
