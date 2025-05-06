//import * as THREE from 'three';
import * as THREE from 'https://esm.sh/three@latest';
import { PointerLockControls } from 'threePointerLockControls';
import { params } from 'params';
import { SolarSystem } from 'solarSystem';


const miniCameraMinY = 20;
const miniCameraMaxY = 500;

// Scene
export const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, params.STAR_RADIUS*10); // Move camera back to see planets
camera.rotation.x = -Math.PI / 6; // Incline the camera to look down at the solar system, 30 degrees down
// Minimap Camera - top-down view
const d = 200;
const aspect = 1;
const miniCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 2000);

// Position the camera high above the scene, looking down
miniCamera.position.set(0, 200, 0);       // High in Y
miniCamera.up.set(0, 0, -1);              // Make Z axis point "up" on the screen
miniCamera.lookAt(0, 0, 0);               // Look at the center


// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Minimap Renderer
const miniRenderer = new THREE.WebGLRenderer({ antialias: true });
miniRenderer.setSize(250, 250);
miniRenderer.setClearColor(0x000000, 1);
minimapContainer.appendChild(miniRenderer.domElement);

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

const zoomSpeed = 20;
let miniFrustumSize = 300;

function updateMiniCameraFrustum(size) {
    miniCamera.top = size;
    miniCamera.bottom = -size;
    miniCamera.left = -size * aspect;
    miniCamera.right = size * aspect;
    miniCamera.updateProjectionMatrix();
}

updateMiniCameraFrustum(miniFrustumSize);

document.addEventListener('wheel', (event) => {
    const delta = event.deltaY > 0 ? 1 : -1;
    miniFrustumSize = THREE.MathUtils.clamp(miniFrustumSize + delta * zoomSpeed, 50, 1000);
    updateMiniCameraFrustum(miniFrustumSize);
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

    // Update planetary positions
    [...solarSystem.moons, ...solarSystem.planets].forEach(planet => {
        const orbitSpeed = planet.isMoon 
            ? (2 * Math.PI) / (planet.orbit.radius * 50) 
            : (2 * Math.PI) / (planet.orbit.radius * 500);
        planet.updateRotationSpeed();
        planet.updateOrbit(orbitSpeed);
    });

    // Movement (WASD)
    if (keys['KeyW']) controls.moveForward(moveSpeed);
    if (keys['KeyS']) controls.moveForward(-moveSpeed);
    if (keys['KeyA']) controls.moveRight(-moveSpeed);
    if (keys['KeyD']) controls.moveRight(moveSpeed);

    // Vertical movement + miniCamera zoom
    if (keys['Space']) {
        camera.position.y += moveSpeed;
        miniCamera.position.y += moveSpeed;
    }
    if (keys['ShiftLeft']) {
        camera.position.y -= moveSpeed;
        miniCamera.position.y -= moveSpeed;
    }

    // Clamp minimap camera Y distance (zoom level)
    miniCamera.position.y = Math.max(miniCameraMinY, Math.min(miniCameraMaxY, miniCamera.position.y));    

    // Update minimap camera to follow player from above
    miniCamera.position.x = camera.position.x;
    miniCamera.position.z = camera.position.z;

    // Extract yaw from camera's quaternion safely
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const yaw = Math.atan2(cameraDirection.x, cameraDirection.z);

    // Set minimap camera rotation: look down (-90° pitch) with yaw
    miniCamera.rotation.set(-Math.PI / 2, 0, -yaw);

    // Set up vector to keep minimap orientation consistent
    miniCamera.up.set(Math.sin(yaw), 0, Math.cos(yaw));

    miniCamera.up.set(Math.sin(yaw), 0, Math.cos(yaw));
    // Y stays fixed so it's always looking down from above
    miniCamera.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));

    // Render the scene
    renderer.render(scene, camera);
    miniRenderer.render(scene, miniCamera);
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
