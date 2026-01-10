import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!token) {
            toast.error("Invalid or missing reset token");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("token", token);
            formData.append("new_password", password);
            await api.post("/reset-password", formData);
            toast.success("Password reset successful! Please login.");
            navigate("/login");
        } catch (error) {
            console.error("Reset Password error:", error);
            toast.error("Failed to reset password. Token may be invalid or expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
                    <p className="text-gray-600">The password reset link is invalid or missing a token.</p>
                </div>
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-base" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
