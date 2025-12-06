import { supabase } from '../lib/supabaseClient';

/**
 * Booking Service - Handles all booking-related database operations
 */

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    // Ensure guest profile exists to avoid FK constraint violations when
    // auth user exists but no `profiles` row was created (e.g., created via admin or OAuth flows).
    if (bookingData && bookingData.guest_id) {
      try {
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', bookingData.guest_id)
          .maybeSingle();

        if (profileCheckError) {
          console.error('Error checking for existing profile before booking:', profileCheckError);
        }

        if (!existingProfile) {
          // Try to populate minimal profile information from the current auth user
          try {
            const { data: { user } = {} } = await supabase.auth.getUser();
            const email = user?.email || null;
            const full_name = user?.user_metadata?.full_name || null;

            const { data: createdProfile, error: createProfileError } = await supabase
              .from('profiles')
              .insert([{ id: bookingData.guest_id, email, full_name }])
              .select()
              .single();

            if (createProfileError) {
              console.error('Failed to create missing profile for booking guest_id:', createProfileError);
            } else {
              console.log('Created missing profile for guest_id before booking:', bookingData.guest_id);
            }
          } catch (innerErr) {
            console.error('Unexpected error while creating missing profile:', innerErr);
          }
        }
      } catch (err) {
        console.error('Error during profile existence check for booking:', err);
      }
    }

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
        ),
        payments(
          id,
          amount,
          currency,
          status,
          payment_gateway,
          transaction_id,
          created_at
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

    // Fetch overlapping bookings and include related payments so we can
    // only count bookings that are either confirmed by the host, have a
    // completed payment, or are a recent 'hold' (created within HOLD_WINDOW_MINUTES).
    const { data: overlapping, error: overlapError } = await supabase
      .from('bookings')
      .select(`*, payments(id, status)`)
      .eq('property_id', propertyId)
      // NOT (co <= b_ci)
      .not('check_out_date', 'lte', requestedCheckIn)
      // AND NOT (ci >= b_co)
      .not('check_in_date', 'gte', requestedCheckOut);

    if (overlapError) throw overlapError;

    // Only count bookings that are confirmed OR have at least one completed payment
    // OR are pending but recently created (temporary hold)
    const HOLD_WINDOW_MINUTES = 5;
    const roomsAlreadyBooked =
      overlapping?.reduce((sum, booking) => {
        const hasCompletedPayment = Array.isArray(booking.payments)
          ? booking.payments.some((p) => String(p.status).toLowerCase() === 'completed')
          : false;
        const createdAt = booking.created_at ? new Date(booking.created_at) : null;
        const now = new Date();
        const isRecentHold =
          booking.status === 'pending' && createdAt && (now - createdAt) <= HOLD_WINDOW_MINUTES * 60 * 1000;

        const shouldCount = booking.status === 'confirmed' || hasCompletedPayment || isRecentHold;
        if (!shouldCount) return sum;

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

// Returns an array of blocked date ranges for a property where bookings
// should prevent new reservations. Each item is { check_in_date, check_out_date }
export const fetchBlockedDateRanges = async (propertyId) => {
  try {
    if (!propertyId) throw new Error('Missing propertyId');
    // Try to use a privacy-friendly view first. Projects that enforce strict
    // RLS for bookings expose `guest_bookings_view` which returns only the
    // current user's bookings (or otherwise enforces privacy). This lets the
    // frontend block dates only for the signed-in user's own bookings while
    // respecting privacy.
    // If the view isn't available or returns an error, fall back to the
    // `bookings` table (used by hosts/admins or in setups without the view).

    const HOLD_WINDOW_MINUTES = 5;
    const now = new Date();

    // Attempt view first
    let rows = null;
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('guest_bookings_view')
        .select('check_in_date, check_out_date, status, created_at, payment_status, property_id')
        .eq('property_id', propertyId)
        .order('check_in_date', { ascending: true });

      if (!viewError && Array.isArray(viewData)) {
        rows = viewData;
      }
    } catch (e) {
      // ignore - we'll try fallback below
      console.warn('guest_bookings_view not available or query failed, falling back to bookings table:', e?.message || e);
    }

    // Fallback to bookings table if view query didn't return rows
    if (!rows) {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`check_in_date, check_out_date, status, created_at, payments(id, status), property_id`)
        .eq('property_id', propertyId)
        .order('check_in_date', { ascending: true });

      if (bookingsError) throw bookingsError;
      rows = bookingsData || [];
    }

    // Normalize detection of completed payment: the view exposes `payment_status`
    // as a top-level column (string), while the bookings join exposes payments array.
    const ranges = (rows || []).filter((b) => {
      const hasCompletedPayment = b.payment_status
        ? String(b.payment_status).toLowerCase() === 'completed'
        : Array.isArray(b.payments)
        ? b.payments.some((p) => String(p.status).toLowerCase() === 'completed')
        : false;

      const createdAt = b.created_at ? new Date(b.created_at) : null;
      const isRecentHold = b.status === 'pending' && createdAt && (now - createdAt) <= HOLD_WINDOW_MINUTES * 60 * 1000;

      return b.status === 'confirmed' || hasCompletedPayment || isRecentHold;
    }).map((b) => ({ check_in_date: b.check_in_date, check_out_date: b.check_out_date }));

    return { data: ranges, error: null };
  } catch (error) {
    console.error('Error fetching blocked date ranges:', error);
    return { data: [], error: error.message || String(error) };
  }
};
