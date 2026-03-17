const express = require('express')
const router = express.Router()

// GET /search/providers - Search providers
router.get('/providers', async (req, res) => {
  try {
    const { category, location, query } = req.query
    res.json({
      success: true,
      data: []
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// GET /search/categories - Get categories
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      data: ['Logistics', 'Photography', 'Graphic design', 'Creative arts', 'Electrician', 'Plumber', 'Painter', 'Carpenter', 'Catering', 'Cleaning Services', 'Events', 'Fashion designing', 'Repairs', 'Hairstylist', 'Other']
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

module.exports = router
