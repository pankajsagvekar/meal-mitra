import AIChatWidget from "@/components/AIChatWidget";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const verifySession = async () => {
            try {
                await api.get("/profile");
            } catch (error) {
                console.error("Session verification failed:", error);
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300 flex flex-col">
                <div className="container max-w-7xl mx-auto p-4 md:p-8 animate-fade-in flex-1">
                    <Outlet />
                </div>

                {/* Footer */}
                {/* <footer className="py-8 px-4 border-t border-border bg-white mt-auto">
                    <div className="container max-w-4xl mx-auto text-center">
                        <p className="text-muted-foreground text-sm">
                            Made with 💚 for communities everywhere
                        </p>
                        <p className="text-muted-foreground/60 text-xs mt-2">
                            Meal-Mitra © 2024 • Reducing food waste, one meal at a time
                        </p>
                    </div>
                </footer> */}
            </main>

            {/* Global Widgets */}
            <AIChatWidget />
        </div>
    );
};

export default MainLayout;
