export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type GpsPrecision = "excellent" | "good" | "low";

export class LocationService {
  private static instance: LocationService;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Obtiene la ubicación actual del dispositivo
   */
  async getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error("La geolocalización no está soportada en este navegador"),
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = "Error al obtener ubicación";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message =
                "Permiso de ubicación denegado. Actívalo en la configuración del navegador.";
              break;
            case error.POSITION_UNAVAILABLE:
              message =
                "No se pudo determinar la ubicación. Verifica tu conexión GPS.";
              break;
            case error.TIMEOUT:
              message = "Tiempo de espera agotado. Intenta nuevamente.";
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  }

  /**
   * Calcula la precisión basada en la exactitud
   */
  getPrecision(accuracy: number): GpsPrecision {
    if (accuracy < 20) return "excellent";
    if (accuracy < 50) return "good";
    return "low";
  }
}
