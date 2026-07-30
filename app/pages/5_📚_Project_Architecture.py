"""
Streamlit subpage for visualizing Project Architecture (Feature 10).
Loads a script rendering Mermaid diagrams dynamically using HTML components.
Details the dataset preprocessing, Keras neural network layers, and explainability workflows.
"""

import streamlit as st
import streamlit.components.v1 as components

# Configure Page
st.set_page_config(
    page_title="Project Architecture",
    page_icon="📚",
    layout="wide"
)

# Live HTML Mermaid rendering for visually stunning flowcharts (Feature 10)
MERMAID_DIAGRAM = """
<div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dadce0;">
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
    </script>
    <div class="mermaid" style="display: flex; justify-content: center;">
        graph TD
            A[Raw Applicant Profile Form] -->|11 Raw Variables| B[Preprocessor ColumnTransformer]
            B -->|Numerical Impute & Scaler| C[21-Dimensional Transformed Row]
            B -->|Categorical Impute & One-Hot| C
            
            C -->|Forward Pass| D[Keras Neural Network Model]
            C -->|Background Reference| G[SHAP KernelExplainer]
            
            D -->|Sigmoid Probability| E[Deep Learning Prediction]
            E -->|Approved/Rejected & Confidence| H[Generative AI Advisory Engine]
            
            A -->|Credit/Income/LTI Metrics| F[Fraud Risk Score Calculator]
            F -->|Score 0-100 & Risk Level| H
            
            G -->|Attributions Summed| I[Grouped Feature Attributions]
            I -->|Attribution List| H
            
            H -->|Narrative & Checklist| J[PDF Underwriting Report / TXT Export]
            H -->|Inference Context| K[Ask AI Chat Assistant Routing]
            
            style A fill:#e8f0fe,stroke:#1a73e8,stroke-width:2px;
            style D fill:#fce8e6,stroke:#c5221f,stroke-width:2px;
            style F fill:#fef7e0,stroke:#b06000,stroke-width:2px;
            style G fill:#f3e8fd,stroke:#9334e6,stroke-width:2px;
            style H fill:#e6f4ea,stroke:#137333,stroke-width:2px;
            style J fill:#f1f3f4,stroke:#5f6368,stroke-width:2px;
            style K fill:#e2f1f8,stroke:#0288d1,stroke-width:2px;
    </div>
</div>
"""

def main():
    st.title("📚 System Architecture & Workflow Map")
    st.markdown(
        "Explore the detailed end-to-end processing architecture mapping raw customer inputs "
        "through preprocessing pipelines, deep learning Keras scoring, SHAP attributions, "
        "and Generative AI underwriter reporting."
    )
    
    st.divider()
    
    # Render Mermaid diagram
    st.markdown("##### 🏛️ Interactive Data Processing Flowchart")
    components.html(MERMAID_DIAGRAM, height=480, scrolling=True)
    
    st.divider()
    
    # Detailed section cards explaining architecture stages
    col1, col2 = st.columns(2)
    
    with col1:
        with st.container(border=True):
            st.markdown("### 📥 1. Feature Preprocessing")
            st.write(
                "Raw inputs undergo cleaning and normalization via a saved scikit-learn "
                "**ColumnTransformer** (`preprocessor.joblib`):"
            )
            st.markdown(
                "- **Numerical Features** (ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term): "
                "Imputed with `median` and standardized using `StandardScaler`.\n"
                "- **Categorical Features** (Gender, Married, Dependents, Education, Self_Employed, Credit_History, Property_Area): "
                "Imputed with `most_frequent` and encoded using `OneHotEncoder`.\n"
                "- Output expands into a **21-dimensional sparse row** compatible with Keras."
            )
            
        st.write("")
        
        with st.container(border=True):
            st.markdown("### 🧠 2. Deep Learning Neural Network")
            st.write(
                "A binary classification multi-layer perceptron built in TensorFlow Keras:"
            )
            st.markdown(
                "```text\n"
                "Input (21 Nodes)\n"
                "  ↓\n"
                "Dense (128 Nodes, ReLU Activation)\n"
                "  ↓\n"
                "BatchNormalization\n"
                "  ↓\n"
                "Dropout (Rate: 30%)\n"
                "  ↓\n"
                "Dense (64 Nodes, ReLU Activation)\n"
                "  ↓\n"
                "Dropout (Rate: 20%)\n"
                "  ↓\n"
                "Dense (32, ReLU Activation)\n"
                "  ↓\n"
                "Dense (1 Node, Sigmoid Output)\n"
                "```"
            )
            st.write(
                "Optimized using **Adam** with binary crossentropy, outputting a probability $p \in [0, 1]$ representing approval likelihood."
            )
            
    with col2:
        with st.container(border=True):
            st.markdown("### 🔬 3. SHAP Explainability")
            st.write(
                "Enables local model explainability by tracing the contribution of each feature "
                "on the output probability:"
            )
            st.markdown(
                "- Uses **SHAP KernelExplainer** fitted on a representative 50-row training slice.\n"
                "- Evaluates the target row against background averages to compute raw marginal contributions.\n"
                "- Regroups the 21 one-hot columns back into the **11 original base variables** (e.g. summing "
                "`cat__Credit_History_0.0` and `cat__Credit_History_1.0` to represent the overall contribution of credit history).\n"
                "- Renders positive/negative impacts dynamically in interactive Plotly horizontal bar graphs."
            )
            
        st.write("")
        
        with st.container(border=True):
            st.markdown("### 🏛️ 4. Generative Advisor & Decision Support")
            st.write(
                "Combines model predictions and metrics into a unified underwriter guidance engine:"
            )
            st.markdown(
                "- **Fraud Risk Score**: A rule-based indicator (0 to 100) scoring delinquency vectors "
                "(credit issues, extreme Loan-to-Income levels, income volatility).\n"
                "- **Advisory Report**: Summarizes positive/negative factors and recommends verification checklists.\n"
                "- **LLM Assistant**: Routes to OpenAI/Gemini for underwriting question Q&A, with automatic offline "
                "fallback to a query-matching local rule-based response parser."
            )

if __name__ == "__main__":
    main()
