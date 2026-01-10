import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Heart, Leaf, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile").then((res) => {
      setUsername(res.data.user.username);
    }).catch(() => {
      navigate("/login");
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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
            </CardContent>
          </Card>
        </Link>

        <Link to="/my-donation">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
            </CardContent>
          </Card>
        </Link>

        {/* <Link to="/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" />
                Profile
              </CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and update your personal information and preferences.
              </p>
            </CardContent>
          </Card>
        </Link> */}
      </div>
    </div>
  );
};

export default UserDashboard;
