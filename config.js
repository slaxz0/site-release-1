// Configuration for site storage
const SiteConfig = {
    // JSONBin.io configuration
    jsonbin: {
        masterKey: '$2a$10$kxjxJSTqGo6J7eM/jm5nVu/088Az5ecHsEEP4MC/r6MFmfKZFAhp6',
        accessKey: '$2a$10$9v1qEGNZwEjE73v8Z41lPeug2Hr1ZizD5k842HcrvcTh2GW.Pz0ka',
        baseUrl: 'https://api.jsonbin.io/v3/b',
        binId: '68704caf4e2901599cff8e53' // Fixed bin ID
    },
    
    storage: {
        localStorageKey: 'siteData',
        syncInterval: 5000, // Sync every 5 seconds
        retryAttempts: 3
    },
    
    features: {
        cloudStorage: true,
        realTimeSync: true,
        debugMode: false
    }
};

window.SiteConfig = SiteConfig;