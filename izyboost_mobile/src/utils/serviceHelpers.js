
import { Ionicons } from '@expo/vector-icons';

// Map platform names to specific colors and icons
// Backend names are like "Tiktok Vues", "Facebook Like"
const PLATFORM_CONFIG = {
    'tiktok': {
        icon: 'logo-tiktok',
        color: '#000000',
        bgColor: '#E6F7FF' // Light cyan/white
    },
    'facebook': {
        icon: 'logo-facebook',
        color: '#1877F2',
        bgColor: '#E7F5FF'
    },
    'instagram': {
        icon: 'logo-instagram',
        color: '#E1306C',
        bgColor: '#FFF0F5'
    },
    'youtube': {
        icon: 'logo-youtube',
        color: '#FF0000',
        bgColor: '#FFF0F0'
    },
    'twitter': {
        icon: 'logo-twitter',
        color: '#1DA1F2',
        bgColor: '#F0F8FF'
    },
    'x': { // Handle "X" rebranding if present
        icon: 'logo-twitter', // Or create custom X icon
        color: '#000000',
        bgColor: '#F5F5F5'
    },
    'telegram': {
        icon: 'paper-plane', // Ionicon equivalent
        color: '#0088CC',
        bgColor: '#E0F2F7'
    },
    'spotify': {
        icon: 'musical-notes', // Ionicon equivalent
        color: '#1DB954',
        bgColor: '#E8F5E9'
    },
    'snapchat': {
        icon: 'logo-snapchat',
        color: '#FFFC00',
        bgColor: '#FFFDE7'
    },
    'linkedin': {
        icon: 'logo-linkedin',
        color: '#0A66C2',
        bgColor: '#E8F0FE'
    },
    'whatsapp': {
        icon: 'logo-whatsapp',
        color: '#25D366',
        bgColor: '#E8F5E9'
    },
    'default': {
        icon: 'flash',
        color: '#20B2AA', // Primary Green of the theme
        bgColor: '#E0F2F1'
    }
};

/**
 * Normalizes the platform name from the category name.
 * e.g., "Tiktok Vues" -> "tiktok"
 */
const getPlatformKey = (categoryName) => {
    if (!categoryName) return 'default';
    const lowerName = categoryName.toLowerCase();

    for (const key of Object.keys(PLATFORM_CONFIG)) {
        if (lowerName.includes(key)) {
            return key;
        }
    }
    return 'default';
};

/**
 * Groups a flat list of categories into platforms.
 * @param {Array} categories - raw data from /api/services
 * @returns {Array} - Array of platform objects { name, key, icon, color, categories: [] }
 */
export const groupCategoriesByPlatform = (categories) => {
    if (!categories || !Array.isArray(categories)) return [];

    const groups = {};

    categories.forEach(cat => {
        const key = getPlatformKey(cat.name);

        if (!groups[key]) {
            groups[key] = {
                id: key,
                name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
                key: key,
                ...PLATFORM_CONFIG[key],
                subCategories: [],
                totalServices: 0
            };
        }

        groups[key].subCategories.push(cat);
        // Sum up services count if available
        if (cat.services) {
            groups[key].totalServices += cat.services.length;
        }
    });

    // Convert object to array and sort by priority (optional)
    return Object.values(groups).sort((a, b) => {
        // Basic sorting: Popular platforms first
        const priority = ['tiktok', 'facebook', 'instagram', 'youtube', 'whatsapp', 'telegram'];
        const indexA = priority.indexOf(a.key);
        const indexB = priority.indexOf(b.key);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.name.localeCompare(b.name);
    });
};

/**
 * Formats currency in FCFA
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 FCFA';
    // Format with spaces as thousand separators: 15 000
    const formatted = parseFloat(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${formatted} FCFA`;
};
