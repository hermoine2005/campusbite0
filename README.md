# CampusBite — Smart Canteen Pre-Order System
React (Vite) + Bootstrap 5 · Node/Express · MongoDB (Mongoose) · JWT + bcrypt (bcryptjs)

## Run locally (Windows, PowerShell)
Prerequisites: Node.js 18+ and MongoDB Community (running as a service) **or** a free MongoDB Atlas URI.
```powershell
cd CampusBite\server
npm install
copy ..\.env.example .env      # then edit JWT_SECRET (and MONGO_URI if using Atlas)
npm run seed                   # creates 13 foods + admin user
npm run dev                    # API on http://localhost:5000

# new terminal
cd CampusBite\client
npm install
copy .env.example .env
npm run dev                    # app on http://localhost:5173
```
Admin login: `admin@campusbite.com` / `Admin@12345` (change in `.env` before seeding).
Check API: http://localhost:5000/api/health

## Postman
Import `postman/CampusBite.postman_collection.json`. After Login, paste the token into the collection variable `token`; paste a food `_id` from "Get menu" into `foodId`; in "Checkout" replace `pickupTime` with an ISO time 10-60 min ahead (e.g. from `new Date(Date.now()+30*60000).toISOString()`).

## Deployment (free tier)
1. **MongoDB Atlas**: free M0 cluster → Database Access: add user → Network Access: allow 0.0.0.0/0 → Connect → copy connection string (add `/campusbite` before `?`).
2. **GitHub**: `git init && git add . && git commit -m "CampusBite"`, create repo, push (`.env` is git-ignored).
3. **API on Render**: New Web Service → repo. Root `server`, Build `npm install`, Start `npm start`. Env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (set after step 5), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. **Seed**: locally, put the Atlas URI in `server/.env` and run `npm run seed` once.
5. **Frontend on Vercel**: import repo, Root `client`, framework Vite, env `VITE_API_URL=https://<your-render-url>/api`.
6. Set `CLIENT_URL` on Render to the Vercel URL, redeploy. (Free Render sleeps when idle; first request may take ~50 s.)

## Submission ZIP
Delete every `node_modules` folder, then zip the `CampusBite` folder as `PRN_Name_Project.zip`.
