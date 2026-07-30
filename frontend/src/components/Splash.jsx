import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  "Initializing AI Engine...",
  "Loading TensorFlow Keras models...",
  "Connecting Gateway API Server...",
  "Loading SHAP Explainability attributions...",
  "Preparing LendWise Executive Dashboard..."
];

export default function Splash({ onFinish }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment message index sequentially every 800ms
    const msgTimer = setInterval(() => {
      setMsgIdx(prev => {
        if (prev < LOADING_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 850);

    // Progress bar loader
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          clearInterval(msgTimer);
          // Fade out splash screen after small delay
          setTimeout(onFinish, 400);
          return 100;
        }
        return prev + 2.5; // increment progress
      });
    }, 100);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, [onFinish]);

  return (
    <div className="splash-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #030712 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'white'
    }}>
      {/* Dynamic background particles */}
      <div className="background-blobs">
        <div className="blob blob-1" style={{ top: '20%', left: '20%', width: '300px', height: '300px', opacity: 0.15 }} />
        <div className="blob blob-2" style={{ bottom: '20%', right: '20%', width: '400px', height: '400px', opacity: 0.15 }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}
      >
        {/* Minimal Gradient Logo (LW) */}
        <div className="splash-logo" style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: '900',
          color: 'white',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}>
          LW
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: '850', letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #38BDF8 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LendWise AI
        </h1>
        
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
          ENTERPRISE RISK & AUTOMATED UNDERWRITING
        </p>

        {/* Progress track */}
        <div style={{
          width: '280px',
          height: '6px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginTop: '30px',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)',
            transition: 'width 0.1s linear',
            boxShadow: '0 0 10px #7C3AED'
          }} />
        </div>

        {/* Sequential text label */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={msgIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginTop: '10px' }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
