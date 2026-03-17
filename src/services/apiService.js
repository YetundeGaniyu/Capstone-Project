/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import { API_CONFIG, API_ENDPOINTS, HTTP_METHODS, API_HEADERS, ERROR_MESSAGES, HTTP_STATUS } from './api.js'

/**
 * Generic API request handler
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {Object} params - URL parameters
 * @param {Object} headers - Request headers
 * @param {string} authToken - Authentication token
 * @returns {Promise} Response data
 */
export const apiRequest = async ({
  method = HTTP_METHODS.GET,
  endpoint,
  data = null,
  params = {},
  headers = {},
  authToken = null,
}) => {
  try {
    const config = {
      method,
      headers: {
        ...API_HEADERS.JSON,
        ...headers,
        ...(authToken ? API_HEADERS.AUTH(authToken) : {}),
      },
    }

    // Add request body for POST/PUT requests
    if (data && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PUT)) {
      config.body = JSON.stringify(data)
    }

    // Add query parameters for GET requests
    let url = `${API_CONFIG.BASE_URL}${endpoint}`
    if (method === HTTP_METHODS.GET && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString()
      url = `${url}?${queryString}`
    }

    // Add path parameters
    Object.keys(params).forEach(key => {
      if (endpoint.includes(`:${key}`)) {
        url = url.replace(`:${key}`, params[key])
      }
    })

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || ERROR_MESSAGES.SERVER_ERROR)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  registerUser: (userData) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.REGISTER_USER,
    data: userData,
  }),

  /**
   * Register new service provider
   * @param {Object} providerData - Provider registration data
   */
  registerProvider: (providerData) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.REGISTER_PROVIDER,
    data: providerData,
  }),

  /**
   * User login
   * @param {Object} credentials - Login credentials
   */
  login: (credentials) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.LOGIN,
    data: credentials,
  }),

  /**
   * Refresh JWT token
   * @param {string} refreshToken - Refresh token
   */
  refreshToken: (refreshToken) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.REFRESH,
    data: { refreshToken },
  }),

  /**
   * Google OAuth login
   * @param {Object} googleData - Google auth data
   */
  googleLogin: (googleData) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
    data: googleData,
  }),

  /**
   * Verify email address
   * @param {Object} emailData - Email verification data
   */
  verifyEmail: (emailData) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    data: emailData,
  }),

  /**
   * Verify OTP code
   * @param {Object} otpData - OTP verification data
   */
  verifyOTP: (otpData) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.AUTH.VERIFY_OTP,
    data: otpData,
  }),
}

/**
 * Provider API calls
 */
export const providersAPI = {
  /**
   * Get all providers
   * @param {Object} filters - Search filters
   */
  getAll: (filters = {}) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.PROVIDERS.LIST,
    params: filters,
  }),

  /**
   * Get provider by ID
   * @param {string} providerId - Provider ID
   */
  getById: (providerId) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.PROVIDERS.GET_BY_ID,
    params: { id: providerId },
  }),

  /**
   * Update provider profile
   * @param {string} providerId - Provider ID
   * @param {Object} updateData - Update data
   * @param {string} authToken - Authentication token
   */
  update: (providerId, updateData, authToken) => apiRequest({
    method: HTTP_METHODS.PUT,
    endpoint: API_ENDPOINTS.PROVIDERS.UPDATE,
    params: { id: providerId },
    data: updateData,
    authToken,
  }),

  /**
   * Get provider reviews
   * @param {string} providerId - Provider ID
   */
  getReviews: (providerId) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.PROVIDERS.GET_REVIEWS,
    params: { id: providerId },
  }),
}

/**
 * Search API calls
 */
export const searchAPI = {
  /**
   * Search providers
   * @param {Object} searchParams - Search parameters
   */
  searchProviders: (searchParams) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.SEARCH.PROVIDERS,
    params: searchParams,
  }),

  /**
   * Get service categories
   */
  getCategories: () => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.SEARCH.CATEGORIES,
  }),
}

/**
 * Review API calls
 */
export const reviewsAPI = {
  /**
   * Submit a review
   * @param {Object} reviewData - Review data
   * @param {string} authToken - Authentication token
   */
  create: (reviewData, authToken) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.REVIEWS.CREATE,
    data: reviewData,
    authToken,
  }),

  /**
   * Get review details
   * @param {string} reviewId - Review ID
   */
  getById: (reviewId) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.REVIEWS.GET_BY_ID,
    params: { id: reviewId },
  }),

  /**
   * Update review
   * @param {string} reviewId - Review ID
   * @param {Object} updateData - Update data
   * @param {string} authToken - Authentication token
   */
  update: (reviewId, updateData, authToken) => apiRequest({
    method: HTTP_METHODS.PUT,
    endpoint: API_ENDPOINTS.REVIEWS.UPDATE,
    params: { id: reviewId },
    data: updateData,
    authToken,
  }),

  /**
   * Delete review
   * @param {string} reviewId - Review ID
   * @param {string} authToken - Authentication token
   */
  delete: (reviewId, authToken) => apiRequest({
    method: HTTP_METHODS.DELETE,
    endpoint: API_ENDPOINTS.REVIEWS.DELETE,
    params: { id: reviewId },
    authToken,
  }),
}

/**
 * Admin API calls
 */
export const adminAPI = {
  /**
   * Get all users
   * @param {string} authToken - Authentication token
   */
  getAllUsers: (authToken) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.ADMIN.USERS,
    authToken,
  }),

  /**
   * Get pending provider verifications
   * @param {string} authToken - Authentication token
   */
  getPendingProviders: (authToken) => apiRequest({
    method: HTTP_METHODS.GET,
    endpoint: API_ENDPOINTS.ADMIN.PENDING_PROVIDERS,
    authToken,
  }),

  /**
   * Verify provider
   * @param {string} providerId - Provider ID
   * @param {string} authToken - Authentication token
   */
  verifyProvider: (providerId, authToken) => apiRequest({
    method: HTTP_METHODS.PUT,
    endpoint: API_ENDPOINTS.ADMIN.VERIFY_PROVIDER,
    params: { id: providerId },
    data: { verified: true },
    authToken,
  }),

  /**
   * Reject provider
   * @param {string} providerId - Provider ID
   * @param {string} authToken - Authentication token
   */
  rejectProvider: (providerId, authToken) => apiRequest({
    method: HTTP_METHODS.PUT,
    endpoint: API_ENDPOINTS.ADMIN.REJECT_PROVIDER,
    params: { id: providerId },
    data: { rejected: true },
    authToken,
  }),
}

/**
 * Chatbot API calls
 */
export const chatbotAPI = {
  /**
   * Send message to AI chatbot
   * @param {Object} messageData - Message data
   */
  sendMessage: (messageData) => apiRequest({
    method: HTTP_METHODS.POST,
    endpoint: API_ENDPOINTS.CHATBOT,
    data: messageData,
  }),
}
