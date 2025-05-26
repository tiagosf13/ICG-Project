//import * as THREE from 'three';
import * as THREE from 'https://esm.sh/three@latest';
import { PointerLockControls } from 'threePointerLockControls';
import { params } from 'params';
import { SolarSystem } from 'solarSystem';


const miniCameraMinY = 10;
const miniCameraMaxY = 200;
let orbitSpeedMultiplier = 1.0;
const orbitSpeedStep = 0.1;
let uiVisible = true;
let showOrbitMesh = true;

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
renderer.setClearColor(0x000000, 1);
renderer.shadowMap.enabled = true; // Enable shadow maps
document.body.appendChild(renderer.domElement);
// Minimap Renderer
const miniRenderer = new THREE.WebGLRenderer({ antialias: true });
// miniRenderer.setSize(window.innerWidth * 0.15, window.innerWidth * 0.15);
miniRenderer.setClearColor(0x000000, 1);
minimapContainer.appendChild(miniRenderer.domElement);

// Solar System
export let solarSystem = new SolarSystem(scene);
scene.add(solarSystem.object);


// Star Light (PointLight for illuminating planets)
const starLight = new THREE.PointLight(0xffffff, 100, 0, 1);
// If still too dim, try 12, 15, or even 20. Iterate to find a good value.
starLight.castShadow = true;
starLight.shadow.mapSize.width = 2048;
starLight.shadow.mapSize.height = 2048;
starLight.shadow.camera.near = 0;
starLight.shadow.camera.far = params.STAR_RADIUS * 150; // Ensure this covers your system for shadows

if (solarSystem.star && solarSystem.star.mesh) {
    starLight.position.copy(solarSystem.star.mesh.position);
} else {
    starLight.position.set(0, 0, 0);
}
scene.add(starLight);

// Ambient Light (for subtle fill light on dark sides)
const ambientLight = new THREE.AmbientLight(0x333333, 1.5);
scene.add(ambientLight);

// Controls
const controls = new PointerLockControls(camera, document.body);
renderer.domElement.addEventListener('click', () => controls.lock());

// Movement variables
const moveSpeed = 0.6;
const keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false, ShiftLeft: false };

const orbitSpeedDisplayValue = document.getElementById('orbitSpeedDisplayValue');


document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) keys[event.code] = true;

    if (event.code === 'ArrowUp') {
        orbitSpeedMultiplier = Math.min(orbitSpeedMultiplier + orbitSpeedStep, 50); // cap at 10x
    }
    if (event.code === 'ArrowDown') {
        orbitSpeedMultiplier = Math.max(orbitSpeedMultiplier - orbitSpeedStep, 0.1); // floor at 0.1x
    }

    if (event.code === 'KeyU') {
        uiVisible = !uiVisible;
        const uiElements = [
            document.getElementById('leftContainer'),
            document.getElementById('rightContainer'),
            document.getElementById('systemNameDisplay'),
            document.getElementById('minimapContainer'),
            document.getElementById('planetInfoContainer')
        ];
        uiElements.forEach(el => {
            if (el) el.style.display = uiVisible ? 'block' : 'none';
        });
    }

    if (event.code === 'KeyM') {
        showOrbitMesh = !showOrbitMesh;
        updateOrbitVisibility();
    }
});


document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) keys[event.code] = false;
});

const zoomSpeed = 0.5;
let miniFrustumSize = 200;

function updateMiniCameraFrustum(size) {
    miniCamera.top = size;
    miniCamera.bottom = -size;
    miniCamera.left = -size * aspect;
    miniCamera.right = size * aspect;
    miniCamera.updateProjectionMatrix();
}

updateMiniCameraFrustum(miniFrustumSize);

let targetFrustumSize = miniFrustumSize;

document.addEventListener('wheel', (event) => {
    let zoomDelta = event.deltaY;

    // Normalize if deltaMode is in lines instead of pixels
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        zoomDelta /= 20; // Or a value that works well on your system
    }

    const zoomStep = zoomDelta * zoomSpeed; // Adjust this multiplier as needed
    targetFrustumSize = THREE.MathUtils.clamp(
        targetFrustumSize + zoomStep,
        miniCameraMinY,
        miniCameraMaxY
    );
});

