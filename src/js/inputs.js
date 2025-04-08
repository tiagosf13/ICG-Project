import { SolarSystem } from 'solarSystem';
import { replaceSolarSystem, scene } from './main.js'; // relative path if needed

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('jsonFileInput');

    if (!fileInput) {
        console.error('File input not found in DOM');
        return;
    }

    const nameDisplay = document.getElementById('systemNameDisplay');

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonText = e.target.result;

                const newSystem = new SolarSystem(scene, false, true, jsonText);
                replaceSolarSystem(newSystem);

                // Show uploaded filename or a fallback name
                const baseName = file.name.replace('.json', '');
                nameDisplay.textContent = `🌌 ${baseName}`;

                console.log('New solar system loaded and replaced');
            } catch (err) {
                console.error('Error parsing JSON file:', err);
                nameDisplay.textContent = '🚫 Failed to load system';
            }
        };

        reader.readAsText(file);
    });
});
