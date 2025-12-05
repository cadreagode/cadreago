import { supabase } from '../lib/supabaseClient';

/**
 * Payment Service - Handles all payment-related database operations
 */

// Create a payment record
export const createPayment = async (paymentData) => {
  try {
    console.log('Creating payment with data:', paymentData);

    // When creating a payment, booking_id might be null initially
    // So we select just the basic fields without joins to avoid errors
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      throw error;
    }

    console.log('Payment created successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { data: null, error: error.message || error };
  }
};

// Fetch user payment history
export const fetchUserPayments = async (guestId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          id,
          booking_ref,
          check_in_date,
          check_out_date,
          total_nights,
          num_adults,
          num_children,
          property:properties(id, name, location, city, country, property_images(image_url, is_primary))
        )
      `)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { data: null, error: error.message };
  }
};

// Fetch payments for a host's properties
export const fetchHostPayments = async (hostId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings!inner(
          id,
          booking_ref,
          check_in_date,
          check_out_date,
          property:properties!inner(id, name, host_id),
          guest:profiles!bookings_guest_id_fkey(id, full_name, email)
        )
      `)
      .eq('booking.property.host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching host payments:', error);
    return { data: null, error: error.message };
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { data: null, error: error.message };
  }
};

// Fetch payment by ID
export const fetchPaymentById = async (paymentId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          *,
          property:properties(
            id,
            name,
            location,
            city,
            country,
            property_images(image_url, is_primary),
            host:profiles!properties_host_id_fkey(id, full_name, email, phone)
          ),
          guest:profiles!bookings_guest_id_fkey(id, full_name, email, phone)
        )
      `)
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return { data: null, error: error.message };
  }
};

// Fetch payments for a booking
export const fetchBookingPayments = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching booking payments:', error);
    return { data: null, error: error.message };
  }
};
