import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Building2, Heart, Package, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

interface NgoDashboardStats {
    name: string;
    registration_status: string;
}

const NgoDashboard = () => {
    const [ngo, setNgo] = useState<NgoDashboardStats | null>(null);

    useEffect(() => {
        api.get("/ngo/profile")
            .then((res) => setNgo(res.data))
            .catch(console.error);
    }, []);

    const stats = [
        { label: "Donations Claimed", value: "0", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Meals Distributed", value: "0", icon: Utensils, color: "text-orange-600", bg: "bg-orange-100" },
        { label: "Volunteer Impact", value: "Low", icon: Heart, color: "text-red-600", bg: "bg-red-100" },
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>NGO Dashboard | Meal-Mitra</title>
            </Helmet>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">NGO Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {ngo?.name || "Partner"}
                    </p>
                </div>
            </div>

            {/* Status Banner */}
            {ngo?.registration_status === "Applied" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4 text-blue-700">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Application Under Review</p>
                        <p className="text-xs opacity-80">Your NGO application is currently being reviewed by our team. You can still browse available donations.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-orange-50/50">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-600" />
                        Available Donations Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground italic">No recent claims or available special NGO donations matched your profile yet.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default NgoDashboard;
