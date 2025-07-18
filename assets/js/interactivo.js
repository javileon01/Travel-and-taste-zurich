const canvas = document.getElementById("mapaCanvas");
const ctx = canvas.getContext("2d");
const mapaImg = new Image();
mapaImg.src = "../assets/img/zurich_canvas_map.png";

let isDrawing = false;
let modoDibujo = false;
let rutas = [];             // Guarda rutas con sus colores
let currentRuta = [];
let colorRuta = "#FFD700";   // Color inicial para las rutas
let marcadores = [];
let marcadoresTocados = new Set();  // Para guardar los marcadores tocados
let juegoTerminado = false;
const boton = document.getElementById("toggleDibujoButton");

let nombreUsuario = document.getElementById("nombre_usuario");
let grosorRutas = document.getElementById("grosor_rutas");

let botonDibujo = document.getElementById("toggleDibujoButton");
let botonBorrarRutas = document.getElementById("botonBorrarRutas");
let botonBorrarMarcadores = document.getElementById("botonBorrarMarcadores");
let botonBorrarTodo = document.getElementById("botonBorrarTodo");
let labelColorRutas = document.getElementById("labelColorRutas");
let inputColorRutas = document.getElementById("colorRutas");

// Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = document.getElementById("audioJuego");
const track = audioCtx.createMediaElementSource(audioElement);

const gainNode = audioCtx.createGain();
const panner = audioCtx.createStereoPanner();
const biquadFilter = audioCtx.createBiquadFilter();

gainNode.gain.value = 6;
panner.pan.value = 0;
biquadFilter.type = "lowpass";
biquadFilter.frequency.value = 1000;

track.connect(biquadFilter)
     .connect(panner)
     .connect(gainNode)
     .connect(audioCtx.destination);

document.body.addEventListener("click", () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}, { once: true });


const elementosControlados = [
    botonDibujo, botonBorrarRutas, botonBorrarMarcadores, 
    botonBorrarTodo, labelColorRutas, inputColorRutas]

mapaImg.onload = () => ctx.drawImage(mapaImg, 0, 0, canvas.width, canvas.height);

// Actualizar audio con la posición del ratón
function actualizarAudioConPosicion(x, y, ancho, alto) {
    // Paneo: -1 (izquierda) a 1 (derecha)
    const pan = (x / ancho) * 2 - 1;
    panner.pan.value = pan;

    // Filtro: 500 Hz (más oscuro) a 5000 Hz (más claro)
    const freq = 500 + ((1 - (y / alto)) * 4500);
    biquadFilter.frequency.value = freq;
}


// Verificar si los inputs tienen valores válidos
function verificarInputs() {
    const nombreValido = nombreUsuario.value.trim().length > 0;
    const grosorRutasValido = grosorRutas.value.trim().length > 0;

    if (nombreValido && grosorRutasValido) {
        elementosControlados.forEach(el => {
            el.style.display = "";
        });
    } else {
        elementosControlados.forEach(el => {
            el.style.display = "none";
        });
    }
}

// Verificar los inputs al cambiar
nombreUsuario.addEventListener("input", verificarInputs);
grosorRutas.addEventListener("input", verificarInputs);

verificarInputs();

// Cambiar el color de las rutas
document.getElementById("colorRutas").addEventListener("input", (event) => {
    colorRuta = event.target.value;
});

// Iniciar dibujo
canvas.addEventListener('mousedown', () => {
    if (modoDibujo) {
        isDrawing = true;
        currentRuta = [];
        marcadoresTocados.clear(); // Limpiar los marcadores tocados al iniciar una nueva ruta

        // Reproducir audio si empezamos a dibujar
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        audioElement.play().catch(e => console.warn("Audio no pudo reproducirse:", e));
    }
});

// Terminar dibujo y guardar ruta con color
canvas.addEventListener('mouseup', () => {
    if (modoDibujo) {
        isDrawing = false;
        if (currentRuta.length > 0) {
            rutas.push({ puntos: currentRuta, color: colorRuta });
        }

        // Pausar audio si terminamos de dibujar
        audioElement.pause();
    }
});

// Dibujar mientras se mueve el ratón
canvas.addEventListener('mousemove', (event) => {
    if (modoDibujo && isDrawing) {
        const x = event.offsetX;
        const y = event.offsetY;
        currentRuta.push({ x, y });

        actualizarAudioConPosicion(x, y, canvas.width, canvas.height);
        dibujarTodo();
        comprobarMarcadores(x, y); // Comprobar si se tocan marcadores en cada punto
    }
});

