import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NgoNavbar from "./NgoNavbar";
import NgoSidebar from "./NgoSidebar";

const NgoLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const verifyNgo = async () => {
            try {
                // Check if NGO profile can be fetched
                await api.get("/ngo/profile");
            } catch (error) {
                console.error("NGO verification failed:", error);
                navigate("/ngo/login");
            } finally {
                setIsLoading(false);
            }
        };

        verifyNgo();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <NgoNavbar toggleSidebar={toggleSidebar} />
            <NgoSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300 flex flex-col">
                <div className="container max-w-7xl mx-auto p-4 md:p-8 animate-fade-in flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default NgoLayout;
