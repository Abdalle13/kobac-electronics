# 🚀 KOBAC Electronics - Premium Tech Store

**KOBAC Electronics** is a high-end, full-stack e-commerce platform designed for selling premium electronics. Built with the **MERN** stack (MongoDB, Express, React, Node.js), it features a sleek, modern UI, cloud-based image management, and a robust admin dashboard.

---

## ✨ Key Features

### 🛒 Customer Experience
- **Premium UI/UX**: Designed with a dark, futuristic aesthetic using Tailwind CSS and Framer Motion.
- **Dynamic Shopping**: Browse products with advanced filtering and real-time search.
- **Full Checkout Flow**: Secure cart management and simulated payment processing.
- **Order Tracking**: Users can view their order history and delivery status in real-time.
- **Mobile First**: Fully responsive design optimized for smartphones and tablets.

### 🛠️ Admin Dashboard
- **Product Management**: Create, edit, and archive products with technical specifications.
- **Cloud Image Uploads**: Integrated with **ImageKit.io** for high-speed, global image delivery.
- **Order Control**: Monitor all customer transactions and mark orders as "Paid" or "Delivered".
- **User Management**: View and manage customer accounts.
- **Analytics Overview**: Quick view of total revenue, orders, and user growth.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT Authentication, Multer |
| **Database** | MongoDB Atlas (Cloud) |
| **Images** | ImageKit.io SDK |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas Account
- ImageKit.io Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdalle13/kobac-electronics.git
   cd kobac-electronics
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example and add your credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file and add VITE_API_URL
   npm run dev
   ```

### Seeding Data
To populate the database with initial products and an admin user:
```bash
cd backend
npm run data:import
```

---

## 📸 Screenshots
*(Add your live site screenshots here to show off the beautiful design!)*

---

## 📄 License
This project is for demonstration purposes. All rights reserved.

**Developed with ❤️ by Abdalle**
