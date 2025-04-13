import * as THREE from 'three';
import { Planet } from '../Planet/planet.js';
import { params } from '../../params/params.js';

export class SolarSystem {
    constructor(scene=null, noRendering=false, readFromFile = false, fileContent = null) {
        this.moons = [];
        this.planets = []; // Array to hold planets
        this.star = null; // Placeholder for the star
        this.object = new THREE.Object3D(); // Main object for the solar system
        readFromFile ? this.readFromFile(fileContent, scene) : this.populateSolarSystem(params.NUMBER_OF_PLANETS, scene, noRendering); // Create planets if not reading from file
        console.log("Moons: ", this.moons);
        console.log("Planets:", this.planets);
    }

    readFromFile(fileContent, scene) {
        // Map the JSON data to the SolarSystem class
        const data = JSON.parse(fileContent);

        // Star data
        const starData = data.star;
        const star = new Planet(
            starData.name,
            starData.radius,
            new THREE.Vector3(starData.position.x, starData.position.y, starData.position.z),
            starData.rotationSpeed,
            starData.isStar,
            starData.isMoon,
            starData.texture,
            starData.widthSegments,
            starData.heightSegments,
            [...this.moons, ...this.planets], // Existing planets and moons
            null, // No existing planets
            null, // No center
            false
        );
        this.setStar(star, scene); // Set the star in the solar system

        // Create planets from the JSON data
        const planetsData = data.planets;
        planetsData.forEach(planetData => {
            const planet = new Planet(
                planetData.name,
                planetData.radius,
                new THREE.Vector3(planetData.position.x, planetData.position.y, planetData.position.z),
                planetData.rotationSpeed,
                planetData.isStar,
                planetData.isMoon,
                planetData.texture,
                planetData.widthSegments,
                planetData.heightSegments,
                [...this.moons, ...this.planets], // Existing planets and moons
                this.star, // Set the star as the center
                planetData.center, // No center for the star
                false // noRendering is true for the planet
            );
            this.addPlanet(planet); // Add the planet to the solar system
            // Create moons for the planet from the JSON data
            planetData.moons.forEach(moonData => {
                this.createMoons(planet, false, moonData); // Pass moon data to createMoons method
            });
        });
    }

    populateSolarSystem(numberOfPlanets, scene, noRendering = false) {
        const star = new Planet(
            'Star',                        // name
            null,                            // radius
            new THREE.Vector3(0, 0, 0),    // position
            0,                             // rotationSpeed
            true,                           // isStar
            false,                          // isMoon
            null,                           // texture
            32,             // widthSegments
            32,// heightSegments
            [...this.moons, ...this.planets],                 // existingPlanets
            null,                           // star
            null,                           // center
            noRendering,                          // noRendering
        );
        this.setStar(star, scene); // Set the star in the solar system
        this.createPlanets(numberOfPlanets, noRendering); // Create planets
    }

    // Method to add a planet to the solar system
    addPlanet(planet) {
        this.planets.push(planet); // Store the planet object
        this.object.add(planet.mesh); // Add planet mesh to the solar system object
        this.object.add(planet.orbit.trajectory); // Add orbit trajectory to the solar system object
        this.star ? this.star.orbit.object.add(planet.mesh) : this.object.add(planet.mesh);
    }

    // Method to set the star of the solar system
    setStar(star, scene=null) {
        this.star = star; // Set the star
        this.object.add(star.mesh); // Add star mesh to the solar system object
        this.object.add(star.orbit.trajectory); // Add orbit trajectory to the solar system object
        // Add the star to the scene
        scene?.add(star.orbit.object); // Add star mesh to the scene
    }

    // Add planets to the solar system with overlap checks
    createPlanets(numPlanets, noRendering = false) {
        for (let i = 0; i < numPlanets; i++) {
            const planet = new Planet(null, null, null, null, false, false, null, 32, 32, [...this.moons, ...this.planets], this.star, null, noRendering);
            while (Math.random() < params.MOON_PROBABILITY) {
                this.createMoons(planet, noRendering); // Create moons for the planet
            }
            this.addPlanet(planet);
        }
    }

    createMoons(planet, noRendering=false, moon=null) {
        if (!planet.isStar) {
            const newMoon = new Planet(
                moon?.name, moon?.radius, null, moon?.rotationSpeed, false, true, moon?.texture,
                moon?.widthSegments, moon?.heightSegments,
                [...this.moons, ...this.planets], // Existing planets and moons
                this.star,
                planet, // Set planet as center
                noRendering // Pass noRendering flag to the moon
            );
            planet.moon = newMoon;
            planet.addMoon(newMoon); // Add moon to the planet
            this.moons.push(newMoon); // Add moon to the artifacts array
        }
    }
    
}
