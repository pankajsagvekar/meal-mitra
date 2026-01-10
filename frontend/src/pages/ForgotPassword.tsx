
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append("email", email);

            await api.post("/forgot-password", formData);
            toast.success("Recovery email sent if the account exists");
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("Failed to send recovery email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-orange-600 px-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <CardTitle className="text-3xl text-center font-bold">Forgot Password</CardTitle>
                    <CardDescription className="text-center text-base">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-base">
                            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
