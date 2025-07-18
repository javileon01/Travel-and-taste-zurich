// Mapa interactivo con Leaflet.js
const map = L.map('map').setView([47.3769, 8.5417], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

const restaurantes = [
    // Restaurantes Suizos
    { coords: [47.3740, 8.5417], nombre: "Restaurante Suizo - Fondue & Raclette" },
    { coords: [47.3770, 8.5440], nombre: "Restaurante Suizo - Rösti & Cerveza" },

    // Restaurantes Internacionales
    { coords: [47.3763, 8.5480], nombre: "Restaurante Italiano - Pizzas y Risottos" },
    { coords: [47.3710, 8.5430], nombre: "Restaurante Alemán - Bratwurst & Schnitzel" },
    { coords: [47.3745, 8.5450], nombre: "Restaurante Francés - Quiches y Coq au Vin" },
    { coords: [47.3720, 8.5470], nombre: "Restaurante Japonés - Sushi y Ramen" },

    // Restaurantes de Lujo
    { coords: [47.3765, 8.5410], nombre: "Haute - Restaurante de Lujo" },
    { coords: [47.3750, 8.5400], nombre: "Pavillon - Alta Cocina Francesa" }
];

restaurantes.forEach(r => {
    const marker = L.marker(r.coords).addTo(map);
    marker.bindPopup(`<b>${r.nombre}</b>`);
});

// Obtener los elementos HTML
const audioPlayer = document.getElementById("audio-player");
const archivoSpan = document.getElementById("archivo");
const estadoSpan = document.getElementById("estado");

const duracionTotalSpan = document.getElementById("duracion-total");
const tiempoRestanteSpan = document.getElementById("tiempo-restante");

// Cargar audio seleccionado
function cargarAudio() {
    const select = document.getElementById("audio-select");
    const selectedOption = select.options[select.selectedIndex];
    const src = selectedOption.value;
    const nombre = selectedOption.getAttribute("data-nombre");

    if (src) {
        audioPlayer.src = src;
        audioPlayer.load();
        archivoSpan.textContent = nombre;
        estadoSpan.textContent = "Iniciado";

    } else {
        audioPlayer.src = "";
        archivoSpan.textContent = "Ninguno";
        estadoSpan.textContent = "Ninguno";
        duracionTotalSpan.textContent = "0:00";
        tiempoRestanteSpan.textContent = "0:00";
    }
}

// Reproducir audio
function playAudio() {
    if (audioPlayer.src) {
        audioPlayer.play();
        estadoSpan.textContent = "Reproduciendo";
    }
}

// Pausar audio
function pauseAudio() {
    if (audioPlayer.src) {
        audioPlayer.pause();
        estadoSpan.textContent = "Pausado";
    }
}

// Detener audio
function stopAudio() {
    if (audioPlayer.src) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        estadoSpan.textContent = "Detenido";
        tiempoRestanteSpan.textContent = "0:00";
    }
}

// Avanzar 5 segundos
function skipForward() {
    if (audioPlayer.src) {
        audioPlayer.currentTime += 5;
    }
}

// Retroceder 5 segundos
function skipBackward() {
    if (audioPlayer.src) {
        audioPlayer.currentTime -= 5;
    }
}

// Formatear tiempo en mm:ss
function formatearTiempo(segundos) {
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Actualizar información de duración y tiempo restante
audioPlayer.addEventListener("loadeddata", () => {
    duracionTotalSpan.textContent = formatearTiempo(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", () => {
    if (!isNaN(audioPlayer.duration)) {  // Verifica si duration no es NaN
        const tiempoRestante = audioPlayer.duration - audioPlayer.currentTime;
        tiempoRestanteSpan.textContent = formatearTiempo(tiempoRestante);
    } else {
        tiempoRestanteSpan.textContent = "0:00";  // Muestra 0:00 en lugar de NaN:NaN
    }

    if (audioPlayer.ended) {
        estadoSpan.textContent = "Finalizado";
    }
});




