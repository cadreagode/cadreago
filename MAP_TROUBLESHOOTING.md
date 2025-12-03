# Google Maps Troubleshooting Guide

## Current Implementation Overview

The application uses a custom GoogleMap component ([src/components/GoogleMap.jsx](src/components/GoogleMap.jsx)) with:
- Custom price marker overlays using OverlayView API
- React.memo optimization to prevent unwanted re-renders
- Hash-based hotel comparison for efficient marker updates
- Imperative API via ref for parent control

## How to Debug Map Issues

### Step 1: Check Browser Console

Open your browser's developer console (F12) and look for these log messages:

✅ **Success indicators:**
```
✓ Initializing Google Map...
✓ GoogleMap: Map is ready
GoogleMap: Creating X price markers
```

❌ **Error indicators:**
```
⏳ GoogleMap: Waiting for Google Maps JS...
GoogleMap: Failed to initialize: [error message]
GoogleMap: Map constructor not available
GoogleMap: Could not create overlay class
```

### Step 2: Visual Inspection

You should see:
1. Map container with rounded corners (16px border radius)
2. Google Maps tiles loading inside the container
3. Price markers appearing as white circular badges with prices
4. Markers turn blue on hover
5. No flickering or unwanted zoom/pan during hover

### Step 3: Check Environment Variables

Verify your `.env` file has these values set:
```bash
REACT_APP_GOOGLE_MAPS_KEY=AIzaSyDw_TKY0RBiIyUJbwugdfN7CO3pfx2PrIM
REACT_APP_GOOGLE_MAPS_MAP_ID=1a0e61c8edd882a5eab0e4fc
```

**Note:** Restart your development server after changing `.env` file!

### Step 4: Verify API Configuration

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Verify your API key matches the one in `.env`
3. Check that these APIs are enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API (optional, for address search)

### Step 5: Check Map ID Configuration

