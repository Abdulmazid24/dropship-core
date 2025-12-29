# Testing Guide - MERN Dropshipping Platform

## 🧪 **Comprehensive Testing Strategy**

This guide covers testing approaches for the complete dropshipping platform.

---

## 1. **Backend API Testing**

### Manual Testing with Thunder Client / Postman

#### Authentication Tests

**1. Signup**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected**: 201 Created + access token + user data

**2. Login**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected**: 200 OK + access token + HTTP-only cookie

**3. Get Current User**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected**: 200 OK + user data

#### Product Tests

**1. Get All Products**
```http
GET http://localhost:5000/api/products?page=1&limit=10
```

**2. Search Products**
```http
GET http://localhost:5000/api/products?search=shirt
```

**3. Create Product (Admin Only)**
```http
POST http://localhost:5000/api/products
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Test Product",
  "description": "A test product description",
  "supplierId": "SUPPLIER_ID_HERE",
  "category": "Electronics",
  "images": ["https://via.placeholder.com/300"]
}
```

#### Cart Tests

**1. Add to Cart**
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "variantId": "VARIANT_ID_HERE",
  "qty": 2
}
```

**2. Get Cart**
```http
GET http://localhost:5000/api/cart
Authorization: Bearer YOUR_TOKEN
```

**3. Update Cart Item**
```http
PUT http://localhost:5000/api/cart/items/VARIANT_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "qty": 5
}
```

#### Order Tests

**1. Create Order**
```http
POST http://localhost:5000/api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Expected**: Order created + inventory reserved

**2. Cancel Order**
```http
PUT http://localhost:5000/api/orders/ORDER_ID/cancel
Authorization: Bearer YOUR_TOKEN
```

**Expected**: Order cancelled + inventory released

#### Payment Tests

**1. Create Payment Intent**
```http
POST http://localhost:5000/api/payment/create
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderId": "ORDER_ID_HERE",
  "currency": "USD"
}
```

**Expected**: Stripe client secret OR SSLCommerz redirect URL

---

## 2. **Automated Backend Tests (Jest)**

### Setup

```bash
cd backend
npm install --save-dev jest @types/jest supertest @types/supertest
```

### Example Test: Auth Routes

```typescript
// backend/src/modules/auth/__tests__/auth.routes.test.ts
import request from 'supertest';
import app from '../../../server';

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      // First signup
      await request(app).post('/api/auth/signup').send({
        name: 'Test',
        email: 'duplicate@example.com',
        password: 'password123'
      });

      // Try duplicate
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Test',
        email: 'duplicate@example.com',
        password: 'password123'
      });

      expect(res.status).toBe(409);
    });
  });
});
```

### Run Tests

```bash
npm test
```

---

## 3. **Frontend Testing**

### Component Testing (Vitest + React Testing Library)

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Example: ProductCard Component Test

```typescript
// frontend/src/components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ProductCard from '../ProductCard';

test('renders product information', () => {
  const product = {
    _id: '1',
    title: 'Test Product',
    description: 'Test description',
    images: ['test.jpg']
  };

  render(<ProductCard product={product} />);

  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('Test description')).toBeInTheDocument();
});
```

---

## 4. **E2E Testing (Playwright)**

### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Example: Complete Shopping Flow

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete shopping flow', async ({ page }) => {
  // 1. Visit homepage
  await page.goto('http://localhost:5173');

  // 2. Navigate to products
  await page.click('text=Products');
  await expect(page).toHaveURL(/.*products/);

  // 3. Click on product
  await page.click('.product-card:first-child');

  // 4. Select variant and add to cart
  await page.selectOption('select', { index: 1 });
  await page.click('text=Add to Cart');

  // 5. Go to cart
  await page.click('text=Cart');

  // 6. Verify item in cart
  await expect(page.locator('.cart-item')).toBeVisible();

  // 7. Checkout
  await page.click('text=Proceed to Checkout');
});
```

### Run E2E Tests

```bash
npx playwright test
```

---

## 5. **Load Testing (Artillery)**

### Setup

```bash
npm install -g artillery
```

### Load Test Configuration

```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users per second
scenarios:
  - name: "Browse products"
    flow:
      - get:
          url: "/api/products"
      - think: 3  # Wait 3 seconds
      - get:
          url: "/api/products/{{ productId }}"
