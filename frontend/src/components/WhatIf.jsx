import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RefreshCw, ArrowUp, ArrowDown, ShieldAlert, FileCheck } from 'lucide-react';
import { runPrediction, runRiskReport } from '../api';

export default function WhatIf({ applicantData, riskReport }) {
  const [scenarioData, setScenarioData] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioReport, setScenarioReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync with baseline on load
  useEffect(() => {
    if (applicantData) {
      setScenarioData({ ...applicantData });
    }
  }, [applicantData]);

  // Recalculate scenario on state update
  useEffect(() => {
    if (!scenarioData) return;
    
    const triggerRecalc = async () => {
      try {
        const pred = await runPrediction(scenarioData);
        const report = await runRiskReport(scenarioData, pred.prediction, pred.probability);
        setScenarioResult(pred);
        setScenarioReport(report);
      } catch (e) {
        console.error(e);
      }
    };
    
    // Quick debounce/immediate execution
    const timer = setTimeout(triggerRecalc, 150);
    return () => clearTimeout(timer);
  }, [scenarioData]);

  if (!applicantData || !riskReport || !scenarioData || !scenarioResult || !scenarioReport) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
        <Sliders size={48} style={{ margin: '0 auto 20px auto', opacity: 0.5 }} />
        <h3>Awaiting Scenario Data</h3>
        <p style={{ fontSize: '13.5px', marginTop: '5px' }}>Please evaluate an applicant profile on the Loan Prediction page first.</p>
      </div>
    );
  }

  const handleSliderChange = (field, val) => {
    setScenarioData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // Extract old probabilities
  const oldApprovalProb = riskReport.prediction === "Loan Approved" ? riskReport.confidence : (1.0 - riskReport.confidence);
  const newApprovalProb = scenarioResult.prediction === "Loan Approved" ? scenarioResult.confidence : (1.0 - scenarioResult.confidence);

  // Compare delta vectors
  const scoreDiff = scenarioReport.risk_score - riskReport.risk_score;
  const probDiff = (newApprovalProb - oldApprovalProb) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="split-screen"
    >
      {/* 1. Left controls panel */}
      <div className="glass-card">
        <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} style={{ color: '#7C3AED' }} /> Adjust Scenario Sliders
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Tweak numerical values and change history flags to simulate immediate underwriting impacts.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Income Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
              <span style={{ color: 'var(--text-secondary)' }}>PRIMARY MONTHLY INCOME</span>
              <span style={{ color: '#7C3AED' }}>${scenarioData.ApplicantIncome.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min={1000} 
              max={15000} 
              step={250}
              value={scenarioData.ApplicantIncome} 
              onChange={(e) => handleSliderChange('ApplicantIncome', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }}
            />
          </div>

          {/* Coapplicant Income Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
              <span style={{ color: 'var(--text-secondary)' }}>CO-APPLICANT INCOME</span>
              <span style={{ color: '#7C3AED' }}>${scenarioData.CoapplicantIncome.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={10000} 
              step={250}
              value={scenarioData.CoapplicantIncome} 
              onChange={(e) => handleSliderChange('CoapplicantIncome', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }}
            />
          </div>

          {/* Loan Amount Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
              <span style={{ color: 'var(--text-secondary)' }}>REQUESTED LOAN SIZE</span>
              <span style={{ color: '#7C3AED' }}>${(scenarioData.LoanAmount * 1000).toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min={10} 
              max={700} 
              step={10}
              value={scenarioData.LoanAmount} 
              onChange={(e) => handleSliderChange('LoanAmount', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }}
            />
          </div>

          {/* Categorical selects */}
          <div className="form-grid-2" style={{ margin: 0 }}>
            <div className="form-group">
              <label>Credit History</label>
              <select 
                value={scenarioData.Credit_History}
                onChange={(e) => handleSliderChange('Credit_History', parseFloat(e.target.value))}
              >
                <option value={1.0}>Favorable (Clean)</option>
                <option value={0.0}>Delinquent / Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label>Self Employed</label>
              <select 
                value={scenarioData.Self_Employed}
                onChange={(e) => handleSliderChange('Self_Employed', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Comparison card */}
      <div className="glass-card">
        <h3 className="form-title">🔄 Real-Time Comparison Grid</h3>
        
        {/* Table layout */}
        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-light)' }}>
                <th style={{ padding: '12px 6px' }}>Metric</th>
                <th style={{ padding: '12px 6px' }}>Baseline (Old)</th>
                <th style={{ padding: '12px 6px' }}>Scenario (New)</th>
                <th style={{ padding: '12px 6px' }}>Delta Shift</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>Decision</td>
                <td style={{ padding: '14px 6px' }}>{riskReport.prediction}</td>
                <td style={{ padding: '14px 6px', color: scenarioResult.prediction === 'Loan Approved' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                  {scenarioResult.prediction}
                </td>
                <td style={{ padding: '14px 6px' }}>
                  {riskReport.prediction !== scenarioResult.prediction ? (
                    <span style={{ fontSize: '11px', background: 'var(--warning-color)', padding: '2px 8px', borderRadius: '4px', color: 'white', fontWeight: 'bold' }}>SHIFT</span>
                  ) : (
                    <span style={{ color: 'var(--text-light)' }}>No Change</span>
                  )}
                </td>
              </tr>
              
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>Risk Score</td>
                <td style={{ padding: '14px 6px' }}>{riskReport.risk_score}</td>
                <td style={{ padding: '14px 6px' }}>{scenarioReport.risk_score}</td>
                <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>
                  {scoreDiff !== 0 ? (
                    <span style={{ color: scoreDiff > 0 ? 'var(--danger-color)' : 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {scoreDiff > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(scoreDiff)} pts
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-light)' }}>0 pts</span>
                  )}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>Probability</td>
                <td style={{ padding: '14px 6px' }}>{(oldApprovalProb * 100).toFixed(1)}%</td>
                <td style={{ padding: '14px 6px' }}>{(newApprovalProb * 100).toFixed(1)}%</td>
                <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>
                  {probDiff !== 0 ? (
                    <span style={{ color: probDiff > 0 ? 'var(--success-color)' : 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {probDiff > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(probDiff).toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-light)' }}>0.0%</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dynamic attributions explanation */}
        <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.5' }}>
          <h4 style={{ fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>Scenario Attribution Summary:</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scoreDiff !== 0 && (
              <p>
                - Default Risk Index has <b>{scoreDiff > 0 ? 'increased' : 'decreased'}</b> by <b>{Math.abs(scoreDiff)}</b> points (from {riskReport.risk_score} to {scenarioReport.risk_score}).
              </p>
            )}
            {probDiff !== 0 && (
              <p>
                - Deep learning approval confidence <b>{probDiff > 0 ? 'increased' : 'decreased'}</b> by <b>{Math.abs(probDiff).toFixed(1)}%</b>.
              </p>
            )}
            {scenarioData.Credit_History !== applicantData.Credit_History && (
              <p style={{ color: 'var(--warning-color)' }}>
                - Credit Bureau flag changed. Favorable credit records are the strongest driver of risk score validation.
              </p>
            )}
            {scoreDiff === 0 && probDiff === 0 && (
              <p style={{ color: 'var(--text-light)' }}>No adjustments detected. Drag the sliders on the left to modify scenario features.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
