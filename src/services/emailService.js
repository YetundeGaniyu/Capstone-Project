// Email service for sending confirmation emails and OTP codes
// This is a mock implementation - in production, you'd use a real email service

export const sendEmailConfirmation = async (email, confirmationCode) => {
  // Mock email sending - replace with actual email service
  console.log(`Sending confirmation email to ${email} with code: ${confirmationCode}`)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In production, this would send an actual email
  return {
    success: true,
    message: 'Confirmation email sent successfully'
  }
}

export const sendOTPCode = async (phoneNumber, otpCode) => {
  // Mock SMS sending - replace with actual SMS service
  console.log(`Sending OTP to ${phoneNumber}: ${otpCode}`)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In production, this would send an actual SMS
  return {
    success: true,
    message: 'OTP code sent successfully'
  }
}

export const generateConfirmationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
