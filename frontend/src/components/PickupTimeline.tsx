import { motion } from "framer-motion";
import { Package, UserCheck, Truck, CheckCircle2 } from "lucide-react";

interface PickupTimelineProps {
  currentStep: number;
  isVisible: boolean;
}

const steps = [
  {
    id: 1,
    title: "Posted",
    description: "Donation submitted",
    icon: Package,
  },
  {
    id: 2,
    title: "Accepted",
    description: "NGO confirmed pickup",
    icon: UserCheck,
  },
  {
    id: 3,
    title: "Picked Up",
    description: "Volunteer collected",
    icon: Truck,
  },
  {
    id: 4,
    title: "Completed",
    description: "Meals distributed",
    icon: CheckCircle2,
  },
];

const PickupTimeline = ({ currentStep, isVisible }: PickupTimelineProps) => {
  if (!isVisible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 px-4 bg-muted/30"
    >
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
          >
            <Truck className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Pickup Status
          </h2>
          <p className="text-muted-foreground">Track your donation journey</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Animated progress */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 w-0.5 gradient-primary"
          />

          {/* Steps */}
          <div className="space-y-8 relative">
            {steps.map((step, index) => {
              const isCompleted = step.id <= currentStep;
              const isCurrent = step.id === currentStep;
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  className={`flex items-center gap-4 md:gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Icon */}
                  <motion.div
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                      isCompleted
                        ? "gradient-primary border-transparent text-primary-foreground"
                        : "bg-card border-border text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20 animate-pulse-soft" : ""}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <StepIcon className="w-5 h-5" />
                  </motion.div>

                  {/* Content */}
                  <div
                    className={`flex-1 p-4 rounded-xl transition-all duration-300 ${
                      isCompleted
                        ? "bg-card shadow-soft"
                        : "bg-muted/50"
                    } ${index % 2 === 0 ? "md:text-right md:mr-8" : "md:text-left md:ml-8"}`}
                  >
                    <div className="flex items-center gap-2 md:justify-start">
                      {isCurrent && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary/10 text-secondary"
                        >
                          Current
                        </motion.span>
                      )}
                      {isCompleted && step.id < currentStep && (
                        <CheckCircle2 className="w-4 h-4 text-primary md:order-last" />
                      )}
                    </div>
                    <h3
                      className={`font-semibold ${
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PickupTimeline;
