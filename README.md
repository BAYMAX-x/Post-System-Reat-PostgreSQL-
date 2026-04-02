# 🛒 Lanka Fresh POS System — Client Deployment Guide

> **System:** Node.js + Fastify + PostgreSQL + React  
> **Version:** 4.2.0-stable  
> **Platform:** Windows 10/11

---

## 📋 Prerequisites — What to Install on the Client PC

### Step 1 — Install Node.js (LTS)
1. Go to **https://nodejs.org**
2. Download the **LTS version** (e.g., v20.x)
3. Run the installer → keep all defaults → click **Next** until finish
4. Open Command Prompt and verify:
   ```
   node -v
   npm -v
   ```

### Step 2 — Install PostgreSQL
1. Go to **https://www.postgresql.org/download/windows/**
2. Download the installer (v16 recommended)
3. Run the installer:
   - Set a **password** for the `postgres` user — **write this down!**
   - Port: `5432` (default)
   - Keep all defaults and finish
4. PostgreSQL will start automatically as a Windows service

### Step 3 — Copy the POS System Files
Copy the entire `POS-System` folder to the client PC (e.g., `C:\LankaFreshPOS\`)

---

## 🗄️ Database Setup (One-Time)

Open **Command Prompt** as Administrator.

### 1. Create the database
```cmd
psql -U postgres
```
Enter the PostgreSQL password you set during install, then run:
```sql
CREATE DATABASE lankafresh_pos;
\q
```

### 2. Configure the backend environment
```cmd
cd C:\LankaFreshPOS\POS-System\backend
copy .env.example .env
notepad .env
```

Edit `.env` and set your password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lankafresh_pos"
STORE_NAME="Your Store Name"
STORE_ADDRESS="Your Store Address"
STORE_TEL="+94 XX XXXXXXX"
STORE_VAT_REG="YOUR-VAT-NUMBER"
```

### 3. Install backend dependencies
```cmd
cd C:\LankaFreshPOS\POS-System\backend
npm install
```

### 4. Run database migrations (creates all tables)
```cmd
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client
```cmd
npx prisma generate
```

### 6. Seed the database with initial products & settings
```cmd
node prisma/seed.js
```

---

## 🚀 Running the POS System

### Start the Backend Server
```cmd
cd C:\LankaFreshPOS\POS-System\backend
npm start
```
> ✅ You should see: `Lanka Fresh POS Backend running at http://localhost:3001`

### Start the Frontend (in a new Command Prompt window)e
```cmd
cd C:\LankaFreshPOS\POS-System
npm install
npm run dev
```
> ✅ Open browser to: **http://localhost:5173**

---

## 🪟 Auto-Start on Windows Boot (Recommended for Client)

Create two `.bat` files on the Desktop:

**`start-pos.bat`** (double-click to launch everything):
```bat
@echo off
echo Starting Lanka Fresh POS...
start "POS Backend" cmd /k "cd /d C:\LankaFreshPOS\POS-System\backend && npm start"
timeout /t 3
start "POS Frontend" cmd /k "cd /d C:\LankaFreshPOS\POS-System && npm run dev"
timeout /t 3
start chrome http://localhost:5173
```

To add to Windows Startup:
1. Press `Win + R` → type `shell:startup` → press Enter
2. Copy the `start-pos.bat` shortcut into that folder

---

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/lankafresh_pos` |
| `PORT` | Backend server port | `3001` |
| `HOST` | Backend host | `0.0.0.0` |
| `STORE_NAME` | Appears on receipts | `Lanka Fresh Market` |
| `STORE_ADDRESS` | Appears on receipts | `No. 45, Galle Road, Colombo 03` |
| `STORE_TEL` | Appears on receipts | `+94 11 2345 678` |
| `STORE_VAT_REG` | VAT registration number | `123456789-7000` |

---

## 📁 Project Folder Structure

```
POS-System/
├── src/                    ← React Frontend
│   ├── context/POSContext.jsx
│   ├── lib/api.js          ← API calls to backend
│   └── pages/
│       ├── Billing/        ← POS Terminal + Receipt
│       ├── Inventory/      ← Product Management
│       ├── Customers/      ← Customer Management  
│       ├── Dashboard/      ← Live Stats
│       └── Reports/        ← Charts
│
└── backend/                ← Node.js + Fastify Backend
    ├── src/
    │   ├── server.js       ← Entry point
    │   └── routes/
    │       ├── products.js
    │       ├── customers.js
    │       ├── transactions.js
    │       ├── dashboard.js
    │       └── settings.js
    └── prisma/
        ├── schema.prisma   ← Database schema (tables)
        └── seed.js         ← Default data
```

---

## 🛠️ Useful Commands

```cmd
# View all database tables in browser
cd backend && npx prisma studio

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Add new migration after schema change
npx prisma migrate dev --name describe_change

# Check backend logs
cd backend && npm start
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Add new product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/stock` | Adjust stock |
| GET | `/api/customers` | List all customers |
| POST | `/api/transactions` | Record a sale |
| GET | `/api/dashboard/today` | Today's stats |
| GET/PUT | `/api/settings` | Store settings |
| GET | `/health` | Backend health check |

---

## ❗ Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to database` | Check PostgreSQL service is running in Windows Services. Verify password in `.env` |
| `Port 3001 already in use` | Change `PORT=3002` in `.env` and restart |
| `Prisma Client not found` | Run `cd backend && npm run db:generate` |
| `Product not found for barcode` | Use Inventory page to add the product with the correct barcode |
| Frontend shows blank page | Make sure backend is running first on port 3001 |

---

## 📞 Support
Contact your system administrator or the development team for technical assistance.

> 🏷️ **Lanka Fresh POS System v4.2.0-stable** — Built with React, Fastify, Prisma & PostgreSQL
