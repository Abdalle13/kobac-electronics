# KOBAC Electronics

A full-stack e-commerce store for premium electronics, built for the Somali market
with EVC Plus mobile-money checkout and local delivery. MERN stack, with a light/dark
theme, product reviews, a wishlist, transactional email, and a full admin dashboard.

**Live:** [kobac-electronics.vercel.app](https://kobac-electronics.vercel.app/) &nbsp;·&nbsp; **Repo:** [github.com/Abdalle13/kobac-electronics](https://github.com/Abdalle13/kobac-electronics)

---

## Features

### Storefront

- Product catalogue with server-side **filtering** (category, brand, price, rating, in-stock), **sorting** and **pagination** — all reflected in the URL.
- Product pages with an image gallery, specs, and **verified-purchase reviews & ratings**.
- **Wishlist** tied to the user account.
- Cart drawer and a two-step **checkout** (address → payment).
- **EVC Plus** (simulated mobile-money gateway with PIN confirmation) and **Cash on Delivery**.
- Order history and a delivery-progress timeline.
- **Light / dark theme** with a toggle, remembered per browser.
- Forgot / reset password by email.
- Responsive down to small phones.

### Admin dashboard (`/dashboard`)

- **Overview** — revenue, orders, users, catalogue size, and a 7-day sales chart.
- **Products** — create, edit and delete, with image upload.
- **Orders** — mark paid / delivered / cancelled, view full order details.
- **Users** — activate / deactivate accounts.
- **Payments** — paid sales split by method, plus a daily history.
- **Settings** — store name, support contact, free-shipping threshold and home banners. Changes propagate to the storefront live.

### Backend

- JWT auth, bcrypt password hashing, `helmet`, CORS allow-list, and rate-limited auth endpoints.
- Order prices are **recomputed server-side** from the database — the client can't set them.
- **Atomic stock reservation** so concurrent orders can't oversell.
- Transactional email (welcome, order confirmation, payment received, delivered, password reset) via SMTP.

---

## Tech stack

| Layer      | Tools                                                                                 |
| :--------- | :------------------------------------------------------------------------------------ |
| Frontend   | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS v4, Framer Motion, Recharts |
| Backend    | Node.js, Express 5, Mongoose 9, JSON Web Tokens, Nodemailer, Multer, Helmet           |
| Database   | MongoDB Atlas                                                                         |
| Images     | ImageKit.io                                                                           |
| Deployment | Vercel (frontend + backend serverless)                                                |

---

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)
- An ImageKit account (for product image uploads)
- An SMTP account for email (a Gmail app password works)

### 1. Clone & install

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
reviews from customers who ordered, and delivery riders:

```bash
cd backend
node scripts/seedDemo.js                  # products, customers, orders
node scripts/seedDemo.js --reviews        # reviews from those customers
node scripts/seedDemo.js --riders         # riders + assign them to open orders
node scripts/seedDemo.js --backfill-costs # cost price everywhere for the profit report
node scripts/seedDemo.js --check          # just print current counts
```

---

## EVC Plus demo checkout

The payment gateway is simulated. At checkout, a valid Somali mobile number and the
demo PIN (`1234`) always succeed; any other PIN is rejected. No real money moves.

---

## Deployment

Frontend and backend both deploy to Vercel. Set the same environment variables on the
backend project, and set `FRONTEND_URL` to your deployed frontend origin so CORS is
locked down.

---

Built by [Abdalle Hussein](https://github.com/Abdalle13).
