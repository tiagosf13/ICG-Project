import * as THREE from 'three';
import { PointerLockControls } from 'threePointerLockControls';
import { params } from 'params';
import { Planet } from 'planet';
import { SolarSystem } from 'solarSystem';

const STAR_RADIUS = 5; // Radius of the star in Three.js units

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, STAR_RADIUS*2); // Move camera back to see planets
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Solar System
const solarSystem = new SolarSystem();
scene.add(solarSystem.object);

// Create a star
const star = new Planet(
    'Star',                        // name
    10,                            // radius
    new THREE.Vector3(0, 0, 0),    // position
    0,                             // rotationSpeed
    true                           // isStar
);
solarSystem.setStar(star, scene);

// Create Planets
solarSystem.createPlanets(8); // Create 8 planets


// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// Movement variables
const moveSpeed = 0.1;
const keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false, ShiftLeft: false };

document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) keys[event.code] = false;
});

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    solarSystem.artifacts.forEach(planet => {
        const orbitSpeed = (2 * Math.PI) / (planet.orbit.radius * 500); // Adjust the divisor for a realistic speed
        planet.updateRotationSpeed()
        planet.updateOrbit(orbitSpeed);
    });

    // WASD Movement
    if (keys['KeyW']) controls.moveForward(moveSpeed);
    if (keys['KeyS']) controls.moveForward(-moveSpeed);
    if (keys['KeyA']) controls.moveRight(-moveSpeed);
    if (keys['KeyD']) controls.moveRight(moveSpeed);
    if (keys['Space']) camera.position.y += moveSpeed;
    if (keys['ShiftLeft']) camera.position.y -= moveSpeed;

    renderer.render(scene, camera);
}

animate();

const axesHelper = new THREE.AxesHelper( 20 );
// Set colors
// Red for X, Green for Y, Blue for Z
axesHelper.setColors( new THREE.Color( 0xff0000 ), new THREE.Color( 0x00ff00 ), new THREE.Color( 0x0000ff ) );
scene.add( axesHelper );

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
