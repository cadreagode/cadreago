import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';

/**
 * Temporary utility component to bulk assign amenities to all properties
 *
 * Usage: Import and render this component in your app temporarily,
 * click the button to assign amenities, then remove it.
 *
 * Example:
 * import BulkAssignAmenities from './utils/BulkAssignAmenities';
 *
 * Then in your component:
 * <BulkAssignAmenities />
 */
export default function BulkAssignAmenities() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);

  const addLog = (message) => {
    setLog(prev => [...prev, message]);
    console.log(message);
  };

  const assignAmenities = async () => {
    setLoading(true);
    setLog([]);
    addLog('🚀 Starting amenity assignment...');

    try {
      // 1. Fetch all amenities
      const { data: amenities, error: amenitiesError } = await supabase
        .from('amenities')
        .select('*');

      if (amenitiesError) throw amenitiesError;

      addLog(`✅ Found ${amenities.length} amenities`);

      // 2. Fetch all properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name');

      if (propertiesError) throw propertiesError;

      addLog(`✅ Found ${properties.length} properties`);

      // 3. Common amenities for all properties
      const commonAmenityNames = ['WiFi', 'Air Conditioning', 'Parking'];
      const commonAmenities = amenities.filter(a => commonAmenityNames.includes(a.name));

      // Luxury amenities (randomly assigned)
      const luxuryAmenityNames = ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service'];
      const luxuryAmenities = amenities.filter(a => luxuryAmenityNames.includes(a.name));

      let totalAssigned = 0;
      let totalSkipped = 0;

      // 4. Process each property
      for (const property of properties) {
        // Check if property already has amenities
        const { data: existing } = await supabase
          .from('property_amenities')
          .select('amenity_id')
          .eq('property_id', property.id);

        if (existing && existing.length > 0) {
          addLog(`⚠️  ${property.name} already has ${existing.length} amenities - skipped`);
          totalSkipped++;
          continue;
        }

        // Build amenities list
        const amenitiesToAssign = [...commonAmenities];

        // Add 3-4 random luxury amenities
        const shuffled = luxuryAmenities.sort(() => 0.5 - Math.random());
        const selectedLuxury = shuffled.slice(0, Math.floor(Math.random() * 2) + 3);
        amenitiesToAssign.push(...selectedLuxury);

        // Create property_amenities records
        const propertyAmenities = amenitiesToAssign.map(amenity => ({
          property_id: property.id,
          amenity_id: amenity.id
        }));

        // Insert
        const { error: insertError } = await supabase
          .from('property_amenities')
          .insert(propertyAmenities);

        if (insertError) {
          addLog(`❌ Error for ${property.name}: ${insertError.message}`);
        } else {
          addLog(`✅ ${property.name}: ${amenitiesToAssign.map(a => a.name).join(', ')}`);
          totalAssigned++;
        }
      }

      addLog(`\n🎉 Complete! ${totalAssigned} properties updated, ${totalSkipped} skipped`);
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-md z-50 border-2 border-blue-500">
      <h3 className="font-bold text-lg mb-2">🛠️ Bulk Assign Amenities</h3>
      <p className="text-sm text-gray-600 mb-3">
        This will assign common amenities to all properties that don't have any.
      </p>

      <Button
        onClick={assignAmenities}
        disabled={loading}
        className="w-full mb-3"
      >
        {loading ? 'Processing...' : 'Assign Amenities to All Properties'}
      </Button>

      {log.length > 0 && (
        <div className="bg-gray-50 rounded p-2 max-h-60 overflow-y-auto text-xs font-mono">
          {log.map((line, idx) => (
            <div key={idx} className="mb-1">{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
