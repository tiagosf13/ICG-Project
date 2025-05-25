import * as THREE from 'three';
import { Orbit } from '../Orbit/orbit.js';
//import { params } from 'params';
import { params }  from '../../params/params.js';

export class Planet {
    constructor(
        name,
        radius,
        position,
        rotationSpeed,
        isStar = false,
        isMoon = false,
        texture,
        widthSegments = 16, 
        heightSegments = 16,
        existingPlanets = [],
        star = null,
        center = null,
        noRendering=false
    ) {
        this.name = name || this.randomName();
        if (isStar) {
            this.radius = radius || (this.randomDiameter() / 2) * params.STAR_PLANET_RATIO;
        }
        else if (isMoon) {
            this.radius = radius || center.radius * params.MOON_PLANET_RATIO ;
        }
        else {
            this.radius = radius || (this.randomDiameter() / 2); // Random radius for planets
        }
        // Create a UUID for the planet
        this.id = crypto.randomUUID();
        // Generate or assign rotation speed in radians per day
        this.rotationSpeed = rotationSpeed || this.randomRotationSpeed(); // radians/day

        // Compute day length from rotation speed
        this.dayLength = this.rotationSpeed !== 0
            ? (2 * Math.PI) / Math.abs(this.rotationSpeed)  // days per full rotation
            : null;

        this.texture = texture || this.randomTexture(isStar, isMoon);

        this.star = star;
        this.isStar = isStar;
        this.isPlanet = !isStar && !isMoon;
        this.isMoon = isMoon;
        this.center = center || star;
        this.moons = [];
        this.position = position || this.generateValidPosition(existingPlanets, star, isStar, isMoon);
        this.orbit = isMoon 
            ? new Orbit(this.position.distanceTo(center.position), isStar) 
            : new Orbit(this.position.length(), isStar);
        this.mesh = noRendering ? null : this.createMesh(widthSegments, heightSegments, this.texture);
    }

    addMoon(moon) {
        this.moons.push(moon);
        // Attach moon mesh and orbit to this planet's mesh
        this.mesh?.add(moon.mesh);                     // So moon orbits relative to the planet
        this.mesh?.add(moon.orbit.trajectory);         // Show the moon's orbital path around the planet
    }    

    updateOrbit(orbitSpeed) {
        this.orbit.orbitAngle += orbitSpeed;
    
        // Get the center position in world space
        const centerWorldPos = new THREE.Vector3();
        if (this.center && this.center.mesh) {
            this.center.mesh.getWorldPosition(centerWorldPos);
        }
    
        // Calculate elliptical orbit radius
        const r = this.orbit.radius * (1 - this.orbit.eccentricity * Math.cos(this.orbit.orbitAngle));
    
        // Compute position in local (orbit) space
        const x = r * Math.cos(this.orbit.orbitAngle);
        const z = r * Math.sin(this.orbit.orbitAngle);
        let newPosition = new THREE.Vector3(x, 0, z);
    
        // Apply inclination rotation
        const inclinationMatrix = new THREE.Matrix4().makeRotationX(this.orbit.inclination);
        newPosition.applyMatrix4(inclinationMatrix);
    
        // Final position in world space
        const finalWorldPosition = centerWorldPos.clone().add(newPosition);
    
        // If the mesh has a parent (like moons), convert world position to local
        if (this.isMoon && this.center && this.center.mesh) {
            // Since the moon mesh is added to the planet mesh, position is local
            this.mesh.position.set(newPosition.x, newPosition.y, newPosition.z);
        } else if (this.mesh.parent) {
            const localPos = this.mesh.parent.worldToLocal(finalWorldPosition.clone());
            this.mesh.position.copy(localPos);
        } else {
            this.mesh.position.copy(finalWorldPosition);
        }        
    }             

