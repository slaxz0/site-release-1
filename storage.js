class SiteStorage {
    constructor() {
        this.config = window.SiteConfig?.jsonbin || {
            masterKey: '$2a$10$kxjxJSTqGo6J7eM/jm5nVu/088Az5ecHsEEP4MC/r6MFmfKZFAhp6',
            accessKey: '$2a$10$9v1qEGNZwEjE73v8Z41lPeug2Hr1ZizD5k842HcrvcTh2GW.Pz0ka',
            baseUrl: 'https://api.jsonbin.io/v3/b',
            binId: '68704caf4e2901599cff8e53'
        };
        this.localStorageKey = 'siteData';
        this.data = {
            pageNames: {
                'the-lock': '?',
                'the-passcode': '??',
                'the-bedroom': '???',
                'the-garden': '????'
            },
            lockState: {
                isUnlocked: false,
                unlockedAt: null
            },
            passcodeState: {
                isUnlocked: false,
                unlockedAt: null
            },
            combinations: {
                lockCombination: '12345',
                passcode: 'ILUVULIL'
            },
            letterContent: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            ],
            nextDate: "7/20/2025"
        };
        this.pageTitleMap = {
            'letter2': 'Letter #2',
            'the-lock': 'The Lock',
            'the-passcode': 'The Passcode',
            'the-bedroom': 'The Bedroom',
            'the-garden': 'The Garden'
        };
        this.init();
    }

    mergeWithSchema(cloudData) {
        const mergedData = JSON.parse(JSON.stringify(this.data));
        this.deepMerge(mergedData, cloudData);
        return mergedData;
    }

    deepMerge(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (target.hasOwnProperty(key)) {
                    if (typeof target[key] === 'object' && target[key] !== null && 
                        typeof source[key] === 'object' && source[key] !== null &&
                        !Array.isArray(target[key]) && !Array.isArray(source[key])) {
                        this.deepMerge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
    }

    async init() {
        const localData = localStorage.getItem(this.localStorageKey);
        if (localData) {
            this.data = { ...this.data, ...JSON.parse(localData) };
        }
        
        await this.loadFromCloud();
        this.applyState();
    }

    async loadFromCloud() {
        try {
            const response = await fetch(`${this.config.baseUrl}/${this.config.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.config.masterKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.record) {
                    const mergedData = this.mergeWithSchema(result.record);
                    const structureChanged = JSON.stringify(mergedData) !== JSON.stringify(result.record);
                    
                    this.data = mergedData;
                    localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
                    
                    if (structureChanged) {
                        await this.saveToCloud();
                    }
                }
            }
        } catch (error) {
        }
    }

    async saveToCloud() {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
            
            const response = await fetch(`${this.config.baseUrl}/${this.config.binId}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': this.config.masterKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.data)
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async updatePageName(pageId, newName) {
        if (this.data.pageNames[pageId] !== newName) {
            this.data.pageNames[pageId] = newName;
            await this.saveToCloud();
            this.applyState();
        }
    }

    async updateLockState(isUnlocked) {
        if (this.data.lockState.isUnlocked !== isUnlocked) {
            this.data.lockState.isUnlocked = isUnlocked;
            if (isUnlocked) {
                this.data.lockState.unlockedAt = new Date().toISOString();
            }
            await this.saveToCloud();
            this.applyState();
        }
    }

    async updatePasscodeState(isUnlocked) {
        if (this.data.passcodeState.isUnlocked !== isUnlocked) {
            this.data.passcodeState.isUnlocked = isUnlocked;
            if (isUnlocked) {
                this.data.passcodeState.unlockedAt = new Date().toISOString();
            }
            await this.saveToCloud();
            this.applyState();
        }
    }

    async updateLetterContent(paragraphs) {
        if (JSON.stringify(this.data.letterContent) !== JSON.stringify(paragraphs)) {
            this.data.letterContent = paragraphs;
            await this.saveToCloud();
            this.applyState();
        }
    }

    async updateNextDate(date) {
        if (this.data.nextDate !== date) {
            this.data.nextDate = date;
            await this.saveToCloud();
            this.applyState();
        }
    }

    async clearAllData() {
        this.data = {
            pageNames: {
                'the-lock': '?',
                'the-passcode': '??',
                'the-bedroom': '???',
                'the-garden': '????'
            },
            lockState: {
                isUnlocked: false,
                unlockedAt: null
            },
            passcodeState: {
                isUnlocked: false,
                unlockedAt: null
            },
            combinations: {
                lockCombination: '12345',
                passcode: 'ILUVULIL'
            },
            letterContent: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            ],
            nextDate: "7/20/2025"
        };
        
        localStorage.removeItem(this.localStorageKey);
        await this.saveToCloud();
        this.applyState();
    }

    applyState() {
        Object.keys(this.data.pageNames).forEach(pageId => {
            const navLink = document.querySelector(`a[href="#${pageId}"]`);
            if (navLink) {
                navLink.textContent = this.data.pageNames[pageId];
            }
        });

        if (this.data.lockState.isUnlocked) {
            const lockElement = document.getElementById('lock');
            if (lockElement) {
                lockElement.classList.add('unlocked');
            }
        }

        if (this.data.passcodeState.isUnlocked) {
            if (window.passcodeLock) {
                window.passcodeLock.setUnlockedState();
            }
        }

        this.applyLetterContent();
        this.applyNotepadContent();
        this.updatePageTitle();
    }

    applyLetterContent() {
        const letterContent = document.querySelector('.letter-content');
        if (letterContent && this.data.letterContent) {
            const signature = letterContent.querySelector('.signature');
            letterContent.innerHTML = '';
            
            this.data.letterContent.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                letterContent.appendChild(p);
            });
            
            if (signature) {
                letterContent.appendChild(signature);
            }
        }
    }

    applyNotepadContent() {
        const notepadSpans = document.querySelectorAll('.notepad-content span');
        if (notepadSpans.length >= 2 && this.data.nextDate) {
            try {
                const nextDate = new Date(this.data.nextDate);
                const today = new Date();
                
                const timeDiff = nextDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                notepadSpans[0].textContent = 'Next Date';
                if (daysDiff === 1) {
                    notepadSpans[1].textContent = '1 day';
                } else if (daysDiff === 0) {
                    notepadSpans[1].textContent = 'Today!!!';
                } else if (daysDiff < 0) {
                    notepadSpans[1].textContent = '?';
                } else {
                    notepadSpans[1].textContent = `${daysDiff} days!`;
                }
            } catch (error) {
                notepadSpans[0].textContent = 'Next Date';
                notepadSpans[1].textContent = 'Invalid';
            }
        }
    }

    updatePageTitle() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id;
            let title;
            
            if (pageId === 'letter2') {
                title = this.pageTitleMap[pageId];
            } else {
                const displayName = this.data.pageNames[pageId];
                title = displayName;
            }
            
            document.title = title;
        }
    }

    getPageTitle(pageId) {
        if (pageId === 'letter2') {
            return this.pageTitleMap[pageId];
        }
        if (pageId.startsWith('mystery-room-')) {
            const roomNumber = pageId.split('-')[2];
            const questionMarks = '?'.repeat(parseInt(roomNumber) || 5);
            return questionMarks;
        }
        return this.data.pageNames[pageId];
    }

    getState() {
        return { ...this.data };
    }

    getLetterContent() {
        return this.data.letterContent || [];
    }

    getLockCombination() {
        return this.data.combinations?.lockCombination || '12345';
    }

    getPasscode() {
        return this.data.combinations?.passcode || 'ILUVULIL';
    }

    getPasscodeState() {
        return this.data.passcodeState || { isUnlocked: false, unlockedAt: null };
    }
}

const siteStorage = new SiteStorage();
window.siteStorage = siteStorage;