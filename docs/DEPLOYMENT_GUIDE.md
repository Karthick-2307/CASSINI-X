# CASSINI-X — Live Website Deployment Guide (Vercel & Render)

This step-by-step guide walks you through publishing **CASSINI-X** live to the web using **Render** (for the FastAPI Python backend) and **Vercel** (for the React Vite frontend).

---

## Part 1: Deploy Backend to Render (Python + FastAPI)

1. Go to [https://render.com](https://render.com) and log in with your GitHub account.
2. In the dashboard, click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repo:
   `https://github.com/Karthick-2307/CASSINI-X`
4. Configure the Web Service settings:
   - **Name**: `cassini-x-backend` (or your preferred name)
   - **Region**: Oregon (US West) or any free region
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
5. Scroll down to **Environment Variables** and add:
   - `PYTHON_VERSION` = `3.11.9`
   - `ASTRAX_DEMO_MODE` = `false`
6. Click **Create Web Service**.
7. Render will build and deploy your API. Once deployed, copy your live backend URL (e.g. `https://cassini-x-backend.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel (React + Vite)

1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. In your Vercel Dashboard, click **Add New...** -> **Project**.
3. Select your GitHub repository: `Karthick-2307/CASSINI-X` and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend` (Important!).
   - **Build and Output Settings**: Leave as default (`npm run build`, `dist`).
5. Open the **Environment Variables** section and add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render live backend URL from Part 1 (e.g. `https://cassini-x-backend.onrender.com`).
6. Click **Deploy**.
7. Vercel will build the frontend in ~30 seconds and provide you with a live `https://*.vercel.app` URL!
