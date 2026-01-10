import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    description: string;
}

const ALL_BADGES = [
    { name: "Annadata", image: "/badge/level 1/annadata.png", level: 1, slug: "annadata", description: "Unlocked on your very first food donation! You are the provider of food." },
    { name: "Bhojanamitra", image: "/badge/level 1/bhojanamitra.png", level: 1, slug: "bhojanamitra", description: "Awarded for being a consistent friend who shares meals with the needy." },
    { name: "Karunamaya", image: "/badge/level 1/karunamaya.png", level: 1, slug: "karunamaya", description: "Awarded for a donation manually verified as safe and high quality. A truly compassionate heart." },
    { name: "Annaraksaka", image: "/badge/level 2/annaraksaka.png", level: 2, slug: "annaraksaka", description: "The protector of food. Awarded for preventing waste on a larger scale." },
    { name: "Dharamitra", image: "/badge/level 2/dharamitra.png", level: 2, slug: "dharamitra", description: "A friend of the earth. Awarded for environmental impact through food saving." },
    { name: "Svacchasevaka", image: "/badge/level 2/svacchasevaka.png", level: 2, slug: "svacchasevaka", description: "Dedicated to cleanliness and hygiene in food handling and donation." },
    { name: "Bhukhahanta", image: "/badge/Level 3/bhukhahanta.png", level: 3, slug: "bhukhahanta", description: "The destroyer of hunger. Awarded for significant contributions to feeding the community." },
    { name: "Haritasevaka", image: "/badge/Level 3/haritasevaka.png", level: 3, slug: "haritasevaka", description: "A green server. Awarded for zero-waste practices in all your donations." },
    { name: "Lokasevaka", image: "/badge/Level 3/lokasevaka.png", level: 3, slug: "lokasevaka", description: "A servant of the people. Recognized for your local community engagement." },
    { name: "Annavira", image: "/badge/level 4/annavira.png", level: 4, slug: "annavira", description: "A hero of food. Awarded for exemplary dedication and high volume of service." },
    { name: "Prakrtiraksaka", image: "/badge/level 4/prakrtiraksaka.png", level: 4, slug: "prakrtiraksaka", description: "Guardian of nature. Awarded for master-level sustainable food practices." },
    { name: "Sevasiromani", image: "/badge/level 4/sevasiromani.png", level: 4, slug: "sevasiromani", description: "The crown jewel of service. Awarded for leadership in food donation." },
    { name: "Annasamjivaka", image: "/badge/level 5/annasamjivaka.png", level: 5, slug: "annasamjivaka", description: "The life-giver through food. A legendary status for unparalleled impact." },
    { name: "Lokakalyanakarta", image: "/badge/level 5/lokakalyanakarta.png", level: 5, slug: "lokakalyanakarta", description: "Architect of public welfare. Awarded for changing lives through service." },
    { name: "Mahasevaka", image: "/badge/level 5/mahasevaka.png", level: 5, slug: "mahasevaka", description: "The ultimate server. The highest honor in the Meal-Mitra community." },
];

const UserProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
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

                    <div className="pt-4 border-t space-y-8">
                        <h3 className="text-lg font-semibold text-primary">Badge Achievements</h3>
                        {badges.length > 0 ? (
                            Array.from(new Set(badges.map(b => b.level))).sort((a, b) => a - b).map(level => (
                                <div key={level} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gray-100"></div>
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                            Level {level}
                                        </span>
                                        <div className="h-px flex-1 bg-gray-100"></div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-6">
                                        {badges.filter(b => b.level === level).map((badge, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`w-32 flex flex-col items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${badge.isAchieved
                                                        ? "bg-white border-primary/20 shadow-sm hover:shadow-md hover:scale-105"
                                                        : "bg-gray-50 border-gray-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
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
                                </div>
                            ))
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

            <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold">{selectedBadge?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className={`w-32 h-32 flex items-center justify-center p-4 rounded-full ${selectedBadge?.isAchieved ? "bg-primary/5" : "bg-gray-100 grayscale"}`}>
                            <img
                                src={selectedBadge?.image}
                                alt={selectedBadge?.name}
                                className="w-full h-full object-contain drop-shadow-xl"
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${selectedBadge?.isAchieved ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"}`}>
                                Level {selectedBadge?.level}
                            </span>
                            <h4 className={`text-sm font-semibold ${selectedBadge?.isAchieved ? "text-green-600" : "text-gray-500"}`}>
                                {selectedBadge?.isAchieved ? "Achievement Unlocked!" : "Locked Achievement"}
                            </h4>
                            <p className="text-muted-foreground text-sm italic py-2">
                                "{selectedBadge?.description}"
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center pt-2">
                        <Button variant="outline" onClick={() => setSelectedBadge(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserProfile;
