import { motion } from "framer-motion";
import { Award, Heart, Users, Star, Sparkles, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
  color: string;
}

const badges: Badge[] = [
  {
    id: "1",
    name: "First Donation",
    description: "Made your first food donation",
    icon: Heart,
    earned: true,
    color: "text-primary bg-primary/10 border-primary/20",
  },
  {
    id: "2",
    name: "Food Saver",
    description: "Saved 10kg+ of food waste",
    icon: Star,
    earned: true,
    color: "text-secondary bg-secondary/10 border-secondary/20",
  },
  {
    id: "3",
    name: "Community Hero",
    description: "Connected with 5+ NGOs",
    icon: Users,
    earned: false,
    color: "text-accent bg-accent/10 border-accent/20",
  },
  {
    id: "4",
    name: "Impact Champion",
    description: "Served 100+ meals",
    icon: Trophy,
    earned: false,
    color: "text-muted-foreground bg-muted border-border",
  },
];

const GamificationSection = () => {
  const earnedBadges = badges.filter((b) => b.earned).length;
  const totalBadges = badges.length;
  const progressPercent = (earnedBadges / totalBadges) * 100;

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container max-w-4xl mx-auto">
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
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 text-secondary mb-4"
          >
            <Award className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Your Achievements
          </h2>
          <p className="text-muted-foreground">
            Collect badges as you make an impact
          </p>
        </motion.div>

        {/* Progress to next badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Progress to Community Hero</p>
                <p className="text-sm text-muted-foreground">Connect with 3 more NGOs</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-secondary">2/5</span>
          </div>
          <Progress value={40} className="h-3" />
        </motion.div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`relative p-5 rounded-2xl border-2 text-center transition-all ${
                  badge.earned
                    ? `bg-card shadow-card ${badge.color}`
                    : "bg-muted/50 border-border opacity-60"
                }`}
              >
                {/* Earned indicator */}
                {badge.earned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
                  >
                    <span className="text-xs text-primary-foreground">✓</span>
                  </motion.div>
                )}

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${
                    badge.earned ? badge.color : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Name */}
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    badge.earned ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {badge.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {badge.description}
                </p>

                {/* Lock overlay for unearned */}
                {!badge.earned && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-[1px]">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GamificationSection;
