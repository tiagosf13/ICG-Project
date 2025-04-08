import * as THREE from 'three';
//import { params } from 'params';
import { params }  from '../../params/params.js';

// Orbit class
class Orbit {
    constructor(radius = params.ORBIT_RADIUS, segments = params.ORBIT_SEGMENTS) {
        this.radius = radius;
        this.segments = segments;
        this.eccentricity = Math.random() * 0.3; // Slight eccentricity (0 to 0.3)
        this.inclination = (Math.random() - 0.5) * Math.PI / 6; // Random tilt between -30° and 30°
        this.trajectory = this.createTrajectory(radius, segments);
        this.object = new THREE.Object3D();
        this.orbitAngle = Math.random() * Math.PI * 2;
        
        // Apply inclination
        this.trajectory.rotation.x = this.inclination;  // << Apply inclination to the trajectory
    }

    createTrajectory(radius, segments) {
        const points = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = radius * (1 - this.eccentricity * Math.cos(angle)); // Apply eccentricity
            points.push(new THREE.Vector3(r * Math.cos(angle), 0, r * Math.sin(angle)));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        return new THREE.LineLoop(geometry, material);
    }
}


// Export the Orbit class
export { Orbit };