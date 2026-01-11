import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, LogIn, PackageOpen, Truck } from "lucide-react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";

const HowItWorks = () => {
    const { openAuth } = useOutletContext<{ openAuth: (tab: "login" | "register") => void }>();

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-16">
            <Helmet>
                <title>How It Works | Meal-Mitra</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">How Meal-Mitra Works</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Our platform simplifies the journey from surplus to service in four simple steps.
                </p>
            </motion.div>

            {/* Steps Section */}
            <div className="space-y-12">
                {[
                    {
                        icon: <LogIn className="w-8 h-8 text-white" />,
                        color: "bg-blue-500",
                        title: "Join the Community",
                        description: "Register as an Individual Donor, an Organization (Restaurant/Hotel), or a verified NGO partner."
                    },
                    {
                        icon: <PackageOpen className="w-8 h-8 text-white" />,
                        color: "bg-orange-500",
                        title: "Post Surplus Food",
                        description: "Quickly list the available food items, quantity, and pickup location using our easy-to-use donation form."
                    },
                    {
                        icon: <ChevronRight className="w-8 h-8 text-white" />,
                        color: "bg-green-500",
                        title: "NGO Notification",
                        description: "Our system instantly alerts local verified NGOs about the available donation in their vicinity."
                    },
                    {
                        icon: <Truck className="w-8 h-8 text-white" />,
                        color: "bg-purple-500",
                        title: "Pickup and Delivery",
                        description: "NGOs accept the donation and handle the pickup. You get real-time status updates until the food reaches its destination."
                    }
                ].map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                    >
                        <div className={`w-16 h-16 shrink-0 rounded-2xl ${step.color} shadow-lg flex items-center justify-center`}>
                            {step.icon}
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">Step {index + 1}</span>
                            <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed max-w-lg">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FAQ/Trust Section */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Trust Meal-Mitra?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        "Verified NGO Partners Only",
                        "Real-time Tracking and Notifications",
                        "Secure Data Privacy",
                        "Transparent Impact Reporting",
                        "Community-driven Quality Checks",
                        "Easy Management Dashboard"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center pt-8">
                <button
                    onClick={() => openAuth("register")}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105"
                >
                    Ready to Start?
                </button>
            </div>
        </div>
    );
};

export default HowItWorks;
