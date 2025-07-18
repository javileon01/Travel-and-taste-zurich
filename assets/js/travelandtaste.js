document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });
});

// Lista de videos
const videos = [
    "assets/videos/video_zurich.mp4",
    "assets/videos/video_zurich_2.mp4",
    "assets/videos/video_zurich_3.mp4"
];

let currentVideo = 0;
const videoPlayer = document.getElementById("videoPlayer");

// Cambiar el video cuando termine el actual
if (videoPlayer) {
    videoPlayer.addEventListener("ended", function() {
        currentVideo = (currentVideo + 1) % videos.length; // Ir al siguiente video
        videoPlayer.src = videos[currentVideo]; // Cambiar la fuente del video
        videoPlayer.play(); // Reproducir el nuevo video
    });
}
