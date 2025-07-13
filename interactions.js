// Site interaction system
class SiteInteractions {
    constructor() {
        this.pageNames = {
            'the-lock': 'The Lock',
            'the-passcode': 'The Passcode',
            'the-bedroom': 'The Bedroom',
            'the-garden': 'The Garden'
        };
        this.init();
    }

    init() {
        // Wait for DOM and storage to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = e.target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const pageId = href.substring(1); // Remove #
                    this.handlePageClick(pageId, e.target);
                }
            });
        });

        // Handle clear data button
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }
    }

    async handlePageClick(pageId, linkElement) {
        // Update tab title immediately when switching pages
        this.updateTabTitle(pageId);
        
        // Check if this is a discoverable page and if it needs to be revealed
        if (this.pageNames[pageId]) {
            const currentName = linkElement.textContent;
            const newName = this.pageNames[pageId];
            
            if (currentName !== newName && currentName.match(/^\?+$/)) {
                // This is the first click on this page - reveal the name
                await window.siteStorage.updatePageName(pageId, newName);
                
                // Update the tab title again with the revealed name
                this.updateTabTitle(pageId);
                
                // Add a nice animation effect
                linkElement.style.transition = 'all 0.5s ease';
                linkElement.style.transform = 'scale(1.1)';
                linkElement.style.color = '#d4c5f0';
                
                setTimeout(() => {
                    linkElement.style.transform = 'scale(1)';
                    linkElement.style.color = '';
                }, 500);
            }
        }
    }
    
    updateTabTitle(pageId) {
        // Update the browser tab title based on current page
        if (window.siteStorage) {
            const title = window.siteStorage.getPageTitle(pageId);
            document.title = title;
        }
    }

    async clearAllData() {
        await window.siteStorage.clearAllData();
        
        // Update tab title after clearing data
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            this.updateTabTitle(activePage.id);
        }
        
        // Show feedback
        const clearBtn = document.getElementById('clearDataBtn');
        const originalText = clearBtn.textContent;
        clearBtn.textContent = 'Data Cleared!';
        clearBtn.style.background = 'linear-gradient(135deg, #7db87d 0%, #a0d4a0 30%, #c4f0c4 50%, #a0d4a0 70%, #7db87d 100%)';
        
        setTimeout(() => {
            clearBtn.textContent = originalText;
            clearBtn.style.background = '';
        }, 2000);
    }
}

// Initialize interactions
const siteInteractions = new SiteInteractions();