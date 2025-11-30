# Quick Start Guide - Cadreago Supabase Integration

## Getting Started

### 1. Environment Setup

Make sure your `.env.local` file has the Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://bnmypoxnzpdhayffkyfm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Service Import Examples

```javascript
// Authentication
import { signIn, signUp, signOut, getCurrentUser } from './services/authService';

// Properties (Hotels)
import { fetchHotels, fetchHotelById } from './services/hotelService';

// Bookings
import { createBooking, fetchUserBookings } from './services/bookingService';

// Reviews
import { createReview, fetchPropertyReviews } from './services/reviewService';

// Favorites
import { addToFavorites, fetchUserFavorites } from './services/favoriteService';

// Payments
import { createPayment, fetchUserPayments } from './services/paymentService';

// Messages
import { sendMessage, fetchUserMessages } from './services/messageService';
```

## Common Usage Examples

### Authentication

```javascript
// Sign Up
const handleSignUp = async () => {
  const { data, error } = await signUp(
    'user@example.com',
    'password123',
    {
      full_name: 'John Doe',
      phone: '+1234567890',
      user_role: 'guest'
    }
  );
  
  if (error) {
    console.error('Sign up failed:', error);
  } else {
    console.log('User created:', data);
  }
};

// Sign In
const handleSignIn = async () => {
  const { data, error } = await signIn('user@example.com', 'password123');
  
  if (error) {
    console.error('Sign in failed:', error);
  } else {
    setUser(data.profile);
  }
};

// Get Current User
const loadUser = async () => {
  const { data, error } = await getCurrentUser();
  if (data) {
    setUser(data.profile);
  }
};
```

### Fetching Properties

```javascript
// Fetch all active properties
const loadProperties = async () => {
  const { data, error } = await fetchHotels();
  if (data) setProperties(data);
};

// Fetch with filters
const searchProperties = async () => {
  const { data, error } = await fetchHotels({
    destination: 'Miami',
    minPrice: 100,
    maxPrice: 500,
    rating: 7,
    type: 'hotel',
    ecoFriendly: true
  });
  if (data) setProperties(data);
};

// Fetch single property
const loadProperty = async (propertyId) => {
  const { data, error } = await fetchHotelById(propertyId);
  if (data) setProperty(data);
};
```

### Creating a Booking

```javascript
const handleBooking = async () => {
  const bookingData = {
    guest_id: user.id,
    property_id: property.id,
    check_in_date: '2025-03-12',
    check_out_date: '2025-03-15',
    num_adults: 2,
    num_children: 0,
    room_rate: 150.00,
    addons_total: 50.00,
    subtotal: 500.00,
    tax_amount: 60.00,
    total_amount: 560.00,
    is_for_self: true,
    trip_type: 'leisure'
  };
  
  const { data, error } = await createBooking(bookingData);
  
  if (error) {
    console.error('Booking failed:', error);
  } else {
    console.log('Booking created:', data.booking_ref);
  }
};
```

### Adding Add-ons to Booking

```javascript
const addAddonToBooking = async (bookingId, addonId) => {
  const { data, error } = await addBookingAddon(bookingId, addonId, 1);
  
  if (error) {
    console.error('Failed to add addon:', error);
  } else {
    console.log('Addon added:', data);
  }
};
```

### Creating Reviews

```javascript
const submitReview = async () => {
  const reviewData = {
    property_id: property.id,
    booking_id: booking.id,
    guest_id: user.id,
    rating: 8.5,
    positive_comment: 'Great location and friendly staff!',
    negative_comment: 'WiFi could be faster'
  };
  
  const reviewScores = {
    cleanliness: 9.0,
    location: 9.5,
    transfers: 7.5,
    facilities: 8.0,
    staff: 9.0,
    accessibility: 8.5,
    comfort: 8.5,
    wifi: 6.5,
    food_drinks: 8.0
  };
  
  const { data, error } = await createReview(reviewData, reviewScores);
  
  if (error) {
    console.error('Review submission failed:', error);
  } else {
    console.log('Review submitted:', data);
  }
};
```

### Managing Favorites

```javascript
// Add to favorites
const handleAddFavorite = async (propertyId) => {
  const { data, error } = await addToFavorites(user.id, propertyId);
  
  if (error) {
    console.error('Failed to add favorite:', error);
  } else {
    console.log('Added to favorites');
  }
};

// Remove from favorites
const handleRemoveFavorite = async (propertyId) => {
  const { error } = await removeFromFavorites(user.id, propertyId);
  
  if (error) {
    console.error('Failed to remove favorite:', error);
  }
};

// Fetch favorites
const loadFavorites = async () => {
  const { data, error } = await fetchUserFavorites(user.id);
  if (data) setFavorites(data);
};
```

