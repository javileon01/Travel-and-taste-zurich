import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById('modelo-navaja');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Fondo blanco para comprobar

// Cámara (bien posicionada)
const camera = new THREE.PerspectiveCamera(
    45, container.clientWidth / container.clientHeight, 0.1, 1000
);
camera.position.set(0, 0, 5); // cámara cerca del modelo

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Luces (Ambiente + Direccional potente)
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Modelo oficial del pato (garantizado funcional)
const loader = new GLTFLoader();

async function cargarModelo() {
    try {
        const gltf = await loader.loadAsync('../assets/models/swiss_army_knife.glb');
        const modelo = gltf.scene;

        modelo.scale.set(1, 1, 1);   // escala original
        modelo.position.set(0, 0, 0); // exactamente centrado

        scene.add(modelo);
        console.log("✅ Modelo oficial cargado correctamente");
    } catch (error) {
        console.error('❌ Error cargando modelo:', error);
    }
}

cargarModelo();

// Redimensionado automático
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Loop animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
