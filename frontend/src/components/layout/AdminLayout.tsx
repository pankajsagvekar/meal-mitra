import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const res = await api.get("/profile");
                if (!res.data.user.is_admin) {
                    navigate("/user/dashboard");
                }
            } catch (error) {
                console.error("Admin verification failed:", error);
                navigate("/");
            } finally {
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300 flex flex-col">
                <div className="container max-w-7xl mx-auto p-4 md:p-8 animate-fade-in flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
