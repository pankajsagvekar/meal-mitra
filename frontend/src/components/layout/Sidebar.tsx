import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { HandHeart, Heart, HelpCircle, Home, LogOut, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/");
        }
    };

    const menuItems = [
        { icon: Home, label: "Dashboard", path: "/user/dashboard" },
        { icon: Heart, label: "Donate Food", path: "/donate" },
        { icon: HandHeart, label: "Claim Food", path: "/claim-food" },
        { icon: Heart, label: "My Donation", path: "/my-donations" },
    ];

    const bottomItems = [
        { icon: HelpCircle, label: "Help & Support", path: "/help-support" },
    ];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col py-6",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="px-4 mb-2 lg:hidden flex justify-end">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                                    )}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="px-4 mt-auto space-y-1 border-t border-gray-100 pt-4">
                    {bottomItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                            >
                                <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                {item.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
                    >
                        <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
