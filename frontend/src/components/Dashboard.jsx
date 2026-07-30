import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { 
  Percent, 
  Layers, 
  FileCheck, 
  ShieldAlert,
  ArrowUpRight,
  Server,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const MOCK_ACTIVITIES = [
  { time: '10 mins ago', action: 'Underwriter checked payroll checklist for Applicant ID #4829', user: 'John Doe' },
  { time: '25 mins ago', action: 'Keras model predicted status: Approved with 88.5% confidence', user: 'LendWise AI' },
  { time: '1 hour ago', action: 'SHAP local attributions compiled for preset Favorable', user: 'LendWise AI' },
  { time: '2 hours ago', action: 'Gemini drafted executive risk report for Applicant ID #4812', user: 'LendWise AI' },
  { time: '3 hours ago', action: 'Underwriting PDF compiled and exported for audit archiving', user: 'John Doe' }
];

export default function Dashboard({ theme, isOnline }) {
  const [chartTab, setChartTab] = useState('risk');
  const [status, setStatus] = useState({
    fastapi: 'loading',
    tensorflow: 'loading',
    shap: 'loading',
    gemini: 'loading',
    pdf: 'loading'
  });

  // Calculate live statuses simulating loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus({
        fastapi: isOnline ? 'online' : 'offline',
        tensorflow: 'online', // local library
        shap: 'online', // local library
        gemini: 'online', // online API
        pdf: 'online' // local compiler
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [isOnline]);

  const kpis = [
    { label: 'Model Accuracy', value: '82.93%', icon: Percent, trend: '+0.54% from train', isSecondary: false },
    { label: 'Total Applications', value: '443', icon: Layers, trend: 'Updated hourly', isSecondary: true },
    { label: 'Approval Rate', value: '68.60%', icon: FileCheck, trend: '-2.1% this month', isSecondary: false },
    { label: 'Average Risk Score', value: '36 / 100', icon: ShieldAlert, trend: 'Medium Risk tier', isSecondary: true },
  ];

  const getLayout = (title) => ({
    title: {
      text: title,
      font: { color: theme === 'dark' ? '#E5E7EB' : '#1F2937', size: 14, family: 'Plus Jakarta Sans' }
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

  const getStatusColor = (val) => {
    if (val === 'online') return 'var(--success-color)';
    if (val === 'offline') return 'var(--danger-color)';
    return 'var(--warning-color)';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Welcome */}
      <div className="hero-section">
        <h1 className="hero-title">LendWise Control Panel</h1>
        <p className="hero-subtitle">
          Real-time credit analysis, Keras classification scoring, and explainability dashboard.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`glass-card kpi-card ${kpi.isSecondary ? 'secondary' : ''}`}
            >
              <div className="kpi-header">
                <span className="kpi-label">{kpi.label}</span>
                <div className="nav-icon-btn" style={{ cursor: 'default' }}>
                  <Icon size={16} />
                </div>
              </div>
              <span className="kpi-value">{kpi.value}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={12} style={{ color: 'var(--success-color)' }} />
                {kpi.trend}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Layout Split: Status center / Live feeds / Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* Left Column: Live Status indicators + Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Status indicators */}
          <div className="glass-card">
            <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Server size={16} /> Core Backend Status Center
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(status).map((key) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {key === 'fastapi' ? 'FastAPI Gateway' : key === 'tensorflow' ? 'TensorFlow core' : key === 'pdf' ? 'fpdf2 Compiler' : `${key} engine`}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: getStatusColor(status[key]),
                      boxShadow: `0 0 6px ${getStatusColor(status[key])}`
                    }} />
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      color: getStatusColor(status[key])
                    }}>
                      {status[key].toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Risk Score Gauge */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <Plot
              data={[{
                type: "indicator",
                mode: "gauge+number",
                value: 36,
                title: { text: "Average Portfolio Risk", font: { size: 13, color: 'var(--text-secondary)' } },
                gauge: {
                  axis: { range: [null, 100], tickwidth: 1 },
                  bar: { color: "#2563EB", thickness: 0.2 },
                  bgcolor: "rgba(0,0,0,0)",
                  borderwidth: 1,
                  bordercolor: "var(--glass-border)",
                  steps: [
                    { range: [0, 30], color: "rgba(34, 197, 94, 0.1)" },
                    { range: [30, 60], color: "rgba(245, 158, 11, 0.1)" },
                    { range: [60, 100], color: "rgba(239, 68, 68, 0.1)" }
                  ]
                }
              }]}
              layout={{
                width: 250,
                height: 150,
                margin: { t: 30, b: 20, l: 30, r: 30 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: theme === 'dark' ? '#E5E7EB' : '#1F2937', family: 'Plus Jakarta Sans' }
              }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div className="glass-card">
          <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <Activity size={16} /> Live Underwriting Activity Stream
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {MOCK_ACTIVITIES.map((act, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start', 
                fontSize: '13px', 
                borderBottom: idx < MOCK_ACTIVITIES.length - 1 ? '1px solid var(--glass-border)' : 'none',
                paddingBottom: idx < MOCK_ACTIVITIES.length - 1 ? '12px' : '0'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>{act.action}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Actor: <b>{act.user}</b></span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="chart-title" style={{ margin: 0 }}>📊 Performance Diagnostics Analytics</h3>
          
          <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setChartTab('risk')}
              className="outline-btn"
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: chartTab === 'risk' ? 'white' : 'transparent', fontWeight: 'bold' }}
            >
              Risk & Decision
            </button>
            <button 
              onClick={() => setChartTab('trends')}
              className="outline-btn"
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: chartTab === 'trends' ? 'white' : 'transparent', fontWeight: 'bold' }}
            >
              Monthly Trends
            </button>
            <button 
              onClick={() => setChartTab('demographics')}
              className="outline-btn"
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: chartTab === 'demographics' ? 'white' : 'transparent', fontWeight: 'bold' }}
            >
              Demographics
            </button>
          </div>
        </div>

        {chartTab === 'risk' && (
          <div className="charts-grid">
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
              <Plot
                data={[{
                  x: ['Low Risk', 'Medium Risk', 'High Risk'],
                  y: [280, 110, 53],
                  type: 'bar',
                  marker: { color: ['#22C55E', '#F59E0B', '#EF4444'] }
                }]}
                layout={getLayout('Risk Distribution (Applications count)')}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
              <Plot
                data={[{
                  values: [304, 139],
                  labels: ['Approved', 'Rejected'],
                  type: 'pie',
                  marker: { colors: ['#2563EB', '#EC4899'] }
                }]}
                layout={getLayout('Model Approval Ratios')}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {chartTab === 'trends' && (
          <div className="charts-grid">
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
              <Plot
                data={[{
                  x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                  y: [32, 45, 48, 62, 58, 74, 82],
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { shape: 'spline', color: '#7C3AED', width: 3 }
                }]}
                layout={getLayout('Monthly Prediction Activity')}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
              <Plot
                data={[{
                  x: ['&lt;2500', '2500-5000', '5000-7500', '7500-10000', '&gt;10000'],
                  y: [58, 185, 120, 52, 28],
                  type: 'bar',
                  marker: { color: '#F97316' }
                }]}
                layout={getLayout('Applicant Monthly Income Distribution')}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {chartTab === 'demographics' && (
          <div className="charts-grid">
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
              <Plot
                data={[{
                  x: ['Favorable History', 'Delinquent/None'],
                  y: [382, 61],
                  type: 'bar',
                  marker: { color: ['#22C55E', '#EF4444'] }
                }]}
                layout={getLayout('Credit Bureau History Distribution')}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
              <Plot
                data={[{
                  x: ['Semiurban', 'Urban', 'Rural'],
                  y: [233, 150, 60],
                  type: 'bar',
                  marker: { color: ['#3b82f6', '#8b5cf6', '#ec4899'] }
                }]}
                layout={getLayout('Property Area Geographies')}
                config={{ displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
