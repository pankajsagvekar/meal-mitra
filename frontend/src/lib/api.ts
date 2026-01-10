import axios from "axios";

export const BASE_URL = "https://meal-mitra.onrender.com";

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

// Mock data for NGOs and Donations
const mockNgos = [
    { id: 1, name: "Helping Hands", email: "info@helpinghands.org", status: "pending", location: "Mumbai" },
    { id: 2, name: "Food for All", email: "contact@foodforall.in", status: "pending", location: "Pune" },
];

const mockDonations = [
    { id: 1, title: "Excess Biryani", quantity: "20 plates", status: "available", donor: "Royal Restaurant" },
    { id: 2, title: "Breakfast Sandwiches", quantity: "15 units", status: "available", donor: "Good Morning Cafe" },
];

api.interceptors.response.use((response) => {
    const url = response.config.url || "";

    // /profile/badges
    if (url.includes("/profile/badges") && response.config.method === "get") {
        return { ...response, data: { badges: mockBadges } };
    }

    // /admin/ngos
    if (url.includes("/admin/ngos") && response.config.method === "get") {
        return { ...response, data: mockNgos };
    }

    // /donations/available
    if (url.includes("/donations/available") && response.config.method === "get") {
        return { ...response, data: mockDonations };
    }

    return response;
}, (error) => {
    const url = error.config?.url || "";
    const method = error.config?.method;

    // /profile/badges
    if (url.includes("/profile/badges") && method === "get") {
        return Promise.resolve({ data: { badges: mockBadges }, status: 200, statusText: "OK", headers: {}, config: error.config });
    }

    // /admin/ngos
    if (url.includes("/admin/ngos") && method === "get") {
        return Promise.resolve({ data: mockNgos, status: 200, statusText: "OK", headers: {}, config: error.config });
    }

    // /admin/ngos/{id}/verify
    if (url.match(/\/admin\/ngos\/\d+\/verify/) && method === "post") {
        return Promise.resolve({ data: { message: "NGO verified successfully" }, status: 200, statusText: "OK", headers: {}, config: error.config });
    }

    // /donations/available
    if (url.includes("/donations/available") && method === "get") {
        return Promise.resolve({ data: mockDonations, status: 200, statusText: "OK", headers: {}, config: error.config });
    }

    // /donations/{id}/claim
    if (url.match(/\/donations\/\d+\/claim/) && method === "post") {
        return Promise.resolve({ data: { message: "Donation claimed successfully" }, status: 200, statusText: "OK", headers: {}, config: error.config });
    }

    return Promise.reject(error);
});

export default api;
