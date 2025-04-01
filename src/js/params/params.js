
export const params = {
    DIAMETER_SCALE_FACTOR: 1/1000, // Scaling factor for the scene
    MIN_DIAMETER: 4879, // Diameter in Km
    MAX_DIAMETER: 14298, // Diameter in Km
    MIN_PLANET_DISTANCE: 0.40 * 3*2, // Minimum distance between planets in AU
    STAR_PLANET_RATIO: 5, // Ratio between the star and the planets
    MIN_DISTANCE_2_STAR: 0.39 * 3*2, // Distance in AU ---> 0.39 * (STAR_PLANET_RATIO*2)
    MAX_DISTANCE_2_STAR: 30 * 3*2, // Distance in AU --> 30 * (STAR_PLANET_RATIO*2)
    MIN_PERIOD: 1, // Period in Earth years
    MAX_PERIOD: 10000, // Period in Earth years
    MIN_ROTATION_SPEED: 1/2500, // Rotation speed in Earth days
    MAX_ROTATION_SPEED: 1/1000, // Rotation speed in Earth days
    PLANETTEXTURES: [
        'earth_clouds.jpg', 'earth_daymap.jpg', 'earth_nightmap.jpg', 'jupiter.jpg', 
        'mars.jpg', 'mercury.jpg', 'moon.jpg', 'neptune.jpg',
        'saturn.jpg', 'uranus.jpg', 'venus_atmosphere.jpg', 'venus_surface.jpg'
    ],
    STARTTEXTURES: [
        'sun-surface.jpg'
    ],
    PLANETNAMES: [
        'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'
    ]
}