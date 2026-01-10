import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Scale, Leaf, TrendingUp } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix: string;
  color: string;
  delay: number;
}

const StatCard = ({ icon: Icon, value, label, suffix, color, delay }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      onViewportEnter={() => setIsVisible(true)}
      className="relative group"
    >
      <motion.div
        className={`p-6 rounded-2xl bg-card shadow-card border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg`}
        whileHover={{ y: -5 }}
      >
        {/* Decorative gradient */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
        
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color.replace('gradient-', 'bg-')}/10 mb-4`}>
          <Icon className={`w-6 h-6 ${color === 'gradient-primary' ? 'text-primary' : color === 'gradient-secondary' ? 'text-secondary' : 'text-accent'}`} />
        </div>

        {/* Value */}
        <motion.div
          className="flex items-baseline gap-1"
          key={count}
        >
          <span className="text-4xl md:text-5xl font-extrabold text-foreground">
            {count.toLocaleString()}
          </span>
          <span className="text-lg font-medium text-muted-foreground">
            {suffix}
          </span>
        </motion.div>

        {/* Label */}
        <p className="text-muted-foreground font-medium mt-2">{label}</p>

        {/* Trend indicator */}
        <div className="flex items-center gap-1 mt-3 text-primary text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>+12% this week</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ImpactDashboard = () => {
  const stats = [
    {
      icon: Utensils,
      value: 12450,
      label: "Meals Served",
      suffix: "+",
      color: "gradient-primary",
    },
    {
      icon: Scale,
      value: 3250,
      label: "Food Saved",
      suffix: "kg",
      color: "gradient-secondary",
    },
    {
      icon: Leaf,
      value: 8120,
      label: "CO₂ Reduced",
      suffix: "kg",
      color: "gradient-accent",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
          >
            <TrendingUp className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Community Impact
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Together, we're making a difference. See the collective impact of our community.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              color={stat.color}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactDashboard;
