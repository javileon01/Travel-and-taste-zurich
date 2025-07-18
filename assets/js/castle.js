import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let container;
let camera, scene, renderer, controls;
const loader = new GLTFLoader();

let castleGroup = new THREE.Group();
let castle = null;
let flagMesh = null;

let ambientLight, sun;
let isDay = false;
let isRotating = false;

let cameraViews = { };

let textMesh = null;
const textLabels = [];

initScene();
loadGLTFModels();
animate();

function initScene() {
  container = document.getElementById("castilloContainer");

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(0, 0, 100);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc); // gris claro suave
  scene.add(camera);

  // Luz ambiental suave
  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  window.addEventListener("resize", onWindowResize, false);

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "l") toggleLighting();
  });  
  
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && castle) rotateCastle();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "d") toggleDisappear();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "i") posInicial();
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key === "1") moveCameraToView("normal");
    if (key === "2") moveCameraToView("bandera");
    if (key === "3") moveCameraToView("cenital");
  });  
}

async function loadGLTFModels() {
  try {
    const gltfAsset = await loader.loadAsync("../assets/models/castillo.glb");
    const gltfModel = gltfAsset.scene;
    castleGroup.add(gltfModel);
    scene.add(castleGroup);
    castle = gltfModel;

    const castlePos = castle.position.clone(); // posición final tras centrado

    // TEXTURA DE LA BANDERA
    const textureLoader = new THREE.TextureLoader();
    const flagTexture = await textureLoader.loadAsync("../assets/img/flag_of_switzerland.png");
    const flagGeometry = new THREE.PlaneGeometry(0.1, 0.1); // cuadrado
    const flagMaterial = new THREE.MeshBasicMaterial({ map: flagTexture, side: THREE.DoubleSide });

    flagMesh = new THREE.Mesh(flagGeometry, flagMaterial);
    flagMesh.position.set(castlePos.x - 0.51, castlePos.y + 1.58, castlePos.z - 0.5);     // Coloca la bandera donde se vea bien
    flagMesh.rotation.set(0, 0.47, 0); // rotación para que quede bien
    scene.add(flagMesh);

     // Luz principal desde arriba/derecha
    sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.copy(castlePos).add(new THREE.Vector3(30, 50, 30));
    scene.add(sun);

    // Luz de relleno
    const fill = new THREE.DirectionalLight(0xffffff, 1);
    fill.position.copy(castlePos).add(new THREE.Vector3(-30, 20, -20));
    scene.add(fill);

    // Luz desde abajo
    const bottom = new THREE.PointLight(0xffffff, 0.3);
    bottom.position.copy(castlePos).add(new THREE.Vector3(0, -30, 0));
    scene.add(bottom);

    const box = new THREE.Box3().setFromObject(castle);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    castle.position.sub(center);
    const desiredSize = 10;
    const scale = desiredSize / maxDim;
    castle.scale.setScalar(scale);

    const newBox = new THREE.Box3().setFromObject(castle);
    const newCenter = newBox.getCenter(new THREE.Vector3());
    castle.position.sub(newCenter);

    const cameraZ = newBox.getSize(new THREE.Vector3()).length() * 1.6;

    cameraViews = {
      normal: new THREE.Vector3(0, 0, cameraZ),              // Vista normal (por defecto)
      bandera: new THREE.Vector3(-7, cameraZ * 0.1, -cameraZ + 15),   // Vista baja (mirando desde abajo)
      cenital: new THREE.Vector3(0, cameraZ - 10, 0.01),          // Vista cenital (desde arriba)
    };

    const fontLoader = new FontLoader();
    fontLoader.load('https://unpkg.com/three@0.151.3/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      addViewSphere(cameraViews.normal, "Vista normal", font);
      addViewSphere(cameraViews.bandera, "Vista bandera", font);
      addViewSphere(cameraViews.cenital, "Vista cenital", font);
    });

    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    //const axesHelper = new THREE.AxesHelper(5);
    //scene.add(axesHelper);

  } catch (err) {
    console.error("Error cargando el modelo:", err);
  }
}

function addViewSphere(position, label, font) {
  // Esfera azul semitransparente
  const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.3,
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(position);
  scene.add(sphere);

  // Texto 3D con la fuente ya cargada
  const textGeometry = new TextGeometry(label, {
    font: font,
    size: 0.4,
    height: 0.05,
    curveSegments: 6,
    bevelEnabled: false,
  });

  textGeometry.computeBoundingBox();
  textGeometry.center(); // Centrar el texto

  const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.copy(sphere.position).add(new THREE.Vector3(0, 1.2, 0)); // un poco encima

  textLabels.push(textMesh);
  scene.add(textMesh);
}

function moveCameraToView(viewName) {
  const targetPos = cameraViews[viewName];
  if (targetPos) {
    camera.position.copy(targetPos);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
    console.log(`📷 Vista cambiada a: ${viewName}`);
  } else {
    console.warn("❌ Vista no encontrada:", viewName);
  }
}

function toggleLighting() {
  if (ambientLight && sun) {
    ambientLight.intensity = isDay ? 0.4 : 0.1;
    sun.intensity = isDay ? 1.2 : 0.5; // más suave de noche
    sun.color.set(isDay ? 0xffffff : 0x222244); // más frío de noche
    scene.background = new THREE.Color(isDay ? 0xcccccc : 0x111133);
    console.log(isDay ? "☀️ Luz de día" : "🌙 Luz de noche");
    
    textLabels.forEach(label => {
      if (label.material && label.material.color) {
        label.material.color.set(isDay ? 0x000000 : 0xffffff);
      }
    });

    isDay = !isDay;
  } else {
    console.warn("⚠️ Luz no encontrada.");
  }
}

function toggleDisappear() {
    if (flagMesh) {
        flagMesh.visible = !flagMesh.visible;
        console.log(flagMesh.visible ? "👀 Bandera visible" : "👻 Bandera oculta");
    } else {
        console.log("⚠️ La bandera no ha cargado aún.");
    }
}

function rotateCastle() {
    isRotating = !isRotating;
}

function posInicial() {
    castleGroup.rotation.set(0, 0, 0);
}

function onWindowResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.setSize(width, height);

}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (isRotating) {
    castleGroup.rotation.y += 0.005; // velocidad de rotación
    console.log(isRotating ? "🔁 Rotación ACTIVADA" : "⏸️ Rotación DESACTIVADA");
  }

  textLabels.forEach(label => label.lookAt(camera.position));
  render();
}

function render() {
  renderer.render(scene, camera);
}
