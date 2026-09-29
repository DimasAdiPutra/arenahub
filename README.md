# 🏟️ ArenaHub — Next-Gen Multi-Venue Booking & Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Payment](https://img.shields.io/badge/Payment-Midtrans_Snap-005696?style=flat-square)](https://midtrans.com/)
[![Storage](https://img.shields.io/badge/Storage-ImageKit_CDN-FF6B6B?style=flat-square)](https://imagekit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **A production-ready, full-stack venue reservation platform built to automate sports arena and event hall bookings. Features real-time schedule conflict prevention, automated payment lifecycle with cryptographic webhook verification, client-side media compression, and venue owner business analytics.**

---

## 📌 Executive Summary & Business Problem Solved

Managing sports venues and rental spaces through traditional channels (WhatsApp, direct messaging, spreadsheets) presents frequent operational hurdles:

- **Double Booking / Schedule Collisions:** Multiple customers attempting to book the same court/time slot simultaneously.
- **Payment Verification Friction:** Manual verification of bank transfer slips leads to fake receipts, delayed confirmations, and lost revenue.
- **Ghost Bookings & Slot Hoarding:** Reserved slots held by non-paying customers block genuine buyers from booking.
- **Operational Inefficiencies:** Venue managers spend excessive time answering schedule inquiries rather than focusing on business growth.

**ArenaHub** solves these bottlenecks with an automated, end-to-end booking infrastructure:

1. **Dynamic Availability Engine:** Customers select dates and multi-hour slots with instant collision detection and past-time blocking.
2. **Automated Midtrans Gateway:** Instant checkout via virtual accounts, e-wallets, and QRIS with automated 15-minute payment expiration windows.
3. **Automated Slot Release Cron:** Background worker periodically expires unfulfilled bookings, freeing court slots back to public circulation.
4. **Dedicated Venue Owner Suite:** Analytics dashboard tracking revenue, bookings, and hours, accompanied by an interactive monthly schedule calendar.

---

## 🎯 Instant Demo Access & Test Accounts

Test both operational perspectives directly with pre-seeded accounts:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **👑 Venue Owner** | `amelia@gmail.com` | `Amelia123` | Venue CRUD, multi-image upload, revenue analytics, booking calendar |
| **👤 Customer** | `adi@gmail.com` | `Adi12345` | Browse catalog, real-time booking, checkout via Midtrans Snap, history |

---

## 🏗️ System Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CLIENT TIER (React 19 + Vite)                     │
│  • Public Catalog & Search      • Interactive Slot Selector             │
│  • Client-Side Compression      • Owner Dashboard & Visual Calendar     │
└──────────────────┬──────────────────────────────────────▲───────────────┘
                   │ HTTPS / REST API                     │ Snap Popup
                   ▼                                      ▼
┌──────────────────────────────────────────────┐  ┌───────────────────────┐
│       APPLICATION TIER (Express 5 + Node.js) │  │  PAYMENT GATEWAY      │
│  • JWT Auth & Role Authorization (RBAC)      │  │  (Midtrans Snap API)  │
│  • Anti-Collision Booking Logic              │◄─┤                       │
│  • SHA-512 Cryptographic Webhook Handler     │  │  • Snap Token Gen     │
│  • NoSQL Injection Sanitization              │  │  • Automated Webhook  │
└──────┬──────────────────────┬────────────────┘  └───────────────────────┘
       │                      │
       ▼                      ▼
┌──────────────────┐   ┌───────────────────────────┐   ┌──────────────────┐
│  DATA STORE      │   │  BACKGROUND WORKER        │   │  MEDIA PIPELINE  │
│  MongoDB Atlas   │   │  (Node-Cron Worker)       │   │  (ImageKit CDN)  │
│  • ACID Schemas  │   │  • Auto-reap pending      │   │  • Direct Stream │
│  • Index & Rel.  │   │    orders (> 15 min)      │   │  • Auto Rollback │
└──────────────────┘   └───────────────────────────┘   └──────────────────┘
```

---

## ⚡ Engineering Highlights & Technical Deep Dive

### 1. Concurrency-Safe Booking & Anti-Collision Engine

- **Slot Collision Prevention:** Before generating invoices, the backend validates selected hour blocks against existing reservations having `pending` or `success` statuses. Conflicting requests are rejected at the database level.
- **Temporal Integrity:** Blocks retroactive bookings—dates in the past and hours already elapsed on the current day cannot be reserved.

### 2. Secure Payment Gateway & Tamper-Proof Webhook

- **Cryptographic Signature Verification:** Incoming Midtrans payment webhooks are verified against a local **SHA-512** hash of `order_id + status_code + gross_amount + ServerKey`. Fake or intercepted callbacks are rejected with HTTP 403.
- **State Machine Integration:** Automated status transitions across `pending`, `success`, `failed`, and `expired` seamlessly update court availability.

### 3. Automated Garbage Collection Worker (`node-cron`)

- Running on a 5-minute background schedule, an automated cleanup task audits pending bookings older than the 15-minute payment threshold.
- Automatically transitions abandoned bookings to `failed`, instantly releasing blocked calendar slots without manual intervention from the venue operator.

### 4. Resilient Media Pipeline with Rollback Protection

- **Client-Side Compression:** High-resolution venue photos are compressed inside a WebWorker via `browser-image-compression` prior to transmission, saving client bandwidth and accelerating upload speeds.
- **Memory Streaming & Rollback:** Multer streams files in memory directly to ImageKit CDN. If MongoDB model creation fails, uploaded images on ImageKit are automatically rolled back (deleted) to prevent orphan cloud storage waste.
- **Active Booking Protection:** Venue owners are blocked from deleting spaces that have active upcoming reservations to safeguard customer bookings.

### 5. Defensive Security & Clean Code Architecture

- **NoSQL Injection Protection:** Custom sanitization layer strips MongoDB operator manipulation (`$gt`, `$where`, etc.) from incoming payload bodies and parameters.
- **Fine-Grained RBAC:** Secure JWT implementation with custom `protect` and `authorize('owner')` middleware guards.
- **Optimistic UI:** State updates reflect immediately during administrative actions, rolling back gracefully with custom toast feedback if server calls fail.

---

## 💻 Tech Stack Breakdown

### Frontend

- **Framework:** React 19 (SPA with React Router v7)
- **Build Tool:** Vite 8 (Ultra-fast HMR and optimized asset bundling)
- **Styling:** Tailwind CSS v4 (Modern utility-first styling with native CSS variables)
- **Media Optimization:** `browser-image-compression` (WebWorker-based client image compressor)
- **UI Components & Icons:** Lucide React, Swiper Carousel, Custom Accessible Modals & Toasts
- **Date Engine:** `date-fns` v4 with Indonesian locale support

### Backend

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js 5
- **Database & ODM:** MongoDB Atlas with Mongoose 9
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Automation / Scheduler:** `node-cron` for automated stale booking cleanup
- **Security:** `express-mongo-sanitize`, input regex enforcement, SHA-512 HMAC signature verification
- **Third-Party Services:** Midtrans Snap SDK (Payment Gateway), ImageKit Node.js SDK (Cloud Media Storage)

---

## 📱 Feature Matrix

### For Sports Enthusiasts & Customers

- 🔍 **Interactive Space Discovery:** Filter arenas by dynamic categories (Futsal, Badminton, Basketball, Event Halls) and keyword search.
- 🕒 **Visual Slot Picker:** Real-time court availability matrix showing booked vs available hours from 08:00 to 22:00.
- 💳 **Integrated Seamless Payment:** Instant checkout via Midtrans Snap popup supporting QRIS, GoPay, ShopeePay, Virtual Accounts, and Credit Cards.
- 📜 **Booking History & Repay:** Track active and past reservations, with direct re-initiation for orders within the 15-minute payment window.

### For Venue Owners & Administrators

- 📊 **Executive Dashboard:** Real-time metrics on Total Bookings, Total Hours Rented, Total Revenue, and Active Venues.
- 📅 **Visual Monthly Calendar:** Date-by-date calendar view showing confirmed venue bookings and time allotments.
- 🏢 **Full Venue Lifecycle Management (CRUD):**
  - Add spaces with automatic category generation, dynamic facility tags, and multi-image uploads.
  - Edit existing venue details with image diffing (retaining unchanged photos and deleting removed ones from cloud storage).
  - Deletion lock preventing accidental removal of venues with active upcoming reservations.

---

## 🗂️ Project Structure

```text
arenahub/
├── backend/
│   ├── config/             # Database connection & ImageKit SDK setup
│   ├── controllers/        # Route controllers (Auth, Booking, Space, Category)
│   ├── middleware/         # Auth (JWT/RBAC), Error, Sanitize, Multer Upload
│   ├── models/             # Mongoose schemas (User, Space, Booking, Category)
│   ├── request/            # REST Client test files (.rest) for manual API testing
│   ├── routes/             # Express API route declarations
│   ├── utils/              # Background cron cleanup job & standardized API response helper
│   ├── server.js           # Server bootstrap and middleware orchestration
│   └── package.json
├── frontend/
│   ├── public/             # Static assets, favicons, SVG icons
│   ├── src/
│   │   ├── components/     # Reusable UI (BookingWidget, Navbar, SpaceCard, Toasts, Modals)
│   │   ├── context/        # Global AuthContext & state management
│   │   ├── hooks/          # Custom hooks (useSpaces, useDocumentTitle)
│   │   ├── layouts/        # Main Layout & Owner Protected Layout
│   │   ├── pages/          # View pages (Landing, Detail, History, Owner Dashboard, CRUD)
│   │   ├── styles/         # Global styles & Tailwind entry point
│   │   ├── utils/          # Axios instance interceptor & formatting helpers
│   │   └── App.jsx         # Client-side routing with role protection
│   ├── vercel.json         # SPA rewrite configuration for Vercel deployment
│   └── package.json
├── package.json            # Monorepo root script runner (Concurrently)
└── README.md
```

---

## 🔌 API Reference Highlights

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer or owner account |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT Bearer token |
| `GET` | `/api/spaces` | Public | Fetch all available venue listings |
| `GET` | `/api/spaces/:id` | Public | Get detailed information for a specific venue |
| `POST` | `/api/spaces` | Owner Only | Create venue with multipart images (ImageKit upload) |
| `PUT` | `/api/spaces/:id` | Owner Only | Update venue details & synchronize image state |
| `DELETE`| `/api/spaces/:id` | Owner Only | Delete venue (guarded against active bookings) |
| `GET` | `/api/bookings/check-availability` | Public | Query taken slots for a space on a given date |
| `POST` | `/api/bookings` | Authenticated | Create booking & receive Midtrans Snap transaction token |
| `GET` | `/api/bookings/my-bookings` | Customer | Retrieve customer transaction history |
| `POST` | `/api/bookings/webhook` | Midtrans | Verified SHA-512 webhook for payment status changes |
| `GET` | `/api/owner/dashboard` | Owner Only | Retrieve revenue, hours, counts, and calendar events |
| `GET` | `/api/owner/my-spaces` | Owner Only | Fetch all spaces managed by logged-in owner |

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **pnpm** (or npm / yarn)
- **MongoDB** instance (Local or MongoDB Atlas)
- **Midtrans** Sandbox Account
- **ImageKit** Account (Free tier available)

### 2. Clone Repository

```bash
git clone https://github.com/DimasAdiPutra/arenahub.git
cd arenahub
```

### 3. Environment Configuration

#### Backend Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/arenahub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here

# Midtrans Payment Gateway (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# ImageKit Cloud Storage
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

#### Frontend Configuration

Create a `.env` file inside the `frontend/` directory:

```env
VITE_BACKEND_URI=http://localhost:5000/api
```

### 4. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install backend & frontend packages
cd backend && pnpm install
cd ../frontend && pnpm install
cd ..
```

### 5. Run Concurrently in Development Mode

From the root directory:

```bash
pnpm run dev
```

- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

---

## 👨‍💻 About the Developer & Freelance Inquiries

Hi! I am **Dimas Adi Putra**, a Full-Stack Web Developer specializing in building high-performance, business-driven web applications and scalable APIs.

### 💼 Services Offered:

- Custom SaaS & Booking Engine Development
- Payment Gateway & Third-Party API Integrations (Midtrans, Stripe, Xendit)
- Database Design, Optimization & Concurrency Handling (MongoDB, PostgreSQL)
- Modern Responsive Web Applications (React, Next.js, Tailwind CSS)
- End-to-End System Architecture & Security Audits

**Have a project in mind or need a reliable developer for your team?**

- 📧 **Email:** [dimas.adiputra.dev@gmail.com](mailto:dimas.adiputra.dev@gmail.com) *(or your preferred email)*
- 💼 **GitHub:** [@DimasAdiPutra](https://github.com/DimasAdiPutra)
- 🌐 **Portfolio / LinkedIn:** Connect on [LinkedIn](https://linkedin.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
