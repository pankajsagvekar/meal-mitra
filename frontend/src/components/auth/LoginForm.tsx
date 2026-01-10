import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
            toast.success("Login successful!");
            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/user/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Invalid credentials");
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
                <Label htmlFor="login-password">Password</Label>
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
