import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Trash2, Download, Mic, HelpCircle } from 'lucide-react';
import { askAiUnderwriter } from '../api';

const PRESETS = [
  "Why was this application rejected?",
  "What increased the applicant's risk?",
  "Which documents should the bank verify?",
  "How can approval chances improve?",
  "What financial weaknesses are present?",
  "Summarize this application for the loan officer.",
  "Explain the decision in simple language.",
  "Write a professional underwriting report."
];

export default function Chat({ applicantData, riskReport }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!applicantData || !riskReport) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
        <Bot size={48} style={{ margin: '0 auto 20px auto', opacity: 0.5 }} />
        <h3>Awaiting Dialogue Setup</h3>
        <p style={{ fontSize: '13.5px', marginTop: '5px' }}>Please evaluate an applicant profile on the Loan Prediction page first.</p>
      </div>
    );
  }

  const handleSend = async (text) => {
    if (!text.trim() || loading) return;
    
    const userMsg = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);
    
    try {
      const response = await askAiUnderwriter(applicantData, riskReport, userMsg.text);
      const assistantMsg = {
        role: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '⚠️ Underwriter Assistant is temporarily unavailable. Check API credentials.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleDownloadLog = () => {
    let logText = "=== AI Underwriting Assistant Chat Logs ===\n\n";
    messages.forEach(msg => {
      logText += `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.text}\n\n`;
    });
    
    const element = document.createElement("a");
    const file = new Blob([logText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `underwriter_assistant_chat_log.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="split-screen"
    >
      {/* 1. Left Preset panel */}
      <div className="glass-card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} style={{ color: '#7C3AED' }} /> Preset Underwriter Queries
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Select a standard underwriting prompt to query the active applicant profile details:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flexGrow: 1 }}>
          {PRESETS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="outline-btn"
              style={{ textAlign: 'left', fontSize: '12px', padding: '12px 14px', borderRadius: '10px' }}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Right Chat Feed panel */}
      <div className="glass-card chat-container">
        {/* Chat Control Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 className="chart-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} style={{ color: '#7C3AED' }} /> Underwriting Dialogue Feed
          </h4>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownloadLog} className="nav-icon-btn" title="Download Log" disabled={messages.length === 0}>
              <Download size={14} />
            </button>
            <button onClick={handleClear} className="nav-icon-btn" title="Clear Chat" disabled={messages.length === 0}>
              <Trash2 size={14} style={{ color: 'var(--danger-color)' }} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="chat-messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', textAlign: 'center' }}>
              <div className="avatar" style={{ background: 'rgba(0,0,0,0.03)', width: '54px', height: '54px', fontSize: '24px', marginBottom: '15px' }}>💬</div>
              <p style={{ fontWeight: 'bold' }}>AI Assistant Initialized</p>
              <p style={{ fontSize: '12px', width: '220px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                Ask specific questions about income, credit risks, or request loan summaries.
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '6px', opacity: 0.6 }}>
                {msg.timestamp}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI is evaluating risk markers</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span className="dot-loading" style={{ animationDelay: '0s' }}>.</span>
                <span className="dot-loading" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="dot-loading" style={{ animationDelay: '0.4s' }}>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type your underwriter question (e.g. 'Summarize credit risks')..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
            disabled={loading}
          />
          <button className="nav-icon-btn" title="Voice Input Placeholder" style={{ padding: '12px', height: 'auto', borderRadius: '14px' }}>
            <Mic size={18} />
          </button>
          <button 
            className="gradient-btn" 
            onClick={() => handleSend(inputVal)} 
            disabled={loading}
            style={{ padding: '12px 20px', borderRadius: '14px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .dot-loading {
          animation: dot-blink 1.4s infinite both;
          font-weight: bold;
        }
        @keyframes dot-blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
      `}</style>
    </motion.div>
  );
}
