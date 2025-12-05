# Fix Row Level Security (RLS) for property_amenities

## Problem
You're getting this error:
```
❌ Error: new row violates row-level security policy for table "property_amenities"
```

This means Supabase RLS is blocking inserts to the `property_amenities` table.

## Solution: Add RLS Policies in Supabase

### Option 1: Quick Fix - Temporarily Disable RLS (Not Recommended for Production)

Go to **Supabase Dashboard → Table Editor → property_amenities → Settings** and toggle off RLS.

⚠️ **Warning:** This removes all security! Only do this temporarily for testing.

### Option 2: Proper Fix - Add RLS Policies (Recommended)

Go to **Supabase Dashboard → Authentication → Policies**, select `property_amenities` table, and add these policies:

#### 1. Allow Property Owners to Insert Amenities

```sql
-- Policy: Property owners can add amenities to their properties
CREATE POLICY "Owners can insert property amenities"
ON property_amenities
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = property_amenities.property_id
    AND properties.host_id = auth.uid()
  )
);
```

#### 2. Allow Anyone to Read Property Amenities

```sql
-- Policy: Anyone can view property amenities
CREATE POLICY "Anyone can view property amenities"
ON property_amenities
FOR SELECT
TO public
USING (true);
```

#### 3. Allow Property Owners to Delete Amenities

```sql
-- Policy: Property owners can delete amenities from their properties
CREATE POLICY "Owners can delete property amenities"
ON property_amenities
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = property_amenities.property_id
    AND properties.host_id = auth.uid()
  )
);
```

### Option 3: If You Want to Use the Bulk Assignment Tool

If you want to use the BulkAssignAmenities tool, you need to either:

**A) Use Service Role Key (Bypasses RLS)**
- Change the utility to use `SUPABASE_SERVICE_ROLE_KEY` instead of anon key
- ⚠️ Only do this server-side, never expose service role key to client

**B) Run SQL Directly in Supabase**

Instead of using the BulkAssignAmenities component, run this SQL in Supabase SQL Editor:

```sql
-- This assigns WiFi, Parking, and Air Conditioning to all properties
INSERT INTO property_amenities (property_id, amenity_id)
SELECT
  p.id as property_id,
  a.id as amenity_id
FROM properties p
CROSS JOIN amenities a
WHERE a.name IN ('WiFi', 'Parking', 'Air Conditioning')
AND NOT EXISTS (
  SELECT 1 FROM property_amenities pa
  WHERE pa.property_id = p.id
  AND pa.amenity_id = a.id
)
ON CONFLICT DO NOTHING;

-- This assigns random luxury amenities (Pool, Spa, Gym, Restaurant)
-- You can run this multiple times to add different combinations
INSERT INTO property_amenities (property_id, amenity_id)
SELECT
  p.id as property_id,
  a.id as amenity_id
FROM properties p
CROSS JOIN amenities a
WHERE a.name IN ('Pool', 'Spa', 'Gym', 'Restaurant', 'Bar')
AND random() > 0.5  -- 50% chance for each amenity
AND NOT EXISTS (
  SELECT 1 FROM property_amenities pa
  WHERE pa.property_id = p.id
  AND pa.amenity_id = a.id
)
ON CONFLICT DO NOTHING;
```

## Recommended Approach

1. **Add the RLS policies** (Option 2) - This is the secure way
2. **Use the Host Dashboard** to manually add amenities per property
3. **Or use SQL directly** (Option 3B) for bulk assignment

## To Use Host Dashboard Instead

Since you mentioned you have a form in the host dashboard:
1. Go to your Host Dashboard
2. Edit each property
3. Select amenities from the form
4. Save

This will work because it uses the authenticated user's credentials and respects RLS policies.
