import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { ArrowLeft, Building2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NgoLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await api.post("/ngo/login", formData);
            toast.success(res.data.message);
            navigate("/ngo/dashboard");
        } catch (error: any) {
            console.error("NGO Login failed:", error);
            toast.error(error.response?.data?.detail || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50/50">
            <Link to="/" className="mb-8 self-start ml-4 md:ml-0">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Button>
            </Link>

            <Card className="w-full max-w-md shadow-xl border-orange-100">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">NGO Login</CardTitle>
                    <CardDescription>
                        Access your NGO dashboard and manage donations
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input id="email" name="email" type="email" placeholder="contact@ngo.org" className="pl-10" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" required />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "NGO Login"}
                        </Button>
                        <div className="text-sm text-center text-gray-600">
                            Don't have an NGO account?{" "}
                            <Link to="/ngo/register" className="text-orange-600 font-semibold hover:underline">
                                Register here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default NgoLogin;
