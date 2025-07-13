let CONSTELLATIONS = {};

async function loadShapeFromFile(filename) {
    try {
        const response = await fetch(`shapes/${filename}`);
        const text = await response.text();
        
        const coordinates = [];
        const matches = text.matchAll(/\((\d+),\s*(\d+)\)/g);
        for (const match of matches) {
            coordinates.push({
                x: parseInt(match[1]),
                y: parseInt(match[2])
            });
        }
        
        return coordinates;
    } catch (error) {
        console.error(`Error loading shape from ${filename}:`, error);
        return [];
    }
}

function normalizeShape(coordinates) {
    if (coordinates.length === 0) return [];
    
    const centroidX = coordinates.reduce((sum, coord) => sum + coord.x, 0) / coordinates.length;
    const centroidY = coordinates.reduce((sum, coord) => sum + coord.y, 0) / coordinates.length;
    
    const centeredCoords = coordinates.map(coord => ({
        x: coord.x - centroidX,
        y: coord.y - centroidY
    }));
    
    const maxAbsValue = Math.max(
        ...centeredCoords.map(coord => Math.max(Math.abs(coord.x), Math.abs(coord.y)))
    );
    
    const normalizedCoords = centeredCoords.map(coord => ({
        x: coord.x / maxAbsValue,
        y: coord.y / maxAbsValue
    }));
    
    return normalizedCoords;
}

function scaleAndPositionShape(normalizedCoords, size, centerX, centerY) {
    return normalizedCoords.map(coord => ({
        x: centerX + (coord.x * size * 0.05),
        y: centerY + (coord.y * size * 0.05 * 1.75)
    }));
}

function createShapeConnections(numPoints) {
    const connections = [];
    for (let i = 0; i < numPoints; i++) {
        connections.push([i, (i + 1) % numPoints]);
    }
    return connections;
}

async function initializeConstellations() {
    try {
        const heartCoords = await loadShapeFromFile('heart.txt');
        const catCoords = await loadShapeFromFile('cat.txt');
        
        const normalizedHeart = normalizeShape(heartCoords);
        const normalizedCat = normalizeShape(catCoords);
        
        const shapeSize = 100;
        
        CONSTELLATIONS = {
            heartLeft: {
                name: "Heart Left",
                stars: scaleAndPositionShape(normalizedHeart, shapeSize, 20, 50),
                connections: createShapeConnections(normalizedHeart.length)
            },
            catRight: {
                name: "Cat Right", 
                stars: scaleAndPositionShape(normalizedCat, shapeSize, 80, 50),
                connections: createShapeConnections(normalizedCat.length)
            }
        };
        
    } catch (error) {
        console.error('Error initializing constellations:', error);
    }
}

function createConstellationLines(constellation, stars) {
    const starsContainer = document.querySelector('.stars-container');
    
    constellation.connections.forEach(([startIdx, endIdx]) => {
        const startStar = constellation.stars[startIdx];
        const endStar = constellation.stars[endIdx];
        
        const containerRect = starsContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const startXPx = (startStar.x / 100) * containerWidth;
        const startYPx = (startStar.y / 100) * containerHeight;
        const endXPx = (endStar.x / 100) * containerWidth;
        const endYPx = (endStar.y / 100) * containerHeight;
        
        const deltaXPx = endXPx - startXPx;
        const deltaYPx = endYPx - startYPx;
        const distancePx = Math.sqrt(deltaXPx * deltaXPx + deltaYPx * deltaYPx);
        const angle = Math.atan2(deltaYPx, deltaXPx) * (180 / Math.PI);
        
        const line = document.createElement('div');
        line.className = 'constellation-line';
        line.style.position = 'absolute';
        line.style.left = startStar.x + '%';
        line.style.top = startStar.y + '%';
        line.style.width = distancePx + 'px';
        line.style.height = '1px';
        line.style.background = 'linear-gradient(90deg, rgba(155, 139, 189, 0.3), rgba(155, 139, 189, 0.6), rgba(155, 139, 189, 0.3))';
        line.style.transformOrigin = '0 50%';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.pointerEvents = 'none';
        line.style.zIndex = '1';
        
        line.setAttribute('data-constellation', constellation.name || 'unknown');
        
        line.style.boxShadow = '0 0 3px rgba(155, 139, 189, 0.4)';
        line.style.animation = 'constellation-glow 6s ease-in-out infinite';
        line.style.animationDelay = Math.random() * 3 + 's';
        
        starsContainer.appendChild(line);
    });
}

