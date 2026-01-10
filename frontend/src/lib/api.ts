import axios from "axios";

export const BASE_URL = "http://localhost:8000";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for session cookies
});

// Mocking /profile/badges endpoint
const mockBadges = [
    {
        "id": 1,
        "badge_name": "First Donation",
        "sanskrit_name": "अन्नदाता (Annadātā)",
        "slug": "annadata",
        "description": "Unlocked on your very first food donation!",
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2913/2913501.png",
        "level": 1,
        "unlocked_at": "2026-01-10T19:57:22.770570"
    },
    {
        "id": 2,
        "badge_name": "Kind Heart",
        "sanskrit_name": "करुणामयः (Karuṇāmayaḥ)",
        "slug": "karunamaya",
        "description": "Awarded for a donation manually verified as safe and high quality.",
        "icon_url": "https://cdn-icons-png.flaticon.com/512/2107/2107845.png",
        "level": 1,
        "unlocked_at": "2026-01-10T19:57:22.771040"
    }
];

api.interceptors.response.use((response) => {
    const isBadgesPath = response.config && (response.config.url === "/profile/badges" || response.config.url?.endsWith("/profile/badges"));
    if (isBadgesPath && response.config.method === "get") {
        return {
            ...response,
            data: { badges: mockBadges }
        };
    }
    return response;
}, (error) => {
    const isBadgesPath = error.config && (error.config.url === "/profile/badges" || error.config.url?.endsWith("/profile/badges"));
    if (isBadgesPath && error.config.method === "get") {
        return Promise.resolve({
            data: { badges: mockBadges },
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
        });
    }
    return Promise.reject(error);
});

export default api;
