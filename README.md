<p align="center">
  <img src="services/web/public/logo-full.png" alt="Spot2Go Logo" width="400">
</p>

<h1 align="center">Spot2Go</h1>

<p align="center">
  <strong>Spot it. Have it.</strong>
</p>

<p align="center">
  A full-stack study and work space booking platform for Thunder Bay.
  <br />
  <a href="https://www.spot2go.app"><strong>Visit the Live App »</strong></a>
</p>

---

**Spot2Go** is a modern, full-stack application designed to help students and professionals discover and book the perfect study or work spots. It serves as a central hub connecting users with local businesses like cafés, libraries, and co-working spaces, allowing them to reserve a spot based on date, time, and party size.

This project is built with a scalable, modular architecture, featuring a separate Node.js/Express API backend and a Next.js/React frontend.

## ✨ Key Features

The platform is built around three distinct user roles: Customers, Owners, and Admins.

### 👤 For Customers
* **Discover & Filter:** Find available spots and filter by type (Cafe, Library, etc.).
* **Secure Authentication:** Sign up with Email/Password (with OTP verification) or Google.
* **Instant Booking:** Book a spot for a specific date, time, duration, and party size.
* **E-Ticket System:** Receive a unique QR code for each booking for easy check-in.
* **Personalization:** Bookmark favorite spots and manage a personal profile.
* **Review System:** Leave ratings and comments for *completed* bookings.
* **Calendar Integration:** Download an `.ics` file for any booking to add to your calendar.

### 🏢 For Business Owners
* **Secure Registration:** Sign up as an owner, with all accounts verified by an admin.
* **Place Management:** Submit, edit, and manage your properties (places), including photos, amenities, location, and reservable hours.
* **Capacity Control:** Set a `maxCapacity` for your spot, which the booking system automatically respects.
* **Booking Dashboard:** View all upcoming and past bookings for your properties.
* **Check-in System:** Mark bookings as 'completed' (check-in) or 'no-show' to manage your space.
* **Menu Management:** (For Cafés) Add and manage menu items.

### 🔑 For Admins
* **Verification Dashboard:** A central dashboard to approve or reject new **Owner** signups and new **Place** submissions.
* **Platform Statistics:** View high-level stats about the platform (total places, pending places, pending owners, etc.).

## 🛠️ Technology Stack

This project uses a modern, decoupled architecture.

| Category | Technology |
| :--- | :--- |
| **Frontend** | **Next.js 14** (App Router), **React**, **TypeScript** |
| | **Tailwind CSS** with **shadcn/ui** components |
| | **Leaflet** & **OpenStreetMap** for interactive maps |
| | `sonner` (Toasts), `vaul` (Drawers), `axios` (API) |
| **Backend** | **Node.js** with **Express.js** |
| | **Sequelize** (ORM) |
| | **Passport.js** (Authentication) |
| **Database** | **PostgreSQL** |
| **Services & APIs** | **JWT** (JSON Web Tokens) for auth |
| | **bcryptjs** for password hashing |
| | **Google OAuth 2.0** for social login |
| | **Nodemailer** for OTP and booking confirmation emails |
| | **Cloudinary** for image storage and delivery |
| | **Stripe** for payments (stubbed) |
| **Deployment** | **Docker** & **Docker Compose**, Vercel (Web), Render (API) |

## 🚀 Getting Started

You can run the entire application using Docker (recommended) or manually.

### 1. Using Docker (Recommended)

This is the simplest way to get both the frontend and backend running.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/spot2go.git
    cd spot2go
    ```

2.  **Set up Environment Variables:**
    * The API service requires environment variables. Copy the example file:
        ```bash
        cp services/api/.env.example services/api/.env
        ```
    * Edit `services/api/.env` and fill in the required values:
        * `DATABASE_URL` (your PostgreSQL connection string)
        * `JWT_SECRET` (a strong random string)
        * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
        * `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST` (for Nodemailer)
        * `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (for Google Auth)

3.  **Build and Run with Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the apps:**
    * **Frontend (Web):** `http://localhost:3000`
    * **Backend (API):** `http://localhost:4000`

### 2. Running Manually

#### Backend (API)

1.  Navigate to the API directory:
    ```bash
    cd services/api
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your `.env` file as described in the Docker section.
4.  Run the development server (which uses `nodemon`):
    ```bash
    npm run dev
    ```
5.  The API will be running on `http://localhost:4000`.

#### Frontend (Web)

1.  In a separate terminal, navigate to the web directory:
    ```bash
    cd services/web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  The Next.js app will be running on `http://localhost:3000`.

## 📁 Project Structure

The repository is structured as a simple monorepo, with each service in its own directory.

```
/
├── docker-compose.yml        # Coordinates both services
├── services/
│   ├── api/                  # Node.js/Express Backend API
│   │   ├── src/
│   │   │   ├── controllers/  # Business logic (customer, owner, admin)
│   │   │   ├── models/       # Sequelize DB models (User, Place, Booking, etc.)
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── config/       # DB, Passport, Cloudinary config
│   │   │   ├── middleware/   # Auth (authenticate, requireRole)
│   │   │   ├── utils/        # Email service
│   │   │   └── index.js      # Server entry point
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── web/                  # Next.js Frontend
│       ├── src/
│       │   ├── components/   # Reusable React components (UI, forms, etc.)
│       │   ├── pages/        # Next.js pages (routes)
│       │   ├── context/      # AuthContext for global state
│       │   ├── lib/          # API client (api.js)
│       │   └── types/        # TypeScript types (User, Place, etc.)
│       ├── public/           # Static assets (logos, icons)
│       ├── package.json
│       ├── tailwind.config.js
│       └── Dockerfile
└── README.md                 # You are here!
```
