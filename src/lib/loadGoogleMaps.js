let googleMapsPromise;

const ensureLibrariesLoaded = async () => {
  const maps = window.google?.maps;
  if (!maps) {
    throw new Error('Google Maps failed to load on window.');
  }

  if (typeof maps.importLibrary === 'function') {
    await Promise.all([
      maps.importLibrary('maps'),
      maps.importLibrary('marker')
    ]);
  }

  return maps;
};

export const loadGoogleMaps = (apiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in the browser.'));
  }

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is missing. Set REACT_APP_GOOGLE_MAPS_KEY in your environment.'));
  }

  if (!googleMapsPromise) {
    const existingMaps = window.google?.maps;
    if (existingMaps && (typeof existingMaps.Map === 'function' || typeof existingMaps.importLibrary === 'function')) {
      googleMapsPromise = ensureLibrariesLoaded();
      return googleMapsPromise;
    }

    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-maps]');

      const handleScriptReady = () => {
        ensureLibrariesLoaded().then(resolve).catch(reject);
      };

      if (existingScript) {
        if (window.google?.maps) {
          handleScriptReady();
        } else {
          existingScript.addEventListener('load', handleScriptReady);
          existingScript.addEventListener('error', reject);
        }
        return;
      }

      const script = document.createElement('script');
      const params = new URLSearchParams({
        key: apiKey,
        libraries: 'places',
        v: 'weekly',
        loading: 'async'
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = 'true';
      script.onload = handleScriptReady;
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
};
