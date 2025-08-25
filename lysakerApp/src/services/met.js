export async function fetchWeatherFromBrowser() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported'));
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      if (isNaN(lat) || isNaN(lon)) {
        return reject(new Error('Invalid coordinates'));
      }

      try {
        const response = await fetch(`/api/met?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
          const text = await response.text();
          return reject(new Error(`API error: ${text}`));
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }, (error) => {
      reject(new Error('Failed to get location: ' + error.message));
    });
  });
}
