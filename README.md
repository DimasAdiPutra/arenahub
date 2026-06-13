# ArenaHub 🏟️

ArenaHub is a comprehensive sports venue booking web application designed to streamline the reservation process for both court operators and sports enthusiasts. Built using the MERN stack with a decoupled architecture, this project features real-time schedule validation and seamless payment gateway integration.

---

## 🚀 Tech Stack

### Frontend

- **Core:** React.js (Vite)
- **Language:** JavaScript (ES6+)
- **Routing:** React Router v7 (SPA Traditional Component Style)
- **Styling:** Tailwind CSS

### Backend

- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose ODM)
- **Payment Gateway:** Midtrans (Sandbox)

---

## 📁 Project Structure

This repository uses a traditional Monorepo structure containing both the backend and frontend codebases:

```text
arenahub/
├── backend/          # Express.js API Server
│   ├── config/       # Database & Third-party configurations
│   ├── controllers/  # Route handler logic
│   ├── models/       # Mongoose Schemas
│   ├── routes/       # API Endpoint definitions
│   └── server.js     # Entry point for backend
├── frontend/         # React.js Client (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx   # Client-side Routing Setup
│   └── package.json
├── .gitignore        # Root gitignore protecting env and node_modules
└── README.md
```
