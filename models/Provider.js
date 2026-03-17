const mongoose = require('mongoose')

const providerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Logistics', 'Photography', 'Graphic design', 'Creative arts', 'Electrician', 'Plumber', 'Painter', 'Carpenter', 'Catering', 'Cleaning Services', 'Events', 'Fashion designing', 'Repairs', 'Hairstylist', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  location: {
    latitude: String,
    longitude: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  blacklisted: {
    type: Boolean,
    default: false
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  vendorId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Provider', providerSchema)
