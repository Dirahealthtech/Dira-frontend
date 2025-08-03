import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Edit, 
  Trash2, 
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../auth/api';
import { useAuth } from '../auth/AuthContext';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, sortBy, sortOrder, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/reviews/product/${productId}`, {
        params: {
          skip: page * 10,
          limit: 10,
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
      
      setReviews(response.data.items || []);
      setReviewStats({
        total: response.data.total,
        averageRating: response.data.average_rating,
        ratingBreakdown: response.data.rating_breakdown
      });
      setTotalPages(response.data.pages || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to write a review');
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      await api.post('/api/v1/reviews', {
        ...formData,
        product_id: parseInt(productId)
      });

      toast.success('Review added successfully!');
      setShowAddModal(false);
      setFormData({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      await api.put(`/api/v1/reviews/${selectedReview.id}`, formData);
      toast.success('Review updated successfully!');
      setShowEditModal(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/v1/reviews/${selectedReview.id}`);
      toast.success('Review deleted successfully!');
      setShowDeleteModal(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteReview = async (reviewId, isHelpful) => {
    if (!user) {
      toast.error('Please log in to vote on reviews');
      return;
    }

    try {
      await api.post(`/api/v1/reviews/${reviewId}/vote`, {
        is_helpful: isHelpful
      });
      
      toast.success('Thank you for your feedback!');
      fetchReviews();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        const errors = {};
        error.response.data.detail.forEach(err => {
          const field = err.loc[err.loc.length - 1];
          errors[field] = err.msg;
        });
        setFormErrors(errors);
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.response.data.detail);
      }
    } else {
      toast.error('An error occurred. Please try again.');
    }
  };

  const openEditModal = (review) => {
    setSelectedReview(review);
    setFormData({
      rating: review.rating,
      comment: review.comment
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const renderStars = (rating, interactive = false, size = 'h-5 w-5') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setFormData(prev => ({ ...prev, rating: star })) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sortOptions = [
    { value: 'created_at_desc', label: 'Newest First', sort_by: 'created_at', sort_order: 'desc' },
    { value: 'created_at_asc', label: 'Oldest First', sort_by: 'created_at', sort_order: 'asc' },
    { value: 'rating_desc', label: 'Highest Rated', sort_by: 'rating', sort_order: 'desc' },
    { value: 'rating_asc', label: 'Lowest Rated', sort_by: 'rating', sort_order: 'asc' },
    { value: 'helpful_votes_desc', label: 'Most Helpful', sort_by: 'helpful_votes', sort_order: 'desc' }
  ];

  const currentSortOption = sortOptions.find(option => 
    option.sort_by === sortBy && option.sort_order === sortOrder
  ) || sortOptions[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          {reviewStats && (
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                {renderStars(Math.round(reviewStats.averageRating))}
                <span className="text-lg font-semibold text-gray-900">
                  {reviewStats.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-600">
                  ({reviewStats.total} {reviewStats.total === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">{currentSortOption.label}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.sort_by);
                      setSortOrder(option.sort_order);
                      setPage(0);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      option.value === `${sortBy}_${sortOrder}` ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Button */}
          <button
            onClick={() => {
              if (!user) {
                toast.error('Please log in to write a review');
                return;
              }
              setFormData({ rating: 5, comment: '' });
              setFormErrors({});
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Write Review</span>
          </button>
        </div>
      </div>

      {/* Rating Breakdown */}
      {reviewStats?.ratingBreakdown && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewStats.ratingBreakdown[rating] || 0;
              const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to review this product</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.first_name} {review.user?.last_name}
                      </h4>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      {renderStars(review.rating)}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User's own review actions */}
                {user && user.id === review.user_id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(review)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              {/* Helpful votes */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVoteReview(review.id, true)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful</span>
                  </button>
                  <button
                    onClick={() => handleVoteReview(review.id, false)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Not Helpful</span>
                  </button>
                </div>
                {review.helpful_votes > 0 && (
                  <span className="text-sm text-gray-500">
                    {review.helpful_votes} {review.helpful_votes === 1 ? 'person found' : 'people found'} this helpful
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  {renderStars(formData.rating, true, 'h-8 w-8')}
                  {formErrors.rating && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your thoughts about this product..."
                  />
                  {formErrors.comment && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.comment}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Review</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  {renderStars(formData.rating, true, 'h-8 w-8')}
                  {formErrors.rating && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your thoughts about this product..."
                  />
                  {formErrors.comment && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.comment}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Updating...' : 'Update Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Review</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{selectedReview.comment}</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Deleting...' : 'Delete Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
};

export default ProductReviews;