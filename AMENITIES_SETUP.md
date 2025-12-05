# How to Assign Amenities to Properties

## Problem
Your properties don't have amenities assigned yet, so the amenity icons won't show on the property cards.

## Solution Options

### Option 1: Use the Bulk Assignment UI (Easiest)

1. **Temporarily add the component to your app:**

   Open `src/components/CadreagoHotelBooking.jsx` and add this import at the top:
   ```javascript
   import BulkAssignAmenities from '../utils/BulkAssignAmenities';
   ```

2. **Render it somewhere in your app:**

   Add this component anywhere in your JSX (it will appear as a fixed button in bottom-right):
   ```jsx
   <BulkAssignAmenities />
   ```

3. **Run the assignment:**
   - Open your app in the browser
   - Click the "Assign Amenities to All Properties" button
   - Wait for it to complete (you'll see a log of what it's doing)
   - Refresh the page to see amenities on property cards

4. **Remove the component:**
   - Once done, remove the import and component from your code

### Option 2: Manually Assign Through Host Dashboard

Use the host dashboard to edit each property and select amenities individually.

### Option 3: Direct Database Insert (Advanced)

If you have database access, you can insert directly into `property_amenities` table:

```sql
-- Example: Assign WiFi (amenity_id from amenities table) to a property
INSERT INTO property_amenities (property_id, amenity_id)
VALUES ('your-property-id', 'wifi-amenity-id');
```

## Database Structure

```
amenities (reference table)
├── id
├── name (WiFi, Pool, Gym, etc.)
├── icon
└── category

property_amenities (junction table)
├── property_id (FK to properties)
└── amenity_id (FK to amenities)
```

**Important:** Don't add `property_id` to the `amenities` table. Use the `property_amenities` junction table instead.

## What Amenities Will Be Assigned?

The bulk assignment tool assigns:
- **All properties get:** WiFi, Air Conditioning, Parking
- **Random luxury amenities (3-4 of):** Pool, Spa, Gym, Restaurant, Bar, Room Service

## Available Amenity Icons

The search results page will show icons for these amenities:
- WiFi / Internet → WiFi icon
- Parking / Car → Car icon
- Pool / Swimming → Waves icon
- Gym / Fitness → Dumbbell icon
- Breakfast / Coffee → Coffee icon
- Restaurant / Dining → Utensils icon
- Spa / Wellness → Sparkles icon
- Air Conditioning / AC → Wind icon
