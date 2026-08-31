# KOBAC Electronics

A full-stack e-commerce platform built for the Somali market: EVC Plus mobile-money
checkout, installment payment plans, local delivery with a rider app, and a full
admin dashboard. MERN stack, light/dark theme, transactional email.

**Live:** [kobac-electronics.vercel.app](https://kobac-electronics.vercel.app/) &nbsp;·&nbsp; **Repo:** [github.com/Abdalle13/kobac-electronics](https://github.com/Abdalle13/kobac-electronics)

---

## Features

### Storefront

- Product catalogue with server-side filtering (category, brand, price, rating, in stock), sorting and pagination, all reflected in the URL.
- Product pages with an image gallery, technical specs, and verified-purchase reviews and ratings.
- Favorites list tied to the user account.
- Cart drawer and a two-step checkout (address then payment) with Somali city and district dropdowns.
- **EVC Plus** (simulated mobile-money gateway with PIN confirmation) and **Cash on Delivery**.
- **Installment plans ("qaybo")**: split an EVC Plus order over 2 to 4 monthly payments, pay each one from the order page.
- Live delivery tracking: the order page shows the courier's progress from Picked Up to Delivered and refreshes on its own.
- Light and dark theme with a toggle, remembered per browser.
- Forgot / reset password by email; sessions expire and sign the user out cleanly.

### Admin dashboard (`/dashboard`)

- **Overview**: revenue, orders, users, catalogue size, a sales chart and week-over-week trends.
- **Products**: create, edit and delete with image upload; cost price and margin per product, plus a category breakdown.
- **Orders**: filter by status, mark paid / delivered / cancelled, assign a delivery rider, record installment cash payments.
- **Reviews**: moderate every product review and see the most-reviewed products.
- **Users**: activate / deactivate accounts, change roles, add delivery riders.
- **Payments**: paid sales split by method, cost of goods, and gross profit with margin.
- **Report**: a one-click branded PDF sales report.
- **Settings**: store name, support contact, free-shipping threshold and home banners; changes reach the storefront live.

### Rider app (`/rider`)

- A rider signs in and sees only the orders assigned to them, with the delivery address and payment state.
- One tap moves a job through Picked Up, On the Way and Delivered; the customer sees it update live.
- New jobs appear automatically without a refresh.

### Backend

- JWT auth, bcrypt hashing, `helmet`, a CORS allow-list, and rate-limited auth endpoints.
- Role-based access: Customer, Rider and Admin, enforced on every route.
- Order prices are recomputed server-side from the database; the client cannot set them.
- Atomic stock reservation so concurrent orders cannot oversell.
- Delivery status can only move forward, and only the assigned rider or an admin can change it.
- Transactional email (welcome, order confirmation, payment received, delivered, password reset) via SMTP.

---

## Tech stack

| Layer      | Tools                                                                                 |
| :--------- | :------------------------------------------------------------------------------------ |
| Frontend   | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS v4, Framer Motion, Recharts |
| Backend    | Node.js, Express 5, Mongoose 9, JSON Web Tokens, Nodemailer, Multer, Helmet           |
| Database   | MongoDB Atlas                                                                         |
| Images     | ImageKit.io                                                                           |
| PDF        | jsPDF + jspdf-autotable (lazy-loaded)                                                 |
| Deployment | Vercel (frontend + backend serverless)                                                |

---

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)
- An ImageKit account (for product image uploads)
- An SMTP account for email (a Gmail app password works)

### 1. Clone and install

```bash
git clone https://github.com/Abdalle13/kobac-electronics.git
cd kobac-electronics

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

Create `backend/.env` from `backend/.env.example`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
FRONTEND_URL=http://localhost:5173

IMAGEKIT_URL_ENDPOINT=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Kobac Electronics <you@gmail.com>

EVC_DEMO_PIN=1234
```

Mail sent from a personal Gmail account can land in the recipient's spam or
promotions folder. The forgot-password screen tells users to check there.

### 3. Run

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Frontend on `http://localhost:5173`, API proxied to `http://localhost:5000`.

### 4. Seed sample data

```bash
cd backend
npm run data:import
```

This loads a sample catalogue and two demo accounts:

| Role     | Email               | Password      |
| :------- | :------------------ | :------------ |
| Admin    | `admin@gmail.com`   | `password123` |
| Customer | `customer@test.com` | `password123` |

`data:import` and `data:destroy` replace the whole database; they will not run over
real order data unless you add `--force`.

For a fuller demo, `scripts/seedDemo.js` **adds** (never deletes) a wider catalogue,
15 Somali customers, ~30 orders across every status and payment method, product
reviews, delivery riders, and cost prices for the profit report:

```bash
cd backend
node scripts/seedDemo.js                  # products, customers, orders
node scripts/seedDemo.js --reviews        # reviews from those customers
node scripts/seedDemo.js --riders         # riders + assign them to open orders
node scripts/seedDemo.js --backfill-costs # cost price everywhere for the profit report
node scripts/seedDemo.js --check          # just print current counts
```

The seeded riders sign in with `rider.cabdi@gmail.com` / `password123` (and
`rider.maxamed@`, `rider.xasan@`).

---

## Payment and delivery, simulated

The EVC Plus gateway is simulated: at checkout a valid Somali mobile number and the
demo PIN (`1234`) always succeed; any other PIN is rejected. No real money moves.
A production build would integrate the Hormuud WAAFI merchant API.

Installment plans, delivery assignment and rider status updates are all real
application logic against the database; only the payment authorization is faked.

---

## Deployment

Frontend and backend both deploy to Vercel. Set the same environment variables on the
backend project. `FRONTEND_URL` may be blank; CORS also allows localhost and any
`*.vercel.app` origin.

---

Built by [Abdalle Hussein](https://github.com/Abdalle13).
