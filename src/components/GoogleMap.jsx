import React, { useRef, useEffect, useImperativeHandle, forwardRef, memo, useCallback } from "react";

// View persistence helpers - save/restore map viewport across remounts
// This prevents map from jumping back to default when React remounts the component
const GLOBAL_VIEW_KEY = '__cadreagoLastMapView';
const SESSION_VIEW_KEY = 'cadreagoMapView';

const getGlobalLastView = () => {
  if (typeof window === 'undefined') return null;
  if (window[GLOBAL_VIEW_KEY]) {
    return window[GLOBAL_VIEW_KEY];
  }
  try {
    const stored = sessionStorage.getItem(SESSION_VIEW_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      window[GLOBAL_VIEW_KEY] = parsed;
      return parsed;
    }
  } catch (e) {}
  return null;
};

const setGlobalLastView = (center, zoom) => {
  if (typeof window === 'undefined') return;
  if (!center || typeof zoom !== 'number') return;
  const view = { center, zoom };
  window[GLOBAL_VIEW_KEY] = view;
  try {
    sessionStorage.setItem(SESSION_VIEW_KEY, JSON.stringify(view));
  } catch (e) {}
};

const clearGlobalLastView = () => {
  if (typeof window === 'undefined') return;
  delete window[GLOBAL_VIEW_KEY];
  try {
    sessionStorage.removeItem(SESSION_VIEW_KEY);
  } catch (e) {}
};

/**
 * Google Map component with Price Marker support
 *
 * FIXED VERSION:
 * - Prevents map from resetting on hover
 * - Separates user interactions from automatic updates
 * - Adds zoom-to-hotel functionality
 * - Adds radius circle display
 * - Persists map view across component remounts
 *
 * Props:
 * - center: { lat, lng } - Initial map center (only used on first render)
 * - zoom: number - Initial zoom level (default 7)
 * - height: string - Height of map container (default "560px")
 * - onMapReady: (map) => void - Callback when map is initialized
 * - className: string - Additional CSS classes
 * - mapId: string - Google Maps Map ID for styling
 * - hotels: array - Array of hotel objects to display as price markers
 * - onHotelClick: (hotel) => void - Callback when a hotel marker is clicked
 * - onHotelHover: (hotelId) => void - Callback when hovering over a marker
 * - hoveredHotelId: string - ID of currently hovered hotel
 * - selectedHotelId: string - ID of currently selected hotel
 * - zoomToHotelId: string - When set, map will zoom to this hotel
 * - radiusKm: number - Radius in km to show around hovered hotel (default 50)
 * - showRadiusCircle: boolean - Whether to show radius circle on hover
 * - onBoundsChanged: (bounds) => void - Callback when map bounds change
 */
