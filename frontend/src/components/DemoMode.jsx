import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, UserCheck, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { runPrediction, runRiskReport, runShapExplain } from '../api';

const PRESETS = {
  low: {
    label: "Low Risk Profile",
    data: {
      Gender: "Male", Married: "Yes", Dependents: "0", Education: "Graduate", Self_Employed: "No",
      ApplicantIncome: 7500, CoapplicantIncome: 2500, LoanAmount: 120, Loan_Amount_Term: 360,
      Credit_History: 1.0, Property_Area: "Semiurban"
    }
  },
  medium: {
    label: "Medium Risk Profile",
    data: {
      Gender: "Female", Married: "No", Dependents: "1", Education: "Graduate", Self_Employed: "No",
      ApplicantIncome: 4800, CoapplicantIncome: 0, LoanAmount: 280, Loan_Amount_Term: 360,
      Credit_History: 1.0, Property_Area: "Urban"
    }
  },
  high: {
    label: "High Risk Profile",
    data: {
      Gender: "Female", Married: "No", Dependents: "2", Education: "Not Graduate", Self_Employed: "Yes",
      ApplicantIncome: 2000, CoapplicantIncome: 0, LoanAmount: 180, Loan_Amount_Term: 180,
      Credit_History: 0.0, Property_Area: "Rural"
    }
  }
};

export default function DemoMode({ 
  setApplicantData, 
  setPredictionResult, 
  setRiskReport, 
  setShapData, 
  setActiveTab 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [runningDemo, setRunningDemo] = useState(null);

  const runDemoWorkflow = async (presetKey) => {
    setRunningDemo(presetKey);
    const preset = PRESETS[presetKey];
    
    // 1. Force route change to predict
    setActiveTab('predict');
    
    // 2. Load preset variables into state
    setApplicantData(preset.data);
    
    // Clear old results
    setPredictionResult(null);
    setRiskReport(null);
    setShapData(null);

    try {
      // Replicate prediction loading sequence
      const pred = await runPrediction(preset.data);
      const report = await runRiskReport(preset.data, pred.prediction, pred.probability);
      const shap = await runShapExplain(preset.data);

      setTimeout(() => {
        setPredictionResult(pred);
        setRiskReport(report);
        setShapData(shap);
        setRunningDemo(null);
        setIsOpen(false);

        // Celebrating approvals
        if (pred.prediction === "Loan Approved") {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
        }
      }, 2000);
      
    } catch (e) {
      console.error(e);
      setRunningDemo(null);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
            style={{ 
              marginBottom: '15px', 
              width: '280px', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              border: '1px solid #7C3AED',
              boxShadow: '0 10px 30px rgba(124, 58, 237, 0.2)'
            }}
          >
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#7C3AED' }}>
              <Award size={16} /> Recruiter Demo Controller
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Select a preset to auto-run a complete underwriting evaluation scenario workflow:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => runDemoWorkflow('low')}
                className="outline-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '11.5px', 
                  padding: '10px',
                  borderColor: 'rgba(34, 197, 94, 0.3)'
                }}
                disabled={runningDemo !== null}
              >
                {runningDemo === 'low' ? <RefreshCw className="animate-spin" size={12} /> : <ShieldCheck size={12} style={{ color: 'var(--success-color)' }} />}
                Low Risk Scenario
              </button>

              <button 
                onClick={() => runDemoWorkflow('medium')}
                className="outline-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '11.5px', 
                  padding: '10px',
                  borderColor: 'rgba(245, 158, 11, 0.3)'
                }}
                disabled={runningDemo !== null}
              >
                {runningDemo === 'medium' ? <RefreshCw className="animate-spin" size={12} /> : <AlertTriangle size={12} style={{ color: 'var(--warning-color)' }} />}
                Medium Risk Scenario
              </button>

              <button 
                onClick={() => runDemoWorkflow('high')}
                className="outline-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '11.5px', 
                  padding: '10px',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
                disabled={runningDemo !== null}
              >
                {runningDemo === 'high' ? <RefreshCw className="animate-spin" size={12} /> : <AlertTriangle size={12} style={{ color: 'var(--danger-color)' }} />}
                High Risk Scenario
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="gradient-btn"
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.4)',
          border: 'none',
          padding: 0
        }}
      >
        <Award size={22} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
      </button>
    </div>
  );
}
