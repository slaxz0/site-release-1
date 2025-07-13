// === ASTRONOMICAL CONSTANTS ===
const ASTRONOMY = {
    // Default location (NYC coordinates)
    DEFAULT_LATITUDE: 40.7128,
    DEFAULT_LONGITUDE: -74.0060,
    
    // Moon phase definitions
    MOON_PHASES: [
        { phase: 0.0, illumination: 0.0, name: "New Moon" },
        { phase: 0.125, illumination: 0.25, name: "Waxing Crescent" },
        { phase: 0.25, illumination: 0.5, name: "First Quarter" },
        { phase: 0.375, illumination: 0.75, name: "Waxing Gibbous" },
        { phase: 0.5, illumination: 1.0, name: "Full Moon" },
        { phase: 0.625, illumination: 0.75, name: "Waning Gibbous" },
        { phase: 0.75, illumination: 0.5, name: "Last Quarter" },
        { phase: 0.875, illumination: 0.25, name: "Waning Crescent" }
    ],
    
    // Moon movement timing
    MOON_RISE_TIME: "19:30", // 7:30 PM - when moon first appears on left
    MOON_SET_TIME: "06:45",  // 6:45 AM - when moon completely disappears on right
    
    // Moon position animation
    MOON_UPDATE_INTERVAL: 60000 // Update every minute
};

// === VISUAL EFFECTS CONSTANTS ===
const VISUAL_EFFECTS = {
    STAR_COUNT: 150,
    STAR_SIZE_RANGE: { min: 3, max: 5 },
    STAR_ANIMATION_DURATION: { min: 2, max: 5 },
    
    CONSTELLATIONS: {
        triangleLeft: [
            // Left triangle at 20% horizontal, middle vertical
            {x: 20, y: 45}, {x: 25, y: 45}, {x: 22.5, y: 40}
        ],
        triangleRight: [
            // Right triangle at 80% horizontal, middle vertical
            {x: 80, y: 45}, {x: 85, y: 45}, {x: 82.5, y: 40}
        ]
    },
    
    SHOOTING_STAR_INTERVAL: { min: 8000, max: 20000 }, // 8-20 seconds
    SHOOTING_STAR_DURATION: { min: 3, max: 5 }, // 3-5 seconds
    
    SPARKLE_COUNT: 5,
    SPARKLE_DURATION: 600,
    SPARKLE_DISTANCE: { min: 20, max: 35 },
    
    MOUSE_TRAIL_PROBABILITY: 0.08, // 8% chance per mouse move
    MOUSE_TRAIL_DURATION: { min: 800, max: 1200 },
    MOUSE_TRAIL_SHAPES: ['circle', 'star']
};

// === MOON VISUAL CONSTANTS ===
const MOON_VISUAL = {
    SIZE: 84,
    SHADOW_OPACITY: 0.9,
    
    ELLIPSE_CURVE_RANGE: { min: 85, max: 100 }, // Natural curve percentages
    ELLIPSE_CURVE_VARIATION: 30, // Variation in curve intensity
    
    POSITION: {
        // Horizontal movement (0% = left edge, 100% = right edge)
        START_X: -10,    // Start off-screen to the left
        END_X: 110,      // End off-screen to the right
        
        // Vertical movement - Arc
        MIN_HEIGHT: 15,  // Peak position (% from top) - near header
        MAX_HEIGHT: 55,  // Starting/ending points (middle of screen vertically)
        
        MARGIN_TOP: 120, // Pixels from top to avoid header clipping
        MARGIN_SIDE: 60  // Margin from screen edges
    },
    
    // Arc calculation parameters
    ARC: {
        CURVE_FACTOR: 1.2, 
        PEAK_POSITION: 0.5,
        FLATTENED_TOP: true, // Enable flattened top behavior
        FLATTEN_START: 0.35, // Start flattening at 35% progress
        FLATTEN_END: 0.65,   // End flattening at 65% progress
        MIN_HEIGHT_OVERRIDE: 15 // Peak height to clear letter (% from top)
    }
};

// === PARTICLE SYSTEM CONSTANTS ===
const PARTICLES = {
    COUNT: 8,
    COLORS: ['#9b8bbd', '#6b5b95', '#ffffff'],
    OPACITY: { value: 0.8, min: 0.1 },
    SIZE: { value: 3, min: 1 },
    SPEED: 0.5,
    DIRECTION: 'bottom-right'
};

// === ANIMATION TIMING ===
const ANIMATIONS = {
    TWINKLE_DURATION: 4000,
    HEARTBEAT_DURATION: 2000,
    TRANSITION_DURATION: 1000,
    SPARKLE_ANIMATION_DURATION: 600
};

// === COLORS ===
const COLORS = {
    PRIMARY: '#9b8bbd',
    SECONDARY: '#6b5b95',
    ACCENT: '#ffffff',
    BACKGROUND: '#1a1a2e',
    MOON_LIGHT: '#f8f8ff',
    MOON_SHADOW: 'rgba(0,0,0,0.9)',
    CONSTELLATION: '#9b8bbd'
};

// === TESTING CONSTANTS ===
const TESTING = {
    FORCE_NIGHT_MODE: true,
    TEST_TIME_PROGRESS: 0.3,
    DEFAULT_MOON_PHASE: 3   
};

// === GLOBAL EXPORTS ===
window.ASTRONOMY = ASTRONOMY;
window.VISUAL_EFFECTS = VISUAL_EFFECTS;
window.MOON_VISUAL = MOON_VISUAL;
window.PARTICLES = PARTICLES;
window.ANIMATIONS = ANIMATIONS;
window.COLORS = COLORS;
window.TESTING = TESTING;