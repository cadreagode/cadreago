/**
 * Script to assign amenities to properties
 * Run this with: node scripts/assignAmenities.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function assignAmenitiesToProperties() {
  console.log('🚀 Starting amenity assignment...\n');

  // 1. Fetch all amenities
  const { data: amenities, error: amenitiesError } = await supabase
    .from('amenities')
    .select('*');

  if (amenitiesError) {
    console.error('❌ Error fetching amenities:', amenitiesError);
    return;
  }

  console.log(`✅ Found ${amenities.length} amenities:`, amenities.map(a => a.name).join(', '), '\n');

  // 2. Fetch all properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id, name');

  if (propertiesError) {
    console.error('❌ Error fetching properties:', propertiesError);
    return;
  }

  console.log(`✅ Found ${properties.length} properties\n`);

  // 3. Define common amenities to assign to each property
  const commonAmenityNames = ['WiFi', 'Air Conditioning', 'Parking', 'Room Service'];
  const commonAmenities = amenities.filter(a => commonAmenityNames.includes(a.name));

  // Additional amenities based on property type (you can customize this)
  const luxuryAmenityNames = ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar'];
  const luxuryAmenities = amenities.filter(a => luxuryAmenityNames.includes(a.name));

  // 4. Assign amenities to each property
  for (const property of properties) {
    console.log(`📍 Processing: ${property.name}`);

    // Assign common amenities to all properties
    const amenitiesToAssign = [...commonAmenities];

    // Randomly add some luxury amenities (50% chance each)
    luxuryAmenities.forEach(amenity => {
      if (Math.random() > 0.5) {
        amenitiesToAssign.push(amenity);
      }
    });

    // Create property_amenities records
    const propertyAmenities = amenitiesToAssign.map(amenity => ({
      property_id: property.id,
      amenity_id: amenity.id
    }));

    // Check if amenities already exist
    const { data: existing } = await supabase
      .from('property_amenities')
      .select('amenity_id')
      .eq('property_id', property.id);

    if (existing && existing.length > 0) {
      console.log(`  ⚠️  Property already has ${existing.length} amenities, skipping...`);
      continue;
    }

    // Insert amenities
    const { error: insertError } = await supabase
      .from('property_amenities')
      .insert(propertyAmenities);

    if (insertError) {
      console.error(`  ❌ Error assigning amenities to ${property.name}:`, insertError);
    } else {
      console.log(`  ✅ Assigned ${amenitiesToAssign.length} amenities: ${amenitiesToAssign.map(a => a.name).join(', ')}`);
    }
  }

  console.log('\n🎉 Amenity assignment complete!');
}

// Run the script
assignAmenitiesToProperties()
  .then(() => {
    console.log('\n✨ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
