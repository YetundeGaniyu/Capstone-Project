/**
 * Centralized API Configuration
 * Base URL: https://askyello-backend.onrender.com
 */

// Base API configuration
export const API_CONFIG = {
  BASE_URL: 'https://askyello-backend.onrender.com',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER_USER: '/auth/register',
    REGISTER_PROVIDER: '/auth/register-provider',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    GOOGLE_LOGIN: '/auth/google',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_OTP: '/auth/verify-otp',
  },

  // Provider endpoints
  PROVIDERS: {
    LIST: '/providers',
    GET_BY_ID: '/providers/:id',
    UPDATE: '/providers/:id',
    GET_REVIEWS: '/providers/:id/reviews',
  },

  // Search endpoints
  SEARCH: {
    PROVIDERS: '/search/providers',
    CATEGORIES: '/search/categories',
  },

  // Review endpoints
  REVIEWS: {
    CREATE: '/reviews',
    GET_BY_ID: '/reviews/:id',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    PENDING_PROVIDERS: '/admin/providers/pending',
    VERIFY_PROVIDER: '/admin/providers/:id/verify',
    REJECT_PROVIDER: '/admin/providers/:id/reject',
  },

  // Chatbot endpoint
  CHATBOT: '/chatbot',
}

// HTTP methods configuration
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

// Helper function to build full URLs
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  // Replace path parameters (e.g., :id)
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key])
  })
  
  return url
}

// Helper function to build query strings
export const buildQueryString = (params = {}) => {
  const query = new URLSearchParams(params)
  return query.toString()
}

// Common headers configuration
export const API_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
  'Accept': 'application/json',
  },
  AUTH: (token) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  }),
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized. Please log in again.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
}

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}
