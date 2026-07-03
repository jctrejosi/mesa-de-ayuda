// geoloc.js
function obtenerYGuardarUbicacion() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                    timestamp: new Date().getTime()
                };
                // Guardar en el localStorage como JSON
                localStorage.setItem("miUbicacion", JSON.stringify(coords));
                console.log("Ubicación guardada:", coords);
            },
            (error) => {
                console.error("Error al obtener ubicación:", error.message);
            }
        );
    } else {
        console.warn("La geolocalización no es soportada por este navegador.");
    }
}

// Ejecutar automáticamente al cargar el script
obtenerYGuardarUbicacion();