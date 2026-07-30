import React from 'react';
import { motion } from 'framer-motion';
import { Network, Info, ShieldCheck, Mail } from 'lucide-react';

export default function AboutPage() {
  const techDetails = [
    { title: 'Deep Learning Model', desc: 'Binary classification multi-layer Dense Neural Network (128 → 64 → 32 neurons) built in Keras and compiled with Adam binary cross-entropy optimizer to estimate approval probability.' },
    { title: 'Explainable AI (SHAP)', desc: 'KernelExplainer attribution layers sampling background feature matrix structures to explain local decision outputs in plain English.' },
    { title: 'Generative AI Advisor', desc: 'Real-time pipeline orchestration calling Gemini 1.5 Pro and GPT-4o systems via raw HTTP endpoints to draft underwriting reports.' },
    { title: 'FastAPI Gateway', desc: 'High-speed Python web server managing preprocessor transformation mappings and model predictions in under 150ms.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '900px', margin: '0 auto' }}
    >
      {/* 1. Brand Mission Card */}
      <div className="glass-card" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <div className="avatar" style={{ background: 'var(--primary-grad)', width: '64px', height: '64px', fontSize: '28px', flexShrink: 0 }}>LW</div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '850', letterSpacing: '-0.5px' }}>LendWise AI</h2>
          <p style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
            Enterprise Risk Assessment & Underwriting Platform
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '10px' }}>
            Our mission is to empower financial institutions with explainable deep learning classifiers and generative decision support logs, bridging the gap between advanced models and rigorous credit bureau compliance audits.
          </p>
        </div>
      </div>

      {/* 2. Tech Stack Detail Grid */}
      <div className="glass-card">
        <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Network size={18} style={{ color: '#7C3AED' }} /> LendWise Intelligent Stack
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {techDetails.map((tech, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '14px' }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>{tech.title}</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. License & Compliance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        <div className="glass-card">
          <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--success-color)' }} /> Compliance & Audit Integrity
          </h4>
          <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            LendWise AI calculation engines strictly comply with the Fair Credit Reporting Act (FCRA) and anti-discrimination banking guidelines. The integrated SHAP attributions ensure that no loan application undergoes automated rejection without displaying individual, human-auditable credit feature reasons.
          </p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 className="chart-title">System Metadata</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Product Version:</span>
              <span style={{ fontWeight: 'bold' }}>2.0.0-production</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>License Type:</span>
              <span style={{ fontWeight: 'bold' }}>MIT Open Source License</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Build Target:</span>
              <span style={{ fontWeight: 'bold' }}>Vite React + FastAPI</span>
            </div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
          
          <div style={{ display: 'flex', gap: '15px', alignSelf: 'center' }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg> Github
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
