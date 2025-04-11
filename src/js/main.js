//import * as THREE from 'three';
import * as THREE from 'https://esm.sh/three@latest';
import { PointerLockControls } from 'threePointerLockControls';
import { params } from 'params';
import { SolarSystem } from 'solarSystem';

// Scene
export const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, params.STAR_RADIUS*10); // Move camera back to see planets
camera.rotation.x = -Math.PI / 6; // Incline the camera to look down at the solar system, 30 degrees down

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Solar System
export let solarSystem = new SolarSystem(scene);
scene.add(solarSystem.object);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// Movement variables
const moveSpeed = 0.6;
const keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false, ShiftLeft: false };

document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) keys[event.code] = false;
});

export function replaceSolarSystem(newSystem) {
    
    // TODO: optionally dispose of geometry/textures if needed
    // Dispose of the old solar system
    solarSystem.moons.forEach(moon => {
        disposeObject3D(moon.mesh);
        scene.remove(moon.orbit.object);
    });
    solarSystem.planets.forEach(planet => {
        disposeObject3D(planet.mesh);
        scene.remove(planet.orbit.object);
    });
    disposeObject3D(solarSystem.star.mesh);
    scene.remove(solarSystem.star.orbit.object);
    // Dispose of the star if needed
    if (solarSystem.star) {
        disposeObject3D(solarSystem.star.mesh);
        scene.remove(solarSystem.star.orbit.object);
    }
    // Remove old one from the scene
    disposeObject3D(solarSystem.object);
    scene.remove(solarSystem.object);
    
    // Add new one
    solarSystem = newSystem;
    scene.add(solarSystem.object);
}

function disposeObject3D(obj) {
    obj.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}


// Animate loop
function animate() {
    requestAnimationFrame(animate);

    [...solarSystem.moons, ...solarSystem.planets].forEach(planet => {

        const orbitSpeed = planet.isMoon ? (2 * Math.PI) / (planet.orbit.radius * 50) : (2 * Math.PI) / (planet.orbit.radius * 500); // Adjust the divisor for a realistic speed
        planet.updateRotationSpeed();
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

// Axes Helper
// Red for X, Green for Y, Blue for Z
const axesHelper = new THREE.AxesHelper( 20 );
axesHelper.setColors( new THREE.Color( 0xff0000 ), new THREE.Color( 0x00ff00 ), new THREE.Color( 0x0000ff ) );
scene.add( axesHelper );

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
