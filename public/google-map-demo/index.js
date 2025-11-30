async function initMap() {
  try {
    const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
      google.maps.importLibrary('maps'),
      google.maps.importLibrary('marker')
    ]);

    const mapElement = document.querySelector('gmp-map');
    if (!mapElement) {
      throw new Error('Missing gmp-map element in DOM');
    }

    const innerMap = mapElement.innerMap;
    innerMap.setOptions({
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false
    });

    new AdvancedMarkerElement({
      map: innerMap,
      position: mapElement.center,
      title: 'Cadreago demo pin'
    });

    google.maps.event.addListenerOnce(innerMap, 'idle', () => {
      const status = document.querySelector('[data-map-status]');
      if (status) {
        status.textContent = 'Map loaded successfully. Click the marker to inspect.';
      }
    });
  } catch (err) {
    const status = document.querySelector('[data-map-status]');
    if (status) {
      status.textContent = `Error loading Google Maps: ${err.message}`;
      status.style.color = '#dc2626';
    }
    console.error(err);
  }
}

initMap();
