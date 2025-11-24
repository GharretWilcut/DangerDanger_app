// Web-compatible geolocation utility
export const requestLocationPermission = async () => {
  if (!navigator.geolocation) {
    return { status: 'denied', error: 'Geolocation is not supported by this browser.' };
  }
  return { status: 'granted' };
};

export const getCurrentPosition = async (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
};

