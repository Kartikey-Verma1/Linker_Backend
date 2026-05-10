# Linker Backend

This repository contains the backend/server-side application for Linker. It handles authentication, profile management, connection requests, user feeds, and API services for the platform.

---

## ✨ Features

### 🔐 Authentication & Security
- User Signup
- User Login
- User Logout
- JWT-based Authentication
- Password hashing using bcrypt
- Protected API routes
- Input validation using validator
- Cookie-based authentication

### 👤 Profile Management
- View profile
- Edit profile
- Change password
- Delete account
- View other user profiles

### 🤝 Connection System
- Send connection requests
- Ignore profiles
- Accept requests
- Reject requests
- Withdraw sent requests
- View pending requests
- View sent requests
- View user connections

### 📰 Feed System
- Personalized user feed
- Feed pagination/rate limiting for optimized loading

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT
- bcrypt
- validator
- Cookies

---

## 🔑 Authentication Method

The backend uses JWT (JSON Web Token) authentication with HTTP cookies for maintaining user sessions securely.

---

## 📦 Installation

Clone the repository:

```bash
git clone <your-backend-repository-url>
```

Move into the project directory:

```bash
cd linker-backend
```

Install dependencies:

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add:

```env
DATABASE_URL=
PORT=
JWT_SECRET=
```

---

## ▶️ Run Locally

Start the server:

```bash
npm run start
```

For development using nodemon:

```bash
npm run dev
```

---

## 📡 API Endpoints

### Authentication Routes

```http
POST /authProfile/signup
POST /authProfile/login
POST /authProfile/logout
```

### Connection Request Routes

```http
POST /connectionRequest/send/:status/:receiverId
POST /connectionRequest/review/:status/:userId
POST /connectionRequest/withdraw/interaction/:id
```

### Profile Routes

```http
GET    /profile/view
PATCH  /profile/edit
PATCH  /profile/changePassword
DELETE /profile/deleteAccount
```

### User Routes

```http
GET /user/requests/pending
GET /user/requests/sent
GET /user/connections
GET /user/feed
GET /user/profile/view/:id
```

---

## 🚀 Deployment

Backend APIs are deployed along with the frontend application.

---

## 👨‍💻 Author

Kartikey Verma