# Google Maps Integration - Setup and Troubleshooting

## Recent Fixes Applied

### 1. Google Maps API Loading (Fixed)
**Issue:** The map was not initializing properly due to incorrect library loading.

**Solution:** Updated [src/lib/loadGoogleMaps.js](src/lib/loadGoogleMaps.js) to:
- Use the new modular Google Maps API with `importLibrary()`
- Properly load both 'maps' and 'marker' libraries
- Attach loaded libraries to `window.google.maps` for component access
- Better error handling and logging

### 2. Advanced Markers Configuration (Fixed)
**Issue:** Console warnings about AdvancedMarkerElement not being available.

**Solution:** Updated [src/components/CadreagoHotelBooking.jsx](src/components/CadreagoHotelBooking.jsx:708-755) to:
- Remove the invalid demo Map ID
- Use legacy markers (which work without a Map ID)
- Added clear comments about AdvancedMarkerElement requirements

**Note:** To use AdvancedMarkerElement (the new marker system), you need:
1. A valid Map ID from Google Cloud Console
2. Map ID must be created in your Google Cloud project
3. Add `mapId: 'YOUR_MAP_ID'` to the map options

### 3. Auth Session Warnings (Fixed)
**Issue:** Console showing "AuthSessionMissingError" when not logged in.

**Solution:** Updated [src/services/authService.js](src/services/authService.js:91-136) to:
- Check for active session before calling `getUser()`
- Silently handle AuthSessionMissingError (expected when not logged in)
- Only log unexpected errors

## Current Configuration

### API Key Status
- Location: `.env.local`
- Variable: `REACT_APP_GOOGLE_MAPS_KEY`
- Status: ✅ Configured

### Map Features
- ✅ Map rendering
- ✅ Legacy markers (price markers on hotels)
- ✅ Zoom controls
- ✅ Click handlers
- ⚠️ AdvancedMarkerElement (requires Map ID - see below)

## How to Enable AdvancedMarkerElement (Recommended)

AdvancedMarkerElement is the new, more performant marker system from Google. The code is already set up to use it - you just need to create a Map ID and add it to your environment.

### Step 1: Create a Map ID in Google Cloud Console

1. **Go to Map Management:**
   - Visit [Google Cloud Console - Map Management](https://console.cloud.google.com/google/maps-apis/studio/maps)
   - Make sure you're in the same project as your API key

2. **Create a New Map ID:**
   - Click **"Create Map ID"** button
   - Fill in the form:
     - **Map Name:** `Cadreago Hotels Map` (or any name you prefer)
     - **Map Type:** Select **"JavaScript"**
     - **Description:** (optional) `Hotel booking map with custom price markers`
   - Click **"Save"**

3. **Copy Your Map ID:**
   - After creation, you'll see your Map ID (format: `abc123def456` or similar)
   - Copy this ID

### Step 2: Add Map ID to Your Environment

1. **Open `.env.local` file** in your project root
2. **Add this line:**
   ```bash
   REACT_APP_GOOGLE_MAPS_MAP_ID=your_map_id_here
   ```
3. **Replace `your_map_id_here`** with the Map ID you copied

Example `.env.local`:
```bash
REACT_APP_GOOGLE_MAPS_KEY=AIzaSyBOvO8-gKV7fCxv2mfV3nlD0orHU87xDX0
REACT_APP_GOOGLE_MAPS_MAP_ID=abc123def456
REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Rebuild and Test

```bash
# Rebuild the application
npm run build

# Start the dev server (or refresh if already running)
npm start
```

### Step 4: Verify It's Working

Open browser console and look for:
- ✅ **"✓ Using AdvancedMarkerElement (modern markers)"** - Success!
- ⚠️ **"ℹ Using legacy markers (no Map ID provided)"** - Map ID not configured
- ❌ **"⚠ AdvancedMarkerElement not available"** - Map ID may be invalid

### What You'll Get with AdvancedMarkerElement

✅ **Better Performance** - Optimized rendering for many markers
✅ **No Deprecation Warning** - Uses the modern API
✅ **Custom HTML Content** - Beautiful price markers (already implemented)
✅ **Better Mobile Performance** - Touch-optimized interactions
✅ **Future-Proof** - Google's recommended approach

## API Key Security

### Current Restrictions Recommended
Your API key should have these restrictions in Google Cloud Console:

1. **Application restrictions:**
   - HTTP referrers (websites)
   - Add your domains:
     - `localhost:3000/*` (development)
     - `yourdomain.com/*` (production)

2. **API restrictions:**
   - Restrict to: Maps JavaScript API
   - (Optional) Places API if you add location search

### How to Add Restrictions
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click "Edit"
4. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add allowed domains
5. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Maps JavaScript API"
6. Save

## Troubleshooting

### Map Not Showing
1. Check browser console for errors
2. Verify API key in `.env.local`
3. Check API key restrictions in Google Cloud Console
4. Ensure billing is enabled in Google Cloud

### CSP Errors (net::ERR_BLOCKED_BY_CLIENT)
This is usually caused by:
- Ad blockers blocking Google domains
- Browser extensions
- Network restrictions

**Solution:** Ask users to:
- Disable ad blocker for your site
- Whitelist `maps.googleapis.com` and `maps.gstatic.com`

### Markers Not Showing
1. Check if hotels have valid coordinates
2. Check browser console for marker errors
3. Verify map is loaded before adding markers

## Testing the Fix

1. Start the development server:
   ```bash
   npm start
   ```

2. Open browser console (F12)

3. Expected behavior:
   - ✅ No "AdvancedMarkerElement not available" warnings
   - ✅ No "AuthSessionMissingError" messages
   - ✅ Map loads and displays
   - ✅ Hotel markers appear on the map
   - ⚠️ "Marker is deprecated" warning (this is normal for legacy markers)

4. The deprecation warning is expected and harmless. Google will support legacy markers for at least 12 months.

## Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Advanced Markers Migration Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)
- [Map IDs Documentation](https://developers.google.com/maps/documentation/get-map-id)
