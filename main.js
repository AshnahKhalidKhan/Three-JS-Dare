import * as THREE from 'three';
import { GUI } from 'dat.gui';

// --- Scene setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Bloch sphere wireframe ---
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const wireMaterial = new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  wireframe: true,
  transparent: true,
  opacity: 0.3,
});
const sphere = new THREE.Mesh(sphereGeometry, wireMaterial);
scene.add(sphere);

// --- Axes ---
const axesLength = 1.5;
const xAxis = new THREE.ArrowHelper(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 0),
  axesLength,
  0xff0000
);
const yAxis = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, 0),
  axesLength,
  0x0000ff
);
const zAxis = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  axesLength,
  0x00ff00
);
scene.add(xAxis, yAxis, zAxis);

// --- State vector ---
const stateVector = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  1.2,
  0xffff00
);
scene.add(stateVector);

// --- Parameters for θ and φ ---
const params = {
  theta: 0,
  phi: 0,
  state: '',
};

// --- GUI setup ---
const gui = new GUI();
gui.width = 300;
gui.add(params, 'theta', 0, Math.PI, 0.01).name('θ (rad)').onChange(updateState);
gui.add(params, 'phi', -Math.PI, Math.PI, 0.01).name('φ (rad)').onChange(updateState);

const stateFolder = gui.addFolder('Quantum State');
stateFolder.add(params, 'state').name('|ψ⟩').listen();

// --- Update function ---
function updateState() {
  const { theta, phi } = params;

  // Bloch sphere position
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.cos(theta);
  const z = Math.sin(theta) * Math.sin(phi);

  stateVector.setDirection(new THREE.Vector3(x, y, z).normalize());

  // Quantum amplitudes
  const alpha = Math.cos(theta / 2);
  const betaReal = Math.sin(theta / 2) * Math.cos(phi);
  const betaImag = Math.sin(theta / 2) * Math.sin(phi);

  params.state = `|ψ⟩ = ${alpha.toFixed(4)}|0⟩ + (${betaReal.toFixed(4)} ${betaImag >= 0 ? '+' : ''} ${betaImag.toFixed(4)}i)|1⟩`;
}
updateState();

// --- Resize handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Render loop ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
