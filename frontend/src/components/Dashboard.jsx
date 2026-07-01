import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Eye, Activity, ShieldCheck, ShieldAlert, Users, 
  RefreshCw, Clock, Download, ChevronRight, FileText, 
  Settings, HelpCircle, BarChart2, Video, AlertTriangle, Play, Square 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Dashboard({ 
  liveData, 
  warnings, 
  statusIndicators, 
  sessionState, 
  onStartSession, 
  onStopSession,
  historyReports,
  onRefreshReports
}) {
  const [activeTab, setActiveTab] = useState('interview');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [chartData, setChartData] = useState([]);
  
  // Update local clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update chart data in real-time
  useEffect(() => {
    if (sessionState === 'active' && liveData?.metrics) {
      const metrics = liveData.metrics;
      setChartData(prev => {
        const newPoint = {
          time: metrics.session_time || '00:00',
          readiness: metrics.readiness_score || 0,
          attention: metrics.attention_score || 0,
          stability: metrics.stability_score || 0,
          eyeContact: metrics.eye_score || 0
        };
        const updated = [...prev, newPoint];
        // Keep the last 30 data points
        if (updated.length > 30) {
          updated.shift();
        }
        return updated;
      });
    } else if (sessionState === 'ended' || sessionState === 'idle') {
      setChartData([]);
    }
  }, [liveData, sessionState]);

  // Format sizes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVerdictDetails = (verdict) => {
    switch (verdict) {
      case 'COOKIN':
        return { text: 'COOKIN 🔥', color: 'text-[#00FFA3]', bg: 'bg-[#00FFA3]/10', border: 'border-[#00FFA3]/30', glow: 'glow-emerald' };
      case 'GOOD':
        return { text: 'GOOD 👍', color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]/30', glow: 'glow-blue' };
      case 'NEEDS PRACTICE':
        return { text: 'NEEDS PRACTICE ⚠️', color: 'text-[#FFC857]', bg: 'bg-[#FFC857]/10', border: 'border-[#FFC857]/30', glow: 'glow-warning' };
      case 'COOKED':
        return { text: 'COOKED 💀', color: 'text-[#FF4D6D]', bg: 'bg-[#FF4D6D]/10', border: 'border-[#FF4D6D]/30', glow: 'glow-danger' };
      default:
        return { text: 'NO SESSION', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', glow: '' };
    }
  };

  const verdict = liveData?.metrics?.verdict || 'NO SESSION';
  const vd = getVerdictDetails(verdict);

  return (
    <div className="min-h-screen flex bg-background text-white font-sans selection:bg-[#7B61FF]/30 selection:text-white">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-72 glass-panel border-r border-white/5 flex flex-col p-6 space-y-8 z-20 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#7B61FF] flex items-center justify-center font-bold text-lg font-space shadow-[0_0_15px_rgba(0,212,255,0.3)]">
            C
          </div>
          <div>
            <h2 className="font-space font-bold text-lg leading-tight">CookedOrCookin</h2>
            <span className="text-[10px] text-muted tracking-widest font-mono uppercase">AI Analyzer</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-2">
          {[
            { id: 'interview', label: 'Interview Console', icon: Video },
            { id: 'history', label: 'Report History', icon: FileText },
            { id: 'analytics', label: 'Global Analytics', icon: BarChart2 },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'about', label: 'About Systems', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'history') onRefreshReports();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold tracking-wide font-space transition-all duration-300 group text-left relative ${
                  isActive 
                    ? 'bg-white/5 text-white border border-white/10 shadow-lg' 
                    : 'text-[#A7AAB8] hover:text-white hover:bg-white/5 hover:translate-x-1'
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1.5 h-6 rounded-r-full bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]"
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-[#00D4FF]' : 'group-hover:scale-110'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* System Control Panel */}
        <div className="glass-card p-4 rounded-[20px] border border-white/5 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#A7AAB8]">CORE ENGINE:</span>
            <span className="text-[#00FFA3] font-bold">ONLINE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#A7AAB8]">YUNET DETECTOR:</span>
            <span className="text-[#00FFA3] font-bold">LOADED</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#A7AAB8]">MEDIAPIPE MESH:</span>
            <span className="text-[#00FFA3] font-bold">ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* HEADER */}
        <header className="h-20 glass-panel border-b border-white/5 px-8 flex justify-between items-center z-10 sticky top-0 shrink-0">
          {/* Status indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sessionState === 'active' ? 'bg-[#FF4D6D]' : 'bg-[#00FFA3]'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${sessionState === 'active' ? 'bg-[#FF4D6D]' : 'bg-[#00FFA3]'}`} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                {sessionState === 'active' ? 'LIVE MONITORING' : 'CAMERA READY'}
              </span>
            </div>
            {sessionState === 'active' && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
                  <Activity className="w-4 h-4 text-[#00D4FF] animate-pulse" />
                  <span>FPS: {liveData?.metrics?.fps || 0}</span>
                </div>
              </>
            )}
          </div>

          {/* Time & Duration */}
          <div className="flex items-center gap-6 font-mono text-sm">
            <div className="flex items-center gap-2 text-[#A7AAB8]">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
            {sessionState === 'active' && (
              <div className="px-3 py-1.5 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[#FF4D6D] flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,77,109,0.15)] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D]" />
                <span>SESSION: {liveData?.metrics?.session_time || '00:00'}</span>
              </div>
            )}
          </div>
        </header>

        {/* TAB CONTENTS CONTAINER */}
        <main className="flex-1 p-8 min-h-0 relative">
          
          <AnimatePresence mode="wait">
            
            {/* TAB: INTERVIEW */}
            {activeTab === 'interview' && (
              <motion.div
                key="interview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* CENTER PANEL (CAMERA STREAM) */}
                <div className="xl:col-span-8 space-y-8">
                  <div className={`relative aspect-video rounded-[24px] overflow-hidden glass-panel border bg-[#0E1015]/60 flex items-center justify-center shadow-2xl transition-all duration-500 ${
                    sessionState === 'active' 
                      ? (warnings.length > 0 ? 'border-glow-warning' : 'border-glow-active') 
                      : 'border-white/5'
                  }`}>
                    
                    {sessionState === 'active' && liveData?.frame ? (
                      /* Live webcam feed image */
                      <img 
                        src={liveData.frame} 
                        alt="Live CV Stream" 
                        className="w-full h-full object-cover select-none"
                      />
                    ) : (
                      /* Camera Standby Screen */
                      <div className="text-center space-y-6 z-10 px-4">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] shadow-[0_0_20px_rgba(123,97,255,0.15)]">
                          <Camera className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-space">Webcam Feed Offline</h3>
                          <p className="text-sm text-muted max-w-sm mx-auto mt-2">
                            To begin mock interview analysis, activate the real-time AI loop. Your browser will configure landmarks overlay locally.
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={onStartSession}
                            className="px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] rounded-2xl font-space font-bold tracking-wider hover:opacity-90 transition-opacity flex items-center gap-3 mx-auto shadow-lg"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            START ANALYSIS SESSION
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Camera grid overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-white/[0.02]" />

                    {/* Live Warning overlays */}
                    <AnimatePresence>
                      {sessionState === 'active' && warnings.map((warn, i) => (
                        <motion.div
                          key={warn}
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -15 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="absolute top-6 right-6 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 text-[#FF4D6D] backdrop-blur-xl shadow-lg text-xs font-mono font-bold tracking-wide uppercase z-10"
                        >
                          <AlertTriangle className="w-4 h-4 animate-bounce" />
                          {warn}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Session Validity Floating Overlay */}
                    {sessionState === 'active' && (
                      <div className="absolute bottom-6 left-6 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/60 border border-white/5 backdrop-blur-md text-[10px] font-mono tracking-wider font-bold">
                        <span className={`w-2 h-2 rounded-full ${statusIndicators?.session_valid ? 'bg-[#00FFA3]' : 'bg-[#FF4D6D] animate-ping'}`} />
                        <span>SESSION STATUS: {statusIndicators?.session_valid ? 'VALID' : 'INVALID'}</span>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE CONTROLS (IF LIVE) */}
                  {sessionState === 'active' && (
                    <div className="flex gap-4">
                      <button
                        onClick={onStopSession}
                        className="px-6 py-4 bg-[#FF4D6D]/10 hover:bg-[#FF4D6D]/20 border border-[#FF4D6D]/30 hover:border-[#FF4D6D]/50 text-[#FF4D6D] rounded-2xl font-space font-bold tracking-wide transition-colors flex items-center gap-3 shadow-lg"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        TERMINATE INTERVIEW
                      </button>
                    </div>
                  )}

                  {/* REAL-TIME TIMELINE GRAPH */}
                  <div className="glass-panel p-6 rounded-[24px]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-space font-bold text-base">Real-time Behavior Timeline</h3>
                        <p className="text-xs text-muted">Averages updated frame by frame from computer vision descriptors</p>
                      </div>
                      {/* Metric Legend */}
                      <div className="flex gap-4 text-[10px] font-mono tracking-wider">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#7B61FF]" /> READINESS</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#00D4FF]" /> ATTENTION</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#00FFA3]" /> EYE CONTACT</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FFC857]" /> STABILITY</span>
                      </div>
                    </div>
                    
                    <div className="h-64 w-full">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} fontClassName="font-mono" />
                            <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" fontSize={10} fontClassName="font-mono" />
                            <Tooltip 
                              contentStyle={{ background: 'rgba(14, 16, 21, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              labelClassName="font-mono text-[#A7AAB8] text-[10px]"
                            />
                            <Line type="monotone" dataKey="readiness" stroke="#7B61FF" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="attention" stroke="#00D4FF" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="eyeContact" stroke="#00FFA3" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="stability" stroke="#FFC857" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-mono text-muted">
                          [WAITING FOR LIVE DATA FEED SESSION]
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL (AI READINESS METRIC & METRICS LIST) */}
                <div className="xl:col-span-4 space-y-8">
                  {/* AI PERFORMANCE CARD */}
                  <div className="glass-panel p-8 rounded-[24px] text-center space-y-6">
                    <h3 className="font-space font-bold text-lg text-left border-b border-white/5 pb-4">AI Readiness Summary</h3>
                    
                    {/* Circle readiness score */}
                    <div className="w-40 h-40 mx-auto relative group">
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-35 transition-all duration-500 ${vd.glow}`} />
                      <CircularProgressbar
                        value={liveData?.metrics?.readiness_score || 0}
                        text={`${Math.round(liveData?.metrics?.readiness_score || 0)}%`}
                        styles={buildStyles({
                          textSize: '20px',
                          pathColor: '#7B61FF',
                          textColor: '#ffffff',
                          trailColor: 'rgba(255,255,255,0.03)',
                        })}
                      />
                    </div>

                    {/* Verdict indicator */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] text-muted tracking-widest font-mono uppercase block">CURRENT VERDICT</span>
                      <div className={`inline-block px-5 py-2.5 rounded-2xl border font-space font-extrabold text-sm ${vd.color} ${vd.bg} ${vd.border} ${vd.glow}`}>
                        {vd.text}
                      </div>
                    </div>
                  </div>

                  {/* REAL-TIME METRICS GRID */}
                  <div className="space-y-4">
                    <h3 className="font-space font-bold text-base text-left px-2">Integrity & Behavior Metrics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metric Card: Eye Contact */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-center text-[#00FFA3]">
                          <Eye className="w-5 h-5" />
                          <span className="text-[10px] font-mono font-bold">EYE CONTACT</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono">{liveData?.metrics?.eye_score || 0}%</span>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#00FFA3]" style={{ width: `${liveData?.metrics?.eye_score || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Attention */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-center text-[#00D4FF]">
                          <Activity className="w-5 h-5" />
                          <span className="text-[10px] font-mono font-bold">ATTENTION</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono">{liveData?.metrics?.attention_score || 0}%</span>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#00D4FF]" style={{ width: `${liveData?.metrics?.attention_score || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Blinks */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-center text-[#7B61FF]">
                          <RefreshCw className="w-5 h-5" />
                          <span className="text-[10px] font-mono font-bold">BLINKS</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold font-mono">{liveData?.metrics?.blink_count || 0}</span>
                            <span className="text-[10px] text-muted font-mono">EAR: {liveData?.metrics?.ear || 0}</span>
                          </div>
                          <span className="text-[10px] text-[#A7AAB8] font-mono block mt-2">COUNT TRIGGERED</span>
                        </div>
                      </div>

                      {/* Metric Card: Stability */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-center text-[#FFC857]">
                          <Activity className="w-5 h-5 animate-pulse" />
                          <span className="text-[10px] font-mono font-bold">STABILITY</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono">{liveData?.metrics?.stability_score || 0}%</span>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#FFC857]" style={{ width: `${liveData?.metrics?.stability_score || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Presence Score */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-center text-white">
                          <Users className="w-5 h-5" />
                          <span className="text-[10px] font-mono font-bold">PRESENCE</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono">{liveData?.metrics?.presence || 0}%</span>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-white" style={{ width: `${liveData?.metrics?.presence || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Integrity Score */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex justify-between items-center text-[#00FFA3]">
                          {liveData?.metrics?.integrity >= 70 ? (
                            <ShieldCheck className="w-5 h-5 text-[#00FFA3]" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-[#FF4D6D] animate-ping" />
                          )}
                          <span className="text-[10px] font-mono font-bold">INTEGRITY</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono">{liveData?.metrics?.integrity || 0}</span>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className={`h-full ${liveData?.metrics?.integrity >= 70 ? 'bg-[#00FFA3]' : 'bg-[#FF4D6D]'}`} style={{ width: `${liveData?.metrics?.integrity || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Head Pose Sub-Card */}
                    <div className="glass-card p-5 rounded-2xl">
                      <span className="text-[10px] font-mono font-bold text-muted block mb-3">HEAD POSE (DEGREE ROTATION)</span>
                      <div className="grid grid-cols-3 gap-2 text-center font-mono">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] text-[#A7AAB8] block">PITCH</span>
                          <span className="text-sm font-bold">{liveData?.metrics?.pitch || 0.0}°</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] text-[#A7AAB8] block">YAW</span>
                          <span className="text-sm font-bold">{liveData?.metrics?.yaw || 0.0}°</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[9px] text-[#A7AAB8] block">ROLL</span>
                          <span className="text-sm font-bold">{liveData?.metrics?.roll || 0.0}°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: REPORT HISTORY */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold font-space">Mock Interview History</h2>
                    <p className="text-sm text-muted">Browse and download previously generated candidate PDF analysis reports.</p>
                  </div>
                  <button
                    onClick={onRefreshReports}
                    className="p-3 bg-secondary border border-white/5 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 text-[#00D4FF]" />
                  </button>
                </div>

                <div className="space-y-4">
                  {historyReports.length > 0 ? (
                    historyReports.map((rep) => (
                      <div
                        key={rep.filename}
                        className="glass-card p-6 rounded-[24px] flex items-center justify-between border border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF]">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-space font-bold text-white text-base">{rep.filename}</h4>
                            <div className="flex gap-4 text-xs text-muted font-mono mt-1">
                              <span>Created: {rep.created_at}</span>
                              <span>Size: {formatBytes(rep.size)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <a
                          href={`http://localhost:8000/api/reports/download/${rep.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/25 border border-[#00D4FF]/30 text-[#00D4FF] rounded-xl font-semibold text-xs tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,212,255,0.05)]"
                        >
                          <Download className="w-4 h-4" />
                          DOWNLOAD
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="glass-panel p-12 rounded-[24px] text-center space-y-4 border border-white/5">
                      <FileText className="w-12 h-12 text-[#A7AAB8] mx-auto opacity-30" />
                      <p className="text-sm font-space text-muted max-w-sm mx-auto leading-relaxed">
                        No previous PDF reports discovered in the repository historical list. Complete an interview to generate one.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: GLOBAL ANALYTICS */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold font-space">Global Analytics Dashboard</h2>
                  <p className="text-sm text-muted">Averages aggregated over all completed sessions.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 rounded-[24px] text-center">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block mb-2">AVERAGE READINESS</span>
                    <span className="text-5xl font-mono font-bold text-[#7B61FF]">78.4%</span>
                  </div>
                  <div className="glass-card p-6 rounded-[24px] text-center">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block mb-2">AVERAGE INTEGRITY</span>
                    <span className="text-5xl font-mono font-bold text-[#00D4FF]">92.1</span>
                  </div>
                  <div className="glass-card p-6 rounded-[24px] text-center">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block mb-2">TOTAL SESSIONS</span>
                    <span className="text-5xl font-mono font-bold text-[#00FFA3]">
                      {historyReports.length || 0}
                    </span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-[24px]">
                  <h3 className="font-space font-bold text-base mb-4">Historical Progression Curve</h3>
                  <div className="h-64 flex items-center justify-center border border-white/5 rounded-2xl bg-secondary/20">
                    <span className="text-xs font-mono text-muted">[GLOBAL PROGRESSION PLOT NOT ENOUGH SESSIONS DATA]</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto space-y-8 glass-panel p-8 rounded-[24px]"
              >
                <h2 className="text-xl font-bold font-space border-b border-white/5 pb-4">Settings & Thresholds</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-mono text-muted block mb-2">AUTO TERMINATION TRIGGER TIMER (SECONDS)</label>
                    <input 
                      type="text" 
                      value="10 Seconds (Absence Limit)" 
                      disabled 
                      className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted block mb-2">MINIMUM CAMERA FRAME RATE (FPS)</label>
                    <input 
                      type="text" 
                      value="25 FPS Target" 
                      disabled 
                      className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted block mb-2">INTEGRITY ALGORITHM RULES</label>
                    <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 text-[11px] font-mono text-[#A7AAB8] space-y-1">
                      <div>• Presence Score Impact: -20 penalty if presence &lt; 90%</div>
                      <div>• Multiple Face Event Penalty: -5 integrity score per event</div>
                      <div>• Invalid Session Boundary: Integrity score &lt; 70</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ABOUT SYSTEMS */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto space-y-8 glass-panel p-8 rounded-[24px]"
              >
                <h2 className="text-xl font-bold font-space border-b border-white/5 pb-4">About CookedOrCookin</h2>
                <div className="space-y-4 text-sm text-[#A7AAB8] leading-relaxed">
                  <p>
                    CookedOrCookin is a real-time behavioral readiness and integrity analysis dashboard.
                  </p>
                  <p>
                    Built on top of OpenCV, MediaPipe FaceMesh, and YuNet DNN Face Detection, the system measures eye engagement vectors, stable posture coordinates, blinks frequencies, and candidate presence indicators.
                  </p>
                  <p>
                    The UI combines high-tech futuristic overlays with glassmorphism visual systems, responsive layout structures, and high-frequency real-time Recharts indicators.
                  </p>
                  <div className="pt-4 border-t border-white/5 text-xs font-mono flex justify-between">
                    <span>VERSION: 2.1.0-VITE</span>
                    <span>DEVELOPED BY: DEEPMIND ANTIGRAVITY</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
