let devMode = false;

function toggleDevMode() {
    devMode = !devMode;
    const body = document.body;
    
    if (devMode) {
        body.classList.remove('dev-mode-off');
    } else {
        body.classList.add('dev-mode-off');
    }
    
    localStorage.setItem('devMode', devMode);
}

function initDevMode() {
    const savedDevMode = localStorage.getItem('devMode');
    if (savedDevMode !== null) {
        devMode = savedDevMode === 'true';
    }
    
    if (!devMode) {
        document.body.classList.add('dev-mode-off');
    }
}

window.toggleDevMode = toggleDevMode;

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.remove();
        }, 800);
    }
}

window.addEventListener('load', function() {
    setTimeout(hideLoadingScreen, 1000);
});

if (document.readyState === 'complete') {
    hideLoadingScreen();
}

document.addEventListener('DOMContentLoaded', async function() {
    initDevMode();
    createStars();
    await ConstellationModule.createConstellations();
    initTsParticles();
    setupNavigation();
    addInteractiveFeatures();
    MoonModule.updateMoonPhase();
    MoonModule.setupMoonPhaseSlider();
    MoonModule.setupTimeControlSlider();
    
    setInterval(MoonModule.updateMoonPhase, 60000);
    
    setTimeout(hideLoadingScreen, 800);
});

function createStars() {
    const starsContainer = document.querySelector('.stars-container');
    const numStars = 150;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        const size = Math.random() * 2 + 3;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        starsContainer.appendChild(star);
    }
}



function createShootingStars() {
    const shootingStarsContainer = document.querySelector('.shooting-stars');
    
    function createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        
        const startSide = Math.random() < 0.5;
        if (startSide) {
            star.style.left = Math.random() * 100 + '%';
            star.style.top = '-10px';
        } else {
            star.style.left = '110%';
            star.style.top = Math.random() * 50 + '%';
        }
        
        const duration = Math.random() * 2 + 3;
        star.style.animationDuration = duration + 's';
        
        shootingStarsContainer.appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) {
                star.remove();
            }
        }, duration * 1000 + 500);
    }
    
    function scheduleNextStar() {
        const delay = Math.random() * 12000 + 8000;
        setTimeout(() => {
            createShootingStar();
            scheduleNextStar();
        }, delay);
    }
    
    setTimeout(() => {
        createShootingStar();
        scheduleNextStar();
    }, 3000);
}

function initTsParticles() {
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load('tsparticles', {
            particles: {
                number: {
                    value: 8,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#9b8bbd', '#6b5b95', '#ffffff']
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.8,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.5,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: false
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: 'bottom-right',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: false
                    },
                    onclick: {
                        enable: false
                    },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            // Update browser tab title
            if (window.siteStorage) {
                const title = window.siteStorage.getPageTitle(targetId);
                document.title = title;
            }
            
            createSparkles(e.target);
        });
    });
}

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const numSparkles = 5;
    
    for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = rect.left + rect.width / 2 + 'px';
        sparkle.style.top = rect.top + rect.height / 2 + 'px';
        sparkle.style.width = '3px';
        sparkle.style.height = '3px';
        sparkle.style.background = 'white';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.style.boxShadow = '0 0 6px rgba(255, 255, 255, 0.8)';
        
        const angle = (i / numSparkles) * Math.PI * 2;
        const distance = 20 + Math.random() * 15;
        // Create heart-shaped pattern :D
        const heartAngle = angle + Math.sin(angle * 2) * 0.3;
        const heartDistance = distance * (1 + Math.sin(angle * 2) * 0.2);
        const endX = Math.cos(heartAngle) * heartDistance;
        const endY = Math.sin(heartAngle) * heartDistance - Math.abs(Math.sin(angle)) * 8;
        
        sparkle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => sparkle.remove();
        
        document.body.appendChild(sparkle);
    }
}

function addInteractiveFeatures() {
    const letterBox = document.querySelector('.letter-box');
    
    if (letterBox) {
        letterBox.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 15px 40px rgba(107, 91, 149, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
        });
        
        letterBox.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        });
    }
    
    document.addEventListener('mousemove', function(e) {
        if (Math.random() < 0.08) {
            createMouseTrail(e.clientX, e.clientY);
        }
    });
    
}


function createMouseTrail(x, y) {
    const shapes = ['circle', 'star'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = x + (Math.random() - 0.5) * 20 + 'px';
    trail.style.top = y + (Math.random() - 0.5) * 20 + 'px';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '5';
    
    if (shape === 'star') {
        trail.style.width = '6px';
        trail.style.height = '6px';
        trail.style.background = 'white';
        trail.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        trail.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 8px rgba(155, 139, 189, 0.6))';
    } else {
        trail.style.width = '4px';
        trail.style.height = '4px';
        trail.style.background = 'radial-gradient(circle, white, rgba(155, 139, 189, 0.8))';
        trail.style.borderRadius = '50%';
        trail.style.boxShadow = '0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px rgba(155, 139, 189, 0.5)';
    }
    
    const duration = 800 + Math.random() * 400;
    const scale = 0.8 + Math.random() * 0.4;
    
    trail.animate([
        { 
            transform: `translate(-50%, -50%) scale(${scale})`, 
            opacity: 0.9,
            filter: shape === 'star' ? 
                'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 8px rgba(155, 139, 189, 0.6))' : 
                'none'
        },
        { 
            transform: `translate(-50%, -50%) scale(0) rotate(${Math.random() * 360}deg)`, 
            opacity: 0,
            filter: shape === 'star' ? 
                'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 16px rgba(155, 139, 189, 0.3))' : 
                'none'
        }
    ], {
        duration: duration,
        easing: 'ease-out'
    }).onfinish = () => trail.remove();
    
    document.body.appendChild(trail);
}

