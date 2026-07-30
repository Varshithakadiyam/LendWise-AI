import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  FileText, 
  Compass, 
  Sliders, 
  Bot, 
  Network, 
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Loan Prediction', icon: Sparkles },
    { id: 'advisor', label: 'AI Risk Advisor', icon: FileText },
    { id: 'shap', label: 'SHAP Explainability', icon: Compass },
    { id: 'whatif', label: 'What-If Analysis', icon: Sliders },
    { id: 'chat', label: 'Ask AI Assistant', icon: Bot },
    { id: 'reports', label: 'Reports Center', icon: BarChart3 },
    { id: 'architecture', label: 'System Architecture', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About LendWise', icon: Info }
  ];

  return (
    <aside className="app-sidebar" style={{
      width: isCollapsed ? '80px' : '280px',
      transition: 'var(--transition-smooth)'
    }}>
      {/* Header with toggle */}
      <div className="sidebar-logo" style={{ justifyContent: isCollapsed ? 'center' : 'space-between', paddingRight: isCollapsed ? '0' : '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ background: 'var(--primary-grad)', width: '34px', height: '34px' }}>LW</div>
          {!isCollapsed && <span className="logo-text">LendWise AI</span>}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="nav-icon-btn" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)} 
          className="nav-icon-btn" 
          style={{ width: '28px', height: '28px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', alignSelf: 'center', marginBottom: '25px' }}
          title="Expand Sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}
      
      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '14px 0' : '14px 18px' }}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={18} className="nav-icon" style={{ strokeWidth: 2.5, flexShrink: 0 }} />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </div>
          );
        })}
      </nav>
      
      {/* Logout */}
      <div 
        onClick={onLogout}
        className="nav-item" 
        style={{ marginTop: 'auto', opacity: 0.6, justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '14px 0' : '14px 18px' }}
        title={isCollapsed ? 'Logout' : ''}
      >
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
        {!isCollapsed && <span className="nav-label">Logout</span>}
      </div>
    </aside>
  );
}
