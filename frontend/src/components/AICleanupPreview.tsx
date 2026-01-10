import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Clock, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CleanedFoodData {
  foodName: string;
  quantity: string;
  safeUntil: string;
  safetyNote: string;
  safetyLevel: "safe" | "caution" | "urgent";
  category: string;
}

interface AICleanupPreviewProps {
  data: CleanedFoodData | null;
  isVisible: boolean;
}

const AICleanupPreview = ({ data, isVisible }: AICleanupPreviewProps) => {
  if (!data) return null;

  const getSafetyConfig = (level: string) => {
    switch (level) {
      case "safe":
        return {
          color: "bg-primary/10 text-primary border-primary/20",
          icon: CheckCircle2,
          label: "Safe",
        };
      case "caution":
        return {
          color: "bg-secondary/10 text-secondary border-secondary/20",
          icon: AlertTriangle,
          label: "Use Soon",
        };
      case "urgent":
        return {
          color: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertTriangle,
          label: "Urgent",
        };
      default:
        return {
          color: "bg-muted text-muted-foreground border-border",
          icon: ShieldCheck,
          label: "Unknown",
        };
    }
  };

  const safetyConfig = getSafetyConfig(data.safetyLevel);
  const SafetyIcon = safetyConfig.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="py-8 px-4"
        >
          <div className="container max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-primary/20 relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">AI-Processed Details</h3>
                  <p className="text-xs text-muted-foreground">
                    Cleaned and structured for NGO partners
                  </p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid gap-4">
                {/* Food Name & Quantity */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-start justify-between gap-3 p-4 bg-muted/30 rounded-xl"
                >
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Food Item
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {data.foodName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quantity: {data.quantity}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {data.category}
                  </Badge>
                </motion.div>

                {/* Safe Until */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl"
                >
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Safe Until
                    </p>
                    <p className="font-semibold text-foreground">{data.safeUntil}</p>
                  </div>
                </motion.div>

                {/* Safety Note */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${safetyConfig.color}`}
                >
                  <div className="p-2 rounded-lg bg-current/10">
                    <SafetyIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs uppercase tracking-wide font-medium">
                        Safety Status
                      </p>
                      <Badge variant="outline" className={safetyConfig.color}>
                        {safetyConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm">{data.safetyNote}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default AICleanupPreview;