    // Load and apply texture (if exists) or set default color
    createMesh(widthSegments, heightSegments, texturePath) {
        let geometry = new THREE.SphereGeometry(this.radius, widthSegments, heightSegments);
        const loader = new THREE.TextureLoader();
        let textureMap = texturePath ? loader.load(texturePath) : null;

        if (this.isStar) {
            this.material = new THREE.MeshPhongMaterial({
                map: textureMap,
                emissiveMap: textureMap,
                emissive: 0xffffff,
                emissiveIntensity: 1.5,
                color: textureMap ? 0xffffff : 0xFFEEAA
            });
        } else {
            // PLANETS and MOONS
            this.material = new THREE.MeshPhongMaterial({
                map: textureMap,
            });
            if (!textureMap) {
                this.material.color.set(0xaaaaaa);
            }
        }

        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.position.set(this.position.x, this.position.y, this.position.z);

        if (this.isStar) {
            mesh.castShadow = true;    // Stars cast shadows
            mesh.receiveShadow = false; // Stars don't receive shadows
        } else {
            mesh.castShadow = true;     // Planets and moons DO cast shadows
            mesh.receiveShadow = true;  // Planets and moons DO receive shadows
        }
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
    generateValidPosition(existingPlanets, star, isStar = false, isMoon = false) {
        let position;
        let overlap = true;
    
        while (overlap) {
            if (isStar) {
                position = new THREE.Vector3(0, 0, 0); // Star is at the origin
            }
            else if (isMoon && this.center) {
                // Generate a position relative to the planet this moon orbits
                const distance = this.randomDistance2Planet();
                const angle = Math.random() * 2 * Math.PI;
                const offsetX = distance * Math.cos(angle);
                const offsetZ = distance * Math.sin(angle);
    
                const centerPos = this.center.position;
                position = new THREE.Vector3(
                    centerPos.x + offsetX,
                    centerPos.y,
                    centerPos.z + offsetZ
                )
            } else {
                // Generate a position relative to the star
                const distance = this.randomDistance2Star();
                const angle = Math.random() * 2 * Math.PI;
                const offsetX = distance * Math.cos(angle);
                const offsetZ = distance * Math.sin(angle);
    
                position = new THREE.Vector3(offsetX, 0, offsetZ);
            }
    
            this.position = position; // Temporarily assign the position for overlap check
            overlap = isStar ? false : this.checkOverlap(existingPlanets, star);
        }
    
        return position;
    }

    // Generate a random texture for the planet or star
    randomTexture(isStar, isMoon) {
        let texturePath = null;
        if (isStar) {
            texturePath = params.STARTTEXTURES[Math.floor(Math.random() * params.STARTTEXTURES.length)]
        }
        else if (isMoon) {
            texturePath = params.MOONTEXTURES[Math.floor(Math.random() * params.MOONTEXTURES.length)]
        }
        else {
            texturePath = params.PLANETTEXTURES[Math.floor(Math.random() * params.PLANETTEXTURES.length)]
        }
        return "src/textures/" + texturePath;
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

    // Generate a random distance from the planet for the moon
    randomDistance2Planet() {
        return Math.random() * (params.MOON_MAX_DISTANCE_2_PLANET - params.MOON_MIN_DISTANCE_2_PLANET) + params.MOON_MIN_DISTANCE_2_PLANET;
    }

    // Generate a random rotation speed for the planet
    randomRotationSpeed() {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const min = params.MIN_ROTATION_SPEED;
        const max = params.MAX_ROTATION_SPEED;
        const revPerDay = Math.random() * (max - min) + min; // full rotations per day
        return sign * revPerDay * 2 * Math.PI; // radians/day
    }


    updateRotationSpeed(deltaTimeInSeconds) {
        // Convert rotationSpeed from radians per day to radians per second
        const rotationSpeedPerSecond = this.rotationSpeed / (24 * 60 * 60); // 86400 seconds in a day

        this.mesh.rotation.y += rotationSpeedPerSecond * deltaTimeInSeconds;
    }

}
