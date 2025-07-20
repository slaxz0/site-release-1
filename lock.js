(function($) {
    $.fn.makeLock = function(dialNum) {
        var combo;
        var dials = dialNum || $(this).attr('data-dials') || 3;
        var lock = $(this).addClass('myLock');
        
        lock.append('<div class="lockInset">' +
                    '<div class="lockLine"></div>' +
                    '<div class="lockWrapper"></div>' +
                    '</div>');
        
        var enterBTN = $('<div class="btnEnter button">Enter</div>').appendTo(lock);
        var lockWrapper = lock.find('.lockWrapper');
        
        for (var i = 0; i < dials; i++) {
            var dial = $('<div class="dial"><ol></ol></div>').appendTo(lockWrapper);
            var slider = dial.find('ol');
            for (var n = 0; n < 10; n++) {
                slider.append('<li>' + n + '</li>');
            }
            slider.prepend(slider.find('li:last-child'));
        }
        lockWrapper.append('<div class="shadow"></div>');

        var dialMove = function(e) {
            var $this = $(this);
            
            $this.append($('li:first-child', $this));
            
            $this.css({
                'transition': 'top 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'top': '5px'
            });
            
            setTimeout(function() {
                $this.css('top', '-60px');
            }, 10);
        };
        
        lock.find('ol').on('click', dialMove);

        var checkLock = function(e) {
            combo = '';
            lock.find('li:nth-child(3)').each(function() {
                combo += $(this).text();
            });
            
            var correctCombination = window.siteStorage ? window.siteStorage.getLockCombination() : '12345';
            
            if (combo === correctCombination) {
                enterBTN.css('background', 'linear-gradient(135deg, #7db87d 0%, #a0d4a0 30%, #c4f0c4 50%, #a0d4a0 70%, #7db87d 100%)')
                       .text('✓ Unlocked');
                
                // Don't update storage state yet - wait until after explosion
                
                setTimeout(function() {
                    alert('Wow, you finally got it open, huh? Good job cutie <3');
                    
                    // After alert is dismissed, start explosion
                    const lockCenter = document.querySelector('#the-lock .lock-center');
                    const letterContainer = document.querySelector('#the-lock .lock-letter-container');
                    const lockElement = lock[0];
                    
                    if (lockElement) {
                        lockElement.classList.add('exploding');
                    }
                    
                    // Wait for shake and explosion to complete, then transition to letter
                    setTimeout(function() {
                        // Now update storage state
                        if (window.siteStorage) {
                            window.siteStorage.updateLockState(true);
                        }
                        
                        // Update timers immediately when lock is unlocked
                        if (window.mysteryTimers) {
                            window.mysteryTimers.updateAllTimers();
                        }
                        
                        if (lockCenter && letterContainer) {
                            lockCenter.style.display = 'none';
                            letterContainer.style.display = 'block';
                            letterContainer.style.opacity = '0';
                            letterContainer.style.transition = 'opacity 0.8s ease';
                            
                            setTimeout(function() {
                                letterContainer.style.opacity = '1';
                            }, 50);
                        }
                    }, 5200); // Wait for shake (4s) + explosion (0.5s) + particles (0.5s) + buffer
                }, 500);
            } else {
                enterBTN.css('background', 'linear-gradient(135deg, #d49b9b 0%, #e8b8b8 30%, #f0d4d4 50%, #e8b8b8 70%, #d49b9b 100%)')
                       .text('✗ Wrong Code');
                setTimeout(function() {
                    enterBTN.css('background', 'linear-gradient(135deg, #6b5b95 0%, #7a6ba5 30%, #8a7bb5 50%, #7a6ba5 70%, #6b5b95 100%)')
                           .text('Enter');
                }, 2000);
            }
        };
        
        enterBTN.on('click', checkLock);
        
        return this;
    };
}(jQuery));

$(document).ready(function() {
    $("#lock").makeLock();
});