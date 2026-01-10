import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface RegisterFormProps {
    onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("password", password);

            await api.post("/register", formData);

            toast.success("Registration successful! Please login.");

            setUsername("");
            setEmail("");
            setPassword("");

            onSuccess?.();
        } catch (error: any) {
            console.error("Registration error:", error);

            let message = "Registration failed";

            if (error.response?.data) {
                const data = error.response.data;

                if (Array.isArray(data.detail)) {
                    message = data.detail.map((err: any) => err.msg).join(", ");
                } else if (typeof data.detail === "string") {
                    message = data.detail;
                } else if (typeof data.message === "string") {
                    message = data.message;
                }
            }

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                    id="register-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <Button disabled={isLoading} className="w-full">
                {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
        </form>
    );
};

export default RegisterForm;
