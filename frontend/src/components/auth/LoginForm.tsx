import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LoginFormProps {
    onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            await api.post("/login", formData);

            // Fetch profile to check if admin
            const profileResponse = await api.get("/profile");
            const isAdmin = profileResponse.data.user.is_admin;

            toast.success("Login successful!");

            if (isAdmin) {
                navigate("/admin-dashboard");
            } else {
                navigate("/user/dashboard");
            }

            // Signal to AIChatWidget to show prompt
            localStorage.setItem("showChatPrompt", "true");

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const message = error.response?.data?.detail || error.response?.data?.message || "Invalid credentials or server error";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <Button type="submit" className="w-full bg-primary font-bold" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
};

export default LoginForm;
