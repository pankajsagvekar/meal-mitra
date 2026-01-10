import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  type: "card" | "map" | "timeline";
}

const SkeletonLoader = ({ type }: SkeletonLoaderProps) => {
  if (type === "card") {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (type === "map") {
    return (
      <div className="rounded-2xl overflow-hidden shadow-card border border-border/50 animate-pulse">
        <div className="h-[400px] bg-muted flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground"
          >
            Loading map...
          </motion.div>
        </div>
      </div>
    );
  }

  if (type === "timeline") {
    return (
      <div className="space-y-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 h-16 bg-muted rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
