import GamificationSection from "@/components/GamificationSection";
import ImpactDashboard from "@/components/ImpactDashboard";
import { Helmet } from "react-helmet";

const Impact = () => {
    return (
        <div className="space-y-12">
            <Helmet>
                <title>Our Impact | Meal-Mitra</title>
            </Helmet>

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Community Impact</h1>
                <p className="text-muted-foreground mt-2">
                    See how our collective efforts are changing lives and reducing waste.
                </p>
            </div>

            <ImpactDashboard />
            <GamificationSection />
        </div>
    );
};

export default Impact;