export function replaceSolarSystem(newSystem) {
    // Dispose of the old solar system
    solarSystem.moons.forEach(moon => {
        disposeObject3D(moon.mesh);
        scene.remove(moon.orbit.object);
    });
    solarSystem.planets.forEach(planet => {
        disposeObject3D(planet.mesh);
        scene.remove(planet.orbit.object);
    });
    if (solarSystem.star) {
        disposeObject3D(solarSystem.star.mesh);
        scene.remove(solarSystem.star.orbit.object);
    }
    disposeObject3D(solarSystem.object);
    scene.remove(solarSystem.object);

    // Remove planet cards from DOM
    planetCards.forEach(card => {
        if (card.parentNode) {
            card.parentNode.removeChild(card);
        }
    });
    planetCards.clear();

    // Add new solar system
    solarSystem = newSystem;
    scene.add(solarSystem.object);
    updateOrbitVisibility();
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

function toScreenPosition(obj, camera) {
    const vector = new THREE.Vector3();
    obj.getWorldPosition(vector);
    vector.project(camera);

    return {
        x: (vector.x * 0.5 + 0.5) * window.innerWidth,
        y: (-vector.y * 0.5 + 0.5) * window.innerHeight
    };
}


let lastTime = performance.now();
// Animate loop
function animate() {
    requestAnimationFrame(animate);

    let now = performance.now();
    let deltaTime = (now - lastTime) / 1000; // seconds elapsed since last frame
    lastTime = now;

    // Update planetary positions
    [...solarSystem.moons, ...solarSystem.planets].forEach(planet => {
        const orbitSpeed = planet.isMoon 
            ? (2 * Math.PI) / (planet.orbit.radius * 50) * orbitSpeedMultiplier
            : (2 * Math.PI) / (planet.orbit.radius * 500) * orbitSpeedMultiplier;
        orbitSpeedDisplayValue.textContent = `${orbitSpeedMultiplier.toFixed(1)}`;
        planet.updateRotationSpeed(deltaTime);
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

    miniFrustumSize = THREE.MathUtils.lerp(miniFrustumSize, targetFrustumSize, 0.1);
    updateMiniCameraFrustum(miniFrustumSize);

    // Planet card update
    const cameraPos = camera.position;
    const viewDir = new THREE.Vector3();
    camera.getWorldDirection(viewDir);

    [...solarSystem.planets, ...solarSystem.moons].forEach(body => {
        if (!body.mesh) return;

        const bodyPos = new THREE.Vector3();
        body.mesh.getWorldPosition(bodyPos);

        const distance = cameraPos.distanceTo(bodyPos);
        if (distance > params.MIN_CARD_DISTANCE_2_PLANET) {
            if (planetCards.has(body.id)) {
                planetCards.get(body.id).style.display = 'none';
            }
            return;
        }

        const dirToBody = bodyPos.clone().sub(cameraPos).normalize();
        const angle = viewDir.angleTo(dirToBody);

        if (angle < Math.PI / 4) {
            const cardId = body.id;
            let card = planetCards.get(cardId);

            if (!card) {
                card = document.createElement('div');
                card.className = 'planet-card';

                card.innerHTML = `
                    <div>${body.isMoon ? `🌙 ${body.name}` : `🪐 ${body.name}`}</div>
                    <div>Radius: ${typeof body.radius === 'number' ? body.radius.toFixed(2) : 'N/A'} km</div>
                    <div>Distance to star: ${body.orbit?.radius != null ? body.orbit.radius.toFixed(2) : 'N/A'} AU</div>
                    <div>Period: ${body.orbit?.period != null ? body.orbit.period.toFixed(2) : 'N/A'} years</div>
                    <div>Rotation speed: ${typeof body.rotationSpeed === 'number' ? Math.abs(body.rotationSpeed).toFixed(4) : 'N/A'} rad/day</div>
                    <div>Day length: ${typeof body.dayLength === 'number' ? body.dayLength.toFixed(2) : 'N/A'} days</div>
                `;

                infoContainer.appendChild(card);
                planetCards.set(cardId, card);
            }

            card.style.display = 'block';

            const screenPos = toScreenPosition(body.mesh, camera);
            card.style.left = `${screenPos.x}px`;
            card.style.top = `${screenPos.y}px`;

        } else {
            if (planetCards.has(body.id)) {
                planetCards.get(body.id).style.display = 'none';
            }
        }
    });

    if (solarSystem.star?.mesh) {
        starLight.position.copy(solarSystem.star.mesh.getWorldPosition(new THREE.Vector3()));
    }


    // Render the scene
    renderer.render(scene, camera);
    miniRenderer.render(scene, miniCamera);
}
const infoContainer = document.getElementById('planetInfoContainer');
const planetCards = new Map(); // planetName -> cardElement

animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function updateOrbitVisibility() {
    solarSystem.planets.forEach(planet => {
        if (planet.orbit?.object) {
            planet.orbit.trajectory.visible = showOrbitMesh;
        }
    });
    solarSystem.moons.forEach(moon => {
        if (moon.orbit?.object) {
            moon.orbit.trajectory.visible = showOrbitMesh;
        }
    });
}

