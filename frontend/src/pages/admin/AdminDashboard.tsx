import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Activity, AlertTriangle, CheckCircle, Clock, Heart, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface AdminDashboardData {
    user_stats: {
        total_users: number;
        total_ngos: number;
    };
    pending_actions: {
        organizations: number;
        ngos: number;
    };
    donation_stats: {
        total: number;
        available: number;
        claimed: number;
        completed: number;
        expired: number;
    };
    system_health: string;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<AdminDashboardData | null>(null);

    useEffect(() => {
        api.get("/dashboard/admin")
            .then((res) => {
                console.log("Admin Dashboard Data:", res.data);
                setStats(res.data);
            })
            .catch((err) => {
                console.error("Error fetching admin dashboard data:", err);
            });
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back! Manage users and donations here.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.user_stats.total_users || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered on platform</p>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total NGOs</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.user_stats.total_ngos || 0}</div>
                        <p className="text-xs text-muted-foreground">Verified partners</p>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Donations</CardTitle>
                        <Heart className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.donation_stats.available || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently available</p>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.system_health || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">Operational status</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Donation Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>Total Donations</span>
                            </div>
                            <span className="font-bold">{stats?.donation_stats.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Completed</span>
                            </div>
                            <span className="font-bold">{stats?.donation_stats.completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <UserCheck className="h-4 w-4 text-blue-500" />
                                <span>Claimed</span>
                            </div>
                            <span className="font-bold">{stats?.donation_stats.claimed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span>Expired</span>
                            </div>
                            <span className="font-bold">{stats?.donation_stats.expired || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/verify-ngo" className="flex flex-col p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-100 relative">
                            {stats?.pending_actions.ngos ? (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                                    {stats.pending_actions.ngos}
                                </span>
                            ) : null}
                            <ShieldCheck className="h-6 w-6 text-red-500 mb-2" />
                            <span className="font-semibold text-red-900">Verify NGOs</span>
                            <span className="text-xs text-red-700">Approval pending</span>
                        </Link>

                        <Link to="/admin/users" className="flex flex-col p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
                            <Users className="h-6 w-6 text-blue-500 mb-2" />
                            <span className="font-semibold text-blue-900">Manage Users</span>
                            <span className="text-xs text-blue-700">View user base</span>
                        </Link>

                        <Link to="/admin/donations" className="flex flex-col p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-100">
                            <Heart className="h-6 w-6 text-orange-500 mb-2" />
                            <span className="font-semibold text-orange-900">Donations</span>
                            <span className="text-xs text-orange-700">Manage listings</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
