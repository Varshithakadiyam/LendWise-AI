import React, { useState } from 'react';
import { Sun, Moon, Bell, Search, ShieldCheck, ChevronRight, Settings, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, theme, toggleTheme, isOnline, user, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Risk Control Center';
      case 'predict': return 'Automated Underwriting';
      case 'advisor': return 'Generative AI Advisor';
      case 'shap': return 'SHAP Attributions';
      case 'whatif': return 'Scenario Playground';
      case 'chat': return 'Ask AI Assistant';
      case 'reports': return 'Reports Center';
      case 'architecture': return 'System Pipeline';
      case 'settings': return 'System Preferences';
      case 'about': return 'About LendWise';
      default: return 'LendWise AI';
    }
  };

  return (
    <header className="top-navbar" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Breadcrumbs (Feature 4) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 'bold' }}>
          <span>LendWise AI</span>
          <ChevronRight size={10} />
          <span style={{ textTransform: 'capitalize' }}>{activeTab}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 className="navbar-title">{getTabTitle()}</h2>
          
          {/* Status Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'rgba(255,255,255,0.06)', 
            padding: '4px 10px', 
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 'bold',
            border: '1px solid var(--glass-border)',
            color: isOnline ? 'var(--success-color)' : 'var(--warning-color)'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOnline ? 'var(--success-color)' : 'var(--warning-color)',
              boxShadow: `0 0 8px ${isOnline ? 'var(--success-color)' : 'var(--warning-color)'}`,
            }} />
            <span>{isOnline ? 'AI ONLINE' : 'LOCAL OFFLINE'}</span>
          </div>
        </div>
      </div>
      
      <div className="navbar-actions">
        {/* Search */}
        <div className="search-bar">
          <Search size={16} style={{ color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search applicant, logs..." />
        </div>
        
        {/* Theme Toggle */}
        <div className="nav-icon-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </div>
        
        {/* Notifications */}
        <div className="nav-icon-btn" style={{ position: 'relative' }}>
          <Bell size={18} />
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--danger-color)',
            border: '2px solid white'
          }} />
        </div>
        
        {/* User profile dropdown trigger (Feature 4) */}
        <div 
          className="user-profile" 
          onClick={() => setProfileOpen(prev => !prev)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div className="avatar" style={{ background: 'var(--secondary-grad)' }}>
            {user?.name?.slice(0,2).toUpperCase() || 'JD'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>{user?.name || 'John Doe'}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{user?.role || 'Senior Underwriter'}</span>
          </div>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: '55px',
              right: 0,
              width: '180px',
              background: 'var(--bg-sidebar)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              color: 'white',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.8 }}>
                <User size={14} /> Profile Details
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <div 
                onClick={onLogout}
                style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', color: 'var(--danger-color)' }}
                className="dropdown-logout"
              >
                <LogOut size={14} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
