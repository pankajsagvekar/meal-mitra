import { motion } from "framer-motion";
import { Heart, Target, Users, Utensils } from "lucide-react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";

const About = () => {
    const { openAuth } = useOutletContext<{ openAuth: (tab: "login" | "register") => void }>();

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-16">
            <Helmet>
                <title>About Us | Meal-Mitra</title>
            </Helmet>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 shadow-lg mb-4">
                    <Utensils className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Mission to End Hunger</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Meal-Mitra is a bridge between surplus and scarcity. We believe that no one should go to bed hungry when millions of tons of food are wasted every day.
                </p>
            </motion.div>

            {/* Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        icon: <Target className="w-6 h-6 text-orange-500" />,
                        title: "Our Vision",
                        description: "A world where food waste is non-existent and every community has access to nutritious meals."
                    },
                    {
                        icon: <Heart className="w-6 h-6 text-orange-500" />,
                        title: "Our Mission",
                        description: "To create a seamless platform that connects food donors with NGOs and those in need efficiently."
                    },
                    {
                        icon: <Users className="w-6 h-6 text-orange-500" />,
                        title: "Our Community",
                        description: "Built on trust, empathy, and collective action, involving thousands of donors and dedicated NGO partners."
                    }
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="mb-4">{item.icon}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                    </motion.div>
                ))}
            </div>

            {/* Story Section */}
            <div className="bg-orange-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">The Story Behind Meal-Mitra</h2>
                    <p className="text-gray-700 leading-relaxed">
                        It started with a simple observation: grand weddings and events producing enormous amounts of untouched food, while blocks away, people were searching for their next meal.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        We decided to build a technology platform that eliminates the barriers to food donation. By simplifying the process of listing surplus food and alerting local verified NGOs, we've managed to serve thousands of lives.
                    </p>
                </div>
                <div className="flex-1">
                    <div className="aspect-square bg-orange-200 rounded-2xl overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Utensils className="w-32 h-32 text-orange-400 opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Statement */}
            <div className="text-center py-12 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Join Us in Making a Difference</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Whether you're an individual, a restaurant owner, or a volunteer, your contribution can save lives.
                </p>
                <button
                    onClick={() => openAuth("register")}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105"
                >
                    Join the Mission
                </button>
            </div>
        </div>
    );
};

export default About;