```

### Run Load Test

```bash
artillery run load-test.yml
```

---

## 6. **Security Testing**

### SQL Injection Test

```http
# Should be blocked by Mongoose
GET http://localhost:5000/api/products?search=' OR 1=1--
```

### XSS Test

```http
# Should be sanitized
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "<script>alert('XSS')</script>",
  "description": "Test"
}
```

### Rate Limit Test

```bash
# Send 150 requests in 1 minute (should be rate limited after 100)
for i in {1..150}; do
  curl http://localhost:5000/api/products
done
```

---

## 7. **Database Testing**

### MongoDB Transactions Test

```typescript
// Test race condition handling
import mongoose from 'mongoose';

test('prevents overselling with concurrent orders', async () => {
  const variant = await Variant.create({
    sku: 'TEST-SKU',
    availableQty: 1,
    // ... other fields
  });

  // Try to order 2 items simultaneously when only 1 available
  const promises = [
    createOrder({ variantId: variant._id, qty: 1 }),
    createOrder({ variantId: variant._id, qty: 1 })
  ];

  const results = await Promise.allSettled(promises);

  // One should succeed, one should fail
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  expect(succeeded).toBe(1);
});
```

---

## 8. **Manual Testing Checklist**

### User Flow Tests

- [ ] **Signup Flow**
  - [ ] Valid email/password → Success
  - [ ] Duplicate email → Error
  - [ ] Weak password → Error

- [ ] **Login Flow**
  - [ ] Correct credentials → Success
  - [ ] Wrong password → Error
  - [ ] Non-existent email → Error

- [ ] **Product Browsing**
  - [ ] Products load with pagination
  - [ ] Search works correctly
  - [ ] Filters apply properly

- [ ] **Shopping Cart**
  - [ ] Add item → Cart updates
  - [ ] Update quantity → Total recalculates
  - [ ] Remove item → Cart updates
  - [ ] Cart persists on page reload

- [ ] **Checkout**
  - [ ] Create order → Inventory reserved
  - [ ] Out of stock → Error shown
  - [ ] Cancel order → Inventory released

- [ ] **Payment**
  - [ ] Stripe payment → Redirects correctly
  - [ ] SSLCommerz payment → Redirects correctly
  - [ ] Payment success → Order updated

- [ ] **Admin Dashboard**
  - [ ] Non-admin → Access denied
  - [ ] Admin → Can view dashboard
  - [ ] Update order status → Status changes

---

## 9. **Performance Testing Metrics**

### Target Benchmarks

| Endpoint | Target | Acceptable | Poor |
|----------|--------|------------|------|
| GET /products | <100ms | <300ms | >500ms |
| POST /orders | <200ms | <500ms | >1000ms |
| GET /cart | <50ms | <150ms | >300ms |
| Payment intent | <300ms | <800ms | >1500ms |

### Tools

- **Chrome DevTools** - Network tab
- **Lighthouse** - Frontend performance
- **Artillery** - Load testing
- **New Relic / Datadog** - Production monitoring

---

## 10. **Continuous Testing (CI/CD)**

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

---

## ✅ **Testing Sign-Off Checklist**

Before production deployment:

- [ ] All API endpoints tested manually
- [ ] Unit tests written for core business logic
- [ ] Integration tests for critical paths
- [ ] E2E tests for main user flows
- [ ] Load testing completed with acceptable results
- [ ] Security vulnerabilities scanned
- [ ] Performance benchmarks met
- [ ] Browser compatibility checked
- [ ] Mobile responsiveness verified
- [ ] Error handling tested (network failures, etc.)

---

**Testing is the foundation of reliable software. This guide ensures comprehensive coverage from unit to production.**
