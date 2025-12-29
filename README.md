# 🚀 Dropship Core - Enterprise MERN Dropshipping Platform

> **Production-ready, scalable dropshipping eCommerce platform built with MERN stack, TypeScript, and modern best practices.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)

---

## 📋 **Table of Contents**

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ **Features**

### **Customer Features**
- 🛍️ Product browsing with search & filters
- 🎨 Variant selection (size, color, etc.)
- 🛒 Shopping cart with persistent state
- 💳 Multi-gateway payment (Stripe + SSLCommerz)
- 📦 Order tracking
- 👤 User authentication & profile

### **Admin Features**
- 📊 Analytics dashboard
- 📦 Product & inventory management
- 🔄 Order lifecycle management
- 🏪 Supplier management
- 💰 Profit tracking
- ⚙️ System configuration

### **Technical Features**
- ⚡ **Scalable Architecture** - Modular monolith → Microservices ready
- 🔒 **Enterprise Security** - JWT + HTTP-only cookies, Helmet.js, rate limiting
- 💾 **Atomic Transactions** - MongoDB transactions prevent race conditions
- 🎯 **Payment Abstraction** - Unlimited payment providers via Factory pattern
- 📈 **Performance Optimized** - Indexed database, TanStack Query caching
- 🐳 **Docker Ready** - Complete containerization
- 🔄 **CI/CD Pipeline** - GitHub Actions workflow
- 📚 **Comprehensive Docs** - Setup, testing, deployment guides

---

## 🛠️ **Tech Stack**

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Atlas)
- **ODM**: Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Payments**: Stripe, SSLCommerz
- **Security**: Helmet.js, express-rate-limit

### **Frontend**
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query)
- **Styling**: TailwindCSS + DaisyUI
- **HTTP Client**: Axios

### **DevOps**
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Railway (backend), Vercel (frontend)
- **Monitoring**: Sentry (ready to configure)
- **Caching**: Redis-ready architecture

---

## 🏗️ **Architecture**

```
┌─────────────────┐         ┌──────────────────┐
│   React SPA     │────────▶│   Express API    │
│   (Vercel)      │  HTTPS  │   (Railway)      │
└─────────────────┘         └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
              │  MongoDB  │   │   Redis   │   │  Payment  │
              │  (Atlas)  │   │  (Cache)  │   │ Gateways  │
              └───────────┘   └───────────┘   └───────────┘
```

### **Scalability Highlights**
- **100-1,000** concurrent users (single server)
- **1,000-10,000** users (with Redis)
- **10,000-100,000** users (with load balancer)
- **100,000+** users (microservices architecture)

[📖 Read full scalability guide](SCALABILITY.md)

---

## ⚡ **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payments)
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/Abdulmazid24/dropship-core.git
cd dropship-core
```

### **2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

**Backend runs on**: `http://localhost:5000`

### **3. Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

### **4. Test the System**
1. Open `http://localhost:5173`
2. Create an account (signup)
3. Browse products
4. Add to cart
5. Create order

[📖 Detailed setup guide](SETUP.md)

---

## 📚 **Documentation**

### **Setup & Configuration**
- [SETUP.md](SETUP.md) - Complete installation guide
- [.env.example](backend/.env.example) - Environment variables reference

### **Architecture & Development**
- [SCALABILITY.md](SCALABILITY.md) - Scalability architecture & patterns
- [API Documentation](docs/API.md) - REST API endpoints (coming soon)

### **Testing & Quality**
- [TESTING.md](TESTING.md) - Testing strategies & guides
- [Manual Test Cases](TESTING.md#manual-testing-checklist)

### **Deployment**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [Docker Deployment](#docker-deployment)
- [CI/CD Guide](#cicd-pipeline)

---

## 🐳 **Docker Deployment**

### **Local Development**
```bash
docker-compose up
```

Services:
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **Backend**: `localhost:5000`
- **Frontend**: `localhost:3000`

### **Production Build**
```bash
# Backend
cd backend
docker build -t dropship-backend .
docker run -p 5000:5000 --env-file .env dropship-backend

# Frontend
cd frontend
docker build -t dropship-frontend .
docker run -p 80:80 dropship-frontend
```

---

## 🚀 **Deployment**

### **Recommended Stack**
- **Backend**: [Railway](https://railway.app) / [Render](https://render.com)
- **Frontend**: [Vercel](https://vercel.com)
- **Database**: MongoDB Atlas (already configured)

### **One-Click Deploy**

**Backend to Railway:**
```bash
npm install -g @railway/cli
cd backend
railway init
railway up
```

**Frontend to Vercel:**
```bash
npm install -g vercel
cd frontend
vercel
```

[📖 Complete deployment guide](DEPLOYMENT.md)

---

## 🧪 **Testing**

### **Run Backend Tests**
```bash
cd backend
npm test
```

### **Run Frontend Tests**
```bash
cd frontend
npm test
```

### **E2E Tests**
```bash
npm run test:e2e
```

[📖 Testing guide](TESTING.md)

---

## 📊 **Project Status**

### **Completed Features** ✅
- [x] Authentication & Authorization
- [x] Product & Variant Management
- [x] Shopping Cart
- [x] Order Management (with transactions)
- [x] Payment Integration (Stripe + SSLCommerz)
- [x] Admin Dashboard
- [x] Comprehensive Documentation
- [x] Docker & CI/CD Setup

### **Backend API Endpoints**: 40+
### **Frontend Pages**: 10+
### **Total Commits**: 15+ professional semantic commits

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Abdul Mazid**
- GitHub: [@Abdulmazid24](https://github.com/Abdulmazid24)

---

## 🙏 **Acknowledgments**

- MongoDB Atlas for database hosting
- Stripe & SSLCommerz for payment processing
- Vercel & Railway for deployment platforms
- Open source community for amazing tools

---

## 📞 **Support**

For questions and support:
- 📧 Email: contact@example.com
- 💬 Issues: [GitHub Issues](https://github.com/Abdulmazid24/dropship-core/issues)
- 📖 Docs: [Documentation](docs/)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Built with ❤️ using MERN Stack

</div>
