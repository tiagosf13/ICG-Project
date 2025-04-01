import * as THREE from 'three';
import { Orbit } from '../Orbit/orbit.js';
import { params } from 'params';

export class Planet {
    // Add a new constant for controlling the minimum distance between planets

    constructor(
        name,
        radius,
        position,
        rotationSpeed,
        isStar = false,
        texture,
        widthSegments = 32, 
        heightSegments = 32,
        existingPlanets = [], // Pass in existing planets to check for overlap
        star = null // Pass the star (the Sun) for overlap check
    ) {
        this.name = name || this.randomName();
        this.radius = radius || (isStar ? (this.randomDiameter() / 2) * params.STAR_PLANET_RATIO : this.randomDiameter() / 2);
        
        this.position = position || this.generateValidPosition(existingPlanets, star);
        
        this.rotationSpeed = rotationSpeed || this.randomRotationSpeed();
        this.texture = texture || this.randomTexture(isStar);
    
        this.mesh = this.createMesh(widthSegments, heightSegments, this.texture);
        this.orbit = new Orbit(this.position.length());
        this.star = star; // Store the star reference
    }

    updateOrbit(orbitSpeed) {
        this.orbit.orbitAngle += orbitSpeed; // Increment the angle
    
        const starPosition = this.star ? this.star.mesh.position : new THREE.Vector3(0, 0, 0);
    
        // Calculate elliptical orbit radius
        const r = this.orbit.radius * (1 - this.orbit.eccentricity * Math.cos(this.orbit.orbitAngle));
    
        // Compute X and Z positions
        const x = r * Math.cos(this.orbit.orbitAngle);
        const z = r * Math.sin(this.orbit.orbitAngle);
    
        // Create a new 3D position vector before applying inclination
        let newPosition = new THREE.Vector3(x, 0, z);
    
        // Apply inclination using the orbit's rotation matrix
        const inclinationMatrix = new THREE.Matrix4().makeRotationX(this.orbit.inclination);
        newPosition.applyMatrix4(inclinationMatrix);
    
        // Set the final position relative to the star
        this.mesh.position.set(
            starPosition.x + newPosition.x,
            starPosition.y + newPosition.y,
            starPosition.z + newPosition.z
        );
    }           

    // Load and apply texture (if exists) or set default color
    createMesh(widthSegments, heightSegments, texture) {
        let geometry = new THREE.SphereGeometry(this.radius, widthSegments, heightSegments);
        
        if (texture) {
            const loader = new THREE.TextureLoader();
            texture = loader.load(texture); // Load texture asynchronously
            this.material = new THREE.MeshBasicMaterial({ map: texture });
        } else {
            this.material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        }

        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.position.set(this.position.x, this.position.y, this.position.z);
        return mesh;
    }

    // Check if the new position overlaps with any existing planet or the star
    checkOverlap(existingPlanets, star) {
        // Check overlap with the star (the Sun)
        if (star) {
            let distanceToStar = this.position.distanceTo(star.position);
            let combinedRadii = this.radius + star.radius; // Consider the radius of the star (Sun)
            if (distanceToStar < combinedRadii) {
                return true; // Overlap detected with the star
            }
        }

        // Check overlap with other planets considering the minimum distance
        for (let planet of existingPlanets) {
            let distance = this.position.distanceTo(planet.position);
            let combinedRadii = this.radius + planet.radius + params.MIN_PLANET_DISTANCE;
            if (distance < combinedRadii) {
                return true; // Overlap detected
            }
        }

        return false; // No overlap
    }

    // Generate a valid position that does not overlap with any other planet or the star
    generateValidPosition(existingPlanets, star) {
        let position;
        let overlap = true;

        while (overlap) {
            position = new THREE.Vector3(this.randomDistance2Star(), 0, 0); // Random position
            this.position = position; // Assign the position

            // Check for overlap with the star and other planets
            overlap = this.checkOverlap(existingPlanets, star);
        }

        return position; // Return valid position after overlap check
    }

    // Generate a random texture for the planet or star
    randomTexture(isStar) {
        const texturePath = isStar
            ? params.STARTTEXTURES[Math.floor(Math.random() * params.STARTTEXTURES.length)]
            : params.PLANETTEXTURES[Math.floor(Math.random() * params.PLANETTEXTURES.length)];
        return "/src/textures/" + texturePath;
    }

    // Generate a random name for the planet
    randomName() {
        return params.PLANETNAMES[Math.floor(Math.random() * params.PLANETNAMES.length)];
    }

    // Generate a random diameter for the planet
    randomDiameter() {
        return params.DIAMETER_SCALE_FACTOR * (Math.random() * (params.MAX_DIAMETER - params.MIN_DIAMETER) + params.MIN_DIAMETER);
    }

    // Generate a random distance from the Sun for the planet
    randomDistance2Star() {
        return Math.random() * (params.MAX_DISTANCE_2_STAR - params.MIN_DISTANCE_2_STAR) + params.MIN_DISTANCE_2_STAR;
    }

    // Generate a random period for the planet
    randomPeriod() {
        return Math.random() * (params.MAX_PERIOD - params.MIN_PERIOD) + params.MIN_PERIOD;
    }

    // Generate a random rotation speed for the planet
    randomRotationSpeed() {
        const sign = Math.random() < 0.5 ? -1 : 1; // Randomly choose -1 or 1
        return sign * (Math.random() * (params.MAX_ROTATION_SPEED - params.MIN_ROTATION_SPEED) + params.MIN_ROTATION_SPEED);
    }

    updateRotationSpeed() {
        this.mesh.rotation.y += this.rotationSpeed; // Rotate the planet around its own axis
    }
}
