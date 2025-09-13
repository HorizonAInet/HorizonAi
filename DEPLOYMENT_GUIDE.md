# 🚀 NL2PD Deployment Guide

This guide covers deploying your NL2PD project with a React frontend and FastAPI backend.

## 📋 Overview
- **Frontend**: Deploy to Vercel (recommended) or Netlify
- **Backend**: Deploy to Railway, Render, or Fly.io

## 🔧 Environment Variables Needed

### Backend Environment Variables
```bash
# Required
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Optional (for specific deployment platforms)
PORT=8000
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables
```bash
# Required
REACT_APP_API_URL=https://your-backend-domain.railway.app
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🚂 **Option 1: Railway (Recommended)**

### Setup Steps:
1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Deploy**:
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Deploy
   railway up
   ```
4. **Set Environment Variables**:
   - Go to your project dashboard
   - Click on "Variables" tab
   - Add all backend environment variables

### Benefits:
- $5/month free credit
- Great for FastAPI/Python apps
- Easy GitHub integration
- Good performance

---

## 🎯 **Option 2: Render**

### Setup Steps:
1. **Sign up** at [render.com](https://render.com)
2. **Create Web Service**:
   - Connect GitHub repository
   - Choose "Web Service"
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `python run_backend.py`
3. **Environment Variables**:
   - In service settings, add all backend environment variables
4. **Deploy**: Render will auto-deploy

### Benefits:
- 750 hours/month free
- Auto-deploy from GitHub
- Built-in SSL

### Limitations:
- Spins down after 15 minutes of inactivity

---

## ✈️ **Option 3: Fly.io**

### Setup Steps:
1. **Install Fly CLI**:
   ```bash
   # Windows (PowerShell)
   Invoke-WebRequest https://fly.io/install.ps1 -UseBasicParsing | Invoke-Expression
   ```
2. **Login and Setup**:
   ```bash
   fly auth login
   fly launch
   ```
3. **Set Environment Variables**:
   ```bash
   fly secrets set GROQ_API_KEY=your_key_here
   fly secrets set SUPABASE_URL=your_url_here
   fly secrets set SUPABASE_ANON_KEY=your_key_here
   fly secrets set ENCRYPTION_KEY=your_encryption_key_here
   ```
4. **Deploy**:
   ```bash
   fly deploy
   ```

---

## 🌐 **Frontend Deployment (Vercel)**

### Setup Steps:
1. **Sign up** at [vercel.com](https://vercel.com)
2. **Connect GitHub**: Import your repository
3. **Configure**:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Environment Variables**:
   - Add all frontend environment variables
   - Set `REACT_APP_API_URL` to your deployed backend URL
5. **Deploy**: Vercel will auto-deploy

### Alternative: Netlify
1. **Sign up** at [netlify.com](https://netlify.com)
2. **Drag & Drop**: Build locally and drag the `build` folder
3. **Or Connect GitHub**: For auto-deployment

---

## 🔐 **Security Setup**

### Generate Encryption Key:
```python
# Run this in Python to generate a key
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

### Supabase Setup:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get URL and anon key from project settings

### Groq API Setup:
1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate API key
3. Add to environment variables

---

## 🧪 **Testing Deployment**

### Test Backend:
```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-14T...",
  "version": "1.0.0"
}
```

### Test Frontend:
1. Visit your Vercel URL
2. Try logging in
3. Test file upload and queries

---

## 🔧 **Troubleshooting**

### Common Issues:

#### Backend not starting:
- Check environment variables are set
- Verify requirements.txt is complete
- Check logs in platform dashboard

#### CORS errors:
- Ensure frontend URL is in CORS settings
- Check `FRONTEND_URL` environment variable

#### Database connection issues:
- Verify Supabase credentials
- Check network/firewall settings

#### File upload issues:
- Check file size limits on platform
- Verify temp directory permissions

---

## 📊 **Cost Breakdown**

### Free Tiers:
- **Railway**: $5/month credit (usually sufficient)
- **Render**: 750 hours/month (with sleeps)
- **Fly.io**: Generous free allowances
- **Vercel**: Unlimited for personal projects
- **Supabase**: 500MB database, 1GB bandwidth

### Paid Plans (if needed):
- **Railway**: $5-20/month
- **Render**: $7-25/month
- **Fly.io**: $5-15/month
- **Vercel Pro**: $20/month

---

## 🚀 **Quick Start Commands**

### Deploy to Railway:
```bash
# Install CLI
npm install -g @railway/cli

# Deploy
railway login
railway up
```

### Deploy to Render:
- Just connect GitHub repo and configure in dashboard

### Deploy Frontend to Vercel:
```bash
# Install CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

---

## 📞 **Support**

If you encounter issues:
1. Check platform-specific documentation
2. Review environment variables
3. Check application logs
4. Test locally first

Remember to keep your API keys secure and never commit them to GitHub!