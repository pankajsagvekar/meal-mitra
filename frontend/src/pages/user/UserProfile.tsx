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

const UserProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/me");
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                // If unauthorized, redirect to login
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
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
