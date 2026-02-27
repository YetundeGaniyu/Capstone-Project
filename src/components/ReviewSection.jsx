import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function ReviewSection({ vendorId, onReviewSubmit }) {
  const { currentUser } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      alert('Please sign in to leave a review')
      return
    }

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmitting(true)
    
    try {
      const review = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        vendorId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      }

      await onReviewSubmit(review)
      
      // Reset form
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="review-section">
      <h3>Leave a Review</h3>
      
      {!currentUser ? (
        <div className="review-prompt">
          <p>Please <a href="/login">sign in</a> to leave a review</p>
        </div>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              Comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-input"
              rows={4}
              placeholder="Share your experience with this vendor..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  )
}
