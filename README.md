# Orbit Ecommerce

A full-featured e-commerce platform with a modern React frontend and Express.js backend.
Supports user authentication, product management, shopping cart, coupon system, order processing, and admin dashboard with analytics.

## Features

### User Features

- Email/password authentication with JWT tokens
- Google OAuth login
- Product browsing with categories
- Search functionality
- Shopping cart management
- Coupon/discount codes
- Order placement via Razorpay
- User profile with address management

### Admin Features

- Admin dashboard (/secret-dashboard)
- Product management (create, update, delete)
- User management
- Order management with status tracking
- Analytics dashboard with charts
- Coupon creation per user

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Zustand (state management)
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- React Hot Toast
- Axios

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- Redis (token storage)
- JWT authentication
- Razorpay payment integration
- Cloudinary image storage
- Google OAuth

## Project Structure

orbit-ecommerce/
├── backend/
│ ├── controllers/ # Route handlers
│ ├── middleware/ # Auth & rate limiting
│ ├── models/ # Mongoose models
│ ├── routes/ # API routes
│ ├── lib/ # Utilities (DB, Redis, Cloudinary)
│ └── server.js # Express server
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── pages/ # Page components
│ │ ├── stores/ # Zustand stores
│ │ ├── lib/ # Utilities
│ │ └── App.jsx # Main app
│ └── public/ # Static assets
└── README.md

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Cloudinary account
- Razorpay account
- Google OAuth credentials

## Installation

1. Clone the repository
2. Install root dependencies:
   npm install

3. Install frontend dependencies:
   cd frontend
   npm install

## Environment Variables

Create .env file in root directory:

# Server

PORT=5000
NODE_ENV=development

# MongoDB

MONGO_URI=your_mongodb_uri

# Redis

REDIS_URL=your_redis_url

# JWT

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google OAuth

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

## Running the Application

### Development Mode

Start backend (from root):
npm run dev

Start frontend (separate terminal):
cd frontend
npm run dev

### Production Build

Build both frontend and backend:
npm run build

Start production server:
npm start

## API Endpoints

### Authentication

- POST /auth/signup - Register new user
- POST /auth/login - Login user
- POST /auth/logout - Logout user
- POST /auth/refresh - Refresh access token
- POST /auth/google - Google OAuth
- GET /auth/profile - Get current user

### Products

- GET /products - List products
- GET /products/:id - Get product details
- POST /products - Create product (admin)
- PUT /products/:id - Update product (admin)
- DELETE /products/:id - Delete product (admin)

### Cart

- GET /cart - Get user cart
- POST /cart - Add item to cart
- PUT /cart - Update cart item
- DELETE /cart/:productId - Remove item

### Orders

- GET /orders - Get user orders
- GET /orders/:id - Get order details
- POST /orders - Create order

### Coupons

- GET /coupon - Get user coupon
- POST /coupon - Create coupon (admin)

### Payments

- POST /payments/create - Create Razorpay order
- POST /payments/verify - Verify payment

### Analytics

- GET /analytics/stats - Get dashboard stats (admin)

## User Roles

- customer - Regular user
- admin - Can manage products, orders, users
- superadmin - Full access

## Deployment

The app is configured for deployment on Render:

- Backend: Express server serves API and static frontend
- Database: MongoDB Atlas
- Cache: Redis cloud instance
