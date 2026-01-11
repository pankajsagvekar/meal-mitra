import AuthModal from "@/components/auth/AuthModal";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    const openAuth = (tab: "login" | "register") => {
        setAuthTab(tab);
        setAuthModalOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans antialiased">
            <Navbar onOpenAuth={openAuth} />
            <main className="flex-1 pt-16">
                <Outlet context={{ openAuth }} />
            </main>
            <Footer />
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                defaultTab={authTab}
                key={authModalOpen ? "open" : "closed"}
            />
        </div>
    );
};

export default PublicLayout;
