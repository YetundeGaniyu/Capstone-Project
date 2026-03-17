const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const session = require('express-session')
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/askyello')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://askyello-frontend.vercel.app'], // Your frontend URLs
  credentials: true
}))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Passport initialization
app.use(passport.initialize())
app.use(passport.session())

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://askyello-backend.onrender.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user in database
    let user = await User.findOne({ googleId: profile.id })
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        photoURL: profile.photos[0].value,
        createdAt: new Date()
      })
      await user.save()
    }
    
    return done(null, user)
  } catch (error) {
    return done(error, null)
  }
}))

// Serialize/deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Mount ALL routes BEFORE the 404 handler
app.use('/auth', require('./routes/auth'))
app.use('/providers', require('./routes/providers'))
app.use('/search', require('./routes/search'))
app.use('/reviews', require('./routes/reviews'))
app.use('/admin', require('./routes/admin'))
app.use('/chatbot', require('./routes/chatbot'))

// Google OAuth Routes (these stay in main server file)
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: 'http://localhost:5173/auth/callback?success=true'
}))

// Current user endpoint
app.get('/auth/current-user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      data: {
        userId: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName,
        photoURL: req.user.photoURL
      }
    })
  } else {
    res.json({
      success: false,
      message: 'Not authenticated'
    })
  }
})

// Logout endpoint
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.json({ success: false, message: 'Logout failed' })
    }
    res.json({ success: true, message: 'Logged out successfully' })
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// 404 handler - MUST be LAST, after all routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Google OAuth callback URL: ${process.env.GOOGLE_CALLBACK_URL}`)
})

module.exports = app
