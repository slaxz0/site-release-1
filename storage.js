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
                lockCombination: '123456',
                passcode: 'ILUVULIL22'
            },
            letterContent: [
                "Hi there little princess,",
                "I had such an amazing time with you today. I don't think there are enough words out there to express how happy being with you makes me feel. All of our dates are so magical!! BUT I HATE HAVING TO LEAVE AAAAAAAAA",
                "It's okay though. I'll come back from South Korea to visit you as soon as I can. Please don't worry about the flight time or price! Looking forward to that is the only thing that'll help me make it through my two weeks there... And honestly, I could never put a price on my time with you. Every second is a priceless, treasured memory to me.",
                "By the way, I thought the timing you chose for our first kiss was really romantic. I've been trying to hold back for such a long time, but I truly couldn't wait any longer. I'm relieved now. You know, I had a plan for it on Coney Island, but it's kinda nice not worrying about plans and letting things happen naturally sometimes. Your lips felt nice. You looked really pretty too! The entire date, I couldn't stop thinking about how you were glowing. I hope it didn't feel like I was giving you too much affection. I'm really bad at hiding my feelings these days, and they're especially intense when I'm with you",
                "I can never stop admiring you.",
                "Even after four years, I've never known anyone even close to being as pretty as you are.",
                "I really do feel lucky I have the privilege to take you out, to hold your hand, and to kiss you. It feels so dreamlike and surreal sometimes. I get excited every time I remember we're together, out on a date, in New York City of all places. I couldn't imagine anyone I'd rather be with. I really can't, and I've never been able to. Everything feels worth it when I'm with you .",
                "There's so much more that I want to say to you, but I think it'll be more special if I wait until our next date. So you'll have to hold on until then :)",
                "This website is something I've been working on for a while. I have a lot of surprises in store for the future. I'll reveal the next one on our next date hehe. Sorry for teasing you like that, but it'll be more exciting that way.",
                "Thank you for letting me take you out on another date. I've been wishing for a chance like this for a long, long time. I won't let it go."
            ],
            letterThreeContent: [
                "Lorem ipsum letter three content.",
                "This is placeholder text for Letter #3.",
                "More placeholder content here."
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
            if (isUnlocked && !this.data.lockState.unlockedAt) {
                // Only set unlockedAt if it hasn't been set before
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

    async updateLetterThreeContent(paragraphs) {
        if (JSON.stringify(this.data.letterThreeContent) !== JSON.stringify(paragraphs)) {
            this.data.letterThreeContent = paragraphs;
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
                lockCombination: '123456',
                passcode: 'ILUVULIL22'
            },
            letterContent: [
                "Hi there little princess,",
                "I had such an amazing time with you today. I don't think there are enough words out there to express how happy being with you makes me feel. All of our dates are so magical!! BUT I HATE HAVING TO LEAVE AAAAAAAAA",
                "It's okay though. I'll come back from South Korea to visit you as soon as I can. Please don't worry about the flight time or price! Looking forward to that is the only thing that'll help me make it through my two weeks there... And honestly, I could never put a price on my time with you. Every second is a priceless, treasured memory to me.",
                "By the way, I thought the timing you chose for our first kiss was really romantic. I've been trying to hold back for such a long time, but I truly couldn't wait any longer. I'm relieved now. You know, I had a plan for it on Coney Island, but it's kinda nice not worrying about plans and letting things happen naturally sometimes. Your lips felt nice. You looked really pretty too! The entire date, I couldn't stop thinking about how you were glowing. I hope it didn't feel like I was giving you too much affection. I'm really bad at hiding my feelings these days, and they're especially intense when I'm with you",
                "I can never stop admiring you.",
                "Even after four years, I've never known anyone even close to being as pretty as you are.",
                "I really do feel lucky I have the privilege to take you out, to hold your hand, and to kiss you. It feels so dreamlike and surreal sometimes. I get excited every time I remember we're together, out on a date, in New York City of all places. I couldn't imagine anyone I'd rather be with. I really can't, and I've never been able to. Everything feels worth it when I'm with you .",
                "There's so much more that I want to say to you, but I think it'll be more special if I wait until our next date. So you'll have to hold on until then :)",
                "This website is something I've been working on for a while. I have a lot of surprises in store for the future. I'll reveal the next one on our next date hehe. Sorry for teasing you like that, but it'll be more exciting that way.",
                "Thank you for letting me take you out on another date. I've been wishing for a chance like this for a long, long time. I won't let it go."
            ],
            letterThreeContent: [
                "Lorem ipsum letter three content.",
                "This is placeholder text for Letter #3.",
                "More placeholder content here."
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

        // Don't auto-show the letter even if unlocked in JSON
        // Still keep the unlocked state in JSON for other purposes

        if (this.data.passcodeState.isUnlocked) {
            if (window.passcodeLock) {
                window.passcodeLock.setUnlockedState();
            }
        }

        this.applyLetterContent();
        this.applyLetterThreeContent();
        this.applyNotepadContent();
        this.updatePageTitle();
    }

    applyLetterContent() {
        const letterContent = document.querySelector('#letter2 .letter-content');
        if (letterContent && this.data.letterContent) {
            const header = letterContent.querySelector('.letter-header');
            const signature = letterContent.querySelector('.signature');
            letterContent.innerHTML = '';
            
            if (header) {
                letterContent.appendChild(header);
            }
            
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

    applyLetterThreeContent() {
        const letterContent = document.querySelector('#the-lock .letter-content');
        if (letterContent && this.data.letterThreeContent) {
            const header = letterContent.querySelector('.letter-header');
            const signature = letterContent.querySelector('.signature');
            letterContent.innerHTML = '';
            
            if (header) {
                letterContent.appendChild(header);
            }
            
            this.data.letterThreeContent.forEach(paragraph => {
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

    getLetterThreeContent() {
        return this.data.letterThreeContent || [];
    }

    getLockCombination() {
        return this.data.combinations?.lockCombination || '12345';
    }

    getPasscode() {
        return this.data.combinations?.passcode || 'ILUVULIL';
    }

    getLockState() {
        return this.data.lockState || { isUnlocked: false, unlockedAt: null };
    }

    getPasscodeState() {
        return this.data.passcodeState || { isUnlocked: false, unlockedAt: null };
    }
}

const siteStorage = new SiteStorage();
window.siteStorage = siteStorage;