import React, { useState, useEffect, useRef } from 'react';
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
  
  const wsRef = useRef(null);

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/reports');
      if (res.ok) {
        const data = await res.json();
        setHistoryReports(data);
      }
    } catch (e) {
      console.error("Error fetching reports history:", e);
    }
  };

  // Poll reports once on load
  useEffect(() => {
    fetchReports();
  }, []);

  // Toast notification system for active session warnings
  useEffect(() => {
    if (sessionState === 'active' && warnings.length > 0) {
      warnings.forEach((warn) => {
        toast.error(warn, {
          id: warn, // Prevents duplicate concurrent toasts for the same warning
          duration: 3000,
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
    }
  }, [warnings, sessionState]);

  // Connect to WebSocket
  const startWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WS Connection established');
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
        setSummaryData(payload);
        setScreen('ENDING');
        setSessionState('idle');
        fetchReports(); // Refresh history reports list
        if (wsRef.current) {
          wsRef.current.close();
        }
      } else if (payload.type === 'error') {
        toast.error(payload.message);
        setScreen('START');
        setSessionState('idle');
        if (wsRef.current) {
          wsRef.current.close();
        }
      }
    };

    ws.onclose = () => {
      console.log('WS Connection closed');
      setSessionState('idle');
    };

    ws.onerror = (e) => {
      console.error('WS Error:', e);
      toast.error('Could not connect to analyzer engine backend. Check if server.py is running.');
      setScreen('START');
      setSessionState('idle');
    };
  };

  const handleStartInterview = () => {
    setScreen('LOADING');
  };

  const handleCalibrationComplete = () => {
    startWebSocket();
  };

  const handleStopInterview = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }
  };

  const handleRestart = () => {
    setLiveData(null);
    setWarnings([]);
    setStatusIndicators(null);
    setSummaryData(null);
    setScreen('START');
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-[#7B61FF]/30">
      {/* Toast Notification Container */}
      <Toaster position="top-right" />

      {screen === 'START' && (
        <StartScreen onStart={handleStartInterview} />
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
        />
      )}

      {screen === 'ENDING' && (
        <EndingScreen
          summaryData={summaryData}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
