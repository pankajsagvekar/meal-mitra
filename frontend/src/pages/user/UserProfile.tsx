import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Mail, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

interface UserProfile {
    username: string;
    email: string;
    phone?: string;
    address?: string;
    createdAt?: string;
}

interface Badge {
    name: string;
    image: string;
    level: number;
    isAchieved: boolean;
    slug: string;
}

const ALL_BADGES = [
    { name: "Annadata", image: "/badge/level 1/annadata.png", level: 1, slug: "annadata" },
    { name: "Bhojanamitra", image: "/badge/level 1/bhojanamitra.png", level: 1, slug: "bhojanamitra" },
    { name: "Karunamaya", image: "/badge/level 1/karunamaya.png", level: 1, slug: "karunamaya" },
    { name: "Annaraksaka", image: "/badge/level 2/annaraksaka.png", level: 2, slug: "annaraksaka" },
    { name: "Dharamitra", image: "/badge/level 2/dharamitra.png", level: 2, slug: "dharamitra" },
    { name: "Svacchasevaka", image: "/badge/level 2/svacchasevaka.png", level: 2, slug: "svacchasevaka" },
    { name: "Bhukhahanta", image: "/badge/Level 3/bhukhahanta.png", level: 3, slug: "bhukhahanta" },
    { name: "Haritasevaka", image: "/badge/Level 3/haritasevaka.png", level: 3, slug: "haritasevaka" },
    { name: "Lokasevaka", image: "/badge/Level 3/lokasevaka.png", level: 3, slug: "lokasevaka" },
    { name: "Annavira", image: "/badge/level 4/annavira.png", level: 4, slug: "annavira" },
    { name: "Prakrtiraksaka", image: "/badge/level 4/prakrtiraksaka.png", level: 4, slug: "prakrtiraksaka" },
    { name: "Sevasiromani", image: "/badge/level 4/sevasiromani.png", level: 4, slug: "sevasiromani" },
    { name: "Annasamjivaka", image: "/badge/level 5/annasamjivaka.png", level: 5, slug: "annasamjivaka" },
    { name: "Lokakalyanakarta", image: "/badge/level 5/lokakalyanakarta.png", level: 5, slug: "lokakalyanakarta" },
    { name: "Mahasevaka", image: "/badge/level 5/mahasevaka.png", level: 5, slug: "mahasevaka" },
];

const UserProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileRes, badgesRes] = await Promise.allSettled([ // Use Promise.allSettled to handle individual failures
                    api.get("/profile"),
                    api.get("/profile/badges")
                ]);

                if (profileRes.status === "fulfilled") {
                    setProfile(profileRes.value.data.user);
                } else {
                    console.error("Failed to fetch profile data:", profileRes.reason);
                    // If profile fetch fails, it's a critical error, redirect to login
                    navigate("/");
                    return; // Stop execution if profile data is not available
                }

                if (badgesRes.status === "fulfilled") {
                    const earnedBadges = badgesRes.value?.data?.badges || [];
                    const earnedSlugs = new Set(earnedBadges.map((b: any) => b.slug));

                    // Merge master list with earned status
                    const mergedBadges = ALL_BADGES.map(badge => ({
                        ...badge,
                        isAchieved: earnedSlugs.has(badge.slug)
                    }));

                    // Sort by level
                    const sortedBadges = mergedBadges.sort((a, b) => a.level - b.level);
                    setBadges(sortedBadges);
                } else {
                    console.warn("Failed to fetch badges, displaying all as unearned:", badgesRes.reason);
                    setBadges(ALL_BADGES.map(b => ({ ...b, isAchieved: false })));
                }

            } catch (error) {
                console.error("An unexpected error occurred during profile data fetch:", error);
                // Catch any other unexpected errors
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md">
                    <CardContent className="py-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Profile not found
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Please try logging in again.
                        </p>
                        <Button onClick={() => navigate("/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Helmet>
                <title>My Profile | Meal-Mitra</title>
            </Helmet>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Profile</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{profile.username}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Email Address
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium">{profile.email || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Phone Number
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium">{profile.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Address
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium">{profile.address || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4 text-primary">Earned Badges</h3>
                        {badges.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {badges.map((badge, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${badge.isAchieved
                                            ? "bg-white border-primary/20 shadow-sm hover:shadow-md hover:scale-105"
                                            : "bg-gray-50 border-gray-100 opacity-60 grayscale"
                                            }`}
                                    >
                                        <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                                            {badge.isAchieved && (
                                                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
                                            )}
                                            <img
                                                src={badge.image}
                                                alt={badge.name}
                                                className={`max-w-full max-h-full object-contain relative z-10 transition-all ${badge.isAchieved ? "drop-shadow-lg" : ""
                                                    }`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Badge';
                                                }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${badge.isAchieved ? "text-primary" : "text-gray-400"
                                            }`}>
                                            Level {badge.level}
                                        </span>
                                        <span className={`text-xs font-semibold text-center leading-tight ${badge.isAchieved ? "text-gray-900" : "text-gray-500"
                                            }`}>
                                            {badge.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No badges earned yet. Start donating to earn badges!
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Username</span>
                                <span className="text-sm font-medium">{profile.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Account Status</span>
                                <span className="text-sm font-medium text-green-600">Active</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;
