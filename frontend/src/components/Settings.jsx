import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, ShieldAlert, Key, Globe, Eye } from 'lucide-react';

const ACCENT_PRESETS = [
  { name: 'Classic Indigo', primary: '#2563EB', secondary: '#7C3AED' },
  { name: 'Aurora Emerald', primary: '#059669', secondary: '#0D9488' },
  { name: 'Sunset Crimson', primary: '#DC2626', secondary: '#EA580C' },
  { name: 'Royal Violet', primary: '#4F46E5', secondary: '#9333EA' }
];

export default function SettingsPage({ theme, toggleTheme, backendUrl, setBackendUrl }) {
  const [apiKeyGemini, setApiKeyGemini] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [apiKeyOpenAI, setApiKeyOpenAI] = useState(() => localStorage.getItem('OPENAI_API_KEY') || '');
  const [accent, setAccent] = useState('Classic Indigo');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKeyGemini);
    localStorage.setItem('OPENAI_API_KEY', apiKeyOpenAI);
    localStorage.setItem('LENDWISE_BACKEND_URL', backendUrl);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const applyAccent = (preset) => {
    setAccent(preset.name);
    const root = document.documentElement;
    root.style.setProperty('--primary-grad', `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Settings Card */}
      <div className="glass-card">
        <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Settings size={18} style={{ color: '#7C3AED' }} /> LendWise System Preferences
        </h3>

        {savedMsg && (
          <div style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            color: 'var(--success-color)', 
            padding: '12px', 
            borderRadius: '8px', 
            fontSize: '13px', 
            border: '1px solid rgba(34, 197, 94, 0.2)',
            marginBottom: '20px'
          }}>
            ✓ System settings saved successfully and loaded into runtime cache.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Theme selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>UI Theme Mode</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Toggles dark and light mode styling overlays.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => theme !== 'dark' && toggleTheme()}
                className="outline-btn"
                style={{ flexGrow: 1, background: theme === 'dark' ? 'var(--input-bg)' : 'transparent', border: theme === 'dark' ? '1px solid #7C3AED' : '1px solid var(--input-border)' }}
              >
                Dark Mode (Default)
              </button>
              <button 
                onClick={() => theme !== 'light' && toggleTheme()}
                className="outline-btn"
                style={{ flexGrow: 1, background: theme === 'light' ? 'white' : 'transparent', border: theme === 'light' ? '1px solid #7C3AED' : '1px solid var(--input-border)' }}
              >
                Light Mode
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          {/* Accent Color selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Visual Accents</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Alters the primary system color gradients.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {ACCENT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyAccent(p)}
                  className="outline-btn"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px', 
                    fontSize: '12px',
                    borderColor: accent === p.name ? '#7C3AED' : 'var(--input-border)'
                  }}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          {/* Backend Connection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={14} /> Backend Gateway API</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Points Axios requests to target python routes.</p>
            </div>
            <input 
              type="text" 
              value={backendUrl} 
              onChange={(e) => setBackendUrl(e.target.value)} 
              placeholder="http://127.0.0.1:8000"
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          {/* AI Credentials API Keys */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Key size={14} /> AI Credentials</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Input API keys to enable live underwriter LLM assistants.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '10px' }}>Gemini Pro API Key</label>
                <input 
                  type="password" 
                  value={apiKeyGemini} 
                  onChange={(e) => setApiKeyGemini(e.target.value)}
                  placeholder="AIzaSy..."
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '10px' }}>OpenAI API Key</label>
                <input 
                  type="password" 
                  value={apiKeyOpenAI} 
                  onChange={(e) => setApiKeyOpenAI(e.target.value)}
                  placeholder="sk-proj-..."
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          {/* Reduced Motion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> Reduced Motion</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Disables heavy Framer Motion keyframe transitions.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={reducedMotion} 
                onChange={(e) => setReducedMotion(e.target.checked)}
                style={{ accentColor: '#7C3AED', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '13.5px' }}>Enable reduced motion</span>
            </label>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="gradient-btn"
          style={{ width: '100%', marginTop: '30px' }}
        >
          <Save size={16} /> Save Preference Parameters
        </button>
      </div>
    </motion.div>
  );
}
