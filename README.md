# Meal Mitra  
**No One Sleeps Hungry**

## About the Project
**Meal Mitra** is a social impact platform that connects **donors**, **NGOs**, and **admins** to reduce food waste and support people in need through food and monetary donations. It leverages verified NGOs and community-driven verification to ensure safe and efficient food redistribution.

## Problem Statement
Every day, large amounts of food are wasted while many people remain hungry.  
Meal Mitra bridges this gap by enabling structured, transparent, and verified donations, ensuring that surplus food reaches those who need it most effectively.

## Solution
Meal Mitra provides:
- **Smart Donation Handling**: AI-powered parsing of donation messages.
- **Verified Network**: NGO-based handling and community verification.
- **Gamified Impact**: Badges and levels to encourage consistent contributions.
- **Real-time Tracking**: Status updates for donations and claims.

## User Roles
- **Donor** : Donate food or money, track impact, earn badges (e.g., *Annadātā*, *Bhojanamitraḥ*).
- **NGO** : Accept donations, verify food safety, manage distribution.
- **Admin** : Verify NGOs, manage users, monitor platform analytics.

## Key Features
- **AI-Powered Food Analysis**: Uses **Groq (Llama 3)** to parse donation details (food type, quantity, safety estimates) automatically from text.
- **Gamification System**: Earn Sanskrit-themed badges and level up based on donations, CO2 reduction, and meals served.
- **Smart Notifications**: Instant email alerts for OTPs, badge unlocks, and verification status.
- **Secure Authentication**: Role-based access with JWT and secure password hashing.
- **Interactive Dashboard**: Visual analytics for donors and admins using Recharts.
- **Location Services**: Map-based donation tracking with Leaflet.

## Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **State & Data**: TanStack Query (React Query)
- **Forms**: React Hook Form, Zod
- **Visuals**: Framer Motion (Animations), Lucide React (Icons)
- **Maps**: React Leaflet
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy
- **AI Integration**: Groq API (Llama 3.3 Versatile)
- **Authentication**: OAuth2, Passlib (Bcrypt), JWT
- **Email Service**: FastAPI-Mail
- **Security**: CORS, TrustedHost, SessionMiddleware

### Database
- **Primary**: SQLite (Dev) / PostgreSQL (Prod supported)

### Testing
- **E2E Testing**: Selenium WebDriver
- **BDD Framework**: Cucumber (Java)
- **Unit Testing**: JUnit

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables in a `.env` file (refer to `.env.example` if available).
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Testing Setup
1. Navigate to the testing directory:
   ```bash
   cd testing/TestMitra
   ```
2. Run tests using Maven:
   ```bash
   mvn test
   ```
