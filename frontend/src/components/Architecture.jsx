import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Info, Server, Cpu, Compass, Bot, FileCheck, CheckCircle } from 'lucide-react';

const NODES = [
  { id: 'react', label: 'React Web UI', tech: 'Vite, Framer Motion, Axios, Plotly.js', desc: 'Provides the premium user interface, form builders, slider playgrounds, and chat portals.', icon: Cpu },
  { id: 'fastapi', label: 'FastAPI Gateway', tech: 'Python 3.12, Uvicorn', desc: 'Exposes secure endpoints to orchestrate data calculations and dispatch models.', icon: Server },
  { id: 'tensorflow', label: 'Keras DL Engine', tech: 'TensorFlow 2.x, Dense Deep Neural Network', desc: 'Binary classification model predicting Loan Approval with probability estimation.', icon: Cpu },
  { id: 'shap', label: 'SHAP Attribution', tech: 'KernelExplainer, Sampled Background Data', desc: 'Deconstructs the model inputs into grouped local feature attributions.', icon: Compass },
  { id: 'llm', label: 'LLM Risk Advisor', tech: 'Gemini 1.5 Flash / OpenAI GPT-4o-mini', desc: 'Drafts underwriting risk narratives and extracts key risk indicators.', icon: Bot },
  { id: 'pdf', label: 'PDF Compilation', tech: 'fpdf2, Byte Streams', desc: 'Generates formal print-ready underwriting report attachments dynamically.', icon: FileCheck },
  { id: 'support', label: 'Decision Support', tech: 'Interactive Audit Checklist, Scenario Builder', desc: 'Allows the senior underwriter to verify checklists and override decisions safely.', icon: CheckCircle }
];

export default function Architecture() {
  const [activeNode, setActiveNode] = useState(NODES[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
    >
      <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Network size={18} style={{ color: '#7C3AED' }} /> System Pipeline Architecture
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Hover or click on any pipeline node to inspect technical stacks and structural processing roles:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px', alignItems: 'center' }}>
        {/* SVG Flow diagram */}
        <div style={{ position: 'relative', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <svg viewBox="0 0 500 500" style={{ width: '100%', height: 'auto' }}>
            {/* Definitions for gradients and markers */}
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 8 5 L 0 8 z" fill="#7C3AED" />
              </marker>
            </defs>

            {/* Connecting paths with animated dasharrays */}
            <path d="M 250 50 L 250 100" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />
            <path d="M 250 140 L 250 190" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />
            <path d="M 250 230 L 250 280" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />
            <path d="M 250 320 L 250 370" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />
            
            {/* Snake flow branches to fit screen nicely */}
            <path d="M 250 410 C 250 450, 100 450, 100 370" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />
            <path d="M 100 330 L 100 230" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />
            <path d="M 100 190 C 100 130, 250 130, 250 90" fill="none" stroke="url(#flowGrad)" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="6,6" className="animated-line" />

            {/* Render Nodes as SVG Groups */}
            {/* React Node */}
            <g transform="translate(150, 10)" onClick={() => setActiveNode(NODES[0])} style={{ cursor: 'pointer' }}>
              <rect width="200" height="40" rx="8" fill={activeNode.id === 'react' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'react' ? '#2563EB' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="100" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">React Frontend App</text>
            </g>

            {/* FastAPI Node */}
            <g transform="translate(150, 100)" onClick={() => setActiveNode(NODES[1])} style={{ cursor: 'pointer' }}>
              <rect width="200" height="40" rx="8" fill={activeNode.id === 'fastapi' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'fastapi' ? '#7C3AED' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="100" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">FastAPI API Gateway</text>
            </g>

            {/* TensorFlow Node */}
            <g transform="translate(150, 190)" onClick={() => setActiveNode(NODES[2])} style={{ cursor: 'pointer' }}>
              <rect width="200" height="40" rx="8" fill={activeNode.id === 'tensorflow' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'tensorflow' ? '#EC4899' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="100" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">TensorFlow / Keras DL</text>
            </g>

            {/* SHAP Node */}
            <g transform="translate(150, 280)" onClick={() => setActiveNode(NODES[3])} style={{ cursor: 'pointer' }}>
              <rect width="200" height="40" rx="8" fill={activeNode.id === 'shap' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'shap' ? '#22C55E' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="100" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">SHAP Explainability</text>
            </g>

            {/* LLM Node */}
            <g transform="translate(150, 370)" onClick={() => setActiveNode(NODES[4])} style={{ cursor: 'pointer' }}>
              <rect width="200" height="40" rx="8" fill={activeNode.id === 'llm' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'llm' ? '#F59E0B' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="100" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">Generative AI Advisor</text>
            </g>

            {/* PDF Node */}
            <g transform="translate(5, 330)" onClick={() => setActiveNode(NODES[5])} style={{ cursor: 'pointer' }}>
              <rect width="180" height="40" rx="8" fill={activeNode.id === 'pdf' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'pdf' ? '#2563EB' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="90" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">fpdf2 PDF Compilation</text>
            </g>

            {/* Support Node */}
            <g transform="translate(5, 190)" onClick={() => setActiveNode(NODES[6])} style={{ cursor: 'pointer' }}>
              <rect width="180" height="40" rx="8" fill={activeNode.id === 'support' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)'} stroke={activeNode.id === 'support' ? '#22C55E' : 'rgba(124, 58, 237, 0.2)'} strokeWidth="2" />
              <text x="90" y="25" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold">Decision Support</text>
            </g>
          </svg>
        </div>

        {/* Node detail display */}
        <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar" style={{ background: 'var(--primary-grad)', width: '38px', height: '38px' }}>
              {React.createElement(activeNode.icon, { size: 16 })}
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 'bold' }}>{activeNode.label}</h4>
              <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 'bold' }}>{activeNode.tech}</span>
            </div>
          </div>
          <p style={{ fontSize: '13.5px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            {activeNode.desc}
          </p>
          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
            <span>Interactive flow indicates real-time data serialization cycles.</span>
          </div>
        </div>
      </div>

      <style>{`
        .animated-line {
          stroke-dasharray: 8;
          animation: dash 1s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </motion.div>
  );
}
