# MERN Stack Dropshipping eCommerce Platform

A scalable, supplier-driven dropshipping eCommerce platform built with the MERN stack and TypeScript.

## 🚀 Features

- **Headless Architecture**: Decoupled frontend and backend
- **Supplier-Driven Inventory**: Real-time inventory sync with suppliers
- **SKU/Variant-Based Products**: Support for multiple product variants
- **Multi-Payment Gateway**: Stripe (International) + SSLCommerz (Bangladesh)
- **Role-Based Access Control**: User and Admin roles
- **Order Management**: Complete order lifecycle tracking
- **Admin Dashboard**: Comprehensive management interface

## 🛠 Tech Stack

### Frontend
- **Vite** + **React** + **TypeScript**
- **TailwindCSS** + **DaisyUI** for styling
- **Zustand** for UI state management
- **TanStack Query** for server state
- **React Router** for navigation

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** with Mongoose
- **Redis** for caching
- **JWT** authentication
- **Zod** for validation

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Vercel** (frontend deployment)
- **Railway/Render** (backend deployment)

## 📁 Project Structure

```
dropship-core/
├── backend/          # Express + TypeScript backend
├── frontend/         # Vite + React frontend
├── .github/          # CI/CD workflows
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional for development)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Abdulmazid24/dropship-core.git
cd dropship-core
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- [Implementation Plan](docs/implementation_plan.md)
- [API Documentation](docs/api.md) _(coming soon)_
- [Database Schema](docs/database.md) _(coming soon)_

## 🔐 Environment Variables

### Backend
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dropship
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_password
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

Automated deployment via GitHub Actions on push to `main` branch.

## 📖 API Documentation

API documentation will be available at `/api/docs` when running in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Abdulmazid24** - [GitHub](https://github.com/Abdulmazid24)

## 🙏 Acknowledgments

- Built with guidance from comprehensive dropshipping platform requirements
- Inspired by modern eCommerce best practices
