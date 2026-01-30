# AI-Powered Internship & Job Application Platform

A modern, production-ready MERN stack application to help students find internships, track applications, and get AI-powered career guidance.

## ✨ Features

### 🔍 Live Job Search
- Real-time job listings via RapidAPI integration
- Advanced filtering by title, location, and employment type
- One-click application tracking

### 🤖 AI Job Analyzer
- Paste job descriptions to analyze skill match percentage
- Identify missing skills and get personalized recommendations
- Download professional PDF analysis reports

### 💬 AI Career Bot
- Personalized career advice based on your applications
- Interactive career roadmap generation
- Natural conversation for career guidance

### 📊 Application Tracker
- Centralized dashboard for all applications
- Status tracking (Applied, Interview, Offer, Rejected)
- Visual analytics with charts and insights

### 🎨 Modern UI/UX
- Dark/Light mode toggle
- Responsive design for mobile and desktop
- Smooth animations with Framer Motion
- Professional glassmorphism design

## 🛠 Tech Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS
- Framer Motion (animations)
- Chart.js (analytics)
- Lucide React (icons)
- Firebase (auth & storage)

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT authentication
- Groq AI (Llama 3.3 70B)
- RapidAPI (JSearch)

**AI Features:**
- Job description analysis
- Career advice generation
- Resume skill extraction
- Personalized roadmaps

## 📦 Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Firebase project
- API keys (Groq, RapidAPI)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Internship\ Project
```

2. **Server Setup**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Client Setup**
```bash
cd client
npm install
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔑 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_chars
GROQ_API_KEY=your_groq_api_key
RAPIDAPI_KEY=your_rapidapi_key
NODE_ENV=development
```

See `server/.env.example` for a complete template.

### Client
The client automatically detects the environment (development vs production).

## 🚀 Deployment

See [Deployment Guide](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Render:**
1. Push code to GitHub
2. Create Web Service for backend (server directory)
3. Create Static Site for frontend (client directory)
4. Add environment variables in Render dashboard
5. Done! ✅

## 📂 Project Structure

```
Internship Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth, Theme)
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
│
├── server/                 # Express backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── controllers/       # Business logic
│
└── README.md              # You are here!
```

## 🎯 Key Features Explained

### AI Job Analyzer
Analyzes job descriptions to:
- Extract required skills
- Calculate your match percentage
- Identify skill gaps
- Provide actionable recommendations
- Generate PDF reports

### Career Bot
- Context-aware conversations
- Personalized advice based on your profile
- Career roadmap generation
- Best practices and tips

### Live Job Search
- Search thousands of real job listings
- Filter by remote/hybrid/onsite
- Save jobs directly to tracker
- Auto-fill application details

## 🧪 Production Ready

✅ **Optimized & Clean**
- Removed all test files
- Cleaned up console logs
- Optimized dependencies
- Auto-environment detection

✅ **Secure**
- JWT authentication
- Environment variable protection
- Input validation
- CORS configured

✅ **Performant**
- Code splitting
- Lazy loading
- Optimized bundle size
- Fast API responses

## 📄 License

This project is for educational purposes as part of a CSE major project.

## 🤝 Contributing

This is an academic project. Feedback and suggestions are welcome!

## 🆘 Support

For deployment help, see the [Deployment Guide](./DEPLOYMENT.md).

For issues or questions, check the documentation or create an issue.

---

**Built with ❤️ by Huesh**

## 🏗 Project Structure

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

## 👨‍💻 Author
**Naveen S**
CSE Student | MERN Stack Developer | AI Enthusiast
