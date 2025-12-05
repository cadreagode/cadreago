# Database Structure Fix: Amenities

## Current Problem

You added `property_id` to the `amenities` table, which means:
- ❌ Each amenity (WiFi, Pool, etc.) can only belong to ONE property
- ❌ You'd need duplicate "WiFi" entries for each property
- ❌ Not scalable or maintainable

## Correct Structure (Many-to-Many Relationship)

### Option A: Use Proper Junction Table (Recommended)

```
┌─────────────┐         ┌────────────────────┐         ┌────────────┐
│ properties  │         │ property_amenities │         │ amenities  │
├─────────────┤         ├────────────────────┤         ├────────────┤
│ id (PK)     │────┬───>│ property_id (FK)   │         │ id (PK)    │
│ name        │    │    │ amenity_id (FK)    │<────────│ name       │
│ ...         │    │    └────────────────────┘         │ icon       │
└─────────────┘    │                                   │ category   │
                   │    ┌────────────────────┐         └────────────┘
                   └───>│ property_id        │
                        │ amenity_id         │
                        └────────────────────┘
```

This allows:
- ✅ Multiple properties can have the same amenity
- ✅ One property can have multiple amenities
- ✅ Easy to add/remove amenities
- ✅ Industry standard approach

### Option B: Use PostgreSQL Arrays (Alternative)

Store amenities as an array directly in the properties table:

```sql
ALTER TABLE properties
ADD COLUMN amenity_ids uuid[] DEFAULT '{}';
```

Then store like: `['wifi-id', 'pool-id', 'gym-id']`

## How to Fix Your Current Setup

### Step 1: Remove property_id from amenities table

```sql
-- In Supabase SQL Editor
ALTER TABLE amenities DROP COLUMN IF EXISTS property_id;
```

### Step 2: Ensure property_amenities junction table exists

```sql
-- Check if table exists, create if not
CREATE TABLE IF NOT EXISTS property_amenities (
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id uuid REFERENCES amenities(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (property_id, amenity_id)
);
```

### Step 3: Use the bulk assignment tool

Once the structure is fixed, use the BulkAssignAmenities component I created.

## SQL to Check Current State

```sql
-- Check amenities table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'amenities';

-- Check if property_amenities exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'property_amenities'
);

-- Count how many amenities are available
SELECT COUNT(*) as total_amenities FROM amenities;

-- Check if any properties have amenities assigned
SELECT COUNT(*) as total_assignments FROM property_amenities;
```
