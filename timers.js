class MysteryTimers {
    constructor() {
        this.timers = [
            {
                id: 'timer1',
                offsetHours: 24, // 1 day
                message: 'Keeping track of time...',
                expiredMessage: 'You watch the TV, while I\'m watching you <3',
                audioFile: 'resources/nothing-22.wav'
            },
            {
                id: 'timer2', 
                offsetHours: 24 * 6, // 6 days
                message: 'Stars in my eyes...',
                expiredMessage: 'You look so pretty...',
                audioFile: 'resources/delilah-22.wav'
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
            container.classList.add('expired');
            
            // Replace timer display with audio player if specified
            if (timer.audioFile && !container.dataset.audioPlayerCreated) {
                this.createAudioPlayer(timer.id, timer.audioFile, timer.expiredMessage);
                container.dataset.audioPlayerCreated = 'true';
            } else if (!timer.audioFile) {
                this.setTimerDisplay(timer.id, 0, 0, 0, 0);
                this.setTimerMessage(timer.id, timer.expiredMessage);
            }
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
    
    createAudioPlayer(timerId, audioFile, message) {
        const container = document.getElementById(timerId);
        if (!container) return;

        // Replace timer display with audio player
        const timerDisplay = container.querySelector('.timer-display');
        const messageEl = container.querySelector('.timer-message');
        
        if (timerDisplay) {
            timerDisplay.innerHTML = `
                <div class="audio-player">
                    <div class="audio-title">${message}</div>
                    <audio id="${timerId}-audio" preload="metadata">
                        <source src="${audioFile}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                    
                    <div class="audio-controls">
                        <button class="loop-btn" id="${timerId}-loop-btn">
                            <div class="loop-arrow"></div>
                        </button>
                        <button class="play-pause-btn" id="${timerId}-play-pause">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon" style="display: none;">⏸</span>
                        </button>
                        
                        <div class="progress-container">
                            <div class="progress-wrapper">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="${timerId}-progress"></div>
                                    <div class="progress-handle" id="${timerId}-handle"></div>
                                </div>
                                <div class="time-display">
                                    <span id="${timerId}-current-time">0:00</span>
                                    <span id="${timerId}-duration">0:00</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="volume-container">
                            <button class="volume-btn" id="${timerId}-volume-btn">🔊</button>
                            <div class="volume-slider">
                                <input type="range" id="${timerId}-volume" min="0" max="100" value="50" class="volume-input">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (messageEl) {
            messageEl.style.display = 'none';
        }
        
        // Initialize audio player functionality
        this.initializeAudioPlayer(timerId);
    }
    
    initializeAudioPlayer(timerId) {
        const audio = document.getElementById(`${timerId}-audio`);
        const playPauseBtn = document.getElementById(`${timerId}-play-pause`);
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        const progressFill = document.getElementById(`${timerId}-progress`);
        const progressHandle = document.getElementById(`${timerId}-handle`);
        const currentTimeEl = document.getElementById(`${timerId}-current-time`);
        const durationEl = document.getElementById(`${timerId}-duration`);
        const volumeBtn = document.getElementById(`${timerId}-volume-btn`);
        const volumeSlider = document.getElementById(`${timerId}-volume`);
        const loopBtn = document.getElementById(`${timerId}-loop-btn`);
        
        if (!audio) return;
        
        // Set initial volume
        audio.volume = 0.5;
        
        // Play/Pause functionality
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline';
            } else {
                audio.pause();
                playIcon.style.display = 'inline';
                pauseIcon.style.display = 'none';
            }
        });
        
        // Progress tracking
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = progress + '%';
                progressHandle.style.left = progress + '%';
                currentTimeEl.textContent = this.formatTime(audio.currentTime);
            }
        });
        
        // Duration loaded
        audio.addEventListener('loadedmetadata', () => {
            durationEl.textContent = this.formatTime(audio.duration);
        });
        
        // Progress bar interaction
        const progressBar = document.querySelector(`#${timerId} .progress-bar`);
        let isDragging = false;
        
        const updateProgress = (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
        };
        
        progressBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateProgress(e);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateProgress(e);
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        progressBar.addEventListener('click', (e) => {
            if (!isDragging) {
                updateProgress(e);
            }
        });
        
        // Touch support for mobile
        progressBar.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            updateProgress(touch);
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                updateProgress(touch);
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Volume control
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
            this.updateVolumeIcon(volumeBtn, audio.volume);
        });
        
        // Volume button toggle
        volumeBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.dataset.previousVolume = audio.volume;
                audio.volume = 0;
                volumeSlider.value = 0;
            } else {
                audio.volume = audio.dataset.previousVolume || 0.5;
                volumeSlider.value = (audio.volume * 100);
            }
            this.updateVolumeIcon(volumeBtn, audio.volume);
        });
        
        // Loop button functionality
        loopBtn.addEventListener('click', () => {
            audio.loop = !audio.loop;
            if (audio.loop) {
                loopBtn.classList.add('active');
            } else {
                loopBtn.classList.remove('active');
            }
        });
        
        // Audio ended
        audio.addEventListener('ended', () => {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
            progressFill.style.width = '0%';
            progressHandle.style.left = '0%';
        });
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateVolumeIcon(volumeBtn, volume) {
        if (volume === 0) {
            volumeBtn.textContent = '🔇';
        } else if (volume < 0.5) {
            volumeBtn.textContent = '🔉';
        } else {
            volumeBtn.textContent = '🔊';
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