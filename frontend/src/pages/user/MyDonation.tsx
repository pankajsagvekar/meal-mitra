import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

interface Donation {
  id: number;
  food?: string;
  quantity?: string;
  location?: string;
  safe_until?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const MyDonation = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get("/my-donations");
        setDonations(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading your donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Helmet>
        <title>My Donations | Meal-Mitra</title>
      </Helmet>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">My Donations</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your contributions and their impact on the community.
          </p>
        </div>
        <div className="bg-primary/10 px-6 py-3 rounded-2xl">
          <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Total Impact</p>
          <p className="text-3xl font-extrabold text-primary">{donations.length} <span className="text-lg font-medium text-primary/60">Meals Shared</span></p>
        </div>
      </div>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        {donations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border"
          >
            <div className="bg-background p-6 rounded-full shadow-sm mb-6">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No donations yet</h3>
            <p className="text-muted-foreground max-w-md text-center mb-8">
              You haven't made any donations yet. Start your journey of giving today!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {donations.map((d) => (
              <motion.div key={d.id} variants={item}>
                <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    {/* Card Header Strip */}
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-foreground capitalize line-clamp-1" title={d.food}>
                            {d.food || "Unknown Food"}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <div className="bg-orange-50 p-2.5 rounded-xl group-hover:bg-orange-100 transition-colors">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                          <Package className="w-4 h-4 mt-0.5 shrink-0" />
                          <span className="font-medium text-foreground/80">Quantity:</span>
                          <span className="truncate">{d.quantity || "N/A"}</span>
                        </div>

                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <span className="font-medium text-foreground/80">Location:</span>
                          <span className="truncate">{d.location || "N/A"}</span>
                        </div>

                        {d.safe_until && (
                          <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="font-medium text-foreground/80">Safe Until:</span>
                            <span className="truncate">{d.safe_until}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyDonation;
