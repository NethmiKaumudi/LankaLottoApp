# 🎰 LankaLottoApp

> **Advanced Lottery Ticket Check & Sales Performance Optimization System**
> Final Year Research Project — London Metropolitan University (CS6P05ES)

![Made with Flask](https://img.shields.io/badge/Backend-Flask%20%28Python%29-blue?style=flat-square&logo=python)
![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB?style=flat-square&logo=react)
![React](https://img.shields.io/badge/Web-React.js-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)
![ML](https://img.shields.io/badge/ML-Prophet%20%7C%20XGBoost-orange?style=flat-square)

---

## 📖 Overview

LankaLottoApp is a full-stack intelligent lottery management system designed to modernize Sri Lanka's lottery industry. The system empowers lottery agents with AI-powered ticket validation and gives administrators data-driven sales forecasting tools — all within a single, secure, integrated platform.

The project tackles three core problems in Sri Lanka's lottery industry:
- ❌ Manual ticket validation errors and fraud
- ❌ Lack of real-time sales insights for administrators
- ❌ No centralized system for agent management and verification

---

## ✨ Key Features

### 📱 Agent Mobile App (React Native)
- 📷 **QR Code Scanning** — scans lottery ticket QR codes using `pyzbar`, with Gemini API as an intelligent fallback for faint/non-standard QR codes
- 🔍 **OCR Ticket Validation** — extracts face numbers from ticket images using the **Gemini API**
- ✅ **Dual Verification** — cross-checks QR data against OCR-extracted numbers to detect counterfeit tickets
- 🏆 **Winning Status Check** — validates tickets against official NLB/DLB draw results in real time
- 📊 **Sales Tracking** — agents can log and track their daily ticket sales
- 🔐 **OTP Authentication** — secure login using phone number + SMS one-time password

### 🖥️ Admin Web Panel (React.js)
- 📈 **Sales Forecasting** — weekly and monthly sales predictions using **Prophet** and **XGBoost** ML models trained on NLB/DLB datasets
- 📊 **Interactive Dashboard** — real-time charts and analytics via **Recharts**
- 📥 **CSV Data Upload** — upload sales datasets for model training and analysis
- 👤 **Agent Management** — approve, reject, and manage registered lottery agents
- 📄 **PDF Report Export** — download sales prediction reports

### 🔒 Security & Backend
- JWT-based authentication for all API endpoints
- OTP-secured agent registration with admin approval workflow
- MongoDB-backed secure storage of agent records, tickets, and sales data
- HTTPS-ready Flask RESTful API architecture

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Mobile Frontend | React Native | Cross-platform agent app (iOS & Android) |
| Web Frontend | React.js + Recharts | Admin dashboard & analytics |
| Backend API | Python Flask | RESTful endpoints, business logic |
| Database | MongoDB | Flexible NoSQL data storage |
| OCR / AI | Gemini API | Ticket number & QR code extraction |
| QR Scanning | pyzbar | Primary QR code decoder |
| ML Forecasting | Prophet + XGBoost | Time-series sales prediction |
| Authentication | JWT + OTP (SMS) | Secure agent & admin login |
| Testing | Python unittest | Unit & integration testing |

---

## 📂 Project Structure

```
LankaLottoApp/
│
├── .vscode/                        # VS Code editor configuration
│
├── Backend/                        # Flask Python backend
│   ├── app.py                      # Flask app entry point
│   ├── requirements.txt            # Python dependencies
│   ├── config/                     # App configuration & environment settings
│   │
│   ├── sales_predictions/          # ML-based sales forecasting module
│   │   ├── __init__.py             # Flask Blueprint setup
│   │   ├── routes.py               # /predict/week & /predict/month endpoints
│   │   ├── sales_prediction_suggestions.py  # Forecast suggestion logic
│   │   └── utils.py                # Helper functions (data loading, lag features)
│   │
│   ├── lottery_validation/         # Ticket validation module
│   │   ├── __init__.py             # Flask Blueprint setup
│   │   └── routes.py               # /upload-image & /process-ticket endpoints
│   │
│   ├── sales/                      # Sales data management module
│   ├── users/                      # Agent/admin authentication module
│   ├── data/                       # CSV datasets (NLB/DLB sales data)
│   ├── uploads/                    # Temporary ticket image storage
│   └── tests/                      # Unit & integration test suites
│
├── LankaLotto/                     # React Native mobile app
│   ├── App.tsx                     # App entry point
│   ├── screens/                    # App screens (Home, Scan, Results, etc.)
│   └── components/                 # Reusable UI components
│
└── web-admin-frontend/             # React.js web admin panel
    ├── src/
    │   ├── components/             # Reusable dashboard components
    │   ├── screens/                # Dashboard pages
    │   └── services/               # API service calls
    └── public/
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI
- Gemini API key

---

### 🔧 Backend Setup (Flask)

```bash
# 1. Clone the repository
git clone https://github.com/NethmiKaumudi/LankaLottoApp.git
cd LankaLottoApp/Backend

# 2. Create and activate virtual environment
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create a .env file with your credentials
# MONGO_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key
# JWT_SECRET=your_jwt_secret

# 5. Run the Flask server
python app.py
```

API will be available at: `http://127.0.0.1:5000/`

---

### 🌐 Web Admin Panel Setup (React.js)

```bash
cd web-admin-frontend
npm install
npm start
```

---

### 📱 Mobile App Setup (React Native)

```bash
cd LankaLotto
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/lottery/upload-image` | Upload ticket image for validation |
| `GET` | `/lottery/process-ticket` | Retrieve ticket validation result |
| `GET` | `/sales/predict/week` | Get 7-day sales forecast |
| `GET` | `/sales/predict/month` | Get 30-day sales forecast |
| `POST` | `/users/register` | Agent registration with OTP |
| `POST` | `/users/login` | Agent/admin login |
| `POST` | `/sales/add` | Log new sales record |
| `PUT` | `/sales/edit` | Update sales record |

---

## 🧠 How Ticket Validation Works

```
Agent scans ticket
       │
       ▼
 QR Code Scan (pyzbar)
       │
  Success? ──No──▶ Gemini API QR Fallback
       │
       ▼
 OCR Number Extraction (Gemini API)
       │
       ▼
 Cross-check QR data vs. OCR data
       │
  Match? ──No──▶ Flag as COUNTERFEIT ❌
       │
       ▼
 Validate against NLB/DLB draw results
       │
       ▼
 Return: Valid ✅ / Invalid ❌ + Prize Info 🏆
```

---

## 📈 How Sales Prediction Works

1. Historical NLB/DLB sales data (CSV) is loaded and preprocessed
2. Lag features are added to improve model accuracy
3. **Prophet** generates time-series trend forecasts
4. **XGBoost** adds regression-based accuracy on structured features
5. Predictions (weekly/monthly) + strategic suggestions are returned as JSON
6. Results are visualized on the React.js admin dashboard with export to PDF

---

## 🧪 Testing

```bash
cd Backend
python -m unittest discover tests/
```

Tests cover:
- Lottery validation endpoints (`/upload-image`, `/process-ticket`)
- Sales prediction endpoints (`/predict/week`, `/predict/month`)
- User authentication flows (register, login, OTP verification)
- Sales CRUD operations

Tested on: **Vivo Y27 Android** (mobile) and **Windows laptop** (web)

---

## 🎯 Research Contribution

- Demonstrates a **dual AI validation method** (pyzbar + Gemini API) for reliable lottery ticket authentication
- Applies **Prophet and XGBoost** ensemble forecasting to real-world lottery sales data
- Provides a **fraud-prevention framework** for lottery agents via cross-verification of QR and OCR data
- Delivers a **reproducible full-stack pipeline**: data ingestion → model training → API serving → frontend visualization

---

## 🔮 Future Enhancements

- 🎫 Support for additional lottery ticket types beyond Mahajana Sampatha
- ⚡ Real-time NLB/DLB dataset integration via official APIs
- 📊 Extended analytics dashboard with KPIs and trend heatmaps
- 🌐 Multilingual support (Sinhala, Tamil, English)
- 🚀 Performance optimization for low-end Android devices
- ☁️ Cloud deployment (AWS / GCP) with auto-scaling

---

## 👩‍💻 Author

**W.V.N. Kaumudi**
📧 [nethmikaumudi7@gmail.com](mailto:nethmikaumudi7@gmail.com)
💼 [Upwork Profile](https://www.upwork.com/freelancers/~017badec76a1f1f970)
🎓 London Metropolitan University — Student ID: 24034291

---

## 📄 License

This project was developed as a final year research project at London Metropolitan University.
All rights reserved © 2025 W.V.N. Kaumudi.
