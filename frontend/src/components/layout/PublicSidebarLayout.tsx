import AIChatWidget from "@/components/AIChatWidget";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const PublicSidebarLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300 flex flex-col">
                <div className="container max-w-6xl mx-auto p-4 md:p-8 animate-fade-in flex-1">
                    <Outlet />
                </div>
            </main>

            <AIChatWidget />
        </div>
    );
};

export default PublicSidebarLayout;
