
export const params = {
    NUMBER_OF_PLANETS: 8, // Number of planets to generate
    DIAMETER_SCALE_FACTOR: 1/1000, // Scaling factor for the scene
    MIN_DIAMETER: 4879, // Diameter in Km
    MAX_DIAMETER: 14298, // Diameter in Km
    MIN_PLANET_DISTANCE: 0.40 * 3*2, // Minimum distance between planets in AU
    MOON_PROBABILITY: 0.4, // 40% chance of getting a moon
    MOON_PLANET_RATIO: 0.5, // Ratio between the moon and the planet
    MOON_MAX_DISTANCE_2_PLANET: 4 * 3*2, // Maximum distance from the planet in AU
    MOON_MIN_DISTANCE_2_PLANET: 2 * 3*2, // Minimum distance from the planet in AU
    STAR_RADIUS: 5, // Radius of the star in Three.js units
    STAR_PLANET_RATIO: 7, // Ratio between the star and the planets
    MIN_DISTANCE_2_STAR: 0.39 * 3*2, // Distance in AU ---> 0.39 * (STAR_PLANET_RATIO*2)
    MAX_DISTANCE_2_STAR: 30 * 3*2, // Distance in AU --> 30 * (STAR_PLANET_RATIO*2)
    MIN_PERIOD: 1, // Period in Earth years
    MAX_PERIOD: 10000, // Period in Earth years
    MIN_ROTATION_SPEED: 1/100, // Rotation speed in Earth days
    MAX_ROTATION_SPEED: 1, // Rotation speed in Earth days
    ORBIT_SEGMENTS: 128, // Number of segments for the orbit
    ORBIT_RADIUS: 5, // Default orbit radius in Three.js units
    MIN_CARD_DISTANCE_2_PLANET: 50, // Minimum distance from the planet to show the card
    PLANETTEXTURES: [
        'earth_clouds75.jpg', 'earth_daymap75.jpg', 'earth_nightmap75.jpg', 'jupiter75.jpg', 
        'mars75.jpg', 'mercury75.jpg', 'moon75.jpg', 'neptune75.jpg',
        'saturn75.jpg', 'uranus75.jpg', 'venus_atmosphere75.jpg'
    ],
    STARTTEXTURES: [
        'sun-surface75.jpg'
    ],
    MOONTEXTURES: [
        'moon75.jpg'
    ],
    PLANETNAMES: [
        'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'
    ]
}