import HeroSection from "@/components/HeroSection";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";

const Home = () => {
    const { openAuth } = useOutletContext<{ openAuth: (tab: "login" | "register") => void }>();

    return (
        <div className="flex flex-col">
            <Helmet>
                <title>Home | Meal-Mitra</title>
            </Helmet>

            <HeroSection onOpenAuth={openAuth} />
        </div>
    );
};

export default Home;
