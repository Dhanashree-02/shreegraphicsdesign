import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ReviewList = ({ productId, reviews, onVoteHelpful, currentUser }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [sortedReviews, setSortedReviews] = useState([]);

  useEffect(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterBy !== 'all') {
      const rating = parseInt(filterBy);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Sort reviews
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
      default:
        break;
    }

    setSortedReviews(filtered);
  }, [reviews, sortBy, filterBy]);

  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
              </div>
              <span className="ml-2 text-lg font-semibold">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
              <span className="ml-1 text-gray-600">({totalReviews} reviews)</span>
            </div>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center text-sm">
                  <span className="w-8">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current mx-1" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <span className="text-sm text-gray-600">
          Showing {sortedReviews.length} of {totalReviews} reviews
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => {
          const isExpanded = expandedReviews.has(review._id);
          const shouldTruncate = review.comment && review.comment.length > 300;
          const displayComment = shouldTruncate && !isExpanded 
            ? review.comment.substring(0, 300) + '...' 
            : review.comment;

          return (
            <div key={review._id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold">{review.user?.name || 'Anonymous'}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {review.title && (
                <h5 className="font-semibold mb-2">{review.title}</h5>
              )}

              {review.comment && (
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{displayComment}</p>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpanded(review._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {review.images && review.images.length > 0 && (
                <div className="mb-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => onVoteHelpful && onVoteHelpful(review._id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  disabled={!currentUser}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">
                    Helpful ({review.helpfulVotes || 0})
                  </span>
                </button>

                {review.adminResponse && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4 rounded">
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-semibold text-blue-800">Store Response</span>
                    </div>
                    <p className="text-sm text-blue-700">{review.adminResponse}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;