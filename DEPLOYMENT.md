# Deployment Guide - MERN Dropshipping Platform

## 🚀 **Production Deployment Guide**

Complete guide for deploying the dropshipping platform to production.

---

## **Quick Deploy Summary**

| Component | Recommended Platform | Alternative |
|-----------|---------------------|-------------|
| **Backend** | Railway / Render | AWS EC2, DigitalOcean |
| **Frontend** | Vercel | Netlify, AWS S3+CloudFront |
| **Database** | MongoDB Atlas | Self-hosted MongoDB |
| **Redis** | Railway Redis | Upstash, AWS ElastiCache |
| **CDN** | Cloudflare / CloudFront | Bunny CDN |

---

## 1. **Database Deployment (MongoDB Atlas)**

### Already Configured ✅

MongoDB Atlas connection string format:
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE
```

> ⚠️ **SECURITY**: Keep credentials in `.env` files only. Never commit to GitHub.

### Production Recommendations

1. **Enable IP Whitelist**
   - Add backend server IPs
   - Remove `0.0.0.0/0` (allow all)

2. **Create Indexes** (if not auto-created)
   ```bash
   mongo "mongodb+srv://cluster0.5rne0.mongodb.net/myFirstDatabase" --username dropship-core
   ```

3. **Setup Backups**
   - MongoDB Atlas → Backup → Enable
   - Frequency: Daily
   - Retention: 7 days minimum

---

## 2. **Backend Deployment**

### Option A: Railway (Recommended)

**Why Railway?**
- ✅ Free $5/month credit
- ✅ Zero config deployments
- ✅ Built-in Redis
- ✅ Automatic HTTPS

**Steps:**

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Initialize Project**
```bash
cd backend
railway init
```

4. **Add Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set JWT_SECRET="your_jwt_secret"
railway variables set JWT_REFRESH_SECRET="your_refresh_secret"
railway variables set FRONTEND_URL="https://your-frontend-url.vercel.app"
railway variables set STRIPE_SECRET_KEY="your_stripe_key"
railway variables set STRIPE_WEBHOOK_SECRET="your_webhook_secret"
# ... add all environment variables
```

5. **Deploy**
```bash
railway up
```

6. **Get Deployment URL**
```bash
railway domain
```

---

### Option B: Render

1. **Connect GitHub Repository**
   - Go to render.com
   - New → Web Service
   - Connect GitHub repo

2. **Configure Service**
   - **Name**: dropship-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

3. **Add Environment Variables** (same as Railway)

4. **Deploy**

---

### Option C: Docker + AWS EC2

**Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**Deploy to EC2**
```bash
# On EC2 instance
docker build -t dropship-backend .
docker run -d -p 5000:5000 --env-file .env dropship-backend
```

---

## 3. **Frontend Deployment**

### Vercel (Recommended)

**Why Vercel?**
- ✅ Free hobby tier
- ✅ Automatic deployments from GitHub
- ✅ Built-in CDN
- ✅ Zero config for Vite

**Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
cd frontend
vercel
```

4. **Set Environment Variables**
```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.railway.app/api
```

5. **Deploy to Production**
```bash
vercel --prod
```

**Auto-Deploy from GitHub:**
- Go to vercel.com
- Import Git Repository
- Select `dropship-core`
- Set root directory: `frontend`
- Deploy

---

### Netlify (Alternative)

1. **Login to Netlify**
2. **New Site from Git**
3. **Configure Build**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
4. **Environment Variables**
   - Add `VITE_API_URL`
5. **Deploy**

---

## 4. **Environment Configuration**

### Backend `.env` (Production)

```env
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE_NAME

# Server
PORT=5000
FRONTEND_URL=https://dropship-core.vercel.app

# JWT
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SSLCommerz (Live Mode)
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
SSLCOMMERZ_IS_LIVE=true

# Redis (if using Railway Redis)
REDIS_URL=redis://default:password@redis:6379
```

### Frontend `.env` (Production)

```env
VITE_API_URL=https://dropship-backend.railway.app/api
```

---

## 5. **CI/CD Pipeline (GitHub Actions)**

### Create Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend tests
      - name: Test Backend
        run: |
          cd backend
          npm ci
          npm test

      # Frontend tests
      - name: Test Frontend
        run: |
          cd frontend
          npm ci
          npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Add Secrets to GitHub

1. Go to repository → Settings → Secrets
2. Add:
   - `RAILWAY_TOKEN` (from `railway whoami`)
   - `VERCEL_TOKEN` (from Vercel account settings)

---

## 6. **Domain Configuration**

### Custom Domain Setup

**Backend (Railway/Render)**
1. Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-project.railway.app
   ```

**Frontend (Vercel)**
1. Project Settings → Domains
2. Add custom domain: `yourdomain.com`
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 7. **SSL/HTTPS Configuration**

**All platforms (Railway, Render, Vercel) provide automatic SSL certificates.**

If self-hosting, use Let's Encrypt:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 8. **Monitoring & Logging**

### Error Tracking (Sentry)

**Backend**
```bash
npm install @sentry/node
```

```typescript
// backend/src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

**Frontend**
```bash
npm install @sentry/react
```

```typescript
// frontend/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

---

### Logging (Winston + LogDNA)

```bash
npm install winston winston-logdna
```

```typescript
// backend/src/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Production: Add LogDNA, Datadog, etc.
  ],
});
```

---

## 9. **Performance Optimization**

### CDN for Static Assets

**Option 1: Cloudflare**
1. Add your domain to Cloudflare
2. Enable CDN caching
3. Automatic optimization

**Option 2: AWS CloudFront**
1. Create CloudFront distribution
2. Set origin to Vercel deployment
3. Configure caching rules

### Image Optimization

Use image CDN service:
- **Cloudinary** (free tier: 25GB/month)
- **imgix**
- **AWS S3 + Lambda@Edge**

---

## 10. **Security Hardening**

### Production Checklist

- [ ] Environment variables secured (not in code)
- [ ] HTTPS enabled everywhere
- [ ] CORS configured (only allow your frontend domain)
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active
- [ ] Database backups configured
- [ ] Error messages don't leak sensitive info
- [ ] Dependency vulnerabilities scanned (`npm audit`)
- [ ] MongoDB IP whitelist configured
- [ ] Payment webhooks verified with signatures

---

## 11. **Health Checks & Uptime Monitoring**

### Uptime Monitoring (UptimeRobot)

1. Sign up at uptimerobot.com
2. Add monitors:
   - **Backend**: `https://api.yourdomain.com/health`
   - **Frontend**: `https://yourdomain.com`
3. Set up alerts (email/SMS)

### Health Check Endpoint

```typescript
// Already implemented!
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
```

---

## 12. **Backup Strategy**

### MongoDB Atlas Backups
- **Automatic**: Configured in Atlas
- **Frequency**: Daily snapshots
- **Retention**: 7-30 days

### Manual Backup
```bash
mongodump --uri="mongodb+srv://..." --out=backup/
```

### Restore
```bash
mongorestore --uri="mongodb+srv://..." backup/
```

---

## 13. **Rollback Strategy**

### Frontend (Vercel)
1. Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Backend (Railway)
1. Dashboard → Deployments
2. Select previous deployment
3. Redeploy

### Database (MongoDB Atlas)
1. Backups → Point-in-time restore
2. Select timestamp
3. Restore to new cluster
4. Update connection string

---

## 14. **Cost Estimate**

### Free Tier (Hobby Project)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free | $0 |
| Railway | Hobby ($5 credit) | $0-5/month |
| Vercel | Hobby | $0 |
| **Total** | | **~$5/month** |

### Production (Small Business)

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M10 Shared | $57/month |
| Railway | Pro | $20/month |
| Vercel | Pro | $20/month |
| Cloudflare | Free | $0 |
| Sentry | Team | $26/month |
| **Total** | | **~$123/month** |

---

## 15. **Post-Deployment Checklist**

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Payment providers configured (live keys)
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Error tracking active
- [ ] Monitoring dashboards set up
- [ ] Backups configured
- [ ] Documentation updated with production URLs
- [ ] Team notified of deployment

---

## 🎉 **Deployment Complete!**

Your dropshipping platform is now live and production-ready!

**Next Steps:**
1. Monitor error logs
2. Track performance metrics
3. Gather user feedback
4. Iterate and improve

**Support Resources:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
