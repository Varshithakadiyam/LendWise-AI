import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, FileCheck, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { runPrediction, runRiskReport, runShapExplain } from '../api';

const PRESETS = {
  "Select Profile Preset...": null,
  "Favorable Profile (Low Risk)": {
    Gender: "Male", Married: "Yes", Dependents: "0", Education: "Graduate", Self_Employed: "No",
    ApplicantIncome: 7500, CoapplicantIncome: 2500, LoanAmount: 120, Loan_Amount_Term: 360,
    Credit_History: 1.0, Property_Area: "Semiurban"
  },
  "High Leverage Profile (Medium Risk)": {
    Gender: "Female", Married: "No", Dependents: "1", Education: "Graduate", Self_Employed: "No",
    ApplicantIncome: 4800, CoapplicantIncome: 0, LoanAmount: 280, Loan_Amount_Term: 360,
    Credit_History: 1.0, Property_Area: "Urban"
  },
  "Delinquent & Volatile Profile (High Risk)": {
    Gender: "Female", Married: "No", Dependents: "2", Education: "Not Graduate", Self_Employed: "Yes",
    ApplicantIncome: 2000, CoapplicantIncome: 0, LoanAmount: 180, Loan_Amount_Term: 180,
    Credit_History: 0.0, Property_Area: "Rural"
  }
};

const STEPS = ["Personal", "Employment", "Income", "Loan", "Property"];

