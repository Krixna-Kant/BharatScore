# BharatScore – AI-Powered Credit Risk Management Platform

<div align="center">

![BharatScore](https://img.shields.io/badge/BharatScore-AI%20Credit%20Scoring-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![React](https://img.shields.io/badge/React-19.1-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Empowering Financial Inclusion Through Alternative Data and Explainable AI**

[Features](#-key-features) • [Installation](#-installation--setup) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Model Performance](#-model-performance)
- [Testing Methodology](#-testing-methodology)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [References](#-references)
- [License](#-license)

---

## 🎯 About

BharatScore is an innovative AI-powered credit risk management platform designed to address financial inclusion challenges in India and similar emerging markets. By leveraging alternative data sources—including telecom usage, utility bill payments, psychometric assessments, and behavioral signals—BharatScore generates reliable credit scores for individuals who lack traditional financial records.

The platform uses advanced machine learning (LightGBM) with explainability tools (SHAP, LIME) to compute Probability of Default (PD) and assign transparent risk tiers. This enables lenders to make informed decisions about applicants who would otherwise be excluded from formal credit systems.

---

## 🔴 Problem Statement

### Current Challenges

**For Users (Underbanked & Unbanked):**
- Lack of formal financial records (credit history, CIBIL scores, bank statements)
- Dependency on informal lending channels with high interest rates
- Systematic exclusion from accessing loans for education, healthcare, emergencies, or business expansion

**For Financial Institutions:**
- Difficulty assessing applicants without reliable data sources
- Higher risk of defaults due to incomplete borrower profiles
- Regulatory pressure mandates transparency, fairness, and bias mitigation in credit scoring

### The Opportunity

With over **190 million unbanked adults** in India and millions more underbanked, there is a significant opportunity to leverage alternative data—telecom usage, utility bill payments, psychometric assessments, and behavioral signals—to estimate probability of default (PD) and provide fair access to credit.

---

## 💡 Solution Overview

BharatScore introduces a comprehensive AI-powered credit risk management system that:

1. **Collects Alternative Data**: Telecom metadata, utility bill payments, Aadhaar-based verification, demographic details, and psychometric evaluations
2. **Generates Credit Scores**: Computes Probability of Default (PD) and assigns transparent risk tiers (A+ to D)
3. **Provides Explainability**: Uses SHAP-based explanations to help lenders understand credit decisions
4. **Ensures Compliance**: Consent-driven data collection compliant with India's DPDP Act
5. **Enables Continuous Improvement**: Post-loan monitoring for dynamic score updates

### Solution Workflow

```
User Onboarding → Data Collection → Model Inference → Risk Scoring → Admin Decision → Post-Loan Monitoring
     ↓                  ↓                 ↓              ↓              ↓                    ↓
Aadhaar OCR    Alternative Data    LightGBM Model   PD & Tier    Admin Dashboard    Repayment Tracking
Phone Verify   + Psychometric      + SHAP Explain  + Score      + AI Insights      + Score Updates
```

---

## ✨ Key Features

### For Users
- ✅ **Seamless Onboarding**: Aadhaar OCR and phone verification for quick registration
- ✅ **Psychometric Testing**: Interactive, timed, randomized questions to assess behavioral traits
- ✅ **Simple Loan Application**: Category-based forms (personal, education, business) with minimal documentation
- ✅ **Transparent Results**: View BharatScore, psychometric score, and loan status on dashboard
- ✅ **Accessibility**: Multilingual support and mobile-friendly design

### For Admins/Lenders
- ✅ **Intuitive Dashboard**: Clear view of applications, approvals, rejections, and risk insights
- ✅ **AI-Driven Support**: Model-generated PD, risk tier, and SHAP-based explanations
- ✅ **Efficient Review**: Quick application review reduces operational costs
- ✅ **Trust & Transparency**: Consent-driven data collection with clear decision explanations

### Technical Features
- ✅ **Explainable AI**: Integrated SHAP explainability for regulatory compliance
- ✅ **Alternative Data Inclusion**: Uses telecom, utility, and psychometric data
- ✅ **Dynamic Scoring**: Post-loan monitoring enables score updates over time
- ✅ **Fraud Prevention**: Psychometric test with timed, randomized questions
- ✅ **Synthetic Data Generation**: Effective model training even with limited real-world data

---

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI 0.116.1
- **Language**: Python 3.8+
- **ML Framework**: LightGBM 4.6.0
- **Explainability**: SHAP 0.48.0, LIME
- **Hyperparameter Tuning**: Optuna
- **Data Processing**: Pandas 2.3.1, NumPy 2.2.6, Scikit-learn 1.6.1
- **Database**: MongoDB (via PyMongo)
- **LLM Integration**: Ollama (Mistral model for RAG-based explanations)

### Frontend
- **Framework**: React 19.1.1 with TypeScript 5.8
- **Build Tool**: Vite 7.1.2
- **UI Library**: Radix UI components, Tailwind CSS
- **Routing**: React Router DOM 7.8.2
- **Authentication**: Clerk (React)
- **State Management**: TanStack Query (React Query) 5.85
- **Charts**: Recharts 3.1.2
- **Face Recognition**: face-api.js 0.22.2 (for Aadhaar verification)

### Infrastructure
- **Cloud**: Cloud-based deployment with microservices architecture
- **Data Pipelines**: Real-time streaming pipelines for telecom and utility data
- **Security**: AES-256 encryption, role-based access control
- **Compliance**: DPDP Act compliant data handling

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ User Portal  │  │ Admin Panel  │  │ Psychometric │         │
│  │   (Clerk)    │  │  Dashboard   │  │     Test     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────┴────────────────────────────────────┐
│                    Backend (FastAPI)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Profile    │  │  Prediction   │  │   Admin      │         │
│  │  Endpoints   │  │   Endpoints   │  │  Endpoints   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                    ML Pipeline Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ LightGBM     │  │    SHAP      │  │   Ollama     │         │
│  │  Model       │  │  Explainer   │  │   (RAG)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                    Data Layer (MongoDB)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   User Data  │  │ Applications │  │  Model       │         │
│  │   Collection │  │  Collection  │  │  Artifacts   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Onboarding**
   - Aadhaar OCR verification
   - Phone number verification
   - Profile creation with demographic data

2. **Data Collection**
   - Telecom metadata (SMS count, recharge frequency, SIM tenure)
   - Utility bill payment history
   - Psychometric test results
   - Loan application details

3. **Model Inference**
   - Feature engineering and preprocessing
   - LightGBM prediction (Probability of Default)
   - SHAP value calculation for explainability
   - Risk tier assignment (A+ to D)
   - Alt-CIBIL score generation (300-900 scale)

4. **Admin Decision**
   - View applications with AI-generated insights
   - Review SHAP-based feature explanations
   - Approve/Reject/Review applications
   - Generate remarks using Ollama RAG model

5. **Post-Loan Monitoring**
   - Track repayment behavior
   - Update credit scores dynamically
   - Proactive risk management

---

## 🚀 Installation & Setup

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18.x or higher
- **MongoDB**: 4.4 or higher (local or cloud instance)
- **Ollama**: For LLM-based explanations (optional but recommended)
- **Git**: For cloning the repository

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BharatScore/backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/bharatscore
   # Or use MongoDB Atlas connection string:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bharatscore
   ```

5. **Ensure model artifacts are present**
   The following files should exist in `backend/artifacts/`:
   - `bharatscore_pipeline_bundle.pkl`
   - `calibrated_clf.pkl`
   - `feature_names.pkl`
   - `inference_wrapper.pkl`
   - `lgbm_raw_model.pkl`
   - `preprocessor.pkl`

6. **Install Ollama (Optional, for RAG-based explanations)**
   ```bash
   # Visit https://ollama.ai for installation instructions
   # After installation, pull the Mistral model:
   ollama pull mistral
   ```

7. **Run the backend server**
   ```bash
   uvicorn app:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative Docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend/bharatscore-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Clerk Authentication (if needed)**
   Update `src/main.tsx` with your Clerk publishable key, or set it via environment variable:
   ```typescript
   // Create .env file in frontend/bharatscore-ui/
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
   ```

4. **Update API endpoint (if needed)**
   If your backend is running on a different port or URL, update the API base URL in your frontend code.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The frontend will be available at `http://localhost:5173`

### Verify Installation

1. **Check backend health**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "models_loaded": true,
     "explainer_loaded": true
   }
   ```

2. **Check frontend**
   Open `http://localhost:5173` in your browser and verify the landing page loads.

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`.env` file in `backend/`)
```env
MONGO_URI=mongodb://localhost:27017/bharatscore
# Or MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bharatscore?retryWrites=true&w=majority
```

#### Frontend (`.env` file in `frontend/bharatscore-ui/`)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:8000
```

### Model Configuration

The model uses the following risk tiers:
- **A+**: PD < 0.05 (Excellent)
- **A**: PD 0.05 - 0.10 (Good)
- **B**: PD 0.10 - 0.20 (Fair)
- **C**: PD 0.20 - 0.35 (Moderate Risk)
- **D**: PD ≥ 0.35 (High Risk)

Sanction percentages by tier:
- **A+**: 100% of requested amount
- **A**: 95% of requested amount
- **B**: 80% of requested amount
- **C**: 55% of requested amount
- **D**: 0% (rejection)

---

## 📖 Usage

### For Users

1. **Sign Up / Sign In**
   - Register using Clerk authentication
   - Verify phone number and Aadhaar details

2. **Complete Profile**
   - Fill in demographic information
   - Provide occupation and location details

3. **Take Psychometric Test**
   - Complete the mandatory psychometric assessment
   - Test includes randomized, timed questions to prevent manipulation

4. **Apply for Loan**
   - Select loan category (Personal, Education, Business)
   - Enter loan amount requested
   - Submit application

5. **View Results**
   - Check dashboard for BharatScore
   - View loan application status
   - Review notifications from admin

### For Admins

1. **Access Admin Dashboard**
   - Login with admin credentials
   - View applications summary and statistics

2. **Review Applications**
   - Click on an application to view details
   - Review BharatScore, risk tier, and PD
   - View SHAP-based feature explanations

3. **Generate AI Insights**
   - Click "Generate AI Insight" for natural language summary
   - Review AI-generated remarks based on SHAP values

4. **Make Decision**
   - Approve, Reject, or mark for Review
   - Add admin remarks and notes
   - System automatically notifies user

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
Most endpoints require `clerk_user_id` as a query parameter or in the request body.

### Key Endpoints

#### User Endpoints

**Create/Update Profile**
```http
POST /profile
Content-Type: application/json

{
  "clerk_user_id": "user_123",
  "name": "John Doe",
  "gender": "Male",
  "state": "Maharashtra",
  "occupation": "Farmer"
}
```

**Get Profile**
```http
GET /profile?clerk_user_id=user_123
```

**Onboard User**
```http
POST /onboard
Content-Type: application/json

{
  "clerk_user_id": "user_123",
  "user_type": "rural",
  "region": "West",
  "sms_count": 150.0,
  "bill_on_time_ratio": 0.85,
  "recharge_freq": 2.5,
  "sim_tenure": 36.0,
  "location_stability": 0.9,
  "income_signal": 0.7,
  "coop_score": 0.8,
  "land_verified": 1,
  "age_group": "30-40",
  "loan_amount_requested": 50000.0,
  "recharge_pattern": "regular",
  "loan_category": "business",
  "psychometric_score": 0.75,
  "consent": true
}
```

**Save Psychometric Score**
```http
POST /save-psychometric
Content-Type: application/json

{
  "clerk_user_id": "user_123",
  "psychometric_score": 0.75
}
```

**Get User Applications**
```http
GET /users?clerk_user_id=user_123
```

**Get User Notifications**
```http
GET /user/notifications/{clerk_user_id}
```

#### Prediction Endpoints

**Predict Credit Score**
```http
POST /predict
Content-Type: application/json

{
  "user_type": "rural",
  "region": "West",
  "sms_count": 150.0,
  "bill_on_time_ratio": 0.85,
  "recharge_freq": 2.5,
  "sim_tenure": 36.0,
  "location_stability": 0.9,
  "income_signal": 0.7,
  "coop_score": 0.8,
  "land_verified": 1,
  "age_group": "30-40",
  "loan_amount_requested": 50000.0,
  "recharge_pattern": "regular",
  "loan_category": "business",
  "psychometric_score": 0.75
}
```

**Response:**
```json
{
  "pd": 0.12,
  "tier": "B",
  "alt_cibil_score": 675.5,
  "eligible_amount": 40000,
  "decision": "Approved",
  "top_shap": [
    {
      "feature": "num__coop_score",
      "shap": 0.15,
      "value_enc": 0.8
    }
  ],
  "final_cibil_score": 675.5,
  "final_tier": "B",
  "loan_approval_probability": 0.88
}
```

#### Admin Endpoints

**Get Applications Summary**
```http
GET /admin/applications-summary
```

**Get Application Details**
```http
GET /admin/applications/{clerk_user_id}
```

**Update Application Status**
```http
PATCH /admin/applications/{clerk_user_id}/{created_timestamp}
Content-Type: application/json

{
  "status": "approved",
  "remarks": "Application approved based on strong credit profile",
  "admin_notes": "Verify documents before disbursement"
}
```

**Generate AI Insight**
```http
POST /admin/generate-insight
Content-Type: application/json

{
  "clerk_user_id": "user_123",
  "application_created": "2024-01-15T10:30:00Z"
}
```

#### Health Check

**Check API Health**
```http
GET /health
```

For complete API documentation, visit `http://localhost:8000/docs` when the server is running.

---

## 📊 Model Performance

### Performance Metrics

The BharatScore model achieved the following results on the test dataset:

- **ROC-AUC**: 0.64 (moderate discrimination ability)
- **PR-AUC**: 0.32 (useful for imbalanced data evaluation)
- **Brier Score**: 0.19 (good probability calibration)
- **Precision (defaults)**: 0.87
- **Recall (defaults)**: 0.60
- **F1-Score**: 0.71

### Key Predictive Features

Based on SHAP analysis, the most important features for credit risk prediction are:

1. **Cooperative Score**: Community/behavioral trust index
2. **Psychometric Test Results**: Behavioral traits and reliability indicators
3. **SMS Activity**: Communication patterns and engagement
4. **Bill Payment Punctuality**: Financial discipline indicator
5. **SIM Tenure**: Stability and commitment signal
6. **Income Signal**: Earning capacity indicator
7. **Land Verification**: Asset ownership verification

### Model Training Details

- **Algorithm**: LightGBM (Gradient Boosting)
- **Hyperparameter Tuning**: Optuna (Bayesian Optimization)
- **Class Imbalance Handling**: SMOTE oversampling + class-weight balancing
- **Data Split**: 70% training, 10% validation, 20% testing (stratified)
- **Evaluation Focus**: F1-score and PR-AUC optimization

---

## 🧪 Testing Methodology

### Dataset Preparation
- Synthetic dataset of ~5,000 borrower profiles
- Features include: SMS activity, bill payment punctuality, recharge patterns, psychometric scores, loan details, and behavioral traits

### Data Splitting
- Stratified random split to maintain class balance
- 70% training, 10% validation, 20% testing

### Preprocessing
- Normalization and feature engineering
- Missing value imputation
- Derived features (log-transformed loan amount, normalized SMS count)

### Model Training
- LightGBM binary classification (default vs non-default)
- Optuna for Bayesian hyperparameter tuning
- SMOTE oversampling for class imbalance
- Class-weight balancing

### Evaluation Metrics
- **ROC-AUC**: Overall model discrimination
- **PR-AUC**: Performance on imbalanced data
- **Brier Score**: Probability calibration assessment
- **Precision, Recall, F1**: Classification performance

### Explainability Testing
- SHAP values calculated for individual predictions
- Feature importance analysis
- Model transparency validation

---

## 🔮 Future Improvements

### Enhanced Modeling Techniques
- Explore ensemble methods combining multiple algorithms
- Deep learning architectures for complex behavioral patterns
- Time-series modeling for temporal data (repayment cycles, usage trends)

### Smarter Psychometric Testing
- Adaptive question banks that adjust based on responses
- AI-generated questions to minimize repeatability
- Reduced gaming potential through dynamic question selection

### Stronger Post-Loan Monitoring
- Traceability module for repayment behavior tracking
- Dynamic BharatScore updates based on real-time payment data
- Proactive risk alerts and early warning systems

### Advanced Features
- Reinforcement Learning for personalized loan recommendations
- Network analysis using telecom call graphs
- Integration with UPI transactions and digital payment data
- Expansion of vernacular and voice-based onboarding

### Scalability Enhancements
- Multi-region cloud deployment for 100M+ users
- Real-time streaming pipelines for high-volume data
- GPU/TPU clusters for large-scale model training
- Enhanced security and compliance automation

---

## 📚 References

1. T. Aslam and A. Aslam, "Social-Credit+: AI Driven Social Media Credit Scoring Platform," arXiv preprint arXiv:2506.12099, 2025. [Online]. Available: https://arxiv.org/pdf/2506.12099

2. P. Gupta, "A Comprehensive Guide on Psychometric Credit Scoring," Nected.ai Blog, Feb. 26, 2024. [Online]. Available: https://www.nected.ai/blog/psychometric-credit-scoring

3. J. A. Kumar and S. R. Babu, "Enhancing Credit Scoring with Alternative Data and Machine Learning for Financial Inclusion," South Eastern European Journal of Public Health, vol. XXVI, pp. 511–518, Jan. 2025. DOI: 10.70135/seejph.vi.3584

4. The Use of Alternative Data in Credit Risk Assessment: The Opportunities, Risks, and Challenges, World Bank, 2023. [Online]. Available: https://documents1.worldbank.org

5. An Explainable AI framework for credit evaluation and analysis, ScienceDirect, 2024.

6. Enhancing credit scoring accuracy with a comprehensive evaluation using alternative data sources, PMC – Home Credit / related dataset.

7. A Survey of Explainable Artificial Intelligence (XAI) in Financial Time Series, ACM, 2024.

8. M. Óskarsdóttir, C. Bravo, C. Sarraute, J. Vanthienen, B. Baesens, "The Value of Big Data for Credit Scoring: Enhancing Financial Inclusion using Mobile Phone Data and Social Network Analytics," arXiv preprint arXiv:2002.09931, 2020. [Online]. Available: https://arxiv.org/abs/2002.09931

9. H. Ots, I. Liiv, D. Tur, "Mobile Phone Usage Data for Credit Scoring," arXiv preprint arXiv:2002.12616, 2020. [Online]. Available: https://arxiv.org/abs/2002.12616

10. M. Schmitt, "Explainable Automated Machine Learning for Credit Decisions: Enhancing Human Artificial Intelligence Collaboration in Financial Engineering," arXiv preprint arXiv:2402.03806, 2024. [Online]. Available: https://arxiv.org/abs/2402.03806

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 👥 Team Squirtle – BharatScore Development Team

| Name | Email | Institution | Location |
|------|--------|--------------|-----------|
| **Krishna** | [kant19krishna@gmail.com](mailto:kant19krishna@gmail.com) | Maharaja Agrasen Institute of Technology | Delhi |
| **Gauri** | [gauri.madaan.12@gmail.com](mailto:gauri.madaan.12@gmail.com) | Maharaja Agrasen Institute of Technology | Delhi |
| **Mohit Taneja** | [mohittaneja156@gmail.com](mailto:mohittaneja156@gmail.com) | Maharaja Agrasen Institute of Technology | Delhi |


---

## 🙏 Acknowledgments

- LightGBM team for the powerful gradient boosting framework
- SHAP library developers for explainability tools
- Clerk for authentication infrastructure
- All open-source contributors whose libraries made this project possible

---

<div align="center">

**Built with ❤️ for Financial Inclusion**

*Empowering millions to access credit through AI and alternative data*

</div>
