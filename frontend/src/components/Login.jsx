import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Sparkles, UserCheck } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('underwriter@lendwise.ai');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate demo credentials verification
    setTimeout(() => {
      if (email === 'underwriter@lendwise.ai' && password === 'demo123') {
        onLogin({ email, role: 'Senior Underwriter', name: 'John Doe' });
      } else {
        setError('Invalid credentials. Use the Demo Login shortcut for immediate access.');
        setLoading(false);
      }
    }, 800);
  };

  const handleDemoLogin = () => {
    setEmail('underwriter@lendwise.ai');
    setPassword('demo123');
    onLogin({ email: 'underwriter@lendwise.ai', role: 'Senior Underwriter', name: 'John Doe' });
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      background: 'radial-gradient(circle at 50% 50%, #0c0a21 0%, #030712 100%)',
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background blobs */}
      <div className="background-blobs">
        <div className="blob blob-1" style={{ top: '10%', left: '10%', width: '400px', height: '400px', opacity: 0.15 }} />
        <div className="blob blob-2" style={{ bottom: '15%', right: '10%', width: '500px', height: '500px', opacity: 0.15 }} />
      </div>

      {/* Left side: AI Illustration Constellation */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ background: 'var(--primary-grad)', width: '36px', height: '36px', fontWeight: 'bold' }}>LW</div>
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>LendWise AI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', textAlign: 'center' }}
        >
          {/* Animated SVG constellation network (Feature 3) */}
          <svg viewBox="0 0 200 200" style={{ width: '180px', height: '180px' }}>
            <defs>
              <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            {/* Outer rings */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(124, 58, 237, 0.15)" strokeWidth="1.5" strokeDasharray="5,10" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" />
            
            {/* Pulsing connections */}
            <path d="M 100 40 L 40 100 M 100 40 L 160 100 M 40 100 L 100 160 M 160 100 L 100 160 M 40 100 L 160 100 M 100 40 L 100 160" 
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            
            {/* Constellation nodes */}
            <circle cx="100" cy="40" r="6" fill="url(#circleGrad)" />
            <circle cx="40" cy="100" r="6" fill="url(#circleGrad)" />
            <circle cx="160" cy="100" r="6" fill="url(#circleGrad)" />
            <circle cx="100" cy="160" r="6" fill="url(#circleGrad)" />
            <circle cx="100" cy="100" r="16" fill="url(#circleGrad)" />
            
            <circle cx="100" cy="100" r="8" fill="white" />
          </svg>
          
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '850', letterSpacing: '-0.5px', marginBottom: '10px' }}>Secure Underwriting Portal</h2>
            <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
              Enforcing Keras neural networks and SHAP explainability filters under credit compliance protocols.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side: Login Form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px'
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card"
          style={{ width: '100%', maxWidth: '400px', padding: '40px' }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Sign In</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Access LendWise automated scoring systems.
            </p>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger-color)', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '12.5px', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-light)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="underwriter@lendwise.ai"
                  style={{ paddingLeft: '42px', width: '100%' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <span style={{ fontSize: '11px', color: '#7C3AED', cursor: 'pointer', fontWeight: 'bold' }}>Forgot?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-light)' }} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  style={{ paddingLeft: '42px', width: '100%' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#7C3AED' }}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="gradient-btn" 
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '25px 0', textAlign: 'center' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--glass-bg)', padding: '0 10px', fontSize: '11.5px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Demo Shortcuts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={handleDemoLogin}
              className="outline-btn"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <UserCheck size={14} style={{ color: 'var(--success-color)' }} /> Quick Demo Sign In
            </button>
            <button 
              onClick={() => onLogin({ email: 'guest@lendwise.ai', role: 'Guest Reader', name: 'Guest' })}
              className="outline-btn"
              style={{ width: '100%', borderStyle: 'dashed' }}
            >
              Continue as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
