import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { CloudRain, Heart, History, IndianRupee, Leaf, Scale, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface DashboardData {
  stats: {
    total_donated: number;
    total_claimed_by_others: number;
    active_listings: number;
  };
  impact: {
    kg_saved: number;
    meals_served: number;
    co2_reduced: number;
    money_saved: number;
    total_donations: number;
    claimed_count: number;
    safe_count: number;
  };
  recent_activity: Array<{
    id: number;
    food: string;
    location: string;
    cooked_at: string;
    status: string;
    quantity: string;
  }>;
}

const UserDashboard = () => {
  const [username, setUsername] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile").then((res) => {
      setUsername(res.data.user.username);
    }).catch(() => {
      navigate("/");
    });

    api.get("/dashboard/user").then((res) => {
      console.log("User Dashboard Data:", res.data);
      setDashboardData(res.data);
    }).catch((err) => {
      console.error("Error fetching user dashboard data:", err);
    });
  }, [navigate]);

  const logout = async () => {
    await api.post("/logout");
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-white/50">
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/donate">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Donate Food
              </CardTitle>
              <CardDescription>
                Share your surplus food with those in need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click here to start a new donation request and help reduce food waste.
              </p>
              {dashboardData && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-2xl font-bold text-primary">{dashboardData.stats.active_listings}</p>
                  <p className="text-xs text-muted-foreground">Active Listings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/my-donations">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                My Donations
              </CardTitle>
              <CardDescription>
                Track your contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See a history of all the food donations you have made.
              </p>
              {dashboardData && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-2xl font-bold text-green-600">{dashboardData.stats.total_donated}</p>
                  <p className="text-xs text-muted-foreground">Total Donated</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-blue-500" />
              Claimed by Others
            </CardTitle>
            <CardDescription>
              Impact of your shared food
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Food items you shared that were successfully claimed and consumed.
            </p>
            {dashboardData && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-2xl font-bold text-blue-600">{dashboardData.stats.total_claimed_by_others}</p>
                <p className="text-xs text-muted-foreground">Items Claimed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Impact</CardTitle>
            <CardDescription>The difference you're making in the world</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <Utensils className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-orange-700">{dashboardData?.impact.meals_served || 0}</p>
                <p className="text-xs text-orange-600 font-medium">Meals Served</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Scale className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-blue-700">{dashboardData?.impact.kg_saved || 0}kg</p>
                <p className="text-xs text-blue-600 font-medium">Food Saved</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <CloudRain className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-700">{dashboardData?.impact.co2_reduced || 0}kg</p>
                <p className="text-xs text-green-600 font-medium">CO2 Reduced</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <IndianRupee className="w-6 h-6 text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-purple-700">₹{dashboardData?.impact.money_saved || 0}</p>
                <p className="text-xs text-purple-600 font-medium">Money Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest donation status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent_activity.length ? (
                dashboardData.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.food}</p>
                        <p className="text-xs text-gray-500">{activity.location} • {activity.quantity}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${activity.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No recent activity to show.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