// Comprobar si el trazo toca marcadores
function comprobarMarcadores(x, y) {
    const umbral = 10;  // Distancia para considerar que ha tocado un marcador
    marcadores.forEach((marker, index) => {
        const distancia = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));

        if (distancia <= umbral && !marcadoresTocados.has(index)) {
            marcadoresTocados.add(index);  // Guardar el índice del marcador tocado
            console.log("Marcador tocado:", marker.descripcion);  // Log para verificar
        }
    });

    if (marcadoresTocados.size >= 2 && !juegoTerminado) {
        juegoTerminado = true;

        const nombreUsuarioValue = nombreUsuario.value.trim();

        setTimeout(() => {
            alert(`¡Enhorabuena, ${nombreUsuarioValue}! Has conseguido conectar dos lugares emblemáticos.`);
            borrarTodo();
            window.location.reload();
        }, 200);
    }
}

// Agregar marcadores con clic derecho
canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (!modoDibujo) {
        const x = event.offsetX;
        const y = event.offsetY;
        const descripcion = prompt("Descripción del lugar turístico:");
        if (descripcion) {
            marcadores.push({ x, y, descripcion });
            dibujarMarcadores();
            animarOnda(x, y);
        }
    }
});

// Animación de onda al agregar marcadores
function animarOnda(x, y) {
    let radio = 6;
    let opacidad = 1.0;

    function animar() {
        if (opacidad > 0) {
            ctx.drawImage(mapaImg, 0, 0, canvas.width, canvas.height);  // Redibujar el mapa
            dibujarTodo();  // Redibujar rutas y marcadores

            ctx.strokeStyle = `rgba(255, 87, 51, ${opacidad})`;  // Color naranja con opacidad
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, radio, 0, Math.PI * 2);
            ctx.stroke();

            radio += 0.5;         // Aumenta el radio de la onda
            opacidad -= 0.01;   // Disminuye la opacidad para el efecto de desvanecimiento
            requestAnimationFrame(animar);
        }
    }
    animar();
}

// Dibujar rutas y marcadores
function dibujarRutas() {
    ctx.drawImage(mapaImg, 0, 0, canvas.width, canvas.height);

    rutas.forEach((ruta) => {
        ctx.strokeStyle = ruta.color;
        ctx.lineWidth = parseInt(grosorRutas.value.trim(), 10) || 3;
        ctx.beginPath();
        ctx.moveTo(ruta.puntos[0].x, ruta.puntos[0].y);
        ruta.puntos.forEach((punto) => ctx.lineTo(punto.x, punto.y));
        ctx.stroke();
    });

    if (currentRuta.length > 0) {
        ctx.strokeStyle = colorRuta;
        ctx.beginPath();
        ctx.moveTo(currentRuta[0].x, currentRuta[0].y);
        currentRuta.forEach((punto) => ctx.lineTo(punto.x, punto.y));
        ctx.stroke();
    }
}

// Dibujar marcadores
function dibujarMarcadores() {
    marcadores.forEach((marker) => {
        ctx.fillStyle = "#FF5733";
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.font = "20px Arial";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.strokeText(marker.descripcion, marker.x + 10, marker.y);

        ctx.fillStyle = "#fff";
        ctx.fillText(marker.descripcion, marker.x + 10, marker.y);
    });
}

function dibujarTodo() {
    dibujarRutas();
    dibujarMarcadores();
}

// Borrar todo
function borrarTodo() {
    rutas = [];
    currentRuta = [];
    marcadores = [];
    marcadoresTocados.clear();  // Limpiar los marcadores tocados
    ctx.drawImage(mapaImg, 0, 0, canvas.width, canvas.height);
}

function borrarRutas() {
    rutas = [];
    currentRuta = [];
    ctx.drawImage(mapaImg, 0, 0, canvas.width, canvas.height);
    dibujarTodo();
}

function borrarMarcadores() {
    marcadores = [];
    marcadoresTocados.clear();  // Limpiar los marcadores tocados
    ctx.drawImage(mapaImg, 0, 0, canvas.width, canvas.height);
    dibujarTodo();
}

// Alternar modo dibujo
function toggleDibujo() {
    modoDibujo = !modoDibujo;

    if (modoDibujo) {
        boton.textContent = "Activar Marcadores";
        boton.style.backgroundColor = "#c09700";
    } else {
        boton.textContent = "Activar Dibujado";
        boton.style.backgroundColor = "#026700";
    }
}
