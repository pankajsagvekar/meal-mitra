
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
    onOpenAuth?: (tab: "login" | "register") => void;
}

const HeroSection = ({ onOpenAuth }: HeroSectionProps) => {
    return (
        <section className="relative min-h-[60vh] pt-24 pb-12 flex items-center justify-center overflow-hidden gradient-hero">
            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-10 left-10 w-16 h-16 rounded-full bg-primary/30"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-20 right-10 w-12 h-12 rounded-full bg-secondary/30"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                />
            </div>

            <div className="container px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-2xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500 shadow-md mb-6"
                    >
                        <Utensils className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* App name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-3"
                    >
                        Meal<span className="text-primary"> Mitra</span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl text-muted-foreground font-medium mb-4"
                    >
                        No One Sleeps Hungry...
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-8"
                    >
                        Join thousands of donors and NGOs working together to reduce food waste
                        and feed communities in need. Every meal matters.
                    </motion.p>

                    {/* Main Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex flex-wrap items-center justify-center gap-3 mt-6"
                    >
                        <Button
                            size="lg"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-5 text-base rounded-xl shadow-lg shadow-orange-100 transition-all hover:scale-105 active:scale-95"
                            onClick={() => onOpenAuth?.("register")}
                        >
                            Get Started
                        </Button>
                        <Link to="/claim-food">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-orange-200 text-orange-600 px-6 py-5 text-base rounded-xl bg-white/50 backdrop-blur-sm transition-all hover:bg-orange-50 hover:scale-105 active:scale-95"
                            >
                                Find Food
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-wrap items-center justify-center gap-6 mt-12 text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-medium">12,450+ Meals Served</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                            <span className="text-xs font-medium">85+ NGO Partners</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-xs font-medium">3,200+ Donors</span>
                        </div>
                    </motion.div>
                </motion.div>


            </div>
        </section>
    );
};

export default HeroSection;
