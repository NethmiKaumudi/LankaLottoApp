# LankaLottoApp 🎰

A final-year research project that combines **AI/ML**, **Flask**, **ReactJS**, **React Native**, and **MongoDB** to build a smart lottery sales prediction and management system for Sri Lanka.

---

## 📖 Overview
**LankaLottoApp** aims to modernize lottery operations by providing predictive analytics for sales together with web and mobile frontends. The system demonstrates how ML-driven forecasts can support planning, inventory/stock decisions, and revenue forecasting for lottery operations.

---

## ✨ Key Features
- 🔮 **AI/ML Sales Prediction** — forecast sales using historical sales data.  
- 📱 **Cross-Platform Interfaces** — ReactJS (web) + React Native (mobile).  
- 🔐 **User Management** — authentication and profile handling.  
- 📊 **Data Upload & Storage** — upload CSV datasets for training/testing.  
- ⚡ **RESTful APIs** — Flask backend exposing endpoints for frontend/mobile clients.

---

## 🛠 Tech Stack
**Frontend**
- ReactJS (Web)
- React Native (Mobile)

**Backend**
- Flask (Python)
- MongoDB (Database)

**Machine Learning**
- Python data & ML libraries (scikit-learn / pandas / numpy / etc.)
- Dataset example: `data/sales_data_full_two_year.csv`

---

## 📂 Project Structure
LankaLottoApp/
│── app.py # Flask app entry point
│── requirements.txt # Python dependencies
│
├── config/ # Configuration files
├── data/ # Datasets (CSV)
├── sales/ # ML models & training/prediction code
├── users/ # Authentication & user management
├── uploads/ # Uploaded files / artifacts
├── tests/ # Unit/integration tests
└── README.md

yaml
Copy code


## 🚀 Quick Start (Backend)
> These steps run the Flask backend locally. Adjust for your environment.

1. Clone the repo  

git clone https://github.com/NethmiKaumudi/LankaLottoApp.git
cd LankaLottoApp
Create a virtual environment

bash
Copy code
python -m venv venv
Activate the virtual environment

macOS / Linux:

bash
Copy code
source venv/bin/activate
Windows (PowerShell):

powershell
Copy code
.\venv\Scripts\Activate.ps1
Install dependencies

bash
Copy code
pip install -r requirements.txt
Run the Flask server

bash
Copy code
python app.py
Open API endpoints at http://127.0.0.1:5000/ (or whatever host/port configured)

🧪 How to run ML prediction (example)
This is an example — adapt paths/commands to your repo structure.

Ensure data/sales_data_full_two_year.csv is present.

Run the training / prediction script inside sales/, e.g.:

bash
Copy code
python sales/train_model.py
python sales/predict.py --input data/sales_data_full_two_year.csv
Check uploads/ or configured output folder for model/artifacts.

🎯 Research Contribution
Applies supervised ML methods to forecast lottery-related sales from historical records.

Demonstrates integration of ML models with production-like REST APIs and frontends.

Provides a reproducible pipeline for data ingestion, model training, and prediction serving.

📌 Future Enhancements
Extend ML models to handle multiple lottery product types and seasonality.

Add a real-time analytics dashboard (charts, KPIs).

Implement role-based access & stronger security (JWT, HTTPS, input validation).

Add multilingual support and improved UX for the mobile app.

👩‍💻 Author
Nethmi Kaumudi

Email: nethmikaumudi7@gmail.com

Upwork: https://www.upwork.com/freelancers/~017badec76a1f1f970

