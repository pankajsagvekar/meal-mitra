import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Heart, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/logout");
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const links = [
        { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/donations", label: "Donations", icon: Heart },
        { href: "/admin/users", label: "Users", icon: Users },
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
                    "fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 lg:translate-x-0 pt-16",
                    isOpen ? "translate-x-0 z-[60]" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="space-y-1 px-3">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => window.innerWidth < 1024 && onClose()}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
