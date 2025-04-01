import * as THREE from 'three';
import { Planet } from 'planet';

export class SolarSystem {
    constructor() {
        this.artifacts = []; // Array to hold planets
        this.star = null; // Placeholder for the star
        this.object = new THREE.Object3D(); // Main object for the solar system
    }

    // Method to add a planet to the solar system
    addPlanet(planet) {
        this.artifacts.push(planet); // Store the planet object
        this.object.add(planet.mesh); // Add planet mesh to the solar system object
        this.object.add(planet.orbit.trajectory); // Add orbit trajectory to the solar system object
        
        // Corrected this line
        this.star ? this.star.orbit.object.add(planet.mesh) : this.object.add(planet.mesh);
    }    

    // Method to set the star of the solar system
    setStar(star, scene) {
        this.star = star; // Set the star
        this.object.add(star.mesh); // Add star mesh to the solar system object
        this.object.add(star.orbit.trajectory); // Add orbit trajectory to the solar system object
        // Add the star to the scene
        scene.add(star.orbit.object); // Add star mesh to the scene
    }

    // Add planets to the solar system with overlap checks
    createPlanets(numPlanets) {
        for (let i = 0; i < numPlanets; i++) {
            const planet = new Planet(null, null, null, null, false, null, 32, 32, this.artifacts, this.star);
            this.addPlanet(planet);
        }
    }
}
