# 🌿 SaveBite - Smart Pantry & Meal Planner

SaveBite is a production-ready, premium, and eco-friendly web application designed to help users organize their pantry, track food expiry dates, reduce food waste, generate structured shopping lists, and receive AI-ready recipe recommendations.

Inspired by clean, minimalist design philosophies (Google Material, Notion, Samsung Health, Apple), SaveBite pairs micro-animations with a glassmorphism aesthetic.

---

## 🚀 Recommended Workspace Setup

The project is initialized in your local scratch directory. To get the best development experience with file link integrations, please open this subdirectory in your IDE:

**Path**: `C:/Users/yasme/.gemini/antigravity/scratch/savebite`

---

## 🛠️ Tech Stack & Key Features

- **Frontend**: React.js, Vite, Tailwind CSS v4 (CSS-first configuration), React Router DOM (v6), Framer Motion (Transitions and tactiles), React Icons.
- **Backend Integration**: Firebase Authentication, Cloud Firestore, Firebase Storage.
- **Local Simulation Mode**: If Firebase keys are absent, SaveBite automatically boots in **Simulation Mode**, syncing all data, auth states, logs, and notifications to `LocalStorage` in real-time. This lets you test the app immediately out of the box!
- **AI Recommendation Engine**: Tracks available/expiring pantry stock, calculates ingredient overlap, suggests substitutions, and forecasts food waste levels.
- **Utility Integrations**: CSV Export, Print layout stylesheets, Barcode Scanner simulator.

---

## 💻 Local Installation & Setup

1. **Verify Workspace Directory**:
   Ensure you are inside the project folder:
   ```bash
   cd C:/Users/yasme/.gemini/antigravity/scratch/savebite
   ```

2. **Install Dependencies**:
   *(Already done during initial setup, but can be rerun to audit packages)*
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   Start the local Vite server:
   ```bash
   npm run dev
   ```
   Open the logged URL (usually `http://localhost:5173`) in your browser.

---

## 🔥 Hooking up Live Firebase Backend

To connect the application to a live Firebase database:

1. **Create Firebase Project**:
   Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.

2. **Activate Services**:
   - **Authentication**: Enable Email/Password and Google login providers.
   - **Firestore Database**: Create a database in **production mode** or **test mode**.
   - **Firebase Storage**: Enable default bucket rules for hosting files/images.

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` (or `.env.local`):
   ```bash
   cp .env.example .env
   ```
   Fill in the variables with your Firebase web configuration credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ...
   ```

4. **Firestore Collections Setup**:
   The app will automatically sync documents inside these Firestore collections:
   - `users`: User metadata, settings, and profile details.
   - `ingredients`: Pantry items (userId, name, category, quantity, unit, expiryDate, storageLocation,Notes, barcode, image).
   - `recipes`: Core recipe book (title, category, cookingTime, calories, ingredients, steps).
   - `shoppingLists`: Items to buy (userId, name, category, quantity, unit, completed, notes).
   - `mealPlans`: Calendar schedules (userId, recipeId, date, mealType).
   - `notifications`: Expiry warnings and stock updates (userId, title, message, read, timestamp).
   - `favorites`: Saved recipe tags (userId, itemId, type).
   - `categories`: Global categories (name, icon, color).
   - `activityLogs`: Audit logs (message, time, type).

   *Note: In simulation mode, the app automatically seeds these collections with default recipes and categories inside your browser's LocalStorage.*

---

## 📦 Vercel Deployment

Deploying the React Vite app on Vercel is seamless:

1. **Vercel CLI**:
   Run the Vercel deploy command at the root of the project:
   ```bash
   vercel
   ```

2. **Configure Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   
3. **SPA Routing**:
   The pre-configured `vercel.json` file handles all sub-routes (like `/pantry` or `/dashboard`) by redirecting them to `index.html` to avoid 404 errors during direct browser visits.
