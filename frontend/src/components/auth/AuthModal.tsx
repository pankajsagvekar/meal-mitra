
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) => {
    const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);

    const navigate = useNavigate();



    // Update internal state when prop changes (if needed, though Dialog controls mount usually)
    // Here we rely on the Tabs value prop if we want it controlled, or defaultValue. 
    // Using value={activeTab} on Tabs to control it manually allows switching from register to login on success.

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">
                        {activeTab === "login" ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {activeTab === "login"
                            ? "Enter your credentials to access your account"
                            : "Sign up to start donating food"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <LoginForm onSuccess={() => {
                            onClose();
                        }} />
                    </TabsContent>

                    <TabsContent value="register">
                        <RegisterForm onSuccess={() => setActiveTab("login")} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
