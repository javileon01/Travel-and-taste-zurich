// Mapa interactivo con Leaflet.js
const map = L.map('map').setView([47.3769, 8.5417], 13);  // Centro de Zúrich

// Capa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

// Lugares específicos en Zúrich
const lugares = [
    { coords: [47.378177, 8.540192], descripcion: "Estación Central de Zúrich (Hauptbahnhof)" },
    { coords: [47.37167, 8.53833], descripcion: "Bahnhofstrasse - Calle comercial" },
    { coords: [47.367347, 8.545594], descripcion: "Lago de Zúrich" },
    { coords: [47.379162, 8.540192], descripcion: "Museo Nacional de Suiza" },
    { coords: [47.3656, 8.5476], descripcion: "Ópera de Zúrich" }
];

// Añadir marcadores en el mapa
lugares.forEach(lugar => {
    const marker = L.marker(lugar.coords).addTo(map); // Coordenadas del lugar
    marker.bindPopup(`<b>${lugar.descripcion}</b>`); // Descripción del lugar
});

// Video
const video = document.getElementById("video-zurich");
const progressBar = document.getElementById("progress-bar");

function playVideo() {
    video.play();
    video.style.border = "3px solid #28a745"
}

function pauseVideo() {
    video.pause();
    video.style.border = "3px solid #f0ad4e"
}

function stopVideo() {
    video.pause();
    video.currentTime = 0;
}

function skipForward() {
    video.currentTime += 5;
}

function setVolume(volume) {
    video.volume = volume;
}

function maximizeVideo() {
    video.requestFullscreen();
}

video.addEventListener("timeupdate", function () {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.value = progress;
});

