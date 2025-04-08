import { solarSystem } from './main.js';

function getCurrentSolarSystem() {
    const solarSystemJSON = {
        name: generateRandomName(),
        star: {
            name:solarSystem.star.name,
            radius: solarSystem.star.radius,
            position: solarSystem.star.position,
            rotationSpeed: solarSystem.star.rotationSpeed,
            isStar: solarSystem.star.isStar,
            isMoon: solarSystem.star.isMoon,
            texture: solarSystem.star.texture,
            widthSegments: solarSystem.star.widthSegments,
            heightSegments: solarSystem.star.heightSegments
        },
        // Lambda function to map planets to the JSON format
        planets: solarSystem.planets.map(planet => ({
            name: planet.name,
            radius: planet.radius,
            position: planet.position,
            rotationSpeed: planet.rotationSpeed,
            isStar: planet.isStar,
            isMoon: planet.isMoon,
            texture: planet.texture,
            widthSegments: planet.widthSegments,
            heightSegments: planet.heightSegments,
            moons: planet.moons.map(moon => ({
                name: moon.name,
                radius: moon.radius,
                position: moon.position,
                rotationSpeed: moon.rotationSpeed,
                isStar: moon.isStar,
                isMoon: moon.isMoon,
                texture: moon.texture,
                widthSegments: moon.widthSegments,
                heightSegments: moon.heightSegments
            }))
        }))
    }

    return solarSystemJSON;
}

function generateRandomName() {
    const adjectives = ['Nebula', 'Quantum', 'Zenith', 'Orion', 'Crimson', 'Nova'];
    const nouns = ['System', 'Core', 'Array', 'Cluster', 'Field', 'Singularity'];
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return `${rand(adjectives)}${rand(nouns)}_${Math.floor(Math.random() * 1000)}`;
}

function downloadSolarSystem() {
    const solarSystem = getCurrentSolarSystem();

    if (!solarSystem) {
        alert('No solar system loaded!');
        return;
    }

    const jsonStr = JSON.stringify(solarSystem, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const filename = `${solarSystem.name}.json`;

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

document.getElementById('downloadBtn').addEventListener('click', downloadSolarSystem);