function createConstellationStars(constellation, constellationName) {
    const starsContainer = document.querySelector('.stars-container');
    const starElements = [];
    
    constellation.stars.forEach((star, index) => {
        const starElement = document.createElement('div');
        starElement.className = 'constellation-star';
        starElement.setAttribute('data-constellation', constellationName);
        starElement.setAttribute('data-star-index', index);
        starElement.style.left = star.x + '%';
        starElement.style.top = star.y + '%';
        starElement.style.position = 'absolute';
        starElement.style.width = '4px';
        starElement.style.height = '4px';
        starElement.style.background = '#9b8bbd';
        starElement.style.borderRadius = '50%';
        starElement.style.boxShadow = '0 0 8px #9b8bbd, 0 0 15px rgba(155, 139, 189, 0.5)';
        starElement.style.animation = 'twinkle 4s infinite';
        starElement.style.animationDelay = (index * 0.5) + 's';
        starElement.style.zIndex = '2';
        
        starElement.style.cursor = 'pointer';
        starElement.addEventListener('mouseenter', () => {
            starElement.style.transform = 'scale(1.5)';
            starElement.style.boxShadow = '0 0 12px #9b8bbd, 0 0 25px rgba(155, 139, 189, 0.8)';
        });
        
        starElement.addEventListener('mouseleave', () => {
            starElement.style.transform = 'scale(1)';
            starElement.style.boxShadow = '0 0 8px #9b8bbd, 0 0 15px rgba(155, 139, 189, 0.5)';
        });
        
        starsContainer.appendChild(starElement);
        starElements.push(starElement);
    });
    
    return starElements;
}

function clearConstellationLines() {
    const existingLines = document.querySelectorAll('.constellation-line');
    existingLines.forEach(line => line.remove());
}

function recreateConstellationLines() {
    try {
        clearConstellationLines();
        
        const starsContainer = document.querySelector('.stars-container');
        if (!starsContainer) {
            console.warn('Stars container not found, skipping constellation line recreation');
            return;
        }
        
        Object.entries(CONSTELLATIONS).forEach(([name, constellation]) => {
            if (constellation && constellation.stars && constellation.connections) {
                createConstellationLines(constellation, name);
            }
        });
        
    } catch (error) {
        console.error('Error recreating constellation lines:', error);
    }
}

async function createConstellations() {
    const starsContainer = document.querySelector('.stars-container');
    if (!starsContainer) return;
    
    await initializeConstellations();
    
    if (!document.querySelector('#constellation-styles')) {
        const style = document.createElement('style');
        style.id = 'constellation-styles';
        style.textContent = `
            @keyframes constellation-glow {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }
            
            .constellation-line {
                transition: opacity 0.3s ease;
            }
            
            .constellation-star {
                transition: all 0.3s ease;
            }
            
            .constellation-star:hover {
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    Object.entries(CONSTELLATIONS).forEach(([name, constellation]) => {
        createConstellationLines(constellation, name);
        createConstellationStars(constellation, name);
    });
    
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (Object.keys(CONSTELLATIONS).length > 0) {
                recreateConstellationLines();
            }
        }, 50);
    };
    
    window.addEventListener('resize', handleResize);
    
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
}

function highlightConstellation(constellationName) {
    const allStars = document.querySelectorAll('.constellation-star');
    const allLines = document.querySelectorAll('.constellation-line');
    
    allStars.forEach(star => {
        if (star.getAttribute('data-constellation') !== constellationName) {
            star.style.opacity = '0.3';
        } else {
            star.style.opacity = '1';
            star.style.boxShadow = '0 0 15px #9b8bbd, 0 0 30px rgba(155, 139, 189, 1)';
        }
    });
    
    allLines.forEach(line => {
        line.style.opacity = '0.2';
    });
}

function resetConstellationHighlight() {
    const allStars = document.querySelectorAll('.constellation-star');
    const allLines = document.querySelectorAll('.constellation-line');
    
    allStars.forEach(star => {
        star.style.opacity = '1';
        star.style.boxShadow = '0 0 8px #9b8bbd, 0 0 15px rgba(155, 139, 189, 0.5)';
    });
    
    allLines.forEach(line => {
        line.style.opacity = '';
    });
}

window.ConstellationModule = {
    createConstellations,
    highlightConstellation,
    resetConstellationHighlight,
    CONSTELLATIONS
}; 