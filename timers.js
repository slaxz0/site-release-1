class MysteryTimers {
    constructor() {
        this.timers = [
            {
                id: 'timer1',
                offsetHours: 24, // 1 day
                message: 'Keeping track of time...',
                expiredMessage: '✨ First mystery unlocked! ✨'
            },
            {
                id: 'timer2', 
                offsetHours: 24 * 6, // 6 days
                message: 'Stars in my eyes...',
                expiredMessage: '🌟 Second mystery revealed! 🌟'
            },
            {
                id: 'timer3',
                offsetHours: 24 * 11, // 11 days  
                message: 'The sun is up...',
                expiredMessage: '💫 Final mystery unveiled! 💫'
            }
        ];
        
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        // Start updating timers every second
        this.updateAllTimers();
        this.updateInterval = setInterval(() => {
            this.updateAllTimers();
        }, 1000);
    }
    
    getLockUnlockedTime() {
        if (!window.siteStorage) return null;
        
        const lockState = window.siteStorage.getLockState();
        return lockState && lockState.unlockedAt ? new Date(lockState.unlockedAt) : null;
    }
    
    updateAllTimers() {
        const lockUnlockedTime = this.getLockUnlockedTime();
        
        this.timers.forEach(timer => {
            this.updateTimer(timer, lockUnlockedTime);
        });
    }
    
    updateTimer(timer, lockUnlockedTime) {
        const container = document.getElementById(timer.id);
        if (!container) return;
        
        // Check if lock is unlocked at all
        const lockState = window.siteStorage ? window.siteStorage.getLockState() : null;
        
        if (!lockState || !lockState.isUnlocked || !lockUnlockedTime) {
            // Lock hasn't been unlocked yet
            this.setTimerDisplay(timer.id, 0, 0, 0, 0);
            this.setTimerMessage(timer.id, 'Unlock the lock first...');
            container.classList.remove('expired');
            return;
        }
        
        // Calculate target time (lock unlock time + offset)
        const targetTime = new Date(lockUnlockedTime.getTime() + (timer.offsetHours * 60 * 60 * 1000));
        const now = new Date();
        const timeLeft = targetTime.getTime() - now.getTime();
        
        if (timeLeft <= 0) {
            // Timer has expired
            this.setTimerDisplay(timer.id, 0, 0, 0, 0);
            this.setTimerMessage(timer.id, timer.expiredMessage);
            container.classList.add('expired');
        } else {
            // Calculate time remaining
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            this.setTimerDisplay(timer.id, days, hours, minutes, seconds);
            this.setTimerMessage(timer.id, timer.message);
            container.classList.remove('expired');
        }
    }
    
    setTimerDisplay(timerId, days, hours, minutes, seconds) {
        const daysEl = document.getElementById(`${timerId}-days`);
        const hoursEl = document.getElementById(`${timerId}-hours`);
        const minutesEl = document.getElementById(`${timerId}-minutes`);
        const secondsEl = document.getElementById(`${timerId}-seconds`);
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    setTimerMessage(timerId, message) {
        const messageEl = document.getElementById(`${timerId}-message`);
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Initialize timers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure storage is loaded
    setTimeout(() => {
        window.mysteryTimers = new MysteryTimers();
    }, 500); // Increased delay to ensure storage is fully loaded
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (window.mysteryTimers) {
        window.mysteryTimers.destroy();
    }
});