import api from "@/lib/api";
import { Menu, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface AdminNavbarProps {
    toggleSidebar?: () => void;
}

const AdminNavbar = ({ toggleSidebar }: AdminNavbarProps) => {
    const [username, setUsername] = useState("Admin");

    useEffect(() => {
        api.get("/profile")
            .then((res) => {
                setUsername(res.data.user.username);
            })
            .catch(() => {
                setUsername("Admin");
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

                <Link to="/admin-dashboard" className="flex items-center gap-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-500 shadow-lg hover:scale-105 transition">
                        <Utensils className="w-5 h-5 text-white" />
                    </div>

                    <span className="font-bold text-xl tracking-tight hidden md:block">
                        Meal Mitra Admin
                    </span>
                </Link>
            </div>


            <div className="flex items-center gap-4 ml-auto">
                <Link to="/admin-profile" className="block">
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition cursor-pointer">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Profile ({username})
                        </span>
                    </div>
                </Link>
            </div>
        </nav>
    );
};

export default AdminNavbar;
