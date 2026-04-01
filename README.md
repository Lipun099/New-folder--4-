# Nush Café ☕ — Smart Ordering System

A complete mobile-first smart café ordering system with real-time order tracking, admin dashboard, QR scanning, and PDF billing.

---

## 📁 Project Structure

```
nush-cafe/
├── backend/        # Node.js + Express + MongoDB + Socket.io
└── frontend/       # React + Vite + Tailwind CSS
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1️⃣ Setup Backend

```bash
cd backend
npm install
```

Copy `.env` or update the values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nush-cafe
ADMIN_PIN=9999
CLIENT_URL=http://localhost:5173
```

**Seed the menu:**
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev         # development (nodemon)
# or
npm start          # production
```

Backend runs at: `http://localhost:5000`

---

### 2️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 URLs

| Page | URL |
|------|-----|
| Customer Menu | http://localhost:5173/ |
| Cart | http://localhost:5173/cart |
| Checkout | http://localhost:5173/checkout |
| Order Status | http://localhost:5173/order/:id |
| Admin Login | http://localhost:5173/admin/login |
| Admin Dashboard | http://localhost:5173/admin/dashboard |
| Admin Orders | http://localhost:5173/admin/orders |
| Admin Menu | http://localhost:5173/admin/menu |
| Admin Scanner | http://localhost:5173/admin/scanner |

---

## 🔑 Admin Login

Default PIN: **`9999`**

Change it in `backend/.env`:
```
ADMIN_PIN=1234
```

---

## 📡 API Reference

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| POST | `/api/menu` | Add new item |
| PUT | `/api/menu/:id` | Update item |
| DELETE | `/api/menu/:id` | Delete item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order` | Place order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/order/:id` | Get single order |
| PATCH | `/api/order/:id` | Update order status |
| GET | `/api/stats` | Dashboard statistics |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/verify` | Verify admin PIN |

---

## 🔔 Real-time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `new_order` | Server → Admin | New order placed |
| `order_updated` | Server → Customer + Admin | Status changed |
| `join_order_room` | Client → Server | Customer joins order room |
| `join_admin_room` | Client → Server | Admin joins admin room |

---

## ☁️ MongoDB Atlas Setup (Cloud)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free account
2. Create a free cluster → Connect → Get connection string
3. Replace in `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nush-cafe
   ```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#FFD54F` (Yellow) |
| Accent | `#FF8C42` (Orange) |
| Background | `#FFF8E1` (Cream) |
| Text Dark | `#2D1B00` |
| Font | Inter |

---

## 📱 Customer Flow

1. Open the website (or scan QR)
2. Browse menu → Add items to cart
3. Go to cart → Checkout
4. Enter name + table number → Place order
5. Receive token number + QR code
6. Track order status live
7. Download PDF invoice or share on WhatsApp

---

## 🧑‍💻 Admin Flow

1. Go to `/admin/login` → Enter PIN (9999)
2. Dashboard shows today's stats + live orders
3. Orders tab → View all orders, tap to expand, update status
4. Menu tab → Add/edit/delete/toggle menu items
5. Scanner → Scan customer QR → Mark completed

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Routing | React Router v6 |
| Real-time | Socket.io |
| QR Generate | qrcode.react |
| QR Scan | html5-qrcode |
| PDF | html2pdf.js |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| HTTP client | Axios |

---

Made with ❤️ for **Nush Café** ☕
