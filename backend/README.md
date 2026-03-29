# Kobac Electronics Backend API

This directory contains the Express/Node.js backend for the Kobac Electronics E-Commerce platform.

## 🛠️ Tech Stack
- **Node.js**: JavaScript runtime environment.
- **Express**: Fast, unopinionated web framework.
- **MongoDB & Mongoose**: NoSQL database and ORM.
- **Bcrypt & JWT**: Secure password hashing and tokenized authentication.

## 🚀 Getting Started

### 1. Install Dependencies
Run the following command logically separated from the frontend to install all dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `backend/` directory referencing your database and port details:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/kobac
JWT_SECRET=add_your_secret_string_here
```

### 3. Database Seeding
To completely wipe the database and import dummy products and admin users:
```bash
npm run data:import
```
To violently remove all data without importing new lines:
```bash
npm run data:destroy
```

### 4. Running the Server Locally
To start the backend in `watch` mode using standard node parameters:
```bash
npm run dev
```

The server natively runs on `http://localhost:5000` unless overridden in your `.env`.

## 📦 API Routes Reference

### Auth & Users
- `POST /api/users/register`: Create a new Customer account (`name`, `email`, `password`)
- `POST /api/users/login`: Authenticate and receive a JWT token (`email`, `password`)
- `GET /api/users`: Fetch all profiles (Requires **Admin** privileges)
- `GET /api/users/profile`: Retrieve personal user data (Requires auth token)

### Products
- `GET /api/products`: Output a dictionary of active products.
- `GET /api/products/:id`: Read an individual product.
- `POST /api/products`: Create a boilerplate product (Requires **Admin**).
- `DELETE /api/products/:id`: Delete a specific product (Requires **Admin**).

### Orders & Payments
- `POST /api/orders`: Securely drop stock quantities and file an Order (Requires Auth).
- `POST /api/payment/evcplus`: Simulated payment gateway endpoint mimicking EVC processing callbacks.
