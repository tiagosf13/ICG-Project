import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SolarSystem } from '../../../js/objs/SolarSystem/solar_system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../testFiles');


function generateSolarSystem(name = 'generatedSystem') {

    // Generate a solar system
    const solarSystem = new SolarSystem(null, true);

    const solarSystemJSON = {
        name: name,
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

function getNextFileIndex(existingFiles) {
    const existingNumbers = existingFiles
        .map(f => f.match(/^solarSystem_(\d+)\.json$/))
        .filter(Boolean)
        .map(match => parseInt(match[1], 10));
    return existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1;
}

// MAIN GENERATOR
function generateMultiple(count = 5) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const existingFiles = fs.readdirSync(outputDir);
    let index = getNextFileIndex(existingFiles);

    let generated = 0;
    while (generated < count) {
        const filename = `solarSystem_${String(index).padStart(3, '0')}.json`;
        const outputPath = path.join(outputDir, filename);

        if (!fs.existsSync(outputPath)) {
            const solarSystemJSON = generateSolarSystem(`generatedSystem_${index}`);
            fs.writeFileSync(outputPath, JSON.stringify(solarSystemJSON, null, 2));
            console.log(`Saved: ${filename}`);
            generated++;
        }

        index++;
    }
}

// Change this number to how many systems you want
generateMultiple(10);

// RUN : node ./src/tests/solarSystem/js/generateSolarSystem.js
