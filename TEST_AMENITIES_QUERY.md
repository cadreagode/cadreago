# Test Amenities Query

## Issue Found
The Supabase query is returning empty arrays for `property_amenities`:
```
Raw property_amenities for UrbanNest Executive Suites : Array(0)
```

This means the data is being blocked by Row Level Security (RLS) policies.

## Solution: Add RLS Policy for SELECT on property_amenities

### Step 1: Check if RLS is enabled

Go to **Supabase Dashboard → Database → Tables → property_amenities → Settings**

Check if "Enable RLS" is toggled ON. If it is, you need to add SELECT policies.

### Step 2: Add SELECT Policy

Go to **Supabase Dashboard → Authentication → Policies** and select the `property_amenities` table.

Add this policy:

```sql
-- Policy: Anyone can view property amenities (public read access)
CREATE POLICY "Anyone can view property amenities"
ON property_amenities
FOR SELECT
TO public
USING (true);
```

### Alternative: Disable RLS temporarily (NOT recommended for production)

If you just want to test quickly:

Go to **Supabase Dashboard → Database → Tables → property_amenities → Settings**
Toggle OFF "Enable Row Level Security (RLS)"

⚠️ **Warning:** This removes all security! Only use for testing.

## Verify the Fix

After adding the SELECT policy, refresh your app and check the console. You should see:

```
Raw property_amenities for UrbanNest Executive Suites : Array(7)
Processing amenity: {amenity_id: "...", amenities: {id: "...", name: "WiFi", ...}}
Transformed amenities: ["WiFi", "Parking", "Air Conditioning", ...]
```

And the amenity icons should appear on the property cards!

## Quick SQL Check

To verify data exists in the table, run this in Supabase SQL Editor:

```sql
-- Check if data exists (bypasses RLS)
SELECT
  p.name as property_name,
  a.name as amenity_name
FROM property_amenities pa
JOIN properties p ON pa.property_id = p.id
JOIN amenities a ON pa.amenity_id = a.id
LIMIT 10;
```

This should show your amenity assignments if the data was inserted correctly.
