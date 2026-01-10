
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";

interface HeroSectionProps {
    onOpenAuth?: (tab: "login" | "register") => void;
}

const HeroSection = ({ onOpenAuth }: HeroSectionProps) => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden gradient-hero">
            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10"
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-40 right-20 w-16 h-16 rounded-full bg-secondary/10"
                    animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.div
                    className="absolute bottom-40 left-1/4 w-12 h-12 rounded-full bg-accent/10"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div
                    className="absolute bottom-20 right-1/3 w-24 h-24 rounded-full bg-primary/5"
                    animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="container px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-500 shadow-lg mb-8"
                    >
                        <Utensils className="w-10 h-10 text-white" />
                    </motion.div>


                    {/* App name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-4"
                    >
                        Meal-<span className="text-primary">Mitra</span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl md:text-2xl text-muted-foreground font-medium mb-8"
                    >
                        Turning surplus food into shared meals
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-muted-foreground max-w-xl mx-auto mb-10"
                    >
                        Join thousands of donors and NGOs working together to reduce food waste
                        and feed communities in need. Every meal matters.
                    </motion.p>

                    {/* CTA Buttons */}
                    
                    {/* Stats preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-wrap items-center justify-center gap-8 mt-16 text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-medium">12,450+ Meals Served</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                            <span className="text-sm font-medium">85+ NGO Partners</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                            <span className="text-sm font-medium">3,200+ Donors</span>
                        </div>
                    </motion.div>
                </motion.div>


            </div>
        </section>
    );
};

export default HeroSection;
