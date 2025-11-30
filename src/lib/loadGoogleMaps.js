let googleMapsPromise;
let mapsLibrary;
let markerLibrary;

const ensureLibrariesLoaded = async () => {
  // Wait a bit for the API to be ready
  let attempts = 0;
  while (attempts < 50) {
    if (window.google?.maps?.importLibrary) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.google?.maps?.importLibrary) {
    throw new Error('Google Maps importLibrary not available after waiting');
  }

  try {
    // Load both libraries and store their exports
    [mapsLibrary, markerLibrary] = await Promise.all([
      window.google.maps.importLibrary('maps'),
      window.google.maps.importLibrary('marker')
    ]);

    // Attach to window for component access
    if (!window.google.maps.Map && mapsLibrary?.Map) {
      window.google.maps.Map = mapsLibrary.Map;
    }
    if (!window.google.maps.marker) {
      window.google.maps.marker = markerLibrary;
    }

    return window.google.maps;
  } catch (error) {
    console.error('Failed to load Google Maps libraries:', error);
    throw error;
  }
};

export const loadGoogleMaps = (apiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in the browser.'));
  }

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is missing. Set REACT_APP_GOOGLE_MAPS_KEY in your environment.'));
  }

  // Return existing promise if already loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded
  if (window.google?.maps?.importLibrary && mapsLibrary && markerLibrary) {
    return Promise.resolve(window.google.maps);
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-google-maps]');

    const handleScriptReady = () => {
      ensureLibrariesLoaded().then(resolve).catch(reject);
    };

    if (existingScript) {
      if (window.google?.maps?.importLibrary) {
        handleScriptReady();
      } else {
        existingScript.addEventListener('load', handleScriptReady);
        existingScript.addEventListener('error', reject);
      }
      return;
    }

    // Load the bootstrap script for new modular API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&v=weekly`;
    script.async = true;
    script.dataset.googleMaps = 'true';
    script.onload = handleScriptReady;
    script.onerror = (err) => {
      console.error('Failed to load Google Maps script:', err);
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