### Processing Payments

```javascript
const processPayment = async (bookingId) => {
  const paymentData = {
    booking_id: bookingId,
    guest_id: user.id,
    amount: 560.00,
    payment_method: 'card',
    payment_gateway: 'stripe',
    transaction_id: 'txn_123456789',
    status: 'completed'
  };
  
  const { data, error } = await createPayment(paymentData);
  
  if (error) {
    console.error('Payment failed:', error);
  } else {
    console.log('Payment processed:', data);
  }
};
```

### Messaging

```javascript
// Send message to host
const contactHost = async (hostId, propertyId) => {
  const messageData = {
    sender_id: user.id,
    recipient_id: hostId,
    property_id: propertyId,
    subject: 'Question about property',
    message: 'Is parking available?'
  };
  
  const { data, error } = await sendMessage(messageData);
  
  if (error) {
    console.error('Failed to send message:', error);
  } else {
    console.log('Message sent:', data);
  }
};

// Fetch messages
const loadMessages = async () => {
  const { data, error } = await fetchUserMessages(user.id);
  if (data) setMessages(data);
};

// Get unread count
const checkUnread = async () => {
  const { count, error } = await getUnreadCount(user.id);
  if (count) setUnreadCount(count);
};
```

## React Component Integration Example

```javascript
import React, { useState, useEffect } from 'react';
import { fetchHotels } from '../services/hotelService';
import { getCurrentUser } from '../services/authService';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load current user
    const { data: userData } = await getCurrentUser();
    if (userData) setUser(userData.profile);
    
    // Load properties
    const { data: propertiesData, error } = await fetchHotels({
      destination: 'Miami'
    });
    
    if (error) {
      console.error('Error loading properties:', error);
    } else {
      setProperties(propertiesData);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {properties.map(property => (
        <div key={property.id}>
          <h3>{property.name}</h3>
          <p>{property.location}</p>
          <p>Rating: {property.rating}/10</p>
          <p>Price: ${property.base_price_per_night}/night</p>
        </div>
      ))}
    </div>
  );
}
```

## Data Structure Examples

### Property Object
```javascript
{
  id: "uuid",
  name: "Luxury Beach Resort",
  description: "Beautiful beachfront property",
  property_type: "resort",
  location: "Miami Beach",
  city: "Miami",
  country: "USA",
  latitude: 25.7617,
  longitude: -80.1918,
  base_price_per_night: 250.00,
  rating: 8.5,
  total_reviews: 120,
  status: "active",
  eco_friendly: true,
  free_cancellation: true,
  property_images: [
    { image_url: "...", is_primary: true }
  ],
  property_amenities: [
    { amenity: { name: "WiFi", icon: "📶" } }
  ],
  host: {
    full_name: "John Doe",
    avatar_url: "..."
  }
}
```

### Booking Object
```javascript
{
  id: "uuid",
  booking_ref: "CAD123456",
  check_in_date: "2025-03-12",
  check_out_date: "2025-03-15",
  total_nights: 3,
  num_adults: 2,
  num_children: 0,
  total_amount: 560.00,
  status: "confirmed",
  property: {
    name: "Luxury Beach Resort",
    location: "Miami Beach"
  }
}
```

## Error Handling Pattern

```javascript
const handleOperation = async () => {
  const { data, error } = await someServiceFunction();
  
  if (error) {
    // Show error to user
    setErrorMessage(error);
    return;
  }
  
  // Success - use data
  setData(data);
};
```

## Important Notes

1. **Authentication Required**: Many operations require an authenticated user
2. **RLS Policies**: Database enforces row-level security
3. **Auto-generated Fields**: `booking_ref`, `created_at`, `updated_at` are auto-generated
4. **Consistent Response**: All functions return `{ data, error }`
5. **Null Checks**: Always check if `error` is null before using `data`

## Next Steps

1. Replace mock data in your components with Supabase calls
2. Add loading states
3. Implement error handling
4. Add authentication flows
5. Test with real data

For more details, see [SUPABASE_SERVICE_INTEGRATION.md](./SUPABASE_SERVICE_INTEGRATION.md)
