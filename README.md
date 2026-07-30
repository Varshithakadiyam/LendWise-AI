# LendWise AI - Enterprise Loan Risk Assessment Platform

An enterprise-grade underwriting platform combining a TensorFlow Deep Learning classifier, local SHAP explainability, and Generative AI risk advisors in a high-performance FastAPI + Vite React dashboard.

---

## 🏛️ System Features

1. **Vibrant Underwriter Portal:** Collapsible sidebar navigation, live system service health checkers, interactive metrics panels, and Recruiter Demo overlays.
2. **Multi-Step Applicant Wizard:** Five-stage form wizard (`Personal`, `Employment`, `Income`, `Loan`, `Property`) with a sequential checklist tracker during diagnostics.
3. **SHAP Model Interpretability:** Grouped local feature attributions translating 21 Keras-dimensioned inputs back into 11 original features with Plotly bar chart rendering.
4. **What-If Scenario Playground:** Simulates feature updates dynamically to observe changes in prediction confidence and Fraud Risk Scores.
5. **Ask AI Underwriter Assistant:** Dialogue system allowing interactive questions with local offline fallback parsing.
6. **PDF Report Compiler:** Automated print-ready PDF export via `fpdf2` directly streamed from FastAPI backend gateways.

---

## 🏗️ Project Architecture

```
User ──> React (Axios) ──> FastAPI Gateway ──> TensorFlow (Keras)
                                            ├──> SHAP Explainers
                                            ├──> Generative AI (Gemini/OpenAI)
                                            └──> fpdf2 PDF Report Compiler
```

---

## 🛠️ Installation & Setup (Local)

### 1. Requirements
- Python 3.12
- Node.js v18+

### 2. Backend FastAPI Gateway
Navigate to the project root directory:
```bash
# Create and activate Python 3.12 environment
conda activate streamlit_env

# Install backend dependencies
pip install -r requirements.txt

# Start backend server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Navigate to `http://localhost:8000/docs` to access Swagger interactive API documentation.

### 3. Frontend React App
Navigate to the `frontend/` directory:
```bash
cd frontend

# Install package dependencies
npm install

# Start local Vite web server
npm run dev
```
Navigate to `http://localhost:5173` to access the LendWise AI web application.

---

## 🐋 Docker & Docker Compose Deployment

To spin up the entire application stack in coordinated containers:

```bash
# Start all containers in the background
docker-compose up -d --build
```
This launches:
- **FastAPI backend** on `http://localhost:8000`
- **React frontend** on `http://localhost:3000`

---

## ⚙️ Environment Variables (.env)

### Backend `.env` parameters:
```env
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
```

### Frontend `.env` parameters:
```env
VITE_BACKEND_URL=http://localhost:8000
```
