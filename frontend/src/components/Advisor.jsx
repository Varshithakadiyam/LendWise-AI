import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, ShieldAlert, Sparkles, Download, Check } from 'lucide-react';


export default function Advisor({ applicantData, riskReport, shapData }) {
  const [checkedSteps, setCheckedSteps] = useState({});

  // Reset checklist when riskReport changes
  useEffect(() => {
    setCheckedSteps({});
  }, [riskReport]);

  const toggleCheck = (step) => {
    setCheckedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleDownloadTxt = () => {
    if (!riskReport) return;
    const element = document.createElement("a");
    const file = new Blob([riskReport.report_text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Loan_Risk_Report_Score_${riskReport.risk_score}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!riskReport) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
        <FileText size={48} style={{ margin: '0 auto 20px auto', opacity: 0.5 }} />
        <h3>Awaiting Diagnostic Assessment</h3>
        <p style={{ fontSize: '13.5px', marginTop: '5px' }}>Please evaluate an applicant profile on the Loan Prediction page first.</p>
      </div>
    );
  }

  const {
    risk_score,
    risk_level,
    prediction,
    confidence,
    key_risk_indicators,
    positive_indicators,
    verification_steps,
    suggested_underwriter_decision,
    explanation
  } = riskReport;

  // Setup color schema
  let cardClass = "low-risk-bg";
  if (risk_level === "MEDIUM RISK") cardClass = "medium-risk-bg";
  else if (risk_level === "HIGH RISK") cardClass = "high-risk-bg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      {/* 1. Header Overview Card */}
      <div className={`glass-card risk-card ${cardClass}`}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🏛️ Executive Advisory: 
          <span style={{ 
            fontSize: '13px', 
            fontWeight: '900', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            background: 'white', 
            color: 'black',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            {risk_level}
          </span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Risk Index Score</span>
            <h4 style={{ fontSize: '26px', fontWeight: '800' }}>{risk_score} / 100</h4>
          </div>
          <div>
            <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Keras DL Model</span>
            <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{prediction}</h4>
          </div>
          <div>
            <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Model Confidence</span>
            <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{(prediction === 'Loan Approved' ? confidence * 100 : (1.0 - confidence) * 100).toFixed(1)}%</h4>
          </div>
          <div>
            <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Recommended Decision</span>
            <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{suggested_underwriter_decision}</h4>
          </div>
        </div>
      </div>

      {/* 2. Executive Summary */}
      <div className="glass-card">
        <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: '#7C3AED' }} /> Executive Underwriting Narrative
        </h4>
        <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-main)' }}>{explanation}</p>
      </div>

      {/* 3. Grid for Risk / Positive Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="glass-card">
          <h4 className="chart-title" style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} /> Potential Risk Indicators
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {key_risk_indicators.length > 0 ? (
              key_risk_indicators.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' }}>
                  <span>⚠️</span>
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>No significant risk indicators identified.</p>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h4 className="chart-title" style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Positive Supporting Factors
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {positive_indicators.length > 0 ? (
              positive_indicators.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', background: 'rgba(34, 197, 94, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.1)', color: 'var(--success-color)' }}>
                  <span>✓</span>
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>No significant positive indicators extracted.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Smart Checklist */}
      <div className="glass-card checklist-card">
        <h4 className="chart-title">📋 Verification steps & Audit Checklists</h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Perform checking on the following document items to comply with risk verification guidelines:
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {verification_steps.map((step, idx) => {
            const isChecked = !!checkedSteps[step];
            return (
              <div 
                key={idx}
                onClick={() => toggleCheck(step)}
                className={`checklist-item ${isChecked ? 'checked' : ''}`}
              >
                <div className="checkbox-custom">
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '13.5px', textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-secondary)' : 'var(--text-main)', transition: 'var(--transition-smooth)' }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Exporter actions */}
      <div style={{ display: 'flex', justifyItems: 'center', gap: '20px' }}>
        <button 
          onClick={handleDownloadTxt}
          className="gradient-btn"
          style={{ flexGrow: 1, padding: '14px' }}
        >
          <Download size={16} /> Download Underwriter Text Report (.TXT)
        </button>
      </div>
    </motion.div>
  );
}
