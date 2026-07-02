import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Eye, Activity, ShieldCheck, ShieldAlert, Users, 
  RefreshCw, Clock, Download, FileText, Settings, HelpCircle, 
  BarChart2, Video, AlertTriangle, Play, Square, Menu, X, Sun, Moon, Laptop, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
  onRefreshReports,
  theme,
  setTheme,
  accent,
  setAccent,
  sidebarCollapsed,
  setSidebarCollapsed
}) {
  const [activeTab, setActiveTab] = useState('interview');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [chartData, setChartData] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Update local clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    // Simulate loading states for UI skeletons
    const skeletonTimer = setTimeout(() => setContentLoaded(true), 600);
    
    return () => {
      clearInterval(timer);
      clearTimeout(skeletonTimer);
    };
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
        return { text: 'COOKIN 🔥', color: 'text-[#10B981] dark:text-[#00FFA3]', bg: 'bg-[#10B981]/10 dark:bg-[#00FFA3]/10', border: 'border-[#10B981]/30 dark:border-[#00FFA3]/30', glow: 'glow-emerald' };
      case 'GOOD':
        return { text: 'GOOD 👍', color: 'text-[#2563EB] dark:text-[#00D4FF]', bg: 'bg-[#2563EB]/10 dark:bg-[#00D4FF]/10', border: 'border-[#2563EB]/30 dark:border-[#00D4FF]/30', glow: 'glow-blue' };
      case 'NEEDS PRACTICE':
        return { text: 'NEEDS PRACTICE ⚠️', color: 'text-[#FFC857]', bg: 'bg-[#FFC857]/10', border: 'border-[#FFC857]/30', glow: 'glow-warning' };
      case 'COOKED':
        return { text: 'COOKED 💀', color: 'text-[#FF4D6D]', bg: 'bg-[#FF4D6D]/10', border: 'border-[#FF4D6D]/30', glow: 'glow-danger' };
      default:
        return { text: 'NO SESSION', color: 'text-textMuted/60', bg: 'bg-black/5 dark:bg-white/5', border: 'border-borderPrimary', glow: '' };
    }
  };

  const verdict = liveData?.metrics?.verdict || 'NO SESSION';
  const vd = getVerdictDetails(verdict);

  const themeOptions = [
    { id: 'light', label: 'Light Theme', icon: Sun },
    { id: 'dark', label: 'Dark Theme', icon: Moon },
    { id: 'system', label: 'System Pref', icon: Laptop }
  ];

  const accentPresets = [
    { id: 'blue', color: 'bg-[#2563EB] dark:bg-[#00D4FF]', border: 'border-[#2563EB] dark:border-[#00D4FF]' },
    { id: 'purple', color: 'bg-[#7C3AED] dark:bg-[#7B61FF]', border: 'border-[#7C3AED] dark:border-[#7B61FF]' },
    { id: 'emerald', color: 'bg-[#10B981] dark:bg-[#00FFA3]', border: 'border-[#10B981] dark:border-[#00FFA3]' },
    { id: 'orange', color: 'bg-[#EA580C] dark:bg-[#FF9F1C]', border: 'border-[#EA580C] dark:border-[#FF9F1C]' },
    { id: 'rose', color: 'bg-[#E11D48] dark:bg-[#FF4D6D]', border: 'border-[#E11D48] dark:border-[#FF4D6D]' }
  ];

  const navTabs = [
    { id: 'interview', label: 'Interview Console', icon: Video },
    { id: 'history', label: 'Report History', icon: FileText },
    { id: 'analytics', label: 'Global Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About Systems', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-textMain font-sans theme-transition overflow-hidden">
      
      {/* --------------------------------------------------
         DESKTOP COLLAPSIBLE SIDEBAR
      -------------------------------------------------- */}
      <aside className={`hidden lg:flex flex-col glass-panel border-r border-borderPrimary p-6 space-y-8 z-20 shrink-0 relative transition-all duration-500 ease-in-out ${
        sidebarCollapsed ? 'w-24' : 'w-72'
      }`}>
        {/* Toggle Collapse Trigger */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-secondary border border-borderPrimary flex items-center justify-center text-textMuted hover:text-textMain shadow-soft hover:scale-110 active:scale-95 transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accentPrimary to-[#7B61FF] flex items-center justify-center font-bold text-lg font-space text-white shadow-accent shrink-0">
            C
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-space font-bold text-lg leading-tight text-textMain">CookedOrCookin</h2>
              <span className="text-[10px] text-textMuted tracking-widest font-mono uppercase">AI Analyzer</span>
            </motion.div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-2">
          {navTabs.map((tab) => {
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
                    ? 'bg-black/5 dark:bg-white/5 text-textMain border border-borderPrimary shadow-card' 
                    : 'text-textMuted hover:text-textMain hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1 h-6 rounded-r-full bg-accentPrimary shadow-[0_0_10px_var(--accent-primary)]"
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 shrink-0 ${isActive ? 'text-accentPrimary' : 'group-hover:scale-110'}`} />
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Accent Presets Selector (Visible when expanded) */}
        {!sidebarCollapsed && (
          <div className="space-y-3 pt-4 border-t border-borderPrimary">
            <span className="text-[10px] font-bold font-mono tracking-widest text-textMuted uppercase block">ACCENT PRESETS</span>
            <div className="flex gap-2 justify-between items-center px-1">
              {accentPresets.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => setAccent(pr.id)}
                  className={`w-5.5 h-5.5 rounded-full ${pr.color} relative transition-transform hover:scale-110 ${
                    accent === pr.id ? 'ring-2 ring-offset-2 ring-offset-background ring-textMain scale-110' : ''
                  }`}
                  title={`${pr.id} accent color preset`}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* --------------------------------------------------
         MOBILE NAV DRAWER & OVERLAYS
      -------------------------------------------------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            {/* Drawer sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-xs bg-secondary border-r border-borderPrimary p-6 flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center border-b border-borderPrimary pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accentPrimary to-[#7B61FF] flex items-center justify-center font-bold text-base text-white shadow-accent">
                    C
                  </div>
                  <div>
                    <h2 className="font-space font-bold text-base leading-tight">CookedOrCookin</h2>
                    <span className="text-[9px] text-textMuted tracking-wider font-mono">AI Analyzer</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl border border-borderPrimary hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Menu Links */}
              <nav className="flex-1 space-y-1">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                        if (tab.id === 'history') onRefreshReports();
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide font-space transition-colors ${
                        isActive 
                          ? 'bg-black/5 dark:bg-white/5 text-textMain border border-borderPrimary' 
                          : 'text-textMuted hover:text-textMain'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-accentPrimary' : ''}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Accent presets mobile settings */}
              <div className="space-y-3 pt-4 border-t border-borderPrimary">
                <span className="text-[10px] font-bold font-mono tracking-widest text-textMuted uppercase block">ACCENT PRESETS</span>
                <div className="flex gap-3 justify-center items-center py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-borderPrimary">
                  {accentPresets.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => setAccent(pr.id)}
                      className={`w-6 h-6 rounded-full ${pr.color} relative transition-transform ${
                        accent === pr.id ? 'ring-2 ring-offset-2 ring-offset-background ring-textMain scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------
         STICKY HEADER NAVBAR (FOR ALL SIZES)
      -------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 glass-panel border-b border-borderPrimary px-4 sm:px-8 flex justify-between items-center z-30 sticky top-0 shrink-0">
          
          {/* Left Block (Mobile Menu Trigger + Status Indicator) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-borderPrimary text-textMuted hover:text-textMain"
              aria-label="Open mobile navigation drawer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`radar-pulse-ring absolute inline-flex h-full w-full rounded-full opacity-75 ${sessionState === 'active' ? 'bg-danger' : 'bg-accentPrimary'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${sessionState === 'active' ? 'bg-danger' : 'bg-accentPrimary'}`} />
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                {sessionState === 'active' ? 'LIVE MONITORING' : 'CAMERA READY'}
              </span>
            </div>
            {sessionState === 'active' && (
              <>
                <div className="hidden sm:block h-4 w-px bg-borderPrimary" />
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-textMuted font-mono">
                  <Activity className="w-4 h-4 text-accentPrimary animate-pulse" />
                  <span>FPS: {liveData?.metrics?.fps || 0}</span>
                </div>
              </>
            )}
          </div>

          {/* Right Block (Clock, Duration, and Theme Controller Switcher) */}
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-sm">
            <div className="hidden md:flex items-center gap-2 text-textMuted">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
            
            {sessionState === 'active' && (
              <div className="px-2.5 py-1.5 rounded-xl bg-danger/10 border border-danger/30 text-danger flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,77,109,0.15)] animate-pulse text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
                <span>{liveData?.metrics?.session_time || '00:00'}</span>
              </div>
            )}

            {/* THEME SELECTOR BUTTON */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2.5 rounded-xl border border-borderPrimary hover:border-accentPrimary hover:bg-black/5 dark:hover:bg-white/5 transition-all text-textMuted hover:text-textMain flex items-center"
                aria-label="Toggle theme switcher dropdown"
              >
                {theme === 'light' && <Sun className="w-4.5 h-4.5 rotate-0 transition-transform duration-500 text-accentPrimary" />}
                {theme === 'dark' && <Moon className="w-4.5 h-4.5 rotate-360 transition-transform duration-500 text-accentPrimary" />}
                {theme === 'system' && <Laptop className="w-4.5 h-4.5 text-accentPrimary" />}
              </button>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setThemeDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-40 glass-panel p-2 rounded-2xl border border-borderPrimary shadow-xl z-40 space-y-1 text-left"
                    >
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setTheme(opt.id);
                              setThemeDropdownOpen(false);
                            }}
                            className={`w-full py-2 px-3 rounded-xl flex items-center gap-3 text-xs font-space font-bold transition-all ${
                              isActive 
                                ? 'bg-accentPrimary text-white shadow-card' 
                                : 'text-textMuted hover:text-textMain hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* --------------------------------------------------
           DASHBOARD INNER PAGE GRID
        -------------------------------------------------- */}
        <main className="flex-1 p-4 sm:p-8 min-h-0 relative z-10 pb-24 lg:pb-8">
          
          <AnimatePresence mode="wait">
            
            {/* VIEW TAB: INTERVIEW */}
            {activeTab === 'interview' && (
              <motion.div
                key="interview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8"
              >
                {/* CENTER PANEL (WEBCAM & TIMELINE CHART) */}
                <div className="xl:col-span-8 space-y-6 sm:space-y-8">
                  
                  {/* Camera card */}
                  <div className={`relative aspect-video rounded-[24px] overflow-hidden glass-panel border bg-[#0E1015]/60 flex items-center justify-center shadow-soft transition-all duration-500 ${
                    sessionState === 'active' 
                      ? (warnings.length > 0 ? 'border-glow-warning border-warning' : 'border-glow-active border-accentPrimary') 
                      : 'border-borderPrimary'
                  }`}>
                    
                    {sessionState === 'active' && liveData?.frame ? (
                      <img 
                        src={liveData.frame} 
                        alt="Live CV Stream" 
                        className="w-full h-full object-cover select-none"
                      />
                    ) : (
                      // Camera offline / standby panel
                      <div className="text-center space-y-6 z-10 px-4 py-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-accentPrimary/10 border border-accentPrimary/20 flex items-center justify-center text-accentPrimary shadow-accent">
                          <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold font-space">Webcam Feed Offline</h3>
                          <p className="text-xs sm:text-sm text-textMuted max-w-sm mx-auto mt-2">
                            To begin mock interview analysis, activate the real-time AI loop. Your browser will configure landmarks overlay locally.
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={onStartSession}
                            className="px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-accentPrimary to-[#7B61FF] text-white rounded-2xl font-space font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 mx-auto shadow-accent"
                          >
                            <Play className="w-4 h-4 fill-current text-white" />
                            START ANALYSIS SESSION
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Scan line overlay inside camera */}
                    <div className="absolute inset-0 pointer-events-none border border-white/[0.01]" />

                    {/* Warning Notification Badges inside Feed */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10 max-w-[90%]">
                      <AnimatePresence>
                        {sessionState === 'active' && warnings.map((warn) => (
                          <motion.div
                            key={warn}
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-danger/15 border border-danger/30 text-danger backdrop-blur-xl shadow-lg text-[10px] font-mono font-bold tracking-wide uppercase"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 animate-bounce shrink-0" />
                            {warn}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {/* Session Validity Indicator inside Feed */}
                    {sessionState === 'active' && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/60 dark:bg-secondary/80 border border-borderPrimary backdrop-blur-md text-[9px] font-mono font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusIndicators?.session_valid ? 'bg-[#10B981] dark:bg-[#00FFA3]' : 'bg-danger animate-ping'}`} />
                        <span className="text-white">SESSION: {statusIndicators?.session_valid ? 'VALID' : 'INVALID'}</span>
                      </div>
                    )}
                  </div>

                  {/* Active controls banner */}
                  {sessionState === 'active' && (
                    <div className="flex gap-4">
                      <button
                        onClick={onStopSession}
                        className="px-6 py-3.5 bg-danger/10 hover:bg-danger/20 border border-danger/30 hover:border-danger/50 text-danger rounded-2xl font-space font-bold tracking-wide transition-colors flex items-center gap-3 shadow-soft"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        TERMINATE INTERVIEW
                      </button>
                    </div>
                  )}

                  {/* REAL-TIME TIMELINE GRAPH */}
                  <div className="glass-panel p-6 rounded-[24px]">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-space font-bold text-base text-textMain">Real-time Behavior Timeline</h3>
                        <p className="text-xs text-textMuted">Averages updated frame by frame from computer vision descriptors</p>
                      </div>
                      
                      {/* Custom Graph Legend */}
                      <div className="flex flex-wrap gap-3 text-[9px] font-mono tracking-wider text-textMuted">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#7B61FF]" /> READINESS</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accentPrimary" /> ATTENTION</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> EYE CONTACT</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FFC857]" /> STABILITY</span>
                      </div>
                    </div>
                    
                    <div className="h-64 w-full overflow-x-auto">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="99%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid stroke={theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'} strokeDasharray="3 3" />
                            <XAxis dataKey="time" stroke="var(--text-muted)" opacity={0.5} fontSize={10} fontClassName="font-mono" />
                            <YAxis domain={[0, 100]} stroke="var(--text-muted)" opacity={0.5} fontSize={10} fontClassName="font-mono" />
                            <Tooltip 
                              contentStyle={{ 
                                background: theme === 'light' ? '#FFFFFF' : '#0E1015', 
                                borderColor: 'var(--border-primary)', 
                                borderRadius: '14px', 
                                color: 'var(--text-main)' 
                              }}
                              labelStyle={{ fontSize: '10px', opacity: 0.5, fontFamily: 'monospace' }}
                            />
                            <Line type="monotone" dataKey="readiness" stroke="#7B61FF" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="attention" stroke="var(--accent-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="eyeContact" stroke="#10B981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="stability" stroke="#FFC857" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-xs font-mono text-textMuted py-8">
                          <Activity className="w-10 h-10 text-accentPrimary animate-pulse" />
                          <span>[WAITING FOR LIVE DATA FEED SESSION]</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL (AI READINESS GAUGE & COMPONENT STATS) */}
                <div className="xl:col-span-4 space-y-6 sm:space-y-8">
                  
                  {/* Circular Score Panel */}
                  <div className="glass-panel p-8 rounded-[24px] text-center space-y-6">
                    <h3 className="font-space font-bold text-lg text-left border-b border-borderPrimary pb-4 text-textMain">AI Readiness Summary</h3>
                    
                    <div className="w-40 h-40 mx-auto relative group">
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-20 dark:opacity-35 transition-all duration-500 ${vd.glow}`} />
                      <CircularProgressbar
                        value={liveData?.metrics?.readiness_score || 0}
                        text={`${Math.round(liveData?.metrics?.readiness_score || 0)}%`}
                        styles={buildStyles({
                          textSize: '20px',
                          pathColor: 'var(--accent-primary)',
                          textColor: 'var(--text-main)',
                          trailColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                        })}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] text-textMuted tracking-widest font-mono uppercase block">CURRENT VERDICT</span>
                      <div className={`inline-block px-5 py-2.5 rounded-2xl border font-space font-extrabold text-sm ${vd.color} ${vd.bg} ${vd.border} ${vd.glow}`}>
                        {vd.text}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Cards Grid */}
                  <div className="space-y-4">
                    <h3 className="font-space font-bold text-base text-left px-2 text-textMain">Integrity & Behavior Metrics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metric Card: Eye Contact */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border border-borderPrimary">
                        <div className="flex justify-between items-center text-[#10B981] dark:text-[#00FFA3]">
                          <Eye className="w-5 h-5 shrink-0" />
                          <span className="text-[9px] font-mono font-bold tracking-wider">EYE CONTACT</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono text-textMain">{liveData?.metrics?.eye_score || 0}%</span>
                          <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#10B981]" style={{ width: `${liveData?.metrics?.eye_score || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Attention */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border border-borderPrimary">
                        <div className="flex justify-between items-center text-accentPrimary">
                          <Activity className="w-5 h-5 shrink-0" />
                          <span className="text-[9px] font-mono font-bold tracking-wider">ATTENTION</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono text-textMain">{liveData?.metrics?.attention_score || 0}%</span>
                          <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-accentPrimary" style={{ width: `${liveData?.metrics?.attention_score || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Blinks */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border border-borderPrimary">
                        <div className="flex justify-between items-center text-[#7B61FF]">
                          <RefreshCw className="w-5 h-5 shrink-0" />
                          <span className="text-[9px] font-mono font-bold tracking-wider">BLINKS</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold font-mono text-textMain">{liveData?.metrics?.blink_count || 0}</span>
                            <span className="text-[9px] text-textMuted font-mono">EAR: {liveData?.metrics?.ear || 0}</span>
                          </div>
                          <span className="text-[9px] text-textMuted font-mono block mt-2">COUNT TRIGGERED</span>
                        </div>
                      </div>

                      {/* Metric Card: Stability */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border border-borderPrimary">
                        <div className="flex justify-between items-center text-[#FFC857]">
                          <Activity className="w-5 h-5 shrink-0 animate-pulse" />
                          <span className="text-[9px] font-mono font-bold tracking-wider">STABILITY</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono text-textMain">{liveData?.metrics?.stability_score || 0}%</span>
                          <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#FFC857]" style={{ width: `${liveData?.metrics?.stability_score || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Presence Score */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border border-borderPrimary">
                        <div className="flex justify-between items-center text-textMain">
                          <Users className="w-5 h-5 shrink-0" />
                          <span className="text-[9px] font-mono font-bold tracking-wider">PRESENCE</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono text-textMain">{liveData?.metrics?.presence || 0}%</span>
                          <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-textMain" style={{ width: `${liveData?.metrics?.presence || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Metric Card: Integrity Score */}
                      <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 border border-borderPrimary">
                        <div className="flex justify-between items-center text-accentPrimary">
                          {liveData?.metrics?.integrity >= 70 ? (
                            <ShieldCheck className="w-5 h-5 text-[#10B981] dark:text-[#00FFA3] shrink-0" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-danger shrink-0 animate-bounce" />
                          )}
                          <span className="text-[9px] font-mono font-bold tracking-wider">INTEGRITY</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold font-mono text-textMain">{liveData?.metrics?.integrity || 0}</span>
                          <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div className={`h-full ${liveData?.metrics?.integrity >= 70 ? 'bg-[#10B981]' : 'bg-danger'}`} style={{ width: `${liveData?.metrics?.integrity || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Head Pose rotational grid */}
                    <div className="glass-card p-5 rounded-2xl border border-borderPrimary">
                      <span className="text-[9px] font-mono font-bold text-textMuted block mb-3">HEAD POSE (DEGREE ROTATION)</span>
                      <div className="grid grid-cols-3 gap-2 text-center font-mono">
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-borderPrimary">
                          <span className="text-[9px] text-textMuted block">PITCH</span>
                          <span className="text-xs sm:text-sm font-bold text-textMain">{liveData?.metrics?.pitch || 0.0}°</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-borderPrimary">
                          <span className="text-[9px] text-textMuted block">YAW</span>
                          <span className="text-xs sm:text-sm font-bold text-textMain">{liveData?.metrics?.yaw || 0.0}°</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-borderPrimary">
                          <span className="text-[9px] text-textMuted block">ROLL</span>
                          <span className="text-xs sm:text-sm font-bold text-textMain">{liveData?.metrics?.roll || 0.0}°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW TAB: REPORT HISTORY */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex justify-between items-center border-b border-borderPrimary pb-4 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold font-space text-textMain">Mock Interview History</h2>
                    <p className="text-xs sm:text-sm text-textMuted">Browse and download previously generated candidate PDF analysis reports.</p>
                  </div>
                  <button
                    onClick={onRefreshReports}
                    className="p-3 bg-black/5 dark:bg-white/5 border border-borderPrimary rounded-2xl hover:border-accentPrimary hover:scale-105 active:scale-95 transition-all text-accentPrimary shadow-soft"
                    aria-label="Refresh reports list"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {historyReports.length > 0 ? (
                    historyReports.map((rep) => (
                      <div
                        key={rep.filename}
                        className="glass-card p-6 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-borderPrimary gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 border border-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-space font-bold text-textMain text-base">{rep.filename}</h4>
                            <div className="flex gap-4 text-xs text-textMuted font-mono mt-1">
                              <span>Created: {rep.created_at}</span>
                              <span>Size: {formatBytes(rep.size)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <a
                          href={`http://localhost:8000/api/reports/download/${rep.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto px-5 py-3 bg-accentPrimary/10 hover:bg-accentPrimary/25 border border-accentPrimary/30 hover:border-accentPrimary/60 text-accentPrimary rounded-xl font-semibold text-xs tracking-wider flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_var(--accent-glow)]"
                        >
                          <Download className="w-4 h-4 text-accentPrimary" />
                          DOWNLOAD
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="glass-panel p-12 rounded-[24px] text-center space-y-4 border border-borderPrimary">
                      <FileText className="w-12 h-12 text-textMuted mx-auto opacity-30 animate-pulse" />
                      <p className="text-sm font-space text-textMuted max-w-sm mx-auto leading-relaxed">
                        No previous PDF reports discovered in the repository historical list. Complete an interview to generate one.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW TAB: GLOBAL ANALYTICS */}
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
                  <h2 className="text-2xl font-bold font-space text-textMain">Global Analytics Dashboard</h2>
                  <p className="text-xs sm:text-sm text-textMuted">Averages aggregated over all completed mock assessment sessions.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Box 1 */}
                  <div className="glass-card p-6 rounded-[24px] text-center border border-borderPrimary">
                    <span className="text-[10px] font-mono text-textMuted uppercase tracking-wider block mb-2">AVERAGE READINESS</span>
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-[#7B61FF]">78.4%</span>
                  </div>
                  {/* Box 2 */}
                  <div className="glass-card p-6 rounded-[24px] text-center border border-borderPrimary">
                    <span className="text-[10px] font-mono text-textMuted uppercase tracking-wider block mb-2">AVERAGE INTEGRITY</span>
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-accentPrimary">92.1</span>
                  </div>
                  {/* Box 3 */}
                  <div className="glass-card p-6 rounded-[24px] text-center border border-borderPrimary">
                    <span className="text-[10px] font-mono text-textMuted uppercase tracking-wider block mb-2">TOTAL SESSIONS</span>
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-[#10B981]">
                      {historyReports.length || 0}
                    </span>
                  </div>
                </div>

                {/* Progressive curve placeholder */}
                <div className="glass-panel p-6 rounded-[24px] border border-borderPrimary">
                  <h3 className="font-space font-bold text-base mb-4 text-textMain">Historical Progression Curve</h3>
                  
                  {!contentLoaded ? (
                    // Skeleton loader shimmer
                    <div className={`w-full h-64 ${theme === 'light' ? 'light-skeleton' : 'skeleton-box'}`} />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center border border-borderPrimary rounded-2xl bg-black/5 dark:bg-white/5 p-4 text-center">
                      <BarChart2 className="w-10 h-10 text-textMuted opacity-40 animate-pulse mb-3" />
                      <span className="text-xs font-mono text-textMuted">[GLOBAL PROGRESSION PLOT REQUIRES MULTIPLE HISTORIC ASSESSMENT SESSIONS]</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto space-y-8 glass-panel p-6 sm:p-8 rounded-[24px] border border-borderPrimary"
              >
                <h2 className="text-xl font-bold font-space border-b border-borderPrimary pb-4 text-textMain">Settings & Customization</h2>
                
                <div className="space-y-6">
                  {/* Active theme controller inside settings tab */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-textMuted uppercase block">ACTIVE SYSTEM THEME</span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-borderPrimary max-w-sm">
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id)}
                            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-space font-bold transition-all ${
                              isActive 
                                ? 'bg-accentPrimary text-white shadow-card' 
                                : 'text-textMuted hover:text-textMain'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {opt.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active accent preset selector inside settings tab */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-textMuted uppercase block">UI COLOR PRESET</span>
                    <div className="flex gap-3 items-center py-3 px-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-borderPrimary max-w-sm">
                      {accentPresets.map((pr) => {
                        const isSelected = accent === pr.id;
                        return (
                          <button
                            key={pr.id}
                            onClick={() => setAccent(pr.id)}
                            className={`w-7 h-7 rounded-full ${pr.color} relative transition-all duration-300 hover:scale-110 ${
                              isSelected ? 'ring-2 ring-offset-2 ring-offset-background ring-textMain scale-115' : ''
                            }`}
                            title={`${pr.id} Preset`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-borderPrimary" />

                  {/* Other thresholds */}
                  <div>
                    <label className="text-[10px] font-mono text-textMuted block mb-2 uppercase">AUTO TERMINATION TRIGGER TIMER (SECONDS)</label>
                    <input 
                      type="text" 
                      value="10 Seconds (Absence Limit)" 
                      disabled 
                      className="w-full bg-black/5 dark:bg-white/5 border border-borderPrimary rounded-xl px-4 py-3 text-sm font-mono text-textMuted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-textMuted block mb-2 uppercase">MINIMUM CAMERA FRAME RATE (FPS)</label>
                    <input 
                      type="text" 
                      value="25 FPS Target" 
                      disabled 
                      className="w-full bg-black/5 dark:bg-white/5 border border-borderPrimary rounded-xl px-4 py-3 text-sm font-mono text-textMuted cursor-not-allowed"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW TAB: ABOUT SYSTEMS */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto space-y-8 glass-panel p-6 sm:p-8 rounded-[24px] border border-borderPrimary"
              >
                <h2 className="text-xl font-bold font-space border-b border-borderPrimary pb-4 text-textMain">About CookedOrCookin</h2>
                <div className="space-y-4 text-sm text-textMuted leading-relaxed">
                  <p>
                    CookedOrCookin is a real-time mock interview readiness and integrity analyzer system.
                  </p>
                  <p>
                    Built with OpenCV, MediaPipe FaceMesh, and YuNet DNN Face Detection, the platform measures yaw/pitch head postures, EAR blink trackers, eye vector engagements, stability indexes, presence durations, and environment integrity bounds.
                  </p>
                  <p>
                    The UI combines high-tech futuristic overlays with theme configurations, customizable accent presets, responsive sliders, and live chart timeline monitors.
                  </p>
                  <div className="pt-4 border-t border-borderPrimary text-xs font-mono flex justify-between gap-4">
                    <span>VERSION: 2.2.0-VITE</span>
                    <span>DEVELOPED BY: UTKARSH UPADHYAY</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* --------------------------------------------------
           MOBILE BOTTOM NAVIGATION BAR (FIXED ON PHONES/TABLETS)
        -------------------------------------------------- */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-secondary/95 border-t border-borderPrimary backdrop-blur-md px-2 flex justify-around items-center z-30 shadow-2xl">
          {navTabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'history') onRefreshReports();
                }}
                className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-accentPrimary scale-105' : 'text-textMuted'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeMobileIndicator"
                    className="absolute -top-1.5 w-8 h-1 rounded-full bg-accentPrimary shadow-[0_0_8px_var(--accent-primary)]"
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-space font-bold mt-1 tracking-tight leading-none">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
