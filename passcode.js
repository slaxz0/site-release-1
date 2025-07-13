class PasscodeLock {
    constructor() {
        this.correctPasscode = window.siteStorage ? window.siteStorage.getPasscode() : "ILUVULIL";
        this.currentPasscode = "";
        this.inputs = [];
        this.isUnlocked = false;
        this.init();
    }

    init() {
        this.inputs = document.querySelectorAll('.passcode-letter');
        this.statusMessage = document.querySelector('.status-message');
        this.lockContainer = document.querySelector('.passcode-lock');
        
        if (this.inputs.length === 0) return;

        if (window.siteStorage && window.siteStorage.data.passcodeState?.isUnlocked) {
            this.setUnlockedState();
            return;
        }

        this.inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleInput(e, index));
            input.addEventListener('keydown', (e) => this.handleKeydown(e, index));
            input.addEventListener('paste', (e) => this.handlePaste(e));
        });

        this.inputs[0].focus();
    }

    handleInput(event, index) {
        const input = event.target;
        let value = input.value.toUpperCase();

        value = value.replace(/[^A-Z]/g, '');
        
        if (value.length > 1) {
            value = value.slice(0, 1);
        }

        input.value = value;

        if (value) {
            input.classList.add('filled');
            if (index < this.inputs.length - 1) {
                this.inputs[index + 1].focus();
            }
        } else {
            input.classList.remove('filled');
        }

        this.updatePasscode();
    }

    handleKeydown(event, index) {
        const input = event.target;

        if (event.key === 'Backspace') {
            if (!input.value && index > 0) {
                this.inputs[index - 1].focus();
                this.inputs[index - 1].value = '';
                this.inputs[index - 1].classList.remove('filled');
                this.updatePasscode();
            }
        }
        else if (event.key === 'ArrowLeft' && index > 0) {
            this.inputs[index - 1].focus();
        }
        else if (event.key === 'ArrowRight' && index < this.inputs.length - 1) {
            this.inputs[index + 1].focus();
        }
        else if (event.key === 'Enter') {
            this.checkPasscode();
        }
    }

    handlePaste(event) {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text').toUpperCase().replace(/[^A-Z]/g, '');
        
        if (pastedData.length >= this.inputs.length) {
            this.inputs.forEach((input, index) => {
                if (index < pastedData.length) {
                    input.value = pastedData[index];
                    input.classList.add('filled');
                }
            });
            this.updatePasscode();
        }
    }

    updatePasscode() {
        this.currentPasscode = '';
        this.inputs.forEach(input => {
            this.currentPasscode += input.value;
        });

        if (this.currentPasscode.length === 8) {
            setTimeout(() => this.checkPasscode(), 300);
        }
    }

    checkPasscode() {
        if (this.isUnlocked) return;

        this.correctPasscode = window.siteStorage ? window.siteStorage.getPasscode() : this.correctPasscode;

        if (this.currentPasscode === this.correctPasscode) {
            this.unlockSuccess();
        } else if (this.currentPasscode.length === 8) {
            this.unlockFailed();
        }
    }

    unlockSuccess() {
        this.isUnlocked = true;
        this.lockContainer.classList.add('unlocked');
        this.statusMessage.textContent = "Passcode Accepted! Access Granted ✦";
        this.statusMessage.classList.add('success');
        this.statusMessage.classList.remove('error');

        const stars = document.querySelectorAll('.floating-star');
        stars.forEach((star, index) => {
            setTimeout(() => {
                star.style.animation = 'float 0.5s ease-in-out infinite, pulse-star 1s ease-in-out infinite';
            }, index * 100);
        });

        this.inputs.forEach(input => {
            input.disabled = true;
        });

        if (window.siteStorage) {
            window.siteStorage.updatePasscodeState(true);
        }

        setTimeout(() => {
            this.onUnlockSuccess();
        }, 2000);
    }

    unlockFailed() {
        this.statusMessage.textContent = "Incorrect Passcode. Try Again.";
        this.statusMessage.classList.add('error');
        this.statusMessage.classList.remove('success');

        this.inputs.forEach(input => {
            input.style.animation = 'shake 0.5s ease-in-out';
        });

        setTimeout(() => {
            this.clearInputs();
            this.inputs.forEach(input => {
                input.style.animation = '';
            });
            this.statusMessage.classList.remove('error');
            this.statusMessage.textContent = "Think about letter #4 carefully...";
        }, 1500);
    }

    clearInputs() {
        this.inputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        this.currentPasscode = '';
        this.inputs[0].focus();
    }

    onUnlockSuccess() {
        if (window.siteStorage) {
            window.siteStorage.updatePageName('the-passcode', 'The Passcode');
        }
    }

    setPasscode(newPasscode) {
        if (typeof newPasscode === 'string' && newPasscode.length === 8) {
            this.correctPasscode = newPasscode.toUpperCase();
            return true;
        }
        return false;
    }

    getCurrentPasscode() {
        return this.currentPasscode;
    }

    setUnlockedState() {
        if (this.inputs.length === 0) return;
        
        this.isUnlocked = true;
        this.lockContainer.classList.add('unlocked');
        this.statusMessage.textContent = "Access Already Granted ✦";
        this.statusMessage.classList.add('success');
        this.statusMessage.classList.remove('error');

        const correctPasscode = window.siteStorage ? window.siteStorage.getPasscode() : this.correctPasscode;
        this.inputs.forEach((input, index) => {
            if (index < correctPasscode.length) {
                input.value = correctPasscode[index];
                input.classList.add('filled');
                input.disabled = true;
            }
        });

        const stars = document.querySelectorAll('.floating-star');
        stars.forEach((star) => {
            star.style.animation = 'float 0.5s ease-in-out infinite, pulse-star 1s ease-in-out infinite';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.passcodeLock = new PasscodeLock();
});

window.PasscodeLock = PasscodeLock;