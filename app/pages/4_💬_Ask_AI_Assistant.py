"""
Streamlit subpage for LLM Underwriter Assistant Q&A Chat (Features 1, 8).
Utilizes st.chat_message and st.chat_input, maintains chat log memory in st.session_state,
and implements clear/download conversation utilities.
Routes to API if keys are set; otherwise triggers local rule fallback.
"""

import sys
import datetime
from pathlib import Path
import streamlit as st

# Setup python path to import modules from src/
project_root = Path(__file__).resolve().parent.parent.parent
src_dir = project_root / "src"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Configure Page
st.set_page_config(
    page_title="Ask AI Underwriter Assistant",
    page_icon="💬",
    layout="wide"
)

# Safe session state helper for bare python compatibility
def get_state(key, default=None):
    try:
        if key in st.session_state:
            return st.session_state[key]
    except Exception:
        pass
    # Fallback default values for bare mode testing
    if key == "applicant_data":
        return {
            "Gender": "Male", "Married": "Yes", "Dependents": "0", "Education": "Graduate",
            "Self_Employed": "No", "ApplicantIncome": 5000, "CoapplicantIncome": 0,
            "LoanAmount": 150, "Loan_Amount_Term": 360, "Credit_History": 1.0, "Property_Area": "Semiurban"
        }
    if key == "report_data":
        return {
            "risk_score": 15, "risk_level": "LOW RISK", "prediction": "Loan Approved",
            "confidence": 0.85, "suggested_underwriter_decision": "Approve",
            "explanation": "Applicant has favorable credit history and stable employment.",
            "key_risk_indicators": ["Loan Amount is moderate"],
            "positive_indicators": ["Active credit history", "Salaried employment"],
            "verification_steps": ["Verify payroll deposits", "Check credit record"]
        }
    if key == "api_key":
        return None
    return default

try:
    from llm_assistant import ask_ai_assistant
except Exception as e:
    st.error("Failed to load Q&A assistant module.")
    st.exception(e)
    st.stop()

# Preset questions for easy clicking (Feature 1)
PRESETS = [
    "Why was this application rejected?",
    "What increased the applicant's risk?",
    "Which documents should the bank verify?",
    "How can approval chances improve?",
    "What financial weaknesses are present?",
    "Summarize this application for the loan officer.",
    "Explain the decision in simple language.",
    "Write a professional underwriting report."
]

def main():
    st.title("💬 AI Underwriter Assistant Q&A Chat")
    st.markdown(
        "Interact with the AI risk engine to ask questions, request narrative summaries, "
        "or evaluate specific details of the active applicant profile."
    )
    
    st.divider()
    
    # Check baseline applicant safely
    applicant_data = get_state("applicant_data")
    if applicant_data is None:
        st.warning("⚠️ No active applicant evaluation found. Please evaluate an applicant on the 🏛️ Enterprise Dashboard first to generate the diagnosis.")
        st.stop()
        
    # Load session state variables
    report_data = get_state("report_data")
    api_key = get_state("api_key", None)
    
    # Initialize chat history (Feature 8)
    if "chat_history" not in st.session_state:
        try:
            st.session_state["chat_history"] = []
        except Exception:
            pass
        
    # Split pane: Left preset buttons, Right chat dialogue
    col_presets, col_chat = st.columns([1, 2.5])
    
    with col_presets:
        st.markdown("##### 💡 Preset Underwriter Questions")
        st.write("Click any standard query to auto-run it:")
        
        # When a preset is clicked, set the prompt variable
        selected_preset = None
        for q in PRESETS:
            if st.button(q, use_container_width=True, key=f"btn_{q[:20]}"):
                selected_preset = q
                
    with col_chat:
        st.markdown("##### 💬 Conversation history")
        
        # Clear chat history button (Feature 8)
        col_clear, col_save = st.columns(2)
        with col_clear:
            if st.button("🗑️ Clear Chat History", use_container_width=True):
                try:
                    st.session_state["chat_history"] = []
                except Exception:
                    pass
                st.rerun()
                
        # Generate downloadable conversation transcript (Feature 8)
        chat_log_text = "=== AI Underwriting Assistant Chat History ===\n"
        history_list = []
        try:
            history_list = st.session_state["chat_history"]
        except Exception:
            pass
            
        for msg in history_list:
            chat_log_text += f"[{msg['timestamp']}] {msg['role'].capitalize()}: {msg['text']}\n\n"
            
        with col_save:
            st.download_button(
                label="📥 Download Chat Log (TXT)",
                data=chat_log_text,
                file_name=f"underwriter_chat_log_{datetime.date.today()}.txt",
                mime="text/plain",
                use_container_width=True
            )
            
        st.divider()
        
        # Render message history
        for msg in history_list:
            with st.chat_message(msg["role"]):
                st.markdown(f"**{msg['text']}**" if msg["role"] == "user" else msg["text"])
                st.caption(f"Time: {msg['timestamp']}")
                
        # Check if preset was clicked, or get chat_input
        user_query = st.chat_input("Ask about the applicant (e.g. 'Explain the credit risk')...")
        
        # If preset clicked, override chat input
        prompt = selected_preset if selected_preset else user_query
        
        if prompt:
            # Display user message
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            try:
                st.session_state["chat_history"].append({
                    "role": "user",
                    "text": prompt,
                    "timestamp": timestamp
                })
            except Exception:
                pass
            
            # Re-render immediately
            with st.chat_message("user"):
                st.markdown(f"**{prompt}**")
                st.caption(f"Time: {timestamp}")
                
            # Process AI Response
            with st.chat_message("assistant"):
                with st.spinner("Analyzing risk parameters..."):
                    try:
                        ai_response = ask_ai_assistant(applicant_data, report_data, prompt, api_key)
                        ai_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        
                        st.markdown(ai_response)
                        st.caption(f"Time: {ai_timestamp}")
                        
                        # Store in history
                        try:
                            st.session_state["chat_history"].append({
                                "role": "assistant",
                                "text": ai_response,
                                "timestamp": ai_timestamp
                            })
                        except Exception:
                            pass
                        
                    except Exception as e:
                        st.error("Underwriter assistant failed to respond.")
                        st.exception(e)
                        
            # Force refresh to keep UI updated
            st.rerun()

if __name__ == "__main__":
    main()
