# Optional: Completely Disable Saved Map View

If the map is still showing the wrong location after the main fix, you can **completely disable the localStorage-based view persistence** as a temporary measure.

## Why This Might Be Needed
The `GoogleMap` component saves your last map view to `localStorage` so it remembers where you were looking. But if an old bad view (like Oman) got saved, it keeps restoring that view on every page load.

## How to Disable It

Edit [src/components/GoogleMap.jsx](./src/components/GoogleMap.jsx):

### Find this code (around line 180):
```javascript
// CURRENT:
const globalView = getGlobalLastView();
const initialCenter = globalView?.center || center;
const initialZoom = typeof globalView?.zoom === 'number' ? globalView.zoom : zoom;

if (globalView) {
  console.log(
    `GoogleMap instance ${instanceIdRef.current}: Restoring saved view (zoom: ${initialZoom})`
  );
}
```

### Replace with:
```javascript
// TEMP: ignore global view, always use props
const initialCenter = center;
const initialZoom = zoom;

console.log(
  `GoogleMap instance ${instanceIdRef.current}: Starting with fresh view (no saved state)`
);
```

## What This Does
- **Before:** Map restores the last saved center/zoom from localStorage
- **After:** Map always starts with the center/zoom props passed from the parent component
- **Result:** The auto-fit logic in the parent will immediately zoom to your hotels (no old view fighting it)

## Side Effects
- Map won't remember your position when you navigate between pages
- Every page load starts from the default India center (lat 20.59, lng 78.96)
- The auto-fit effect will immediately zoom to hotels after load

## Do You Need This?
**Probably not.** The main fix (clearing saved view on load + auto-fit effect) should be enough. Only use this if:
- The map is *still* showing Oman after the main fix
- You keep seeing logs like "Restoring saved view (zoom: X)" pointing to wrong coordinates
- You don't care about remembering the user's map position

## Revert Later
Once everything is stable and you're confident the auto-fit is working, you can re-enable the saved view by reverting this change. The saved view feature is useful for a better UX (users don't have to re-find their position on every page load).
