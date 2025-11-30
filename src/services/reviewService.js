import { supabase } from '../lib/supabaseClient';

/**
 * Review Service - Handles all review-related database operations
 */

// Create a new review with detailed scores
export const createReview = async (reviewData, reviewScores = null) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select(`
        *,
        guest:profiles!reviews_guest_id_fkey(id, full_name, avatar_url),
        property:properties(id, name)
      `)
      .single();

    if (error) throw error;

    // Add review scores if provided
    if (data && reviewScores) {
      const { error: scoresError } = await supabase
        .from('review_scores')
        .insert([{
          review_id: data.id,
          ...reviewScores
        }]);

      if (scoresError) {
        console.error('Error adding review scores:', scoresError);
      }
    }

    // Note: Property rating is automatically updated by database trigger

    return { data, error: null };
  } catch (error) {
    console.error('Error creating review:', error);
    return { data: null, error: error.message };
  }
};

// Fetch reviews for a property
export const fetchPropertyReviews = async (propertyId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        guest:profiles!reviews_guest_id_fkey(id, full_name, avatar_url, country),
        review_scores(
          cleanliness,
          location,
          transfers,
          facilities,
          staff,
          accessibility,
          comfort,
          wifi,
          food_drinks
        )
      `)
      .eq('property_id', propertyId)
      .order('review_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    return { data: null, error: error.message };
  }
};

// Fetch reviews by guest
export const fetchUserReviews = async (guestId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        property:properties(id, name, location, city, property_images(image_url, is_primary)),
        review_scores(
          cleanliness,
          location,
          transfers,
          facilities,
          staff,
          accessibility,
          comfort,
          wifi,
          food_drinks
        )
      `)
      .eq('guest_id', guestId)
      .order('review_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching guest reviews:', error);
    return { data: null, error: error.message };
  }
};

// Update a review
export const updateReview = async (reviewId, updates, reviewScores = null) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    // Update review scores if provided
    if (data && reviewScores) {
      const { error: scoresError } = await supabase
        .from('review_scores')
        .update(reviewScores)
        .eq('review_id', reviewId);

      if (scoresError) {
        console.error('Error updating review scores:', scoresError);
      }
    }

    // Note: Property rating is automatically updated by database trigger

    return { data, error: null };
  } catch (error) {
    console.error('Error updating review:', error);
    return { data: null, error: error.message };
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Note: Property rating is automatically updated by database trigger
    // Review scores are automatically deleted due to CASCADE

    return { error: null };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { error: error.message };
  }
};

// Fetch review by booking ID
export const fetchReviewByBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        review_scores(*)
      `)
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching review by booking:', error);
    return { data: null, error: error.message };
  }
};
