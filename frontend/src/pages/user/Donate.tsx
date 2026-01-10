import AICleanupPreview, { CleanedFoodData } from "@/components/AICleanupPreview";
import DonorInputCard from "@/components/DonorInputCard";
import NGOMap from "@/components/NGOMap";
import PickupTimeline from "@/components/PickupTimeline";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

type Location = { lat: number; lng: number };

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

const Donate = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [cleanedData, setCleanedData] = useState<CleanedFoodData | null>(null);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const handleSubmit = async (data: { text: string; location: Location | null; cookedAt: string | null }) => {
        setIsProcessing(true);
        setShowPreview(false);
        setShowMap(false);
        setCurrentStep(1);
        setUserLocation(data.location);

        try {
            const formData = new URLSearchParams();
            formData.append("text", data.text);
            if (data.location) {
                formData.append("lat", data.location.lat.toString());
                formData.append("lng", data.location.lng.toString());
            }
            if (data.cookedAt) {
                formData.append("cooked_at", data.cookedAt);
            }

            const response = await api.post("/donations", formData);

            const donation = response.data.cleaned;

            const formattedData: CleanedFoodData = {
                foodName: donation.food ?? "Food Donation",
                quantity: donation.quantity ?? "As mentioned",
                safeUntil: donation.safe_until ?? "Today",
                safetyNote:
                    "Please ensure the food is consumed within the recommended time.",
                safetyLevel: "safe",
                category: "Food",
            };

            setCleanedData(formattedData);
            setShowPreview(true);

            toast({
                title: "Donation submitted 🎉",
                description: "Your donation is live. Nearby NGOs are being notified.",
            });

            setTimeout(() => setShowMap(true), 400);
            setTimeout(() => setCurrentStep(2), 5000);
        } catch (error: any) {
            console.error(error);

            let message = "Unable to submit donation. Please try again.";

            if (error.response?.data?.detail) {
                message = Array.isArray(error.response.data.detail)
                    ? error.response.data.detail.map((e: any) => e.msg).join(", ")
                    : error.response.data.detail;
            }

            if (error.response?.status === 401) {
                toast({
                    title: "Login required",
                    description: "Please log in to donate food.",
                    variant: "destructive",
                });
                navigate("/");
                return;
            }

            toast({
                title: "Submission failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            className="max-w-5xl mx-auto px-4 pb-20 space-y-12"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <Helmet>
                <title>Donate Food | Meal-Mitra</title>
            </Helmet>

            {/* Input Section */}
            <motion.div variants={item}>
                <DonorInputCard onSubmit={handleSubmit} isLoading={isProcessing} />
            </motion.div>

            {/* Results Section */}
            <div className="space-y-8">
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <AICleanupPreview data={cleanedData} isVisible={showPreview} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showMap && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <NGOMap userLocation={userLocation} isVisible={showMap} />
                                </div>
                                <div>
                                    <PickupTimeline currentStep={currentStep} isVisible={showMap} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Donate;