1. Go to [Google Cloud Console - Map Styles](https://console.cloud.google.com/google/maps-apis/studio/maps)
2. Check that your Map ID exists and is configured correctly
3. Ensure the Map ID is associated with your API key
4. Verify the map style is published (not draft)

### Step 6: Check Network Requests

In the Network tab, look for:
- `maps.googleapis.com/maps/api/js` - Should load successfully (200 status)
- Map tile requests (`khms0.googleapis.com`) - Should show Google Maps tiles loading
- No 403 Forbidden errors (indicates API key issues)

## Common Issues and Solutions

### Issue 1: Map Doesn't Show (Blank Container)

**Symptoms:**
- Console shows: `⏳ GoogleMap: Waiting for Google Maps JS...`
- Map container is visible but empty
- No Google Maps tiles

**Solutions:**
1. **Check Google Maps script is loaded:**
   - Open browser console and type `window.google.maps`
   - Should return an object, not `undefined`
   - If undefined, check public/index.html has the script tag

2. **Verify API key is correct:**
   - Check `.env` file has the correct key
   - Restart development server (`npm start`)
   - Clear browser cache

3. **Check network connection:**
   - Ensure you can access Google Maps API
   - Check for firewall or proxy blocking requests
   - Try accessing `https://maps.googleapis.com/maps/api/js?key=YOUR_KEY` in browser

### Issue 2: Google Maps Script Not Loading

**Symptoms:**
- Console shows: `ReferenceError: google is not defined`
- Network tab shows failed request to `maps.googleapis.com`

**Solutions:**
1. Check `public/index.html` has the Google Maps script:
   ```html
   <script
     src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=marker,places&loading=async"
   ></script>
   ```

2. Verify API key in the script URL matches your `.env` file

3. Check for CORS or network errors in console

4. Try loading the script URL directly in a new browser tab

### Issue 3: API Key Authentication Errors

**Symptoms:**
- Network request returns 403 Forbidden
- Console shows: "This API key is not authorized to use this service or API"
- Map shows "For development purposes only" watermark

**Solutions:**
1. **Remove API key restrictions temporarily:**
   - Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
   - Edit your API key
   - Under "Application restrictions" choose "None"
   - Under "API restrictions" choose "Don't restrict key"
   - Save and test

2. **Add proper restrictions for production:**
   - Application restrictions: "HTTP referrers"
   - Add your domains:
     - `http://localhost:3000/*` (development)
     - `https://yourdomain.com/*` (production)
   - API restrictions: "Restrict key"
   - Enable: Maps JavaScript API, Places API

3. **Enable billing:**
   - Google Maps requires billing to be enabled
   - Go to [Google Cloud Console - Billing](https://console.cloud.google.com/billing)
   - Enable billing for your project
   - Free tier includes $200/month credit

### Issue 4: Markers Don't Appear

**Symptoms:**
- Map loads successfully
- Console shows "GoogleMap: Creating 0 price markers" or no marker log
- No price markers visible on map

**Solutions:**
1. **Check hotels prop is passed:**
   ```jsx
   <GoogleMap hotels={displayedHotels} ... />
   ```

2. **Verify hotel data has coordinates:**
   - Open React DevTools
   - Check hotels array has objects with valid coordinates
   - Coordinates should be in format: `{ lat: number, lng: number }`

3. **Check console for marker errors:**
   - Look for OverlayView errors
   - Check if `createOverlayClass()` returns successfully

4. **Verify hotel objects have required fields:**
   ```javascript
   {
     id: "unique-id",
     coordinates: { lat: 12.34, lng: 56.78 },
     base_price_per_night: 5000,
     currency: "INR"
   }
   ```

### Issue 5: Markers Don't Update When Hotels Change

**Symptoms:**
- Initial markers show correctly
- Searching new location doesn't update markers
- Old markers remain after filter changes

**Solutions:**
1. **Check hotel IDs are unique:**
   - Each hotel must have a unique `id` field
   - IDs are used for hash comparison

2. **Verify hotels prop is changing:**
   - Add console.log in parent component
   - Check that displayedHotels array updates

3. **Check React memo is not blocking updates:**
   - GoogleMap component uses React.memo
   - Updates only if hotel IDs change
   - Ensure hotel objects have different IDs

### Issue 6: Map Resets/Zooms on Hover

**Symptoms:**
- Hovering marker causes map to zoom in
- Map position jumps when hovering markers
- Unwanted pan animations during interaction

**Solutions:**
- ✅ This should be fixed in the current implementation
- GoogleMap uses React.memo to prevent re-renders on hover
- Marker styling is handled internally without triggering parent updates
- If still occurring:
  1. Check hoveredHotelId state updates aren't causing full re-renders
  2. Verify memo comparison logic in GoogleMap component
  3. Check parent component doesn't re-render on hover

### Issue 7: Invalid Map ID Errors

**Symptoms:**
- Map initializes but shows error overlay
- Console shows: "Invalid Map ID" or Map ID related errors

**Solutions:**
1. **Verify Map ID in Google Cloud Console:**
   - Go to [Map Styles](https://console.cloud.google.com/google/maps-apis/studio/maps)
   - Check Map ID exists and matches `.env` file
   - Ensure map style is published (not draft)

2. **Associate Map ID with API key:**
   - Edit your API key in Cloud Console
   - Add Map ID to allowed Map IDs

3. **Test without Map ID:**
   - Temporarily comment out mapId prop in GoogleMap component
   - This will use default Google Maps styling
   - If map works without mapId, the issue is with Map ID configuration

### Issue 8: Hover Styling Doesn't Work

**Symptoms:**
- Markers appear but don't turn blue on hover
- No visual feedback when hovering markers
- onClick works but onHover doesn't

**Solutions:**
1. **Check hover callback is connected:**
   ```jsx
   <GoogleMap
     onHotelHover={(hotelId) => setHoveredHotelId(hotelId)}
     hoveredHotelId={hoveredHotelId}
   />
   ```

2. **Verify hoveredHotelId state updates:**
   - Add console.log in onHotelHover callback
   - Check that state changes when hovering

3. **Check marker div has pointer-events:**
   - Inspect marker element in DevTools
   - Should have `pointer-events: auto`
   - Check z-index is sufficient (100+)

4. **Verify setActive() method is working:**
   - Check PriceMarkerOverlay.setActive() in GoogleMap.jsx
   - Should update marker styles when called

## Performance Issues

### Issue: Slow marker rendering with many hotels

**Solutions:**
1. **Already implemented optimizations:**
   - ✅ React.memo prevents unnecessary re-renders
   - ✅ Hash-based comparison skips marker recreation
   - ✅ Efficient marker cleanup

2. **Additional optimizations for 50+ hotels:**
   - Consider marker clustering library
   - Implement viewport-based marker rendering
   - Use marker pooling for frequently updated markers

### Issue: Memory leaks with marker updates

**Solutions:**
- ✅ GoogleMap component properly cleans up markers
- ✅ Uses clearAllMarkers() before creating new ones
- ✅ Removes event listeners on unmount
- If still experiencing issues, check parent component cleanup

## Testing Checklist

After making changes or debugging, verify:

### Map Rendering
- [ ] Map container appears with proper dimensions
- [ ] Google Maps tiles load correctly
- [ ] Map has rounded corners
- [ ] No console errors related to map init

### Price Markers
- [ ] Price markers appear for all hotels
- [ ] Markers show correctly formatted prices (₹ symbol for INR)
- [ ] Marker count matches displayed hotels
- [ ] No duplicate markers

### Interactions
- [ ] Hovering marker turns it blue
- [ ] Clicking marker selects hotel
- [ ] Map doesn't zoom/pan during hover
- [ ] Multiple markers can be hovered smoothly
- [ ] Pan and zoom gestures work properly

### Search Integration
- [ ] Searching new location updates markers
- [ ] Old markers are removed before new ones appear
- [ ] No marker flickering during updates
- [ ] Map centers on search results appropriately

### Console Logs
- [ ] No errors in console
- [ ] Success logs appear in correct order
- [ ] No warnings about missing dependencies
- [ ] Performance metrics are acceptable

## Development Tips

### Enable Verbose Logging

Add more console.logs to GoogleMap component for debugging:

```jsx
// In generateHotelsHash
console.log('Hotels hash:', currentHash);

// In marker creation
console.log('Creating marker for hotel:', hotel.id, coords);

// In hover handling
console.log('Hover state updated:', hotelId);
```

### Use React DevTools

1. Install React Developer Tools extension
2. Inspect GoogleMap component props
3. Check hotels array contents
4. Monitor state updates in parent component

### Check Map Instance

In console, after map loads:
```javascript
// Assuming you have googleMapRef in scope
const map = googleMapRef.current?.getMap();
console.log('Map instance:', map);
console.log('Map center:', map?.getCenter().toString());
console.log('Map zoom:', map?.getZoom());
```

### Debug Marker Positioning

```javascript
// Check marker positions
markersRef.current.forEach((entry) => {
  console.log(`Hotel ${entry.hotelId}:`, entry.coords);
});
```

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [OverlayView Documentation](https://developers.google.com/maps/documentation/javascript/reference/overlay-view)
- [Map Styling Guide](https://developers.google.com/maps/documentation/javascript/styling)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [React.memo Documentation](https://react.dev/reference/react/memo)

## Getting Help

If you continue to experience issues after following this guide:

1. **Check the console carefully:**
   - Copy exact error messages
   - Note when errors occur (on load, on interaction, etc.)

2. **Document steps to reproduce:**
   - What action triggers the issue
   - Expected vs actual behavior
   - Browser and OS information

3. **Verify current implementation:**
   - Check [GoogleMap.jsx](src/components/GoogleMap.jsx) hasn't been modified
   - Ensure [CadreagoHotelBooking.jsx](src/components/CadreagoHotelBooking.jsx) passes correct props

4. **Test in isolation:**
   - Try the TestMap component if available
   - Test with minimal hotel data
   - Test in incognito mode (rules out extensions)

## Quick Fixes Reference

| Issue | Quick Fix |
|-------|-----------|
| Map not showing | Check console for google.maps, verify API key |
| No markers | Verify hotels prop has data with coordinates |
| Hover doesn't work | Check onHotelHover callback and hoveredHotelId state |
| Map resets on hover | Already fixed with React.memo, check implementation |
| 403 errors | Check API key restrictions and billing |
| Invalid Map ID | Verify Map ID in Cloud Console |
| Markers not updating | Check hotel objects have unique IDs |
| Performance issues | Already optimized, consider clustering for 50+ hotels |

## Success Indicators

You'll know everything is working correctly when:
- ✅ Map loads within 2-3 seconds
- ✅ All hotel markers appear
- ✅ Hover turns markers blue instantly
- ✅ No unwanted map movement during interactions
- ✅ Search updates markers smoothly
- ✅ No console errors or warnings
- ✅ Performance is smooth even with many hotels
