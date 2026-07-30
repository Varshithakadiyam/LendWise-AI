import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Cpu, 
  Compass, 
  Bot, 
  Sliders, 
  FileCheck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function Landing({ onLaunch }) {
  const features = [
    { icon: Cpu, title: 'Deep Learning Engine', desc: 'Dense Neural Network (128→64→32) trained on historical bureau records to predict approvals.' },
    { icon: Compass, title: 'Explainable AI (SHAP)', desc: 'Translates 21 high-dimensional model layers back to 11 readable feature attributions.' },
    { icon: Bot, title: 'Generative AI Advisor', desc: 'Automates professional risk assessments and outlines recommended checklists.' },
    { icon: Sliders, title: 'What-If Simulation', desc: 'Simulates financial variables in real-time to preview decision impacts instantly.' },
    { icon: FileCheck, title: 'Enterprise Reports', desc: 'Compiles formal print-ready underwriting report PDF attachments dynamically.' },
    { icon: ShieldCheck, title: 'Compliance & Audit', desc: 'Enforces risk score boundaries and provides step-by-step underwriter override controls.' }
  ];

  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 50% 50%, #0c0a21 0%, #030712 100%)',
      color: 'white',
      padding: '0 40px',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background blobs */}
      <div className="background-blobs">
        <div className="blob blob-1" style={{ top: '10%', left: '10%', width: '400px', height: '400px', opacity: 0.15 }} />
        <div className="blob blob-2" style={{ bottom: '15%', right: '10%', width: '500px', height: '500px', opacity: 0.15 }} />
      </div>

      {/* Navbar header */}
      <header style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ background: 'var(--primary-grad)', width: '36px', height: '36px', fontWeight: 'bold' }}>LW</div>
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>LendWise AI</span>
        </div>
        <button 
          onClick={onLaunch}
          className="gradient-btn"
          style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px' }}
        >
          Launch Dashboard <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '900px',
        margin: '80px auto 40px auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        zIndex: 50
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '12.5px', color: '#38BDF8', fontWeight: 'bold' }}
        >
          <Sparkles size={14} /> Introducing LendWise AI 2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ fontSize: '54px', fontWeight: '850', lineHeight: '1.1', letterSpacing: '-1.5px' }}
        >
          Enterprise AI-Powered Loan Risk <br />
          <span style={{ background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Assessment & Decision Support
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', maxWidth: '650px', lineHeight: '1.6' }}
        >
          Automate loan underwriting checks with deep learning neural predictions, deconstruct complex models via local SHAP explainers, and leverage Generative AI risk advisors.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', gap: '15px', marginTop: '10px' }}
        >
          <button 
            onClick={onLaunch}
            className="gradient-btn"
            style={{ padding: '16px 36px', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold' }}
          >
            Launch Dashboard <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Stats counter row */}
      <section style={{
        maxWidth: '1000px',
        margin: '30px auto 60px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '40px',
        width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '40px',
        textAlign: 'center',
        zIndex: 50
      }}>
        <div>
          <h4 style={{ fontSize: '32px', fontWeight: '850', color: '#38BDF8' }}>82.93%</h4>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 'bold' }}>Validation Accuracy</span>
        </div>
        <div>
          <h4 style={{ fontSize: '32px', fontWeight: '850', color: '#7C3AED' }}>&lt; 150ms</h4>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 'bold' }}>Decision Latency</span>
        </div>
        <div>
          <h4 style={{ fontSize: '32px', fontWeight: '850', color: '#EC4899' }}>100%</h4>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 'bold' }}>Explainable Features</span>
        </div>
      </section>

      {/* Grid of features */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto 80px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px',
        width: '100%',
        zIndex: 50
      }}>
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.03 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8'
              }}>
                <Icon size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '750' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{f.desc}</p>
            </motion.div>
          );
        })}
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        height: '100px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        fontSize: '12.5px',
        color: 'rgba(255,255,255,0.4)',
        zIndex: 50
      }}>
        <span>© 2026 LendWise AI Inc. All rights reserved. (v2.0.0-prod)</span>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg> GitHub
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
