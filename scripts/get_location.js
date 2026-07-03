function obtenerYGuardarUbicacion() {
    if (!navigator.geolocation) {
        console.warn("La geolocalización no es soportada por este navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            localStorage.setItem("latitud", position.coords.latitude);
            localStorage.setItem("longitud", position.coords.longitude);
            localStorage.setItem("timestamp", Date.now());

            console.log("Ubicación guardada");
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

obtenerYGuardarUbicacion();