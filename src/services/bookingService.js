import { supabase } from '../lib/supabaseClient';

/**
 * Booking Service - Handles all booking-related database operations
 */

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        *,
        property:properties(id, name, location, city, country, stars, property_images(image_url, is_primary)),
        guest:profiles!bookings_guest_id_fkey(id, full_name, email, phone)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { data: null, error: error.message };
  }
};

// Fetch user bookings
export const fetchUserBookings = async (guestId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(
          id,
          name,
          location,
          city,
          country,
          stars,
          property_type,
          property_images(image_url, is_primary),
          property_amenities(amenity:amenities(name, icon))
        ),
        booking_addons(
          id,
          quantity,
          unit_price,
          total_price,
          addon:addons(name, description, icon)
        )
      `)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { data: null, error: error.message };
  }
};

// Fetch bookings for a property (for hosts)
export const fetchPropertyBookings = async (propertyId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guest:profiles!bookings_guest_id_fkey(id, full_name, email, phone, country),
        booking_addons(
          id,
          quantity,
          unit_price,
          total_price,
          addon:addons(name, description)
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching property bookings:', error);
    return { data: null, error: error.message };
  }
};

// Fetch all bookings for a host's properties
export const fetchHostBookings = async (hostId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties!inner(id, name, location, host_id, property_images(image_url, is_primary)),
        guest:profiles!bookings_guest_id_fkey(id, full_name, email, phone, country),
        booking_addons(
          id,
          quantity,
          total_price,
          addon:addons(name)
        )
      `)
      .eq('property.host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching host bookings:', error);
    return { data: null, error: error.message };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { data: null, error: error.message };
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { data: null, error: error.message };
  }
};

// Fetch single booking by ID
export const fetchBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(
          *,
          property_images(image_url, is_primary),
          property_amenities(amenity:amenities(name, icon)),
          host:profiles!properties_host_id_fkey(id, full_name, email, phone)
        ),
        guest:profiles!bookings_guest_id_fkey(id, full_name, email, phone, country),
        booking_addons(
          id,
          quantity,
          unit_price,
          total_price,
          addon:addons(name, description, icon)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { data: null, error: error.message };
  }
};

// Add addon to booking
export const addBookingAddon = async (bookingId, addonId, quantity = 1) => {
  try {
    // First fetch the addon to get its price
    const { data: addon, error: addonError } = await supabase
      .from('addons')
      .select('price')
      .eq('id', addonId)
      .single();

    if (addonError) throw addonError;

    const unitPrice = addon.price;
    const totalPrice = unitPrice * quantity;

    const { data, error } = await supabase
      .from('booking_addons')
      .insert([{
        booking_id: bookingId,
        addon_id: addonId,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding booking addon:', error);
    return { data: null, error: error.message };
  }
};

// Check if a property is available for a given date range
// Uses overlap logic: two ranges [ci, co) and [b_ci, b_co) overlap when
// NOT (co <= b_ci OR ci >= b_co)
export const checkPropertyAvailability = async (
  propertyId,
  requestedCheckIn,
  requestedCheckOut,
  requestedRooms = 1
) => {
  try {
    if (!propertyId || !requestedCheckIn || !requestedCheckOut) {
      throw new Error('Missing property or date range for availability check');
    }

    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, total_rooms')
      .eq('id', propertyId)
      .single();

    if (propError) throw propError;
    if (!property) throw new Error('Property not found');

    const { data: overlapping, error: overlapError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['confirmed', 'pending'])
      // NOT (co <= b_ci)
      .not('check_out_date', 'lte', requestedCheckIn)
      // AND NOT (ci >= b_co)
      .not('check_in_date', 'gte', requestedCheckOut);

    if (overlapError) throw overlapError;

    const roomsAlreadyBooked =
      overlapping?.reduce((sum, booking) => {
        // If a rooms_booked column exists, respect it; otherwise assume 1 room per booking
        const roomsBooked =
          typeof booking.rooms_booked === 'number' && booking.rooms_booked > 0
            ? booking.rooms_booked
            : 1;
        return sum + roomsBooked;
      }, 0) ?? 0;

    const totalRooms =
      typeof property.total_rooms === 'number' && property.total_rooms > 0
        ? property.total_rooms
        : null;

    const roomsAvailable =
      totalRooms !== null ? totalRooms - roomsAlreadyBooked : Infinity;

    const isAvailable = roomsAvailable >= requestedRooms;

    return {
      roomsAvailable,
      isAvailable,
      totalRooms,
      roomsAlreadyBooked,
      error: null
    };
  } catch (error) {
    console.error('Error checking property availability:', error);
    return {
      roomsAvailable: 0,
      isAvailable: false,
      totalRooms: null,
      roomsAlreadyBooked: 0,
      error: error.message || String(error)
    };
  }
};
