import { supabase } from '../lib/supabaseClient';

/**
 * Favorite Service - Handles user favorites/wishlist operations
 */

// Add property to favorites
export const addToFavorites = async (guestId, propertyId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ guest_id: guestId, property_id: propertyId }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { data: null, error: error.message };
  }
};

// Remove property from favorites
export const removeFromFavorites = async (guestId, propertyId) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('guest_id', guestId)
      .eq('property_id', propertyId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { error: error.message };
  }
};

// Fetch user favorites
export const fetchUserFavorites = async (guestId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        property:properties(
          *,
          property_images(image_url, is_primary, display_order),
          property_amenities(amenity:amenities(name, icon)),
          host:profiles!properties_host_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { data: null, error: error.message };
  }
};

// Check if property is favorited
export const isFavorited = async (guestId, propertyId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('guest_id', guestId)
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { isFavorited: !!data, error: null };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { isFavorited: false, error: error.message };
  }
};
