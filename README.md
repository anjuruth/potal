# PlaceCell — Placement Cell Management Portal

A full-stack placement management system built with Next.js, Express, and MySQL.

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0
- **Auth:** JWT, Google OAuth 2.0

---

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL 8.0](https://dev.mysql.com/downloads/mysql/)
- Git

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/anjuruth/potal.git
cd potal
```

---

### 2. Set Up the Database

1. Open MySQL and create a new database:

```sql
CREATE DATABASE placement_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import the schema:

```bash
mysql -u root -p placement_portal < placement_fixed.sql
```

> If you don't have the SQL file, the tables are defined in `backend/routes/` and you can refer to the schema section below.

---

### 3. Set Up the Backend

```bash
cd backend
npm install
```

Copy the example environment file and fill in your details:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal

JWT_SECRET=any_long_random_string_here

SESSION_SECRET=another_long_random_string

# Optional - only needed for Google login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional - only needed for email verification
GMAIL_USER=
GMAIL_PASS=
```

Start the backend server:

```bash
node server.js
```

Backend runs at **http://localhost:5000**

---

### 4. Set Up the Frontend

Open a new terminal:

```bash
cd my-project
npm install
```

Create the environment file:

```bash
cp .env.local.example .env.local
```

Or create `my-project/.env.local` manually:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Running the App

You need **two terminals** running at the same time:

| Terminal | Command | URL |
|----------|---------|-----|
| Backend  | `cd backend && node server.js` | http://localhost:5000 |
| Frontend | `cd my-project && npm run dev` | http://localhost:3000 |

Open **http://localhost:3000** in your browser.

---

## First Time Login

1. Go to **http://localhost:3000/auth/register**
2. Fill in your details and register
3. If Gmail is not configured, activate your account manually in MySQL:

```sql
USE placement_portal;
UPDATE Users SET status='active' WHERE email='your@email.com';
```

4. Go to **http://localhost:3000/auth/login** and sign in

---

## Project Structure

```
potal/
├── backend/                  # Express API server
│   ├── config/
│   │   ├── db.js             # MySQL connection pool
│   │   ├── email.js          # Nodemailer (Gmail SMTP)
│   │   └── passport.js       # Google OAuth strategy
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── upload.js         # Multer file uploads
│   ├── routes/
│   │   ├── auth.js           # Register, login, OAuth
│   │   ├── student.js        # Student APIs
│   │   ├── colleges.js       # College & department APIs
│   │   └── skills.js         # Skill category APIs
│   ├── .env.example          # Environment template
│   └── server.js             # Entry point
│
└── my-project/               # Next.js frontend
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── auth/             # Login, Register, OAuth pages
    │   └── student/          # Student dashboard & modules
    ├── lib/
    │   ├── api.ts            # Axios API client
    │   └── auth.ts           # Auth utilities
    └── style/
        └── globals.css       # Global styles
```

---

## Features

- Student registration and login (email + Google OAuth)
- Email verification flow
- Student dashboard with stats
- Browse and apply to placement drives
- Online exam with countdown timer and auto-submit
- Skills portfolio with certificate upload
- Offline placement submission
- Notifications system
- Role-based access (Student, Faculty Advisor, Placement Officer, Higher Authority)
