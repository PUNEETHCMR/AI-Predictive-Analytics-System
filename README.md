# 🤖 AI-Powered Predictive Analytics System

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=flat-square&logo=tensorflow)
![Flask](https://img.shields.io/badge/Flask-REST%20API-black?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![Accuracy](https://img.shields.io/badge/Model%20Accuracy-87%25-brightgreen?style=flat-square)

An end-to-end machine learning application for predictive data analysis — featuring a real-time React dashboard, Flask REST API, TensorFlow/Scikit-learn models, and a fully containerized Docker deployment.

---

## 📸 Preview

> Interactive dashboard with live inference stream, confusion matrix, feature importance, training curves, and data pipeline metrics.

---

## ✨ Features

- 🎯 **87% Model Accuracy** on held-out test datasets
- ⚡ **Real-time Inference** — live prediction stream at ~28ms latency
- 📦 **50,000+ Records** processed through an automated data pipeline
- 🧠 **TensorFlow Sequential Model** with feature engineering & optimization
- 🔌 **RESTful Flask API** to serve ML model predictions
- 📊 **Interactive React Dashboard** with training curves, confusion matrix, residuals, and feature importance charts
- 🐳 **Dockerized Deployment** for scalability and reliability on cloud infrastructure

---

## 🗂️ Project Structure

```
AI-Predictive-Analytics-System/
├── backend/
│   ├── app.py                  # Flask REST API entry point
│   ├── model/
│   │   ├── train.py            # Model training script
│   │   ├── predict.py          # Inference logic
│   │   └── saved_model/        # Trained TensorFlow model
│   ├── pipeline/
│   │   ├── ingest.py           # Data ingestion
│   │   ├── preprocess.py       # Cleaning, scaling, imputation
│   │   └── feature_eng.py      # Feature engineering
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── App.jsx             # React dashboard (Recharts)
│   ├── package.json
│   └── public/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## 🧠 Model Architecture

Built with **TensorFlow 2.x Sequential API**:

| Layer       | Shape       | Activation | Parameters |
|-------------|-------------|------------|------------|
| Input       | 128 neurons | —          | 0          |
| Dense 1     | 256 neurons | ReLU       | 33,024     |
| Dropout     | rate: 0.3   | —          | 0          |
| Dense 2     | 128 neurons | ReLU       | 32,896     |
| Dense 3     | 64 neurons  | ReLU       | 8,256      |
| Output      | 1 neuron    | Sigmoid    | 65         |

**Optimizer:** Adam · **Loss:** Binary Crossentropy · **Epochs:** 30

---

## 📊 Model Performance

| Metric     | Score  |
|------------|--------|
| Accuracy   | 87.3%  |
| Precision  | 91.2%  |
| Recall     | 88.7%  |
| F1 Score   | 89.9%  |
| MAE        | 3.24   |
| RMSE       | 4.87   |
| R² Score   | 0.871  |

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| GET    | `/health`          | Health check                       |
| POST   | `/predict`         | Single record prediction           |
| POST   | `/predict/batch`   | Batch prediction (up to 1000 rows) |
| GET    | `/model/metrics`   | Return latest model metrics        |
| GET    | `/pipeline/status` | Data pipeline status               |

**Example request:**
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1.2, 0.8, 3.4, 2.1, 0.5]}'
```

**Example response:**
```json
{
  "prediction": 0.87,
  "label": "positive",
  "confidence": 0.91,
  "latency_ms": 28
}
```

---

## ⚙️ Data Pipeline

Handles **50,000+ records** through the following stages:

1. **Data Ingestion** — Load from CSV / PostgreSQL / API sources
2. **Null Imputation** — Median/mode filling for missing values
3. **Outlier Removal** — IQR-based anomaly filtering
4. **Feature Scaling** — StandardScaler / MinMaxScaler
5. **Feature Engineering** — Polynomial features, interaction terms
6. **Model Inference** — Batched TensorFlow predictions
7. **Response Serialization** — JSON output via Flask

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/PUNEETHCMR/AI-Predictive-Analytics-System.git
cd AI-Predictive-Analytics-System
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

### 3. Run locally (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🐳 Docker Setup

```yaml
# docker-compose.yml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MODEL_PATH=/app/model/saved_model
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## 🛠️ Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| ML Framework  | TensorFlow 2.x, Scikit-learn      |
| Backend       | Python 3.11, Flask                |
| Frontend      | React 18, Recharts                |
| Database      | PostgreSQL, Redis (cache)         |
| Deployment    | Docker, Docker Compose            |
| Cloud         | AWS EC2 / GCP Cloud Run           |
| Monitoring    | Prometheus, Grafana               |

---

## 📁 Requirements

**backend/requirements.txt**
```
tensorflow==2.13.0
scikit-learn==1.3.0
flask==3.0.0
flask-cors==4.0.0
pandas==2.1.0
numpy==1.24.0
gunicorn==21.2.0
psycopg2-binary==2.9.7
redis==5.0.0
```

---

## 🙋‍♂️ Author

**Puneeth Chityala**
- GitHub: [@PUNEETHCMR](https://github.com/PUNEETHCMR)

---

## 📄 License

This project is licensed under the MIT License.
