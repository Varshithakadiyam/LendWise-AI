import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Splash from './components/Splash';
import Landing from './components/Landing';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Prediction from './components/Prediction';
import Advisor from './components/Advisor';
import ShapPage from './components/ShapPage';
import WhatIf from './components/WhatIf';
import Chat from './components/Chat';
import Reports from './components/Reports';
import Architecture from './components/Architecture';
import SettingsPage from './components/Settings'; // Settings
import AboutPage from './components/About'; // About
import DemoMode from './components/DemoMode'; // Recruiter Floating demo controller
import { checkBackendStatus } from './api';
import './App.css';

export default function App() {
  // Navigation states
  const [showSplash, setShowSplash] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark'); // default dark mode fintech
  const [isOnline, setIsOnline] = useState(false);
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem('LENDWISE_BACKEND_URL') || 'http://127.0.0.1:8000');

  // Applicant global states
  const [applicantData, setApplicantData] = useState({
    Gender: "Male",
    Married: "Yes",
    Dependents: "0",
    Education: "Graduate",
    Self_Employed: "No",
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 150,
    Loan_Amount_Term: 360,
    Credit_History: 1.0,
    Property_Area: "Semiurban"
  });

  // Diagnostic output states
  const [predictionResult, setPredictionResult] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [shapData, setShapData] = useState(null);

  // Monitor health/online status
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await checkBackendStatus();
      setIsOnline(status);
    };
    fetchStatus();
  }, [backendUrl]);

  // Update root element theme classes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setShowLanding(true);
    setPredictionResult(null);
    setRiskReport(null);
    setShapData(null);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key="dashboard" theme={theme} isOnline={isOnline} />;
      case 'predict':
        return (
          <Prediction 
            key="predict"
            applicantData={applicantData}
            setApplicantData={setApplicantData}
            predictionResult={predictionResult}
            setPredictionResult={setPredictionResult}
            riskReport={riskReport}
            setRiskReport={setRiskReport}
            setShapData={setShapData}
          />
        );
      case 'advisor':
        return (
          <Advisor 
            key="advisor"
            applicantData={applicantData}
            riskReport={riskReport}
            shapData={shapData}
          />
        );
      case 'shap':
        return (
          <ShapPage 
            key="shap"
            theme={theme}
            shapData={shapData}
          />
        );
      case 'whatif':
        return (
          <WhatIf 
            key="whatif"
            applicantData={applicantData}
            riskReport={riskReport}
          />
        );
      case 'chat':
        return (
          <Chat 
            key="chat"
            applicantData={applicantData}
            riskReport={riskReport}
          />
        );
      case 'reports':
        return (
          <Reports 
            key="reports"
            theme={theme}
            applicantData={applicantData}
            riskReport={riskReport}
          />
        );
      case 'architecture':
        return <Architecture key="architecture" />;
      case 'settings':
        return (
          <SettingsPage 
            key="settings"
            theme={theme}
            toggleTheme={toggleTheme}
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
          />
        );
      case 'about':
        return <AboutPage key="about" />;
      default:
        return <Dashboard key="dashboard" theme={theme} isOnline={isOnline} />;
    }
  };

  // 1. Loading experience splash screen
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  // 2. Large Hero Landing page
  if (!isAuthenticated && showLanding) {
    return <Landing onLaunch={() => setShowLanding(false)} />;
  }

  // 3. Login page
  if (!isAuthenticated) {
    return <Login onLogin={(userObj) => { setIsAuthenticated(true); setUser(userObj); }} />;
  }

  // 4. Main Authenticated Platform
  return (
    <div className="app-wrapper">
      {/* Background blobs */}
      <div className="background-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Collapsible Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Top bar and content viewport */}
      <main className="app-content">
        <Navbar 
          activeTab={activeTab} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          isOnline={isOnline}
          user={user}
          onLogout={handleLogout}
        />
        
        <div className="page-container">
          <AnimatePresence mode="wait">
            {renderActivePage()}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Recruiter Demo Mode controller */}
      <DemoMode 
        setApplicantData={setApplicantData}
        setPredictionResult={setPredictionResult}
        setRiskReport={setRiskReport}
        setShapData={setShapData}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
