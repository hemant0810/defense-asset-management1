# Deployment Guide - Defense Asset Ops

This project can be deployed using multiple methods based on your preference and infrastructure.

---

## 🌟 Method 1: Free / Cloud Platform (Render or Railway) - Recommended for Beginners

### Step 1: Push Project to GitHub
1. In your project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Defense Asset Ops"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

### Step 2: Create Cloud Database (MySQL)
- On **Render** or **Railway** (or **Aiven.io** / **TiDB Cloud** for free MySQL):
  1. Create a new MySQL instance.
  2. Note down: `DB_HOST`, `DB_PORT` (usually 3306), `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`.

### Step 3: Deploy Backend (Spring Boot Web Service)
- On **Render / Railway**:
  1. Click **New Web Service** -> Connect your GitHub repo.
  2. Root directory: `backend`
  3. Environment: `Docker` (or Java / Maven build)
     - Build Command: `mvn clean package -DskipTests`
     - Start Command: `java -jar target/asset-management-system-1.0.0.jar`
  4. Environment Variables:
     - `DB_HOST`: *Your cloud DB host*
     - `DB_PORT`: *3306*
     - `DB_NAME`: *asset_management_db*
     - `DB_USERNAME`: *your db user*
     - `DB_PASSWORD`: *your db password*
     - `SPRING_PROFILES_ACTIVE`: `default` (or `h2` if you want embedded DB without external MySQL)
  5. Click **Deploy**. Note your backend URL (e.g. `https://defense-backend.onrender.com`).

### Step 4: Deploy Frontend (Vercel, Netlify, or Render)
- On **Vercel** (Recommended for React):
  1. Go to [vercel.com](https://vercel.com) -> **Add New Project**.
  2. Select your GitHub repository.
  3. Set Root Directory: `frontend`
  4. Framework Preset: `Vite`
  5. Add Environment Variable:
     - `VITE_API_BASE_URL`: `https://defense-backend.onrender.com` (Your backend URL from Step 3)
  6. Click **Deploy**!

---

## 🐳 Method 2: One-Click Docker Compose (VPS / AWS EC2 / DigitalOcean)

If you have a Linux VPS (Ubuntu/Debian) or any server with Docker installed:

1. Clone or copy your project folder to the server:
   ```bash
   scp -r c:\vssss\asset-management-system-complete.zip user@your-server-ip:/home/user/
   ```
2. Unzip and enter directory:
   ```bash
   unzip asset-management-system-complete.zip -d app
   cd app
   ```
3. Run with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Access your live application:
   - Frontend: `http://<your-server-ip>`
   - Backend API: `http://<your-server-ip>:8080`
   - Database: Port 3306 (internal network)

---

## ⚡ Method 3: Cloud Run / AWS ECS / Kubernetes
- Backend image: Built using `backend/Dockerfile`
- Frontend image: Built using `frontend/Dockerfile` with Nginx reverse proxy
- Database: Amazon RDS / Cloud SQL for MySQL
