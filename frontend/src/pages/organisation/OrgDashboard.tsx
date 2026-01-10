import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Building2, Package, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

const OrgDashboard = () => {
    const [stats, setStats] = useState([
        { title: "Active Donations", value: "0", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Total Impact", value: "0 kg", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
        { title: "Community Reach", value: "0 NGOs", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    ]);
    const [verificationStatus, setVerificationStatus] = useState("Approved");

    useEffect(() => {
        api.get("/profile")
            .then((res) => {
                setVerificationStatus(res.data.user.verification_status);
                // In a real app, we would fetch actual stats here
                setStats([
                    { title: "Active Donations", value: res.data.total_donations.toString(), icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
                    { title: "Total Impact", value: `${res.data.kg_saved} kg`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
                    { title: "Community Reach", value: "Multiple NGOs", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
                ]);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage your surplus food donations and track your social impact.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Status Notice */}
            {verificationStatus !== "Approved" && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-xl">
                            <Building2 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Verification Pending</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Your account is currently under review by our admin team.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-orange-800">
                            Once verified, your donations will be prioritized for NGOs and you'll receive a badge of trust.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => window.location.href = '/donate'}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Donate Food
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-balance">
                            Post your surplus food now and get it picked up by local NGOs.
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer" onClick={() => window.location.href = '/my-donations'}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-secondary" />
                            View History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-balance">
                            Track your past donations and manage active requests.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrgDashboard;
