# Sphere - Render Deployment Instructions

The backend is fully configured and ready for production deployment on [Render](https://render.com). Follow these exact steps to get your FastAPI backend live.

## Step 1: Push Code to GitHub

First, you need to push your local code to a GitHub repository. We have already added a `.gitignore` file to ensure sensitive keys (like your `.env`) are NOT pushed to public repositories.

1. Open your terminal in the backend directory (`c:\Users\91807\OneDrive\Desktop\StudyTrack AI`).
2. Run the following commands to initialize Git and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial backend commit for deployment"
   ```
3. Create a new empty repository on [GitHub](https://github.com/new).
4. Follow the GitHub instructions to link your local repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Step 2: Connect Repo to Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Under "Connect a repository", connect your GitHub account if you haven't already.
4. Select the repository you just created (`YOUR_REPO_NAME`).
5. Click **Connect**.

## Step 3: Configure Render Web Service Settings

Fill in the settings on Render exactly as follows:

- **Name:** `studytrack-ai-backend` (or whatever you prefer)
- **Region:** Choose the region closest to you or your Supabase database.
- **Branch:** `main`
- **Runtime:** `Python 3`
- **Build Command:** 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:** 
  ```bash
  uvicorn main:app --host 0.0.0.0 --port 10000
  ```
- **Instance Type:** `Free` (or select a paid tier if needed)

## Step 4: Add Environment Variables

Scroll down and click on **Advanced** or **Environment Variables**. You MUST add your Supabase credentials here so the production app can connect to your database.

Add the following keys and values:

1. **Key:** `SUPABASE_URL`
   - **Value:** *(Paste your Supabase Project URL here)*
2. **Key:** `SUPABASE_KEY`
   - **Value:** *(Paste your Supabase `service_role` or `anon` key here, matching what you have in your local `.env`)*
3. **Key:** `PYTHON_VERSION` *(Optional but recommended)*
   - **Value:** `3.10.0` (or whatever version you are using locally)

Click **Create Web Service**.

## Step 5: Verify Deployment

Render will now build and deploy your application. Once the status says **Live**, you will see a URL at the top left (e.g., `https://studytrack-ai-backend.onrender.com`).

Test your deployment by visiting the following URLs in your browser or Postman:

1. **Root Status Check:** `GET https://YOUR_RENDER_URL/`
   - Expected Output: `{"status":"ok", "app":"Sphere", "version":"1.0.0", ...}`
2. **API Documentation:** `GET https://YOUR_RENDER_URL/docs`
   - Expected Output: The Swagger UI page showing all your endpoints.
3. **Test an Endpoint:** `GET https://YOUR_RENDER_URL/plan/today` (Might require authentication or query params based on your logic)

## Deployment Checklist Summary:
- [x] `requirements.txt` is complete.
- [x] `main.py` exposes `app` and has a Root `GET /` endpoint.
- [x] Environment variables configured locally (and ready for Render).
- [x] CORS middleware is enabled allowing all `["*"]` origins.
- [x] `.gitignore` is added to prevent `.env` leaks.
