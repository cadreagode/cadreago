# Supabase Service Integration - Cadreago Hotel Booking Platform

## Overview
All service files have been updated to match your Supabase database schema. The services now properly interface with the following tables:
- `properties` (formerly hotels)
- `profiles` (formerly users/hosts)
- `bookings`
- `payments`
- `reviews` & `review_scores`
- `favorites`
- `property_images`
- `property_amenities`
- `amenities`
- `addons`
- `booking_addons`
- `host_info`
- `property_services`
- `property_policies`

## Service Files Updated

### 1. hotelService.js → Property Service
**Location**: `src/services/hotelService.js`

**Key Functions**:
- `fetchHotels(filters)` - Fetches properties with comprehensive filtering
- `fetchHotelById(propertyId)` - Fetches single property with all relations
- `createHotel(propertyData)` - Creates new property
- `updateHotel(propertyId, updates)` - Updates property
- `deleteHotel(propertyId)` - Deletes property
- `fetchHotelsByHost(hostId)` - Fetches all properties for a host
- `addPropertyImage(propertyId, imageUrl, isPrimary)` - Adds image to property
- `addPropertyAmenity(propertyId, amenityId)` - Links amenity to property
- `fetchAmenities()` - Fetches all available amenities

**Key Changes**:
- Table: `hotels` → `properties`
- Field: `price` → `base_price_per_night`
- Field: `type` → `property_type`
- Added support for `property_images`, `property_amenities`, `addons`, `property_services`, `property_policies`
- Includes host information via `profiles` and `host_info` tables
- Added comprehensive filtering (destination, price, rating, type, eco-friendly, free cancellation)

### 2. bookingService.js
**Location**: `src/services/bookingService.js`

**Key Functions**:
- `createBooking(bookingData)` - Creates new booking
- `fetchUserBookings(guestId)` - Fetches guest's bookings
- `fetchPropertyBookings(propertyId)` - Fetches bookings for a property
- `fetchHostBookings(hostId)` - Fetches all bookings for host's properties
- `updateBookingStatus(bookingId, status)` - Updates booking status
- `cancelBooking(bookingId)` - Cancels a booking
- `fetchBookingById(bookingId)` - Fetches single booking
- `addBookingAddon(bookingId, addonId, quantity)` - Adds addon to booking

