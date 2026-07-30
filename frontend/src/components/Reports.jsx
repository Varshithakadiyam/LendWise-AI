import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { FileText, Download, ShieldCheck, AreaChart, Image, Database } from 'lucide-react';
import { downloadUnderwriterPdf } from '../api';

export default function ReportsPage({ theme, applicantData, riskReport }) {
  const [activeReport, setActiveReport] = useState('metrics');

  const handleDownloadJson = () => {
    if (!riskReport) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify({ applicantData, riskReport }, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `LendWise_Assessment_Report.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCsv = () => {
    if (!applicantData) return;
    const headers = Object.keys(applicantData).join(",");
    const values = Object.values(applicantData).map(v => typeof v === 'string' ? `"${v}"` : v).join(",");
    const csvContent = `${headers}\n${values}`;
    
    const element = document.createElement("a");
    const file = new Blob([csvContent], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = `LendWise_Applicant_Data.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    if (!riskReport) return;
    setDownloadingPdf(true);
    try {
      await downloadUnderwriterPdf(applicantData, riskReport, "SHAP Local Explanation Key Drivers");
    } catch (err) {
      alert("Failed to download PDF report. Ensure backend is running.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getLayout = (title) => ({
    title: {
      text: title,
      font: { color: theme === 'dark' ? '#E5E7EB' : '#1F2937', size: 14, family: 'Plus Jakarta Sans', bold: true }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { 
      gridcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      tickfont: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }
    },
    yaxis: { 
      gridcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      tickfont: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }
    },
    margin: { l: 40, r: 20, t: 40, b: 40 },
    height: 300,
    autosize: true
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', alignItems: 'start' }}
    >
      {/* 1. Left Nav list */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <AreaChart size={18} style={{ color: '#7C3AED' }} /> Report Previews
        </h4>
        
        <button
          onClick={() => setActiveReport('metrics')}
          className="outline-btn"
          style={{ textAlign: 'left', background: activeReport === 'metrics' ? 'var(--input-bg)' : 'transparent', borderColor: activeReport === 'metrics' ? '#7C3AED' : 'var(--input-border)' }}
        >
          📈 Training History Curves
        </button>
        <button
          onClick={() => setActiveReport('matrix')}
          className="outline-btn"
          style={{ textAlign: 'left', background: activeReport === 'matrix' ? 'var(--input-bg)' : 'transparent', borderColor: activeReport === 'matrix' ? '#7C3AED' : 'var(--input-border)' }}
        >
          🎯 Model Confusion Matrix
        </button>
        <button
          onClick={() => setActiveReport('curves')}
          className="outline-btn"
          style={{ textAlign: 'left', background: activeReport === 'curves' ? 'var(--input-bg)' : 'transparent', borderColor: activeReport === 'curves' ? '#7C3AED' : 'var(--input-border)' }}
        >
          📉 ROC & PR Metric Curves
        </button>
        
        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '10px 0' }} />
        
        <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <Database size={18} style={{ color: '#7C3AED' }} /> Export Current Applicant
        </h4>
        
        <button
          onClick={handleDownloadJson}
          className="outline-btn"
          style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={!riskReport}
        >
          <Download size={14} /> Download JSON Data
        </button>
        <button
          onClick={handleDownloadCsv}
          className="outline-btn"
          style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={!applicantData}
        >
          <Download size={14} /> Download CSV schema
        </button>
        <button
          onClick={handleDownloadPdf}
          className="gradient-btn"
          style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', marginTop: '5px' }}
          disabled={!riskReport || downloadingPdf}
        >
          <FileText size={14} /> {downloadingPdf ? 'Compiling PDF...' : 'Download PDF Report'}
        </button>
      </div>

      {/* 2. Right Preview Panel */}
      <div className="glass-card" style={{ minHeight: '450px' }}>
        {activeReport === 'metrics' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Model Training History</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
                <Plot
                  data={[
                    { x: [1,2,3,4,5,6,7,8,9,10], y: [0.65, 0.72, 0.78, 0.81, 0.82, 0.825, 0.829, 0.829, 0.829, 0.829], type: 'scatter', name: 'Accuracy', line: { color: '#22C55E' } },
                    { x: [1,2,3,4,5,6,7,8,9,10], y: [0.55, 0.62, 0.70, 0.74, 0.75, 0.755, 0.758, 0.758, 0.758, 0.758], type: 'scatter', name: 'Val Accuracy', line: { color: '#2563EB', dash: 'dash' } }
                  ]}
                  layout={getLayout('Training Accuracy curves (10 Epochs)')}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
                <Plot
                  data={[
                    { x: [1,2,3,4,5,6,7,8,9,10], y: [0.68, 0.52, 0.44, 0.38, 0.35, 0.34, 0.33, 0.33, 0.33, 0.33], type: 'scatter', name: 'Loss', line: { color: '#EF4444' } },
                    { x: [1,2,3,4,5,6,7,8,9,10], y: [0.72, 0.58, 0.49, 0.44, 0.42, 0.41, 0.40, 0.40, 0.40, 0.40], type: 'scatter', name: 'Val Loss', line: { color: '#F59E0B', dash: 'dash' } }
                  ]}
                  layout={getLayout('Training Loss curves (10 Epochs)')}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeReport === 'matrix' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Model Confusion Matrix</h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
              <Plot
                data={[{
                  z: [[78, 12], [8, 115]],
                  x: ['Predicted Rejection', 'Predicted Approval'],
                  y: ['Actual Rejection', 'Actual Approval'],
                  type: 'heatmap',
                  colorscale: 'Viridis',
                  showscale: false
                }]}
                layout={{
                  title: { text: 'Confusion Matrix (Validation split)', font: { color: theme === 'dark' ? '#E5E7EB' : '#1F2937', size: 14 } },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: { tickfont: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } },
                  yaxis: { tickfont: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } },
                  height: 320,
                  width: 380,
                  margin: { l: 100, r: 20, t: 50, b: 50 }
                }}
                config={{ displayModeBar: false }}
              />
            </div>
          </div>
        )}

        {activeReport === 'curves' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Deep Learning Evaluation Curves</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
                <Plot
                  data={[
                    { x: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0], y: [0, 0.45, 0.68, 0.78, 0.88, 0.94, 0.98, 1.0], type: 'scatter', name: 'ROC Curve (AUC: 0.8012)', line: { color: '#7C3AED', width: 2.5 } },
                    { x: [0, 1], y: [0, 1], type: 'scatter', mode: 'lines', name: 'Baseline', line: { color: 'rgba(255,255,255,0.1)', dash: 'dash' } }
                  ]}
                  layout={getLayout('ROC Curve')}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
                <Plot
                  data={[
                    { x: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1.0], y: [1.0, 0.95, 0.92, 0.88, 0.84, 0.78, 0.65, 0], type: 'scatter', name: 'PR Curve', line: { color: '#EC4899', width: 2.5 } }
                  ]}
                  layout={getLayout('Precision-Recall Curve')}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
