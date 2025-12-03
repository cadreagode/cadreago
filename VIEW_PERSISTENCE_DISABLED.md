# View Persistence Disabled - Fix for Map Location Bug

## Problem Solved
The map was showing the wrong location (Oman) even when Kerala hotels were loaded. This was caused by the view persistence feature saving and restoring old map positions.

## Changes Made

### 1. GoogleMap.jsx - Disabled View Persistence (lines 3-42)
**Commented out all persistence helper functions:**
- `GLOBAL_VIEW_KEY` and `SESSION_VIEW_KEY` constants
- `getGlobalLastView()` - was reading saved view from localStorage/sessionStorage
- `setGlobalLastView()` - was saving map position on every idle/zoom/drag event
- `clearGlobalLastView()` - is no longer needed

**Why:** These functions were creating a loop where old map views (like Oman) were being restored on every component remount, overriding the auto-fit logic.

### 2. GoogleMap.jsx - Use Props Directly (lines 402-406)
**Before:**
```javascript
const globalView = getGlobalLastView();
const initialCenter = globalView?.center || center;
const initialZoom = typeof globalView?.zoom === 'number' ? globalView.zoom : zoom;

if (globalView) {
  console.log(`Restoring saved view (zoom: ${initialZoom})`);
}
```

**After:**
```javascript
// Use props directly (no saved view restoration)
const initialCenter = center;
const initialZoom = zoom;

console.log(`Starting with fresh view (center: ${center.lat}, ${center.lng}, zoom: ${zoom})`);
```

**Why:** Map now always starts with the center/zoom props passed from parent, allowing auto-fit to work correctly.

### 3. GoogleMap.jsx - Removed SaveView Listeners (lines 442-443)
**Removed:**
```javascript
const saveView = () => {
  if (!mapRef.current) return;
  const c = mapRef.current.getCenter();
  const z = mapRef.current.getZoom();
  if (c && typeof z === 'number') {
    setGlobalLastView({ lat: c.lat(), lng: c.lng() }, z);
  }
};

map.addListener('idle', saveView);
map.addListener('zoom_changed', saveView);
map.addListener('dragend', saveView);
```

**Why:** These listeners were saving the map position on every interaction, causing old views to persist.

### 4. GoogleMap.jsx - Removed clearSavedView Method (line 152)
**Removed from useImperativeHandle ref interface:**
```javascript
clearSavedView: () => {
  clearGlobalLastView();
}
```

**Why:** Method is no longer needed since persistence is disabled.

### 5. CadreagoHotelBooking.jsx - Removed clearSavedView Call (lines 212-213)
**Removed:**
```javascript
if (googleMapRef.current?.clearSavedView) {
  console.log('Clearing old saved map view to prevent showing wrong location');
  googleMapRef.current.clearSavedView();
}
```

**Why:** Method no longer exists on GoogleMap ref.

## How It Works Now

1. **Map initializes** → Uses center/zoom props directly (default: India center at lat 20.59, lng 78.96)
2. **Hotels load** → Auto-fit effect (lines 1157-1180 in CadreagoHotelBooking.jsx) detects hotels
3. **Auto-fit triggers** → `fitMapToHotels()` zooms map to show all Kerala properties
4. **User interactions** → Tracked via `userInteractedWithMap.current` flag but NOT saved to localStorage
5. **Component remounts** → Map restarts with props center/zoom (no old view restoration)

## Expected Behavior

✅ **On initial page load:**
- Map shows default India center briefly
- Auto-fit immediately zooms to Kerala properties (5 hotels)
- No "Restoring saved view" messages in console

✅ **Console logs should show:**
- `"Starting with fresh view (center: 20.59, 78.96, zoom: 5)"`
- `"Auto-fitting map to 5 displayed hotels"`
- No "Restoring saved view" messages

✅ **User manual interaction:**
- Map respects user zoom/pan
- Auto-fit stops triggering after user interacts
- No position is saved to localStorage/sessionStorage

## Side Effects

- Map won't remember position across page reloads (this is intentional)
- Every page load starts fresh with default center, then auto-fits to hotels
- User manual interactions are respected during the session but not persisted

## Re-enabling Persistence Later

If you want to re-enable view persistence after auto-fit is stable:

1. Uncomment lines 7-42 in GoogleMap.jsx (the helper functions)
2. Uncomment the globalView logic in initMap (around line 402)
3. Add back the saveView listeners (around line 442)
4. Add back clearSavedView to useImperativeHandle (around line 152)

**Recommendation:** Only re-enable after thoroughly testing that auto-fit and persistence work together without conflicts.

## Build Status
✅ Build compiles successfully (verified with `npm run build`)
✅ File size: 131.88 kB (299 B smaller than before)

## Testing Steps

1. Clear browser cache and localStorage/sessionStorage
2. Reload the page
3. Verify map auto-fits to Kerala properties (not Oman)
4. Check console for "Starting with fresh view" messages
5. Verify no "Restoring saved view" messages appear
6. Test manual zoom/pan still works
7. Reload page and verify map restarts fresh (not from saved position)

## Files Modified
- [src/components/GoogleMap.jsx](src/components/GoogleMap.jsx) - Disabled view persistence
- [src/components/CadreagoHotelBooking.jsx](src/components/CadreagoHotelBooking.jsx) - Removed clearSavedView call
