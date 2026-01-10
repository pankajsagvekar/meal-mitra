import { useState, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import DonorInputCard from "@/components/DonorInputCard";
import AICleanupPreview, { CleanedFoodData } from "@/components/AICleanupPreview";
import NGOMap from "@/components/NGOMap";
import PickupTimeline from "@/components/PickupTimeline";
import ImpactDashboard from "@/components/ImpactDashboard";
import GamificationSection from "@/components/GamificationSection";
import AIChatWidget from "@/components/AIChatWidget";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const Index = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanedData, setCleanedData] = useState<CleanedFoodData | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const donateRef = useRef<HTMLDivElement>(null);

  const handleDonateClick = () => {
    donateRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (data: { text: string; location: { lat: number; lng: number } | null }) => {
    setIsProcessing(true);
    setUserLocation(data.location);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI-cleaned data
    const mockCleanedData: CleanedFoodData = {
      foodName: "Homemade Vegetable Biryani",
      quantity: "Serves 8-10 people (approx. 3kg)",
      safeUntil: "Today, 8:00 PM",
      safetyNote: "Rice-based dish - consume within 6 hours. Keep covered and refrigerated if possible.",
      safetyLevel: "caution",
      category: "Cooked Meal",
    };

    setCleanedData(mockCleanedData);
    setShowPreview(true);
    setIsProcessing(false);

    toast({
      title: "Food details processed!",
      description: "AI has cleaned up your donation details",
    });

    // Show map after a delay
    setTimeout(() => {
      setShowMap(true);
    }, 500);

    // Simulate pickup progress
    setTimeout(() => setCurrentStep(2), 5000);
  };

  return (
    <>
      <Helmet>
        <title>Meal-Mitra | Turn Surplus Food Into Shared Meals</title>
        <meta 
          name="description" 
          content="Join Meal-Mitra to donate surplus food to nearby NGOs. Reduce food waste, feed communities, and make a real impact. Simple, fast, and meaningful." 
        />
        <meta name="keywords" content="food donation, reduce food waste, NGO, community meals, sustainability" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection onDonateClick={handleDonateClick} />

        {/* Donor Input Section */}
        <div ref={donateRef}>
          <DonorInputCard onSubmit={handleSubmit} isLoading={isProcessing} />
        </div>

        {/* AI Cleanup Preview */}
        <AICleanupPreview data={cleanedData} isVisible={showPreview} />

        {/* NGO Map */}
        <NGOMap userLocation={userLocation} isVisible={showMap} />

        {/* Pickup Timeline */}
        <PickupTimeline currentStep={currentStep} isVisible={showMap} />

        {/* Impact Dashboard */}
        <ImpactDashboard />

        {/* Gamification */}
        <GamificationSection />

        {/* AI Chat Widget */}
        <AIChatWidget />

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border bg-muted/30">
          <div className="container max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground text-sm">
              Made with 💚 for communities everywhere
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              Meal-Mitra © 2024 • Reducing food waste, one meal at a time
            </p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
