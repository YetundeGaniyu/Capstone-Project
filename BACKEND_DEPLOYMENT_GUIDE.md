# Backend Deployment Guide for Google OAuth

## 🚀 Quick Fix for Current Issue

The backend is returning "Route not found" because the Google OAuth route is not properly configured. Here's how to fix it:

## 📋 Required Environment Variables on Render

Add these to your Render environment variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-from-google-cloud-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-google-cloud-console
GOOGLE_CALLBACK_URL=https://askyello-backend.onrender.com/auth/google/callback

# Session Configuration
SESSION_SECRET=your-random-session-secret-key-here
NODE_ENV=production

# Database (MongoDB Atlas recommended for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/askyello

# API Configuration
API_BASE_URL=https://askyello-backend.onrender.com
```

## 🔧 Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a project** or select existing one
3. **Enable APIs**:
   - Google+ API
   - Google OAuth2 API
4. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URI: `https://askyello-backend.onrender.com/auth/google/callback`
   - Copy Client ID and Client Secret

## 📦 Required Dependencies

Make sure these are installed on your backend:

```bash
npm install express passport passport-google-oauth20 express-session cors dotenv mongoose
```

## 🗂️ Backend File Structure

```
backend/
├── server.js              # Main server file
├── models/
│   └── User.js            # User model
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## 🔍 Route Registration

The server.js file should include these routes:

```javascript
// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: 'http://localhost:5173/auth/callback?success=true'
}))
```

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Google Client ID and Secret are set in Render environment
- [ ] Callback URL matches exactly in Google Cloud Console
- [ ] `passport-google-oauth20` is installed
- [ ] Auth router is mounted correctly in server.js
- [ ] MongoDB connection is configured
- [ ] CORS is configured for your frontend URL

## 🚨 Common Issues & Solutions

### Issue: "Route not found"
**Solution**: Ensure the auth routes are registered before the 404 handler in server.js

### Issue: "Invalid redirect_uri"
**Solution**: Make sure the callback URL in Google Cloud Console exactly matches `GOOGLE_CALLBACK_URL`

### Issue: "Missing credentials"
**Solution**: Verify environment variables are set correctly in Render dashboard

## 🔄 Testing the OAuth Flow

1. Visit: `https://askyello-backend.onrender.com/auth/google`
2. Should redirect to Google OAuth consent screen
3. After authorization, should redirect to your callback URL
4. Check if user is created in MongoDB

## 📱 Frontend Integration

Your frontend should redirect to:
```javascript
window.location.href = 'https://askyello-backend.onrender.com/auth/google'
```

## 🔧 Production Deployment Steps

1. **Set up MongoDB Atlas** (recommended for production)
2. **Configure Google OAuth** in Google Cloud Console
3. **Add environment variables** to Render dashboard
4. **Deploy backend** to Render
5. **Test OAuth flow** end-to-end
6. **Update frontend** to use production callback URL
