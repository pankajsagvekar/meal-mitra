
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            <DialogContent className="sm:max-w-[400px] p-5 gap-0">
                <div className="flex flex-col items-center">
                    <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900 leading-none">
                        {activeTab === "login" ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1 mb-6 text-xs">
                        {activeTab === "login"
                            ? "Enter your credentials to access your account"
                            : "Sign up to start donating food"}
                    </DialogDescription>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 h-10">
                        <TabsTrigger
                            value="login"
                            className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                        >
                            Login
                        </TabsTrigger>
                        <TabsTrigger
                            value="register"
                            className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                        >
                            Register
                        </TabsTrigger>
                    </TabsList>

                    <div className="min-h-[300px]">
                        <TabsContent value="login" className="mt-0">
                            <LoginForm onSuccess={onClose} />
                            <PartnerSection onClose={onClose} type="login" />
                        </TabsContent>

                        <TabsContent value="register" className="mt-0">
                            <RegisterForm onSuccess={() => setActiveTab("login")} />
                            <PartnerSection onClose={onClose} type="register" />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

const PartnerSection = ({ onClose }: { onClose: () => void, type: "login" | "register" }) => (
    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-4">
        <div className="w-full text-center">
            <p className="text-[10px] font-bold text-orange-600 mb-2 tracking-wider uppercase">Are You an NGO?</p>
            <div className="flex gap-2 justify-center">
                <Link to="/ngo/register" onClick={onClose}>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] px-2.5 h-7 shadow-sm">
                        Register as NGO
                    </Button>
                </Link>
                <Link to="/ngo/login" onClick={onClose}>
                    <Button variant="outline" className="border-orange-200 text-orange-500 hover:bg-orange-50 text-[9px] px-2.5 h-7">
                        NGO Login
                    </Button>
                </Link>
            </div>
        </div>

        <div className="w-full text-center">
            <p className="text-[10px] font-bold text-orange-600 mb-2 tracking-wider uppercase">Are You an Organization?</p>
            <div className="flex gap-2 justify-center">
                <Link to="/organisation/register" onClick={onClose}>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] px-2.5 h-7 shadow-sm">
                        Register as Org
                    </Button>
                </Link>
                <Link to="/ngo/login" onClick={onClose}>
                    <Button variant="outline" className="border-orange-200 text-orange-500 hover:bg-orange-50 text-[9px] px-2.5 h-7">
                        Organization Login
                    </Button>
                </Link>
            </div>
        </div>
    </div>
);

export default AuthModal;
