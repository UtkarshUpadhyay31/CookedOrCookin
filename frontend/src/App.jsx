import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import StartScreen from './components/StartScreen';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import EndingScreen from './components/EndingScreen';

export default function App() {
  const [screen, setScreen] = useState('START'); // START, LOADING, DASHBOARD, ENDING
  const [sessionState, setSessionState] = useState('idle'); // idle, active, ended
  const [liveData, setLiveData] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [statusIndicators, setStatusIndicators] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [historyReports, setHistoryReports] = useState([]);
  
  // Theme state: light, dark, or system
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('co-theme') || 'system';
  });
  
  // Accent state: blue, purple, emerald, orange, rose
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('co-accent') || 'blue';
  });
  
  // Sidebar state: collapsed or expanded on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('co-sidebar-collapsed') === 'true';
  });

  // Connection manager states
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const intentionalCloseRef = useRef(false);
  const [connectionState, setConnectionState] = useState('disconnected'); // disconnected, connecting, connected, reconnecting

  // Sync Theme with class on html element
  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };

    applyTheme();
    localStorage.setItem('co-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [theme]);

  // Sync Accent Presets attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('co-accent', accent);
  }, [accent]);

  // Sync Sidebar Collapsed state
  useEffect(() => {
    localStorage.setItem('co-sidebar-collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Fetch reports from backend (with concurrency safeguard to prevent duplicate calls under StrictMode)
  const isFetchingRef = useRef(false);
  const fetchReports = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch('http://localhost:8000/api/reports');
      if (res.ok) {
        const data = await res.json();
        setHistoryReports(data);
      }
    } catch (e) {
      console.error("Error fetching reports history:", e);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Poll reports once on load
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Toast notification system for connection states
  useEffect(() => {
    if (connectionState === 'connecting') {
      toast.loading("Connecting to analyzer engine...", { id: "ws_connection", duration: 999999 });
    } else if (connectionState === 'reconnecting') {
      toast.loading(`Reconnecting to backend (Attempt ${reconnectAttempts.current})...`, { id: "ws_connection", duration: 999999 });
    } else if (connectionState === 'connected') {
      toast.success("Connected to analyzer engine", { id: "ws_connection", duration: 2000 });
    } else if (connectionState === 'disconnected') {
      toast.dismiss("ws_connection");
    }
  }, [connectionState]);

  // Toast notification system for active session warnings
  useEffect(() => {
    const ALL_POSSIBLE_WARNINGS = ["No Face Detected", "Multiple Faces Detected", "Looking Away"];
    if (sessionState === 'active') {
      // Show active warnings immediately with infinite duration (dismiss manually)
      warnings.forEach((warn) => {
        toast.error(warn, {
          id: warn, // Prevents duplicate concurrent toasts for the same warning
          duration: 999999, // Infinite duration until dismissed
          style: {
            background: 'rgba(255, 77, 109, 0.15)',
            border: '1px solid rgba(255, 77, 109, 0.3)',
            color: '#FF4D6D',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
          },
        });
      });

      // Automatically dismiss notifications for issues that are now resolved
      ALL_POSSIBLE_WARNINGS.forEach((possibleWarn) => {
        if (!warnings.includes(possibleWarn)) {
          toast.dismiss(possibleWarn);
        }
      });
    } else {
      // If session is ended or idle, dismiss all warnings immediately
      ALL_POSSIBLE_WARNINGS.forEach((possibleWarn) => {
        toast.dismiss(possibleWarn);
      });
    }
  }, [warnings, sessionState]);

  // Connect to WebSocket
  const startWebSocket = useCallback(() => {
    // If there is already an active WebSocket connection opening or open, do not duplicate it
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket connection is already active. Ignoring start request.');
      return;
    }

    // Clear any existing connection (which would be CLOSED or CLOSING)
    if (wsRef.current) {
      intentionalCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Clear any pending reconnect timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    intentionalCloseRef.current = false;
    setConnectionState(reconnectAttempts.current > 0 ? 'reconnecting' : 'connecting');

    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WS Connection established');
      reconnectAttempts.current = 0; // Reset retry counter
      setConnectionState('connected');
      // Request backend to start camera frame loop
      ws.send(JSON.stringify({ type: 'start' }));
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === 'session_state') {
        setSessionState(payload.state);
        if (payload.state === 'active') {
          setScreen('DASHBOARD');
        }
      } else if (payload.type === 'live_data') {
        setLiveData(payload);
        setWarnings(payload.warnings || []);
        setStatusIndicators(payload.status_indicators || null);
      } else if (payload.type === 'warning') {
        toast.error(payload.message, { id: payload.message });
      } else if (payload.type === 'auto_terminate') {
        toast.error(payload.reason, { id: 'auto_term', duration: 5000 });
        setSessionState('ended');
      } else if (payload.type === 'session_summary') {
        intentionalCloseRef.current = true;
        setSummaryData(payload);
        setScreen('ENDING');
        setSessionState('idle');
        setConnectionState('disconnected');
        setLiveData(null); // Clear stale live monitoring data
        setWarnings([]); // Reset warning buffers
        setStatusIndicators(null); // Clear live widgets
        fetchReports(); // Refresh history reports list
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      } else if (payload.type === 'error') {
        intentionalCloseRef.current = true;
        toast.error(payload.message);
        setScreen('START');
        setSessionState('idle');
        setConnectionState('disconnected');
        setLiveData(null); // Clear stale data on crash
        setWarnings([]); // Clear stale warnings on crash
        setStatusIndicators(null); // Clear indicators
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      }
    };

    ws.onclose = (event) => {
      console.log(`WS Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      
      // If connection was lost unexpectedly (e.g. server restart), trigger reconnect with backoff
      if (!intentionalCloseRef.current) {
        setConnectionState('reconnecting');
        reconnectAttempts.current += 1;
        
        if (reconnectAttempts.current <= 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Reconnecting in ${delay}ms (Attempt ${reconnectAttempts.current}/5)...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            startWebSocket();
          }, delay);
        } else {
          console.log("Max reconnect attempts reached. Resetting connection state.");
          toast.error("Could not reconnect to backend after multiple attempts.", { id: "ws_connection" });
          setConnectionState('disconnected');
          setScreen('START');
          setSessionState('idle');
        }
      } else {
        setConnectionState('disconnected');
      }
    };

    ws.onerror = (e) => {
      console.error('WS Error:', e);
      // Let onclose handle the reconnection state updates
    };
  }, [fetchReports]);

  // Clean up timers and sockets on component unmount
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  const handleStartInterview = useCallback(() => {
    setScreen('LOADING');
  }, []);

  const handleCalibrationComplete = useCallback(() => {
    startWebSocket();
  }, [startWebSocket]);

  const handleStopInterview = useCallback(() => {
    intentionalCloseRef.current = true;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }
  }, []);

  const handleRestart = useCallback(() => {
    setLiveData(null);
    setWarnings([]);
    setStatusIndicators(null);
    setSummaryData(null);
    setScreen('START');
  }, []);

  return (
    <div className="min-h-screen bg-background relative selection:bg-accentPrimary/30 overflow-hidden theme-transition">
      
      {/* BACKGROUND BLOBS */}
      <div className="bg-blobs-container">
        <div className="bg-blob w-[50vw] h-[50vw] -top-[20%] -left-[10%] bg-accentPrimary" />
        <div className="bg-blob w-[45vw] h-[45vw] -bottom-[15%] -right-[10%] bg-accentPrimary" style={{ animationDelay: '-8s' }} />
      </div>

      {/* Toast Notification Container */}
      <Toaster position="top-right" />

      {screen === 'START' && (
        <StartScreen 
          onStart={handleStartInterview} 
          theme={theme}
          setTheme={setTheme}
          accent={accent}
          setAccent={setAccent}
        />
      )}

      {screen === 'LOADING' && (
        <LoadingScreen onComplete={handleCalibrationComplete} />
      )}

      {screen === 'DASHBOARD' && (
        <Dashboard
          liveData={liveData}
          warnings={warnings}
          statusIndicators={statusIndicators}
          sessionState={sessionState}
          onStartSession={handleStartInterview}
          onStopSession={handleStopInterview}
          historyReports={historyReports}
          onRefreshReports={fetchReports}
          theme={theme}
          setTheme={setTheme}
          accent={accent}
          setAccent={setAccent}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      )}

      {screen === 'ENDING' && (
        <EndingScreen
          summaryData={summaryData}
          onRestart={handleRestart}
          theme={theme}
          accent={accent}
        />
      )}
    </div>
  );
}
