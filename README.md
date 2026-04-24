# MedBrief

**Know before you go.**

MedBrief is an AI-powered pre-appointment companion that helps patients walk into doctor visits prepared, confident, and clear.

---

## 🚀 Overview

Healthcare communication is inefficient. Patients often forget symptoms, struggle to articulate concerns, and waste most of their limited appointment time.

MedBrief solves this by converting unstructured patient input into:
- A **plain-English summary** for patients  
- A **structured clinical brief** for doctors  

It also guides users on what to say, what to ask, and highlights important concerns — always framed as questions, never diagnoses.

---

## ✨ Features

- 🧠 Conversational symptom intake  
- 📄 Doctor-ready clinical brief  
- 🗣️ Patient prep card (what to say & ask)  
- ⚠️ Red-flag detection (question-based, safe)  
- 🖨️ Print-friendly doctor brief  
- 🔌 Modular, plug-and-play architecture  

---

## 🏗️ Tech Stack

- **Frontend:** React (Create React App), CSS  
- **Backend:** Python, FastAPI, Uvicorn  
- **AI:** Grok API  
- **APIs & Data:** REST APIs, JSON  
- **Architecture:** Modular component-based design  

---

## ⚙️ How It Works

1. User describes symptoms conversationally  
2. AI asks follow-up questions  
3. System generates a structured report  
4. Outputs are split into:
   - **Patient View:** simple, actionable summary  
   - **Doctor View:** concise, clinical brief  

---

## 📁 Project Structure



medbrief/
├── backend/
│   ├── main.py
│   ├── analyzer.py
│   └── routers/
├── frontend/
│   └── src/
│       └── components/
├── pitch/
└── README.md

```

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/medbrief.git
cd medbrief
````

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

---

## ⚠️ Challenges

* Ensuring zero diagnostic output (safety-first design)
* Generating consistent structured outputs from AI
* Designing a simple yet powerful UX
* Building modular components with seamless integration

---

## 🏆 Accomplishments

* Dual-sided product for patients and doctors
* Safe-by-design AI system
* Real-world usable print-ready outputs
* Fast, modular integration

---

## 📚 What We Learned

* AI works best when it structures thinking, not replaces it
* Simplicity in healthcare UX is difficult but critical
* Framing outputs as questions builds trust and safety
* Real-world products require balancing capability with ethics

---

## 🔮 What's Next

* Mobile-first experience
* Integration with health records and wearables
* Personalized recommendations
* Multilingual support
* Clinical validation and partnerships

---

## 💡 Tagline

**Know before you go.**

```
```
