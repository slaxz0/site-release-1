function updateMoonPhase() {
    if (typeof SunCalc !== 'undefined') {
        const now = new Date();
        const moonElement = document.querySelector('.moon');
        
        if (moonElement) {
            const phaseSlider = document.getElementById('moonPhaseRange');
            if (phaseSlider && phaseSlider.dataset.userControlled !== 'true') {
                const moonPhase = SunCalc.getMoonIllumination(now);
                const sliderValue = moonPhase.phase * 8;
                
                phaseSlider.value = sliderValue;
                const { phase, illumination, name } = getMoonPhaseFromValue(sliderValue);
                
                const actualIllumination = moonPhase.fraction;
                
                const label = document.getElementById('moonPhaseLabel');
                const phaseInfo = document.querySelector('.phase-info');
                if (label) label.textContent = name;
                if (phaseInfo) phaseInfo.textContent = 'Real: Auto';
                
                updateMoonVisual(moonElement, phase, actualIllumination);
            }
            
            const timeSlider = document.getElementById('timeRange');
            if (timeSlider && timeSlider.dataset.userControlled === 'true') {
                return;
            }
            
            positionMoonByTime(moonElement, now);
        }
    }
}

function setupMoonPhaseSlider() {
    const slider = document.getElementById('moonPhaseRange');
    const label = document.getElementById('moonPhaseLabel');
    const activeButton = document.getElementById('phaseControlActive');
    const phaseInfo = document.querySelector('.phase-info');
    const moonElement = document.querySelector('.moon');
    
    if (!slider || !label || !activeButton || !phaseInfo || !moonElement) return;
    
    let isPhaseControlActive = false;
    
    function updateMoonFromSlider() {
        if (isPhaseControlActive) {
            const value = parseFloat(slider.value);
            const { phase, illumination, name } = getMoonPhaseFromValue(value);
            
            label.textContent = name;
            updateMoonVisual(moonElement, phase, illumination);
            phaseInfo.textContent = 'Manual';
        }
    }
    
    function updateRealMoonPhase() {
        if (!isPhaseControlActive && typeof SunCalc !== 'undefined') {
            const now = new Date();
            const moonPhase = SunCalc.getMoonIllumination(now);
            
            const sliderValue = moonPhase.phase * 8;
            
            slider.value = sliderValue;
            
            const { phase, illumination, name } = getMoonPhaseFromValue(sliderValue);
            label.textContent = name;
            
            updateMoonVisual(moonElement, phase, moonPhase.fraction);
            phaseInfo.textContent = 'Real: Auto';
        }
    }
    
    function togglePhaseControl() {
        isPhaseControlActive = !isPhaseControlActive;
        activeButton.classList.toggle('active', isPhaseControlActive);
        
        if (isPhaseControlActive) {
            slider.dataset.userControlled = 'true';
            updateMoonFromSlider();
        } else {
            slider.dataset.userControlled = 'false';
            updateRealMoonPhase();
        }
    }
    
    slider.addEventListener('input', updateMoonFromSlider);
    activeButton.addEventListener('click', togglePhaseControl);
    
    updateRealMoonPhase();
}

function setupTimeControlSlider() {
    const timeSlider = document.getElementById('timeRange');
    const timeLabel = document.getElementById('timeLabel');
    const activeButton = document.getElementById('timeControlActive');
    const moonElement = document.querySelector('.moon');
    
    if (!timeSlider || !timeLabel || !activeButton || !moonElement) return;
    
    let isTimeControlActive = false;
    
    const startTime = { hours: 18, minutes: 30 };
    const endTime = { hours: 7, minutes: 45 };
    const totalMinutes = 795;
    
    function timeToMinutes(hours, minutes) {
        return hours * 60 + minutes;
    }
    
    function minutesToTime(totalMins) {
        const hours = Math.floor(totalMins / 60) % 24;
        const minutes = Math.floor(totalMins % 60);
        return { hours, minutes };
    }
    
    function formatTime(hours, minutes) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    function sliderToTime(sliderValue) {
        const progress = sliderValue / 100;
        const minutesFromStart = progress * totalMinutes;
        const startMinutes = timeToMinutes(startTime.hours, startTime.minutes);
        const currentMinutes = startMinutes + minutesFromStart;
        
        return minutesToTime(currentMinutes);
    }
    
    function updateTimeFromSlider() {
        const sliderValue = parseFloat(timeSlider.value);
        const time = sliderToTime(sliderValue);
        timeLabel.textContent = `Current: ${formatTime(time.hours, time.minutes)}`;
        
        if (isTimeControlActive) {
            const simulatedDate = new Date();
            simulatedDate.setHours(time.hours, time.minutes, 0, 0);
            
            positionMoonByTime(moonElement, simulatedDate);
        }
    }
    
    let isDragging = false;
    
    function handleSliderInput() {
        updateTimeFromSlider();
    }
    
    function handleSliderMouseDown() {
        isDragging = true;
    }
    
    function handleSliderMouseUp() {
        isDragging = false;
    }
    
    function handleSliderMouseMove() {
        if (isDragging) {
            requestAnimationFrame(updateTimeFromSlider);
        }
    }
    
    function toggleTimeControl() {
        isTimeControlActive = !isTimeControlActive;
        activeButton.classList.toggle('active', isTimeControlActive);
        
        if (isTimeControlActive) {
            timeSlider.dataset.userControlled = 'true';
            updateTimeFromSlider();
        } else {
            timeSlider.dataset.userControlled = 'false';
            const moonElement = document.querySelector('.moon');
            if (moonElement) {
                positionMoonByTime(moonElement, new Date());
            }
        }
    }
    
    // Event listeners
    timeSlider.addEventListener('input', handleSliderInput);
    timeSlider.addEventListener('mousedown', handleSliderMouseDown);
    timeSlider.addEventListener('mouseup', handleSliderMouseUp);
    timeSlider.addEventListener('mousemove', handleSliderMouseMove);
    // Also handle touch events for mobile
    timeSlider.addEventListener('touchstart', handleSliderMouseDown);
    timeSlider.addEventListener('touchend', handleSliderMouseUp);
    timeSlider.addEventListener('touchmove', handleSliderMouseMove);
    
    activeButton.addEventListener('click', toggleTimeControl);
    
    // Initialize
    updateTimeFromSlider();
}

function getMoonPhaseFromValue(value) {
    // Map the 0-8 range back to 0-7 range, with 8 being equivalent to 0
    if (value >= 8) {
        return { phase: 0.0, illumination: 0.0, name: "New Moon" };
    }
    
    const moonPhases = [
        { phase: 0.0, illumination: 0.0, name: "New Moon" },
        { phase: 0.125, illumination: 0.25, name: "Waxing Crescent" },
        { phase: 0.25, illumination: 0.5, name: "First Quarter" },
        { phase: 0.375, illumination: 0.75, name: "Waxing Gibbous" },
        { phase: 0.5, illumination: 1.0, name: "Full Moon" },
        { phase: 0.625, illumination: 0.75, name: "Waning Gibbous" },
        { phase: 0.75, illumination: 0.5, name: "Last Quarter" },
        { phase: 0.875, illumination: 0.25, name: "Waning Crescent" }
    ];
    
    // For smooth transitions between phases
    const phaseIndex = Math.floor(value);
    const nextPhaseIndex = phaseIndex + 1;
    const t = value - phaseIndex;
    
    if (t === 0 || phaseIndex >= moonPhases.length - 1) {
        return moonPhases[Math.min(phaseIndex, moonPhases.length - 1)];
    }
    
    // Handle wrapping from phase 7 back to phase 0
    let currentPhase = moonPhases[phaseIndex];
    let nextPhase;
    
    if (nextPhaseIndex >= moonPhases.length) {
        // Wrap around to new moon
        nextPhase = { phase: 1.0, illumination: 0.0, name: "New Moon" };
    } else {
        nextPhase = moonPhases[nextPhaseIndex];
    }
    
    return {
        phase: currentPhase.phase + (nextPhase.phase - currentPhase.phase) * t,
        illumination: currentPhase.illumination + (nextPhase.illumination - currentPhase.illumination) * t,
        name: t < 0.5 ? currentPhase.name : nextPhase.name
    };
}

function updateMoonVisual(moonElement, phasePercent, illumination) {
    // Remove existing phase classes
    moonElement.classList.remove('new-moon', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 
                               'full-moon', 'waning-gibbous', 'last-quarter', 'waning-crescent');
    
    // Determine moon phase
    let phaseClass = '';
    if (phasePercent < 0.125) {
        phaseClass = 'new-moon';
    } else if (phasePercent < 0.25) {
        phaseClass = 'waxing-crescent';
    } else if (phasePercent < 0.375) {
        phaseClass = 'first-quarter';
    } else if (phasePercent < 0.5) {
        phaseClass = 'waxing-gibbous';
    } else if (phasePercent < 0.625) {
        phaseClass = 'full-moon';
    } else if (phasePercent < 0.75) {
        phaseClass = 'waning-gibbous';
    } else if (phasePercent < 0.875) {
        phaseClass = 'last-quarter';
    } else {
        phaseClass = 'waning-crescent';
    }
    
    moonElement.classList.add(phaseClass);
    
    // Create shadow overlay for crescent phases
    createMoonShadow(moonElement, phasePercent, illumination);
}

function createMoonShadow(moonElement, phasePercent, illumination) {
    // Remove existing shadow
    const existingShadow = moonElement.querySelector('.moon-shadow');
    if (existingShadow) {
        existingShadow.remove();
    }
    
    // Handle special cases
    if (illumination === 0) {
        // New moon - completely dark
        const shadow = document.createElement('div');
        shadow.className = 'moon-shadow';
        shadow.style.position = 'absolute';
        shadow.style.top = '0';
        shadow.style.left = '0';
        shadow.style.width = '100%';
        shadow.style.height = '100%';
        shadow.style.borderRadius = '50%';
        shadow.style.background = 'rgba(0,0,0,0.9)';
        shadow.style.pointerEvents = 'none';
        moonElement.appendChild(shadow);
        return;
    }
    
    if (illumination === 1) {
        // Full moon - no shadow
        return;
    }
    
    // Create shadow using proper moon phase calculations
    const shadow = document.createElement('div');
    shadow.className = 'moon-shadow';
    shadow.style.position = 'absolute';
    shadow.style.top = '0';
    shadow.style.left = '0';
    shadow.style.width = '100%';
    shadow.style.height = '100%';
    shadow.style.borderRadius = '50%';
    shadow.style.pointerEvents = 'none';
    shadow.style.overflow = 'hidden';
    
    // Create a shadow overlay that covers the dark portion
    const shadowOverlay = document.createElement('div');
    shadowOverlay.style.position = 'absolute';
    shadowOverlay.style.top = '0';
    shadowOverlay.style.width = '100%';
    shadowOverlay.style.height = '100%';
    shadowOverlay.style.background = 'rgba(0,0,0,0.9)';
    shadowOverlay.style.borderRadius = '50%';
    
    // 0-0.5: Waxing (light grows from right)
    // 0.5-1.0: Waning (light shrinks from right)
    
    const isWaxing = phasePercent <= 0.5;
    
    if (illumination === 0.5) {
        // Quarter phases - straight vertical line
        if (isWaxing) {
            // First quarter - shadow on left
            shadowOverlay.style.clipPath = 'inset(0 50% 0 0)';
        } else {
            // Last quarter - shadow on right
            shadowOverlay.style.clipPath = 'inset(0 0 0 50%)';
        }
    } else {
        // All other phases - percentage-based clipping
        const shadowPercent = (1 - illumination) * 100;
        
        if (isWaxing) {
            // Waxing: shadow shrinks from left side
            shadowOverlay.style.clipPath = `inset(0 ${100 - shadowPercent}% 0 0)`;
        } else {
            // Waning: shadow grows from right side  
            shadowOverlay.style.clipPath = `inset(0 0 0 ${100 - shadowPercent}%)`;
        }
    }
    
    shadow.appendChild(shadowOverlay);
    moonElement.appendChild(shadow);
}

function positionMoonByTime(moonElement, currentTime) {
    const { ASTRONOMY, MOON_VISUAL } = window;
    
    if (!ASTRONOMY || !MOON_VISUAL) {
        console.warn('Constants not available, using fallback positioning');
        moonElement.style.opacity = '1';
        moonElement.style.visibility = 'visible';
        return;
    }
    
    // Parse rise and set times
    const [riseHour, riseMinute] = ASTRONOMY.MOON_RISE_TIME.split(':').map(Number);
    const [setHour, setMinute] = ASTRONOMY.MOON_SET_TIME.split(':').map(Number);
    
    const currentHour = currentTime.getHours();
    
    // Create date objects for rise and set times
    const riseTime = new Date(currentTime);
    const setTime = new Date(currentTime);
    
    // Normalize time to 0-1 value within the moon's visible window
    // Convert current time to minutes since midnight
    const currentMinutes = currentHour * 60 + currentTime.getMinutes();
    const riseMinutes = riseHour * 60 + riseMinute;
    const setMinutes = setHour * 60 + setMinute;
    
    // Calculate the total duration of moon visibility in minutes
    // Since set time is next day, add 24 hours (1440 minutes) to set time
    const totalVisibleMinutes = (setMinutes + 1440) - riseMinutes;
    
    let normalizedTime;
    let isVisible = false;
    
    if (currentMinutes >= riseMinutes) {
        // Current time is after rise time (same day)
        normalizedTime = (currentMinutes - riseMinutes) / totalVisibleMinutes;
        isVisible = true;
    } else {
        // Current time is before rise time (could be next day, before set)
        if (currentMinutes <= setMinutes) {
            // It's next day, before set time
            const minutesFromRise = (currentMinutes + 1440) - riseMinutes;
            normalizedTime = minutesFromRise / totalVisibleMinutes;
            isVisible = true;
        } else {
            // It's daytime, moon not visible
            isVisible = false;
        }
    }
    
    // If moon is not visible, hide it
    if (!isVisible) {
        moonElement.style.opacity = '0';
        moonElement.style.visibility = 'hidden';
        return;
    }
    
    // Clamp normalized time to 0-1 range
    const progress = Math.max(0, Math.min(1, normalizedTime));
    
    // Calculate positions using arc movement
    const position = calculateMoonArcPosition(progress, MOON_VISUAL);
    
    // Apply positioning - moon is always visible
    moonElement.style.left = `${position.x}%`;
    moonElement.style.top = `${position.y}%`;
    moonElement.style.opacity = '1';
    moonElement.style.visibility = 'visible';
    moonElement.style.position = 'fixed';
    moonElement.style.transform = 'translate(-50%, -50%)';
    moonElement.style.transition = 'all 1s ease';
}

function calculateMoonArcPosition(progress, moonVisual) {
    const { POSITION, ARC } = moonVisual;
    
    // Calculate horizontal position (linear progression from left middle to right middle)
    const x = POSITION.START_X + (POSITION.END_X - POSITION.START_X) * progress;
    
    let y;
    
    if (ARC.FLATTENED_TOP && progress >= ARC.FLATTEN_START && progress <= ARC.FLATTEN_END) {
        // Flattened top section - moon travels horizontally above the letter
        y = ARC.MIN_HEIGHT_OVERRIDE;
    } else if (progress < ARC.FLATTEN_START) {
        // Rising section: smooth arc from horizon to flat top
        // Use quadratic interpolation for smooth curve
        const t = progress / ARC.FLATTEN_START; // normalize to 0-1 for this section
        const startY = POSITION.MAX_HEIGHT; // Start at horizon
        const endY = ARC.MIN_HEIGHT_OVERRIDE; // End at flat top height
        
        // Quadratic ease-out for smooth arc: y = start + (end - start) * (1 - (1-t)²)
        y = startY + (endY - startY) * (1 - Math.pow(1 - t, 2));
    } else {
        // Falling section: smooth arc from flat top to horizon
        const t = (progress - ARC.FLATTEN_END) / (1 - ARC.FLATTEN_END); // normalize to 0-1
        const startY = ARC.MIN_HEIGHT_OVERRIDE; // Start at flat top height
        const endY = POSITION.MAX_HEIGHT; // End at horizon
        
        // Quadratic ease-in for smooth arc: y = start + (end - start) * t²
        y = startY + (endY - startY) * (t * t);
    }
    
    return { x, y };
}


// Export functions for use in other modules
window.MoonModule = {
    updateMoonPhase,
    setupMoonPhaseSlider,
    setupTimeControlSlider,
    getMoonPhaseFromValue,
    updateMoonVisual,
    createMoonShadow,
    positionMoonByTime,
    calculateMoonArcPosition
}; 