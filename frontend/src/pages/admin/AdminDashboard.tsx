import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back! Manage users and donations here.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/admin/donations">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Manage Donations
                            </CardTitle>
                            <Heart className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">View All</div>
                            <p className="text-xs text-muted-foreground">
                                Review and manage all food donations
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/admin/users">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Manage Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">View Users</div>
                            <p className="text-xs text-muted-foreground">
                                Manage registered users and admins
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
