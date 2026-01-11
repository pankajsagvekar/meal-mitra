import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Menu, ShoppingBag, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
    toggleSidebar?: () => void;
    onOpenAuth?: (tab: "login" | "register") => void;
}

const Navbar = ({ toggleSidebar, onOpenAuth }: NavbarProps) => {
    const [username, setUsername] = useState("");

    useEffect(() => {
        api.get("/profile")
            .then((res) => {
                setUsername(res.data.user.username);
            })
            .catch(() => {
                // User not logged in
                setUsername("");
            });
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 flex items-center px-4 md:px-8 justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
                    >
                        <Menu className="h-6 w-6 text-gray-600" />
                    </button>
                )}
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-500 shadow-lg hover:scale-105 transition ">
                        <Utensils className="w-5 h-5 text-white" />
                    </div>

                    <span className="font-bold text-xl tracking-tight hidden md:block">
                        Meal Mitra
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                {username ? (
                    <>
                        <Link
                            to="/donate"
                            className="hidden md:flex items-center gap-2 font-medium text-gray-600 hover:text-primary transition-colors"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <span>Donate Food</span>
                        </Link>
                        <Link to="/profile" className="block">
                            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition cursor-pointer">
                                <User className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    {username}
                                </span>
                            </div>
                        </Link>

                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="font-semibold"
                            onClick={() => onOpenAuth?.("login")}
                        >
                            Sign In
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onOpenAuth?.("register")}
                        >
                            Get Started
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
