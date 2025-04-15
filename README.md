# Full-Stack Authentication System (Next.js + Node.js + MongoDB)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
## About This Project

This repository contains a full-stack authentication system built with a Next.js frontend and a Node.js (Express) backend, utilizing MongoDB as the database. It implements essential, production-ready authentication features often glossed over in simpler tutorials.

**Purpose:** The primary goal is to provide a secure, robust, and reusable authentication foundation for web applications. This project goes beyond basic signup/login by including crucial steps like email verification and secure, HTTP-only cookie-based session management using JWTs, making it suitable for real-world deployment.

## Key Features

* **User Signup:** Secure registration with password hashing.
* **Email Verification:** Ensures users provide a valid email address using time-sensitive tokens.
* **Login:** Authenticates users and establishes a session using JWT stored in secure HTTP-only cookies.
* **Logout:** Clears the user's session securely.

## How It Works

### 1. Signup Flow
1.  A user submits their name, email, and password via the Next.js frontend.
2.  The Node.js backend receives the request.
3.  It checks if a user with that email already exists in the MongoDB database.
4.  If the user is new:
    * The provided password is securely hashed using `bcryptjs`.
    * The new user record (including the hashed password and an `isVerified: false` flag) is saved to MongoDB.
    * A unique, time-limited email verification token is generated.
    * An email containing a verification link (with the token) is sent to the user's email address using `nodemailer`.
5.  The frontend displays a message like: "Signup successful. Please check your email to verify your account."

### 2. Email Verification Flow
1.  The user clicks the verification link in their email. The link typically looks like: `https://your-backend-api.com/api/auth/verify-email?token=UNIQUE_TOKEN_HERE`
2.  This triggers a GET request to the backend endpoint.
3.  The backend:
    * Finds the token in its database (or validates it based on its generation method).
    * Checks if the token is valid and hasn't expired.
    * If valid, it updates the corresponding user's record in MongoDB, setting `isVerified` to `true`.
    * Optionally, the token record is invalidated or removed.
4.  The backend redirects the user to a success page on the frontend (e.g., `/email-verified` or `/login`).

### 3. Login Flow
1.  The user submits their email and password on the login page.
2.  The backend receives the credentials.
3.  It checks:
    * Does a user with this email exist in MongoDB?
    * Is the submitted password correct? (Compares the hash of the submitted password with the stored hash using `bcryptjs`).
    * Has the user's email been verified (`isVerified` flag is `true`)?
4.  If all checks pass:
    * A JSON Web Token (JWT) is generated using `jsonwebtoken`. This token contains user identifiers (like user ID, role, etc.) and an expiration time.
    * The JWT is set as an HTTP-only cookie in the response headers. HTTP-only prevents client-side JavaScript from accessing the cookie, mitigating XSS attacks. Secure and SameSite attributes should also be set for production.
    * The backend sends a success response, often redirecting the user to their dashboard or the homepage on the frontend. The browser automatically stores the cookie.
    * ALLOW 3rd PARTY COOKIES: The frontend and backend of the website is hosted in different domains, the browser treats requests between them as cross-origin requests. By default, the browser blocks cross-origin requests from sharing cookies for security reasons. This is because cookies are typically used for maintaining user sessions and are considered sensitive data.

### 4. Logout Flow
1.  The user clicks the logout button on the frontend.
2.  A request is sent to a backend logout endpoint (e.g., `/api/auth/logout`).
3.  The backend clears the JWT cookie by sending back a `Set-Cookie` header with the same cookie name, an empty value, and an expiration date in the past.
4.  The user is typically redirected to the login or home page.

## Technologies Used

### Frontend (Client)
* **Framework:** [Next.js](https://nextjs.org/) (using App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) 
* **API Requests:** [Axios](https://axios-http.com/)
* **State Management:** React Hooks (`useState`, `useEffect`, `useContext` etc.)

### Backend (Server)
* **Framework:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
* **Password Hashing:** [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Token Generation:** [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
* **Email Sending:** [nodemailer](https://nodemailer.com/)
* **Cookie Handling:** [cookie-parser](https://github.com/expressjs/cookie-parser)
* **Environment Variables:** [dotenv](https://github.com/motdotla/dotenv)

## Getting Started

### Prerequisites

* Node.js (LTS version recommended)
* npm or yarn
* MongoDB instance (local or cloud like MongoDB Atlas)
* An email service provider account (e.g., Gmail with App Password, SendGrid, Mailgun) for `nodemailer`.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SagnikGos/Advanced-Authentication.git
    cd Advanced-Authentication
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # or
    # yarn install
    ```
    * Create a `.env` file in the `backend` directory. Copy the contents of `.env.example` (if provided) or add the following variables:
        ```env
        MONGODB_URI=your_mongodb_connection_string
        PORT=your_backend_port # e.g., 5000
        JWT_SECRET=your_strong_jwt_secret_key
        JWT_EXPIRES_IN=1d # e.g., 1d, 7d, 1h

        EMAIL_HOST=your_email_smtp_host
        EMAIL_PORT=your_email_smtp_port # e.g., 587 or 465
        EMAIL_USER=your_email_address
        EMAIL_PASS=your_email_password_or_app_password
        EMAIL_FROM='"Your App Name" <youremail@example.com>'

        CLIENT_URL=http://localhost:3000 # URL of your Next.js frontend
        ```
    * Run the backend server:
        ```bash
        npm start
        # or for development with nodemon (if configured)
        # npm run dev
        ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    # or
    # yarn install
    ```
    * Create a `.env.local` file in the `frontend` directory. You might need to specify the backend API URL:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:5000/api # Use the correct backend URL and port
        ```
    * Run the frontend development server:
        ```bash
        npm run dev
        # or
        # yarn dev
        ```

4.  **Access the application:** Open your browser and navigate to `http://localhost:3000` (or your configured frontend port).

## API Route Documentation

This section can detail the specific API endpoints available on the backend, including:
* `POST /api/auth/signup`
* `GET /api/auth/verify-email`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me` (Example: To get current user data if logged in)

Include required request bodies, parameters, and expected responses.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.
