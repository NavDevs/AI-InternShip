# 🚀 **AI-Powered Internship & Job Application Platform**

A **production-ready MERN stack application** that helps students **find internships**, **track applications**, and receive **AI-powered career guidance** — all in one place.

🔗 **Live Demo (Frontend):**  
👉 https://ai-internship-frontend.onrender.com  

🔗 **Backend API:**  
👉 https://ai-internship.onrender.com  

📱 **Mobile App:**  
📲 [Download for Android](https://github.com/NavDevs/AI-InternShip/releases/download/v1.4.0/Intern-AI-v7.apk)  

---

## 🎯 **Problem Statement**

Students apply to multiple internships across platforms but struggle with:
- **Tracking application status**
- **Understanding skill gaps from job descriptions**
- **Getting personalized career guidance**

This platform solves all three using **AI + analytics + modern UI**.

---

## ✨ **Features**

### 🔍 **Live Job Search**
- Real-time job listings via **RapidAPI (JSearch)**
- Advanced filtering by **title, location, employment type**
- One-click application tracking

### 🤖 **AI Job Analyzer**
- Paste job descriptions for analysis
- **Skill match percentage calculation**
- Identify **missing skills**
- Download **professional PDF reports**

### 💬 **AI Career Bot**
- Personalized career advice
- Interactive career roadmap generation
- Natural AI-driven conversation

### 📊 **Application Tracker**
- Centralized dashboard for all applications
- Status tracking: **Applied | Interview | Offer | Rejected**
- Visual analytics using charts

### 🎨 **Modern UI / UX**
- **Dark / Light mode**
- Fully responsive design
- Smooth animations with **Framer Motion**
- Professional **glassmorphism UI**

---

## 🛠 **Tech Stack**

### **Frontend**
- **React.js (Vite)**
- **Tailwind CSS**
- **Framer Motion**
- **Chart.js**
- **Lucide React**
- **Firebase Authentication & Storage**

### **Backend**
- **Node.js**
- **Express.js**
- **MongoDB Atlas + Mongoose**
- **JWT Authentication**
- **Groq AI (Llama 3.3 – 70B)**
- **RapidAPI (JSearch)**

### **AI Capabilities**
- Job description analysis
- Resume skill extraction
- Career advice generation
- Personalized learning roadmaps

---

## 🏗 **Project Structure**

```text
AI-InternShip
│
├── client/                 # React frontend
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
│
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Authentication & security
│   └── utils/              # AI helpers
│
└── README.md
```

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=jsearch.p.rapidapi.com
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=https://ai-internship.onrender.com
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📦 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas
- Firebase Project
- Groq AI API Key
- RapidAPI Key

### Clone Repository
```bash
git clone https://github.com/nas23ise-dot/AI-InternShip.git
cd AI-InternShip
```

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔐 Authentication Flow
- Firebase handles login & signup
- JWT secures backend APIs
- Scalable for future role-based access

## 📈 Future Enhancements
- AI resume scoring & ATS matching
- Email notifications for application updates
- Admin dashboard
- Company-wise analytics

## 🧠 Why This Project Stands Out
- ✔ Real-world AI integration
- ✔ Production deployment
- ✔ Clean MERN architecture
- ✔ Strong resume & interview project

---

## 📄 License
This project is for educational purposes as part of a CSE major project.

## 🤝 Contributing
This is an academic project. Feedback and suggestions are welcome!

## 🆘 Support
For deployment help, see the [Deployment Guide](./DEPLOYMENT.md).

---

**Built with ❤️ by Huesh**

## 👨‍💻 Author
**Naveen S**
ISE Student | MERN Stack Developer | AI Enthusiast
