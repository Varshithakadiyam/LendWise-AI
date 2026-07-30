import React from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { Compass, TrendingUp, Info } from 'lucide-react';

export default function ShapPage({ theme, shapData }) {
  if (!shapData) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
        <Compass size={48} style={{ margin: '0 auto 20px auto', opacity: 0.5 }} />
        <h3>Awaiting Attributions</h3>
        <p style={{ fontSize: '13.5px', marginTop: '5px' }}>Please evaluate an applicant profile on the Loan Prediction page first.</p>
      </div>
    );
  }

  const { grouped_shap, positive_contributions, negative_contributions, summary_text } = shapData;

  // Prepare data for Plotly Horizontal Bar Chart
  const sortedFeatures = Object.keys(grouped_shap)
    .map(key => ({ name: key, val: grouped_shap[key] * 100 }))
    .sort((a, b) => Math.abs(a.val) - Math.abs(b.val)); // sort by absolute contribution

  const yNames = sortedFeatures.map(item => item.name);
  const xValues = sortedFeatures.map(item => item.val);
  const barColors = sortedFeatures.map(item => item.val >= 0 ? '#22C55E' : '#EF4444');

  const plotlyData = [{
    y: yNames,
    x: xValues,
    type: 'bar',
    orientation: 'h',
    marker: { color: barColors },
    text: xValues.map(val => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`),
    textposition: 'auto',
    hovertemplate: '<b>%{y}</b><br>Impact: %{x:+.2f}%<extra></extra>'
  }];

  const plotlyLayout = {
    title: {
      text: 'Local Feature Impact on Approval Probability (%)',
      font: { color: theme === 'dark' ? '#E5E7EB' : '#1F2937', size: 14, family: 'Plus Jakarta Sans', bold: true }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { 
      gridcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      tickfont: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' },
      zerolinecolor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      zerolinewidth: 2
    },
    yaxis: { 
      tickfont: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }
    },
    margin: { l: 120, r: 20, t: 50, b: 40 },
    height: 400,
    autosize: true
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
    >
      {/* 1. Bar Chart Card */}
      <div className="glass-card" style={{ marginBottom: '30px', padding: '25px' }}>
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={{ displayModeBar: false }}
          style={{ width: '100%' }}
        />
        <div style={{ 
          marginTop: '15px', 
          background: 'rgba(124, 58, 237, 0.05)', 
          padding: '12px 18px', 
          borderRadius: '10px', 
          border: '1px solid rgba(124, 58, 237, 0.1)',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Info size={16} style={{ color: '#7C3AED', flexShrink: 0 }} />
          <span><b>Attribution Summary:</b> {summary_text}</span>
        </div>
      </div>

      {/* 2. Side-by-side contributions list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="glass-card">
          <h4 className="chart-title" style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} /> Favorable Factors (Approval Drivers)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {positive_contributions.length > 0 ? (
              positive_contributions.map((item, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(34, 197, 94, 0.04)', 
                  border: '1px solid rgba(34, 197, 94, 0.1)', 
                  borderLeft: '4px solid var(--success-color)',
                  padding: '12px 16px', 
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.feature}</span>
                    <span style={{ color: 'var(--success-color)' }}>+{item.contribution.toFixed(2)}%</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    {item.explanation.split('. ').slice(1).join('. ') || 'Favorable contribution.'}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>No meaningful favorable contributors.</p>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h4 className="chart-title" style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ transform: 'rotate(180deg)' }} /> Delinquency Risk Factors (Rejection Drivers)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {negative_contributions.length > 0 ? (
              negative_contributions.map((item, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(239, 68, 68, 0.04)', 
                  border: '1px solid rgba(239, 68, 68, 0.1)', 
                  borderLeft: '4px solid var(--danger-color)',
                  padding: '12px 16px', 
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.feature}</span>
                    <span style={{ color: 'var(--danger-color)' }}>{item.contribution.toFixed(2)}%</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    {item.explanation.split('. ').slice(1).join('. ') || 'Negative contribution.'}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>No meaningful risk contributors.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