export default function Prediction({ 
  applicantData, setApplicantData, 
  predictionResult, setPredictionResult, 
  riskReport, setRiskReport, 
  setShapData 
}) {
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const [presetChoice, setPresetChoice] = useState("Select Profile Preset...");

  // Handles preset load action
  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPresetChoice(val);
    const preset = PRESETS[val];
    if (preset) {
      setApplicantData(preset);
    }
  };

  const handleInputChange = (field, val) => {
    setApplicantData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleNext = () => {
    if (formStep < STEPS.length - 1) {
      setFormStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (formStep > 0) {
      setFormStep(prev => prev - 1);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoaderStep(0);
    
    // Simulate sequential step-by-step loading (Preprocessing -> Running DL -> SHAP -> AI Advisor -> Decision)
    const interval = setInterval(() => {
      setLoaderStep(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        return 4;
      });
    }, 600);

    try {
      // Trigger calculations in background
      const pred = await runPrediction(applicantData);
      const report = await runRiskReport(applicantData, pred.prediction, pred.probability);
      const shap = await runShapExplain(applicantData);

      // Force minimum duration to appreciate loaders
      setTimeout(() => {
        setPredictionResult(pred);
        setRiskReport(report);
        setShapData(shap);
        setLoading(false);

        if (pred.prediction === "Loan Approved") {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }, 3000);
      
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApplicantData({
      Gender: "Male", Married: "Yes", Dependents: "0", Education: "Graduate", Self_Employed: "No",
      ApplicantIncome: 5000, CoapplicantIncome: 0, LoanAmount: 150, Loan_Amount_Term: 360,
      Credit_History: 1.0, Property_Area: "Semiurban"
    });
    setPredictionResult(null);
    setRiskReport(null);
    setShapData(null);
    setFormStep(0);
    setPresetChoice("Select Profile Preset...");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="split-screen"
    >
      {/* 1. Left Form Wizard Panel */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 className="form-title" style={{ margin: 0 }}>📋 Underwriting Applicant Wizard</h3>
          
          {/* Preset Selector */}
          <select 
            value={presetChoice}
            onChange={handlePresetChange}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              background: 'rgba(255,255,255,0.06)', 
              color: 'var(--text-main)',
              border: '1px solid var(--glass-border)',
              outline: 'none'
            }}
          >
            {Object.keys(PRESETS).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Wizard progress bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
          {STEPS.map((s, idx) => (
            <div key={idx} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                height: '4px',
                borderRadius: '2px',
                background: idx <= formStep ? 'var(--primary-grad)' : 'rgba(255,255,255,0.08)',
                boxShadow: idx <= formStep ? '0 0 6px rgba(124, 58, 237, 0.4)' : 'none',
                transition: 'var(--transition-smooth)'
              }} />
              <span style={{ fontSize: '10px', color: idx === formStep ? 'var(--text-main)' : 'var(--text-light)', textAlign: 'center', fontWeight: 'bold' }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handlePredict}>
          <AnimatePresence mode="wait">
            {formStep === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={applicantData.Gender} onChange={(e) => handleInputChange('Gender', e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Marital Status</label>
                    <select value={applicantData.Married} onChange={(e) => handleInputChange('Married', e.target.value)}>
                      <option value="Yes">Yes (Married)</option>
                      <option value="No">No (Single)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Dependents</label>
                    <select value={applicantData.Dependents} onChange={(e) => handleInputChange('Dependents', e.target.value)}>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3+">3+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Education</label>
                    <select value={applicantData.Education} onChange={(e) => handleInputChange('Education', e.target.value)}>
                      <option value="Graduate">Graduate</option>
                      <option value="Not Graduate">Not Graduate</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {formStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className="form-group">
                  <label>Self Employed</label>
                  <select value={applicantData.Self_Employed} onChange={(e) => handleInputChange('Self_Employed', e.target.value)}>
                    <option value="No">No (Salaried Employee)</option>
                    <option value="Yes">Yes (Independent Business Owner)</option>
                  </select>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  * Self-employed applicants are requested to perform ITR tax audit verification checks under underwriting guidelines to mitigate volatile income streams.
                </p>
              </motion.div>
            )}

            {formStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Monthly Applicant Income ($)</label>
                    <input 
                      type="number" 
                      value={applicantData.ApplicantIncome} 
                      onChange={(e) => handleInputChange('ApplicantIncome', parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Co-applicant Income ($)</label>
                    <input 
                      type="number" 
                      value={applicantData.CoapplicantIncome} 
                      onChange={(e) => handleInputChange('CoapplicantIncome', parseFloat(e.target.value))} 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {formStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Loan Amount (Thousands $)</label>
                    <input 
                      type="number" 
                      value={applicantData.LoanAmount} 
                      onChange={(e) => handleInputChange('LoanAmount', parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Term (Months)</label>
                    <select value={applicantData.Loan_Amount_Term} onChange={(e) => handleInputChange('Loan_Amount_Term', parseFloat(e.target.value))}>
                      <option value={360}>360 (30 Years)</option>
                      <option value={240}>240 (20 Years)</option>
                      <option value={180}>180 (15 Years)</option>
                      <option value={120}>120 (10 Years)</option>
                      <option value={84}>84 (7 Years)</option>
                      <option value={60}>60 (5 Years)</option>
                      <option value={36}>36 (3 Years)</option>
                      <option value={12}>12 (1 Year)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {formStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Property Geography</label>
                    <select value={applicantData.Property_Area} onChange={(e) => handleInputChange('Property_Area', e.target.value)}>
                      <option value="Semiurban">Semiurban</option>
                      <option value="Urban">Urban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Bureau Credit History</label>
                    <select value={applicantData.Credit_History} onChange={(e) => handleInputChange('Credit_History', parseFloat(e.target.value))}>
                      <option value={1.0}>Favorable (Clean bureau history)</option>
                      <option value={0.0}>Delinquent / None</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
            {formStep > 0 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="outline-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            
            {formStep < STEPS.length - 1 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="gradient-btn"
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px' }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="gradient-btn" 
                disabled={loading}
                style={{ marginLeft: 'auto', padding: '12px 30px' }}
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? 'Evaluating...' : 'Predict Loan Status'}
              </button>
            )}
            
            <button 
              type="button" 
              onClick={handleReset} 
              className="outline-btn"
              style={{ color: 'var(--danger-color)' }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* 2. Right Results Panel with Sequential Loading List */}
      <div className="glass-card result-card">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
            >
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '10px' }}>
                Pipeline Calculation Checklist
              </h4>
              
              {/* Sequential Checklist indicators */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                {[
                  "Preprocessing bureau data inputs...",
                  "Running Keras deep learning binary classifier...",
                  "Evaluating local SHAP explainability matrices...",
                  "Gemini drafting executive advisor narrative report...",
                  "Underwriter final decision committed."
                ].map((item, idx) => {
                  const isDone = loaderStep > idx;
                  const isActive = loaderStep === idx;
                  
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      fontSize: '13.5px',
                      color: isDone ? 'var(--success-color)' : isActive ? 'var(--text-main)' : 'var(--text-light)',
                      fontWeight: isActive || isDone ? 'bold' : 'normal',
                      transition: 'var(--transition-smooth)'
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isDone ? 'none' : '2px solid var(--glass-border)',
                        background: isDone ? 'var(--success-color)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'white',
                        animation: isActive ? 'pulse-loader 1s infinite alternate' : 'none'
                      }}>
                        {isDone ? '✓' : ''}
                      </div>
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : predictionResult ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              style={{ width: '100%' }}
            >
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '15px', fontWeight: 'bold' }}>
                Underwriting Decision
              </h4>
              
              {predictionResult.prediction === "Loan Approved" ? (
                <div className="status-badge approved">
                  <CheckCircle size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  LOAN APPROVED
                </div>
              ) : (
                <div className="status-badge rejected">
                  <AlertTriangle size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  LOAN REJECTED
                </div>
              )}

              {/* Score breakdown metrics */}
              <div className="result-metric-grid">
                <div className="result-metric">
                  <span className="result-metric-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <ShieldAlert size={14} /> Risk Score
                  </span>
                  <span className="result-metric-val" style={{ color: riskReport?.risk_level === 'HIGH RISK' ? 'var(--danger-color)' : riskReport?.risk_level === 'MEDIUM RISK' ? 'var(--warning-color)' : 'var(--success-color)' }}>
                    {riskReport?.risk_score}
                  </span>
                </div>
                <div className="result-metric">
                  <span className="result-metric-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <FileCheck size={14} /> Model Confidence
                  </span>
                  <span className="result-metric-val">
                    {(predictionResult.prediction === "Loan Approved" ? predictionResult.probability * 100 : (1.0 - predictionResult.probability) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Executive narrative overview */}
              <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', marginTop: '25px', textAlign: 'left', fontSize: '13.5px', lineHeight: '1.5' }}>
                <b>Executive Diagnosis:</b> {riskReport?.explanation}
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: 'var(--text-light)' }}
            >
              <div className="avatar" style={{ background: 'rgba(0,0,0,0.04)', width: '64px', height: '64px', fontSize: '28px', marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }}>📋</div>
              <p style={{ fontWeight: 'bold' }}>Awaiting Applicant Parameters</p>
              <p style={{ fontSize: '12.5px', width: '250px', marginTop: '5px', color: 'var(--text-secondary)' }}>Load a profile preset or construct manually, then run diagnostic.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style>{`
        @keyframes pulse-loader {
          0% { box-shadow: 0 0 0 0px rgba(124, 58, 237, 0.4); border-color: #7C3AED; }
          100% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0.0); border-color: #7C3AED; }
        }
      `}</style>
    </motion.div>
  );
}
