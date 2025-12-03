import { supabase } from '../lib/supabaseClient';

/**
 * Property Service - Handles all property-related database operations
 */

// Transform Supabase property data to match component expectations
const transformPropertyData = (property) => {
  if (!property) return null;

  // Get primary image or first image
  const primaryImage = property.property_images?.find(img => img.is_primary);
  const firstImage = property.property_images?.[0];
  const image = primaryImage?.image_url || firstImage?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';

  // Transform amenities array
  const amenities = property.property_amenities?.map(pa => pa.amenity?.name).filter(Boolean) || [];

  // Transform coordinates
  const coordinates = property.latitude && property.longitude
    ? { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) }
    : null;

  // Flatten host_info from nested structure
  const host_info = property.host?.host_info?.[0] || property.host?.host_info || null;

  // Transform property_services array to services object
  const services = {};
  if (property.property_services && Array.isArray(property.property_services)) {
    property.property_services.forEach(service => {
      if (service.service_name) {
        services[service.service_name] = service.available || false;
      }
    });
  }

  // Calculate average review scores from reviews
  let reviewScores = {
    cleanliness: 0,
    location: 0,
    transfers: 0,
    facilities: 0,
    staff: 0,
    accessibility: 0,
    comfort: 0,
    wifi: 0,
    food_drinks: 0
  };

  // Transform reviews and calculate average scores
  const userReviews = [];
  if (property.reviews && Array.isArray(property.reviews)) {
    const scoreCounts = { ...reviewScores };
    const scoreKeys = Object.keys(reviewScores);

    property.reviews.forEach(review => {
      // Add to user reviews
      userReviews.push({
        id: review.id,
        rating: review.rating || 0,
        userName: review.guest?.full_name || 'Anonymous',
        userAvatar: review.guest?.avatar_url || null,
        date: review.review_date || new Date().toISOString(),
        review: review.positive_comment || '',
        negativeReview: review.negative_comment || '',
      });

      // Accumulate scores
      if (review.review_scores) {
        scoreKeys.forEach(key => {
          if (review.review_scores[key]) {
            reviewScores[key] += parseFloat(review.review_scores[key]);
            scoreCounts[key]++;
          }
        });
      }
    });

    // Calculate averages
    scoreKeys.forEach(key => {
      if (scoreCounts[key] > 0) {
        reviewScores[key] = (reviewScores[key] / scoreCounts[key]).toFixed(1);
      }
    });
  }

  // Ensure we have at least a few images for the gallery
  const imageUrls = property.property_images?.map(img => img.image_url) || [];
  const galleryImages = imageUrls.length > 0 ? imageUrls : [image];

  return {
    ...property,
    // Map database fields to component expectations
    image,
    images: galleryImages,
    price: parseFloat(property.base_price_per_night) || 0,
    currency: property.currency || 'INR', // Get currency from database
    amenities,
    coordinates,
    location: property.location || `${property.city || ''}, ${property.country || ''}`.trim(),
    stars: property.stars || 5,
    ratingText: property.total_reviews > 0 ? `${property.total_reviews} reviews` : 'No reviews yet',
    reviews: property.total_reviews || 0,
    reviewScores,
    userReviews,
    // Keep original fields for backward compatibility
    base_price_per_night: property.base_price_per_night,
    property_images: property.property_images,
    property_amenities: property.property_amenities,
    addons: property.addons || [],
    host_info: host_info,
    ecoFriendly: property.eco_friendly,
    freeCancellation: property.free_cancellation,
    limitedDeal: property.limited_deal || false,
    roomsLeft: property.rooms_left || 5,
    services: services,
  };
};

// Fetch all properties with optional filters
export const fetchHotels = async (filters = {}) => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        host:profiles!properties_host_id_fkey(
          id,
          full_name,
          avatar_url,
          email,
          host_info:host_info!host_info_host_id_fkey(member_since, response_rate, response_time, verified, languages)
        ),
        property_images(id, image_url, is_primary, display_order),
        property_amenities(amenity:amenities(id, name, icon, category)),
        addons(id, name, description, price, icon, per_person),
        property_services(*),
        property_policies(*)
      `)
      .eq('status', 'active');

    // Apply filters if provided
    if (filters.destination) {
      query = query.or(`location.ilike.%${filters.destination}%,city.ilike.%${filters.destination}%,country.ilike.%${filters.destination}%,name.ilike.%${filters.destination}%`);
    }

    if (filters.minPrice && filters.maxPrice) {
      query = query.gte('base_price_per_night', filters.minPrice).lte('base_price_per_night', filters.maxPrice);
    }

    if (filters.rating && filters.rating !== 'all') {
      query = query.gte('rating', parseFloat(filters.rating));
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('property_type', filters.type);
    }

    if (filters.ecoFriendly) {
      query = query.eq('eco_friendly', true);
    }

    if (filters.freeCancellation) {
      query = query.eq('free_cancellation', true);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;

    // Transform data to match component expectations
    const transformedData = data?.map(transformPropertyData) || [];

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { data: null, error: error.message };
  }
};

// Fetch a single property by ID
export const fetchHotelById = async (propertyId) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        host:profiles!properties_host_id_fkey(
          id,
          full_name,
          avatar_url,
          email,
          phone,
          country,
          host_info:host_info!host_info_host_id_fkey(member_since, response_rate, response_time, verified, languages, total_properties)
        ),
        property_images(id, image_url, is_primary, display_order),
        property_amenities(amenity:amenities(id, name, icon, category)),
        addons(id, name, description, price, icon, per_person),
        property_services(*),
        property_policies(*),
        reviews(
          id,
          rating,
          positive_comment,
          negative_comment,
          review_date,
          guest:profiles!reviews_guest_id_fkey(full_name, avatar_url),
          review_scores(cleanliness, location, transfers, facilities, staff, accessibility, comfort, wifi, food_drinks)
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) throw error;

    // Transform data to match component expectations
    const transformedData = transformPropertyData(data);

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching property:', error);
    return { data: null, error: error.message };
  }
};

// Create a new property (for hosts)
export const createHotel = async (propertyData) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating property:', error);
    return { data: null, error: error.message };
  }
};

// Update property information
export const updateHotel = async (propertyId, updates) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating property:', error);
    return { data: null, error: error.message };
  }
};

// Delete a property
export const deleteHotel = async (propertyId) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { error: error.message };
  }
};

// Fetch properties by host
export const fetchHotelsByHost = async (hostId) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(id, image_url, is_primary, display_order),
        property_amenities(amenity:amenities(id, name, icon))
      `)
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match component expectations
    const transformedData = data?.map(transformPropertyData) || [];

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching host properties:', error);
    return { data: null, error: error.message };
  }
};

// Add property image
export const addPropertyImage = async (propertyId, imageUrl, isPrimary = false) => {
  try {
    const { data, error } = await supabase
      .from('property_images')
      .insert([{ property_id: propertyId, image_url: imageUrl, is_primary: isPrimary }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding property image:', error);
    return { data: null, error: error.message };
  }
};

// Add amenity to property
export const addPropertyAmenity = async (propertyId, amenityId) => {
  try {
    const { data, error } = await supabase
      .from('property_amenities')
      .insert([{ property_id: propertyId, amenity_id: amenityId }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding property amenity:', error);
    return { data: null, error: error.message };
  }
};

// Fetch all amenities
export const fetchAmenities = async () => {
  try {
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return { data: null, error: error.message };
  }
};
