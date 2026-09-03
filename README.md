# SaveBite

SaveBite is a smart pantry and meal-planning web application that helps people make better use of the food they already have. Users can keep an organized inventory, monitor ingredients, discover recipes, plan meals, and maintain a focused shopping list in one place.

## What the project includes

- Public landing page and account flows for login, signup, and password recovery
- Dashboard for an overview of pantry activity and food planning
- Pantry management for tracking ingredients, quantities, categories, and expiry dates
- Recipe browsing and detailed recipe views
- Meal planner for scheduling recipes
- Shopping list management
- Favorites, notifications, and profile settings
- Protected admin area for authorized users
- Session-only authentication and in-memory data services for a lightweight demo experience
- Temporary object URLs for selected images; no files are uploaded or persisted

## Tech stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- React Icons
- Browser APIs and React state

## Getting started

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
npm run lint     # Run Oxlint
```

## Data and sessions

SaveBite currently runs without a backend. Authentication, pantry data, recipes, shopping lists, meal plans, favorites, and notifications are held in memory for the active browser session. Reloading the page clears the session and restores the default recipe and category data.

## Deployment

The project is configured as a Vite single-page application and can be deployed to Vercel. Use `npm run build` as the build command and `dist` as the output directory. The included `vercel.json` provides the rewrite needed for client-side routes.
