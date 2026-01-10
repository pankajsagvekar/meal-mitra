import AuthModal from "@/components/auth/AuthModal";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import { Helmet } from "react-helmet";

const Home = () => {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    const openAuth = (tab: "login" | "register") => {
        setAuthTab(tab);
        setAuthModalOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans antialiased">
            <Helmet>
                <title>Home | Meal-Mitra</title>
            </Helmet>

            <Navbar onOpenAuth={openAuth} />

            <main className="flex-1 pt-16">
                <HeroSection onOpenAuth={openAuth} />
            </main>

            <Footer />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                defaultTab={authTab}
                key={authModalOpen ? "open" : "closed"} // Force re-render on open helps sync tab state if desired, but simplified AuthModal handles it via useEffect or state.
            />
        </div>
    );
};

export default Home;
