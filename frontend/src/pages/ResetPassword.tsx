
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token");
            // Optional: navigate to login or show error
        }
    }, [token]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!token) {
            toast.error("Missing reset token");
            return;
        }

        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append("token", token);
            formData.append("new_password", newPassword);

            await api.post("/reset-password", formData);
            toast.success("Password updated successfully! Please login.");
            navigate("/login");
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Failed to reset password. Token may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or missing the token.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link to="/login" className="text-primary hover:underline font-semibold">
                            Back to Login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-orange-600 px-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <CardTitle className="text-3xl text-center font-bold">Reset Password</CardTitle>
                    <CardDescription className="text-center text-base">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-base">
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link to="/login" className="text-sm text-primary hover:underline font-semibold">
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ResetPassword;