**Key Changes**:
- Field: `user_id` → `guest_id`
- Field: `hotel_id` → `property_id`
- Added support for `booking_addons` junction table
- Auto-generates `booking_ref` via database trigger (format: CAD######)
- Includes `total_nights` as computed column
- Supports add-ons with pricing calculation

### 3. authService.js (NEW)
**Location**: `src/services/authService.js`

**Key Functions**:
- `signUp(email, password, userData)` - Creates user account and profile
- `signIn(email, password)` - Authenticates user
- `signOut()` - Signs out user
- `getCurrentUser()` - Gets current authenticated user
- `updateProfile(userId, updates)` - Updates user profile
- `fetchProfileById(userId)` - Fetches user profile
- `updateHostInfo(hostId, hostInfoData)` - Updates/creates host information
- `onAuthStateChange(callback)` - Listens to auth state changes

**Key Features**:
- Uses Supabase Auth for authentication
- Automatically creates profile in `profiles` table on signup
- Supports user roles: 'guest', 'host', 'admin'
- Integrates with `host_info` table for host-specific data

### 4. reviewService.js
**Location**: `src/services/reviewService.js`

**Key Functions**:
- `createReview(reviewData, reviewScores)` - Creates review with detailed scores
- `fetchPropertyReviews(propertyId)` - Fetches all reviews for property
- `fetchUserReviews(guestId)` - Fetches guest's reviews
- `updateReview(reviewId, updates, reviewScores)` - Updates review
- `deleteReview(reviewId)` - Deletes review
- `fetchReviewByBooking(bookingId)` - Fetches review for specific booking

**Key Changes**:
- Field: `hotel_id` → `property_id`
- Field: `user_id` → `guest_id`
- Added support for `review_scores` table with detailed ratings:
  - cleanliness, location, transfers, facilities
  - staff, accessibility, comfort, wifi, food_drinks
- Rating automatically updates via database trigger
- Supports both positive and negative comments
- Rating scale: 0-10 (2 decimal places)

### 5. favoriteService.js
**Location**: `src/services/favoriteService.js`

**Key Functions**:
- `addToFavorites(guestId, propertyId)` - Adds property to favorites
- `removeFromFavorites(guestId, propertyId)` - Removes from favorites
- `fetchUserFavorites(guestId)` - Fetches user's favorite properties
- `isFavorited(guestId, propertyId)` - Checks if property is favorited

**Key Changes**:
- Field: `user_id` → `guest_id`
- Field: `hotel_id` → `property_id`
- Returns complete property details including images and amenities

### 6. paymentService.js
**Location**: `src/services/paymentService.js`

**Key Functions**:
- `createPayment(paymentData)` - Creates payment record
- `fetchUserPayments(guestId)` - Fetches guest's payment history
- `fetchHostPayments(hostId)` - Fetches payments for host's properties
- `updatePaymentStatus(paymentId, status)` - Updates payment status
- `fetchPaymentById(paymentId)` - Fetches single payment
- `fetchBookingPayments(bookingId)` - Fetches payments for a booking

**Key Changes**:
- Field: `user_id` → `guest_id`
- Added `fetchHostPayments()` for host earnings
- Payment statuses: 'pending', 'completed', 'failed', 'refunded'
- Links to booking and property information

## Database Schema Highlights

### Key Tables and Relationships

**profiles** (main user table)
- Links to Supabase Auth `auth.users`
- Fields: id, email, full_name, avatar_url, phone, country, user_role
- Roles: 'guest', 'host', 'admin'

**properties**
- Host reference: `host_id` → `profiles.id`
- Status: 'active', 'pending', 'inactive', 'suspended'
- Types: 'hotel', 'resort', 'villa', 'guesthouse', 'apartment', 'farmstay', 'lodge'
- Auto-updated rating via triggers

**bookings**
- Auto-generated `booking_ref` (CAD######)
- Computed `total_nights` column
- Statuses: 'pending', 'confirmed', 'completed', 'cancelled'
- Supports trip_type, special_requests, guest details

**reviews**
- Rating scale: 0-10 (decimal)
- Linked to `review_scores` for detailed ratings
- Auto-updates property rating via trigger

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Users can view/update own profile
- **Properties**: 
  - Everyone can view active properties
  - Hosts can CRUD their own properties
- **Bookings**: 
  - Guests can view/create/update own bookings
  - Hosts can view/update bookings for their properties
- **Payments**: 
  - Guests can view own payments
  - Hosts can view payments for their property bookings
- **Reviews**: 
  - Everyone can view
  - Guests can create reviews for completed bookings
- **Favorites**: 
  - Guests can manage own favorites
- **Messages**: 
  - Users can view messages they sent/received

## Environment Configuration

**Required Environment Variables**:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Your configuration is already set in `.env.example`:
- URL: https://bnmypoxnzpdhayffkyfm.supabase.co
- Anon Key: Configured

## Database Triggers

The schema includes several automatic triggers:

1. **updated_at timestamps** - Auto-updated on:
   - profiles, properties, addons, bookings, payments, reviews, host_info, property_policies

2. **booking_ref generation** - Auto-generates booking reference on insert

3. **Property rating updates** - Automatically recalculates when reviews added/updated

## Next Steps

1. **Test the Integration**:
   - Create a test user account
   - Add sample properties
   - Create test bookings
   - Add reviews and favorites

2. **Update Component**:
   - Update `CadreagoHotelBooking.jsx` to use the new service functions
   - Replace mock data with actual Supabase queries
   - Handle loading and error states

3. **Add Authentication**:
   - Implement sign-up/sign-in flows
   - Add session management
   - Protect authenticated routes

4. **Seed Data** (Optional):
   - Add sample amenities (already seeded in schema)
   - Create demo properties
   - Add sample reviews

## Important Notes

- All services return consistent response format: `{ data, error }`
- Database automatically handles timestamps via triggers
- Booking references are auto-generated (CAD######)
- Property ratings auto-update when reviews change
- RLS policies ensure data security
- All foreign key relationships have CASCADE delete where appropriate

## Error Handling

All service functions include try-catch blocks and return errors in a consistent format:
```javascript
{
  data: null,
  error: "Error message string"
}
```

Success responses:
```javascript
{
  data: {...},
  error: null
}
```

## Support

For Supabase documentation:
- Docs: https://supabase.com/docs
- API Reference: https://supabase.com/docs/reference/javascript
- Database Functions: https://supabase.com/docs/guides/database/functions