const GoogleMapComponent = forwardRef(({
  center = { lat: 20.5937, lng: 78.9629 },
  zoom = 6,
  height = "560px",
  onMapReady,
  className = "",
  mapId,
  hotels = [],
  onHotelClick,
  onHotelHover,
  hoveredHotelId,
  selectedHotelId,
  zoomToHotelId,
  radiusKm = 50,
  showRadiusCircle = false,
  onBoundsChanged
}, ref) => {
  const instanceIdRef = useRef(Math.random().toString(36).slice(2, 8));
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const overlayClassRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const isInitializedRef = useRef(false);
  const hotelsHashRef = useRef("");
  const isMapReadyRef = useRef(false);

  // Track if this is the first render to apply initial center/zoom
  const isFirstRenderRef = useRef(true);

  // Store the last hotels array to prevent unnecessary marker recreation
  const lastHotelsRef = useRef([]);

  useEffect(() => {
    console.log(`GoogleMap instance ${instanceIdRef.current}: MOUNT`);
    return () => {
      console.log(`GoogleMap instance ${instanceIdRef.current}: UNMOUNT - Cleaning up`);

      // Remove radius circle
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setMap(null);
        radiusCircleRef.current = null;
      }

      // Remove all overlays to prevent "Node cannot be found" errors
      markersRef.current.forEach(entry => {
        if (entry?.overlay) {
          entry.overlay.setMap(null);
        }
      });
      markersRef.current = [];

      // Clear listeners and drop reference to map
      // This helps garbage collection and prevents "Too many WebGL contexts" warnings
      if (mapRef.current) {
        window.google?.maps?.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }

      isInitializedRef.current = false;
      isMapReadyRef.current = false;
    };
  }, []);

  // Expose map instance to parent via ref
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    setCenter: (newCenter) => {
      if (mapRef.current && newCenter) {
        mapRef.current.setCenter(newCenter);
      }
    },
    setZoom: (newZoom) => {
      if (mapRef.current && typeof newZoom === 'number') {
        mapRef.current.setZoom(newZoom);
      }
    },
    fitBounds: (bounds, padding) => {
      if (mapRef.current && bounds) {
        mapRef.current.fitBounds(bounds, padding);
      }
    },
    panTo: (position) => {
      if (mapRef.current && position) {
        mapRef.current.panTo(position);
      }
    },
    zoomToHotel: (hotel, zoomLevel = 12) => {
      zoomToHotelLocation(hotel, zoomLevel);
    },
    resetToDefault: (defaultCenter, defaultZoom) => {
      if (mapRef.current) {
        mapRef.current.setCenter(defaultCenter || center);
        mapRef.current.setZoom(defaultZoom || zoom);
      }
    },
    clearMarkers: () => {
      clearAllMarkers();
    },
    showRadiusCircle: (centerPos, radiusInKm) => {
      showRadius(centerPos, radiusInKm);
    },
    hideRadiusCircle: () => {
      hideRadius();
    },
    clearSavedView: () => {
      clearGlobalLastView();
    }
  }));

  // Helper: Clear all markers
  const clearAllMarkers = useCallback(() => {
    markersRef.current.forEach(entry => {
      if (entry?.overlay) {
        entry.overlay.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // Helper: Show radius circle
  const showRadius = useCallback((centerPos, radiusInKm) => {
    if (!mapRef.current || !window.google?.maps) return;
    
    // Remove existing circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
    }
    
    radiusCircleRef.current = new window.google.maps.Circle({
      map: mapRef.current,
      center: centerPos,
      radius: radiusInKm * 1000, // Convert km to meters
      strokeColor: '#2563eb',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#2563eb',
      fillOpacity: 0.05
    });
  }, []);

  // Helper: Hide radius circle
  const hideRadius = useCallback(() => {
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
      radiusCircleRef.current = null;
    }
  }, []);

  // Helper: Zoom to hotel location
  const zoomToHotelLocation = useCallback((hotel, zoomLevel = 12) => {
    if (!mapRef.current || !hotel) return;
    
    const coords = getHotelCoordinates(hotel);
    if (!coords) return;
    
    mapRef.current.panTo(coords);
    mapRef.current.setZoom(zoomLevel);
    
    if (showRadiusCircle) {
      showRadius(coords, radiusKm);
    }
  }, [showRadiusCircle, radiusKm, showRadius]);

  // Helper: Get price from hotel object
  const getHotelPrice = useCallback((hotel) => {
    const price = Number(
      hotel.base_price_per_night ||
      hotel.basePrice ||
      hotel.pricePerNight ||
      hotel.price_per_night ||
      hotel.price ||
      0
    );
    return price;
  }, []);

  // Helper: Get coordinates from hotel object
  const getHotelCoordinates = (hotel) => {
    if (hotel.coordinates?.lat && hotel.coordinates?.lng) {
      return {
        lat: Number(hotel.coordinates.lat),
        lng: Number(hotel.coordinates.lng)
      };
    }
    if (hotel.latitude && hotel.longitude) {
      return {
        lat: Number(hotel.latitude),
        lng: Number(hotel.longitude)
      };
    }
    return null;
  };

  // Helper: Format price for display
  const formatPrice = useCallback((price, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(price).toLocaleString('en-IN')}`;
    }
    return `$${Number(price).toLocaleString()}`;
  }, []);

  // Create the PriceOverlay class (only once)
  const createOverlayClass = useCallback(() => {
    if (overlayClassRef.current) return overlayClassRef.current;
    if (!window.google?.maps?.OverlayView) return null;

    class PriceMarkerOverlay extends window.google.maps.OverlayView {
      constructor(position, price, hotel, callbacks) {
        super();
        this.position = position;
        this.price = price;
        this.hotel = hotel;
        this.callbacks = callbacks;
        this.div = null;
        this.isActive = false;
      }

      onAdd() {
        const div = document.createElement('div');
        
        Object.assign(div.style, {
          position: 'absolute',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px',
          borderRadius: '999px',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: '600',
          fontSize: '13px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          lineHeight: '1',
          minWidth: '50px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          border: '2px solid #e5e7eb',
          color: '#111827',
          transform: 'translate(-50%, -50%)',
          zIndex: '100',
          pointerEvents: 'auto',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        });

        div.textContent = this.price;

        // Click handler
        div.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.callbacks.onClick) {
            this.callbacks.onClick(this.hotel);
          }
        });

        // Hover handlers - DON'T trigger map zoom here
        div.addEventListener('mouseenter', () => {
          this.setActive(true);
          if (this.callbacks.onHover) {
            this.callbacks.onHover(this.hotel.id);
          }
        });

        div.addEventListener('mouseleave', () => {
          if (!this.isActive) {
            this.setActive(false);
          }
          if (this.callbacks.onHover) {
            this.callbacks.onHover(null);
          }
        });

        this.div = div;

        const panes = this.getPanes();
        if (panes?.overlayMouseTarget) {
          panes.overlayMouseTarget.appendChild(div);
        } else if (panes?.floatPane) {
          panes.floatPane.appendChild(div);
        }
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !this.div) return;

        const pos = projection.fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.position.lat, this.position.lng)
        );

        if (pos) {
          this.div.style.left = `${pos.x}px`;
          this.div.style.top = `${pos.y}px`;
        }
      }

      onRemove() {
        if (this.div?.parentNode) {
          this.div.parentNode.removeChild(this.div);
          this.div = null;
        }
      }

      setActive(isActive) {
        this.isActive = isActive;
        if (!this.div) return;
        
        if (isActive) {
          Object.assign(this.div.style, {
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8',
            color: '#ffffff',
            // Keep size constant so hover doesn't feel like zoom
            transform: 'translate(-50%, -50%)',
            zIndex: '200',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          });
        } else {
          Object.assign(this.div.style, {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            color: '#111827',
            transform: 'translate(-50%, -50%)',
            zIndex: '100',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          });
        }
      }

      getHotelId() {
        return this.hotel.id;
      }
    }

    overlayClassRef.current = PriceMarkerOverlay;
    return PriceMarkerOverlay;
  }, []);

  // Initialize map (runs once)
  useEffect(() => {
    let pollId = null;
    let cancelled = false;

    const initMap = async () => {
      if (cancelled || !divRef.current || mapRef.current) return;

      if (!window.google?.maps) {
        console.log('⏳ GoogleMap: Waiting for Google Maps JS...');
        return;
      }

      console.log(`GoogleMap instance ${instanceIdRef.current}: ✓ Initializing Google Map...`);

      // Try to reuse last known view across remounts (prevents jumping back to default)
      const globalView = getGlobalLastView();
      const initialCenter = globalView?.center || center;
      const initialZoom = typeof globalView?.zoom === 'number' ? globalView.zoom : zoom;

      if (globalView) {
        console.log(
          `GoogleMap instance ${instanceIdRef.current}: Restoring saved view (center: ${initialCenter.lat}, ${initialCenter.lng}, zoom: ${initialZoom})`
        );
      } else {
        console.log(
          `GoogleMap instance ${instanceIdRef.current}: Starting with fresh view (center: ${center.lat}, ${center.lng}, zoom: ${zoom})`
        );
      }

      const mapOptions = {
        center: initialCenter,
        zoom: initialZoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy', // Allow easy zoom/pan
      };

      if (mapId) {
        mapOptions.mapId = mapId;
      }

      try {
        let MapConstructor = window.google?.maps?.Map;

        if (typeof MapConstructor !== 'function' && window.google?.maps?.importLibrary) {
          const { Map } = await window.google.maps.importLibrary('maps');
          if (typeof Map === 'function') {
            MapConstructor = Map;
          }
        }

        if (typeof MapConstructor !== 'function') {
          console.error('GoogleMap: Map constructor not available, will retry when google.maps is ready');
          return;
        }

        const map = new MapConstructor(divRef.current, mapOptions);
        mapRef.current = map;
        isInitializedRef.current = true;

        // Save view on user interactions (prevents jumping back to default on remount)
        const saveView = () => {
          if (!mapRef.current) return;
          const c = mapRef.current.getCenter();
          const z = mapRef.current.getZoom();
          if (c && typeof z === 'number') {
            setGlobalLastView({ lat: c.lat(), lng: c.lng() }, z);
          }
        };

        // Save view when user drags, zooms, or map settles
        map.addListener('idle', saveView);
        map.addListener('zoom_changed', saveView);
        map.addListener('dragend', saveView);

        // Track bounds changes for external use - but only after map is fully ready
        map.addListener('bounds_changed', () => {
          // Don't fire bounds changes until map is ready to prevent initialization loops
          if (!isMapReadyRef.current) return;

          if (onBoundsChanged) {
            const bounds = map.getBounds();
            if (bounds) {
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              onBoundsChanged({
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng()
              });
            }
          }
        });

        // Notify parent when map is ready
        window.google.maps.event.addListenerOnce(map, 'idle', () => {
          console.log(`GoogleMap instance ${instanceIdRef.current}: ✓ Map is ready`);
          isMapReadyRef.current = true; // Now we can start processing bounds changes
          if (onMapReady) {
            onMapReady(map);
          }
        });

      } catch (err) {
        console.error('GoogleMap: Failed to initialize:', err);
      }
    };

    if (window.google?.maps) {
      initMap();
    } else {
      pollId = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(pollId);
          initMap();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
    };
  }, []); // Empty deps - only run once

  // Generate a hash of hotel IDs to detect actual changes
  const generateHotelsHash = useCallback((hotelsArray) => {
    if (!hotelsArray?.length) return "";
    return hotelsArray.map(h => h?.id).sort().join(",");
  }, []);

  // Create/update markers ONLY when hotels actually change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps || !isInitializedRef.current) return;

    // Generate hash of current hotels
    const currentHash = generateHotelsHash(hotels);
    
    // Skip if hotels haven't actually changed
    if (currentHash === hotelsHashRef.current) {
      return;
    }
    
    hotelsHashRef.current = currentHash;

    // Clear existing markers
    clearAllMarkers();

    if (!hotels.length) {
      console.log(`GoogleMap instance ${instanceIdRef.current}: No hotels to display`);
      return;
    }

    const PriceMarkerOverlay = createOverlayClass();
    if (!PriceMarkerOverlay) {
      console.error('GoogleMap: Could not create overlay class');
      return;
    }

    console.log(`GoogleMap instance ${instanceIdRef.current}: Creating ${hotels.length} price markers`);

    hotels.forEach(hotel => {
      const coords = getHotelCoordinates(hotel);
      if (!coords || isNaN(coords.lat) || isNaN(coords.lng)) {
        return;
      }

      const price = getHotelPrice(hotel);
      const formattedPrice = formatPrice(price, hotel.currency);

      const overlay = new PriceMarkerOverlay(
        coords,
        formattedPrice,
        hotel,
        {
          onClick: onHotelClick,
          onHover: onHotelHover
        }
      );

      overlay.setMap(map);

      markersRef.current.push({
        hotelId: hotel.id,
        overlay,
        coords
      });
    });

    lastHotelsRef.current = hotels;

  }, [hotels, generateHotelsHash, clearAllMarkers, createOverlayClass, getHotelPrice, formatPrice, onHotelClick, onHotelHover]);

  // Update marker active states when hoveredHotelId or selectedHotelId changes
  // This should NOT cause map zoom/pan
  useEffect(() => {
    markersRef.current.forEach(entry => {
      const isActive = entry.hotelId === hoveredHotelId || entry.hotelId === selectedHotelId;
      entry.overlay?.setActive(isActive);
    });
  }, [hoveredHotelId, selectedHotelId]);

  // Handle zoom to hotel when zoomToHotelId changes
  useEffect(() => {
    if (!zoomToHotelId || !mapRef.current) {
      hideRadius();
      return;
    }

    const hotelEntry = markersRef.current.find(e => e.hotelId === zoomToHotelId);
    if (hotelEntry?.coords) {
      mapRef.current.panTo(hotelEntry.coords);
      mapRef.current.setZoom(14);  // Neighbourhood zoom level

      if (showRadiusCircle) {
        showRadius(hotelEntry.coords, radiusKm);
      }
    }
  }, [zoomToHotelId, showRadiusCircle, radiusKm, showRadius, hideRadius]);

  return (
    <div
      ref={divRef}
      className={className}
      style={{
        width: "100%",
        height: height,
        borderRadius: "16px",
        overflow: "hidden"
      }}
    />
  );
});

GoogleMapComponent.displayName = 'GoogleMapComponent';

// Optimized memo comparison - ONLY re-render when necessary
const GoogleMap = memo(GoogleMapComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)

  // Always re-render if hotels changed (by ID list)
  const prevHotelIds = prevProps.hotels?.map(h => h?.id).sort().join(",") || "";
  const nextHotelIds = nextProps.hotels?.map(h => h?.id).sort().join(",") || "";
  if (prevHotelIds !== nextHotelIds) return false;

  // Re-render if hover/selection state changed (for marker highlighting)
  if (prevProps.hoveredHotelId !== nextProps.hoveredHotelId) return false;
  if (prevProps.selectedHotelId !== nextProps.selectedHotelId) return false;

  // Re-render if zoom-to-hotel changed
  if (prevProps.zoomToHotelId !== nextProps.zoomToHotelId) return false;

  // Don't re-render for callback changes - they're stable with useCallback
  // Don't re-render for center/zoom changes after initial render
  // These are only used for initial setup

  return true;
});

GoogleMap.displayName = 'GoogleMap';

export default GoogleMap;
