import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { MessageSquare, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${productId}/reviews`);
      setReviews(response.data.reviews || []);
      
      // Find user's existing review
      if (user) {
        const existingReview = response.data.reviews?.find(
          review => review.user._id === user.id
        );
        setUserReview(existingReview || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    if (!user) {
      setError('Please log in to submit a review');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let response;
      if (editingReview) {
        // Update existing review
        response = await axios.put(
          `/api/reviews/${editingReview._id}`,
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } else {
        // Create new review
        response = await axios.post(
          `/api/products/${productId}/reviews`,
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }

      // Refresh reviews
      await fetchReviews();
      
      // Reset form state
      setShowForm(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(
        error.response?.data?.message || 
        'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axios.delete(`/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh reviews
      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      await axios.post(
        `/api/reviews/${reviewId}/vote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refresh reviews to update vote counts
      await fetchReviews();
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to record vote');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Reviews ({reviews.length})
        </h2>
        
        {user && !userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* User's Existing Review */}
      {user && userReview && !showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">Your Review</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditReview(userReview)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit review"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteReview(userReview._id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center mb-2">
            <div className="flex">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`text-lg ${
                    index < userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {userReview.rating} out of 5 stars
            </span>
          </div>
          {userReview.title && (
            <h4 className="font-medium mb-1">{userReview.title}</h4>
          )}
          <p className="text-gray-700">{userReview.comment}</p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSubmit={handleSubmitReview}
          onCancel={handleCancelForm}
          isLoading={submitting}
          existingReview={editingReview}
        />
      )}

      {/* Login Prompt */}
      {!user && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Share Your Experience
          </h3>
          <p className="text-gray-600 mb-4">
            Please log in to write a review for this product.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In to Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <ReviewList
        productId={productId}
        reviews={reviews}
        onVoteHelpful={handleVoteHelpful}
        currentUser={user}
      />
    </div>
  );
};

export default ReviewSection;