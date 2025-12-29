# 🚀 Project Setup Guide

This guide will help you install dependencies, configure environment variables, and run the dropshipping platform locally.

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud: MongoDB Atlas)
- Git

---

## 📥 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Abdulmazid24/dropship-core.git
cd dropship-core
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and fill in your values:

```env
# Environment
NODE_ENV=development

# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/dropship
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dropship

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key

# Redis (optional in development)
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

# CORS
FRONTEND_URL=http://localhost:5173
```

> **Security Note**: Never commit your `.env` file. Generate strong, unique secrets for production.

### Frontend Environment Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB:
```bash
mongod
```

3. MongoDB will run on `mongodb://localhost:27017` by default

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add your IP to the whitelist
4. Create a database user
5. Get your connection string and update `MONGODB_URI` in `.env`

---

## 🏃 Running the Application

### Development Mode

#### Option 1: Run Both (Concurrent)
From the root directory:
```bash
npm run dev
```

This will start both backend and frontend simultaneously.

#### Option 2: Run Separately

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:5000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
App will run on `http://localhost:5173`

---

## ✅ Verify Installation

### Check Backend Health

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-30T01:00:00.000Z"
}
```

### Check Frontend

Navigate to `http://localhost:5173` in your browser.

---

## 🧪 Testing API Endpoints

### 1. User Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get Current User

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🏗️ Build for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

---

## 🐳 Docker (Optional)

Docker configuration coming soon in future phases.

---

## 🛠️ Troubleshooting

### Port Already in Use

If port 5000 or 5173 is occupied:

**Backend**: Change `PORT` in `backend/.env`
**Frontend**: Change port in `frontend/vite.config.ts`

### MongoDB Connection Failed

- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check network connectivity for Atlas

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Available Scripts

### Root Directory
- `npm run dev` - Run both backend and frontend
- `npm run build` - Build both projects

### Backend
- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Frontend
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Review rate limiting settings
- [ ] Enable Stripe/SSLCommerz live mode

---

## 📖 Next Steps

After successful setup:

1. ✅ Test authentication endpoints
2. ✅ Create admin user
3. ⏳ Wait for Phase 4-7 implementation
4. ⏳ Configure payment gateways
5. ⏳ Add sample products

---

## 🆘 Need Help?

- Check the [README.md](../README.md) for project overview
- Review [implementation_plan.md](docs/implementation_plan.md) for architecture
- Check [walkthrough.md](docs/walkthrough.md) for progress updates

---

Happy coding! 🎉
