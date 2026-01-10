import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Loader2, MapPin, Mic, MicOff, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface DonorInputCardProps {
  onSubmit: (data: { text: string; location: { lat: number; lng: number } | null; cookedAt: string | null }) => void;
  isLoading: boolean;
}

const DonorInputCard = ({ onSubmit, isLoading }: DonorInputCardProps) => {
  const [text, setText] = useState("");
  const [cookedAt, setCookedAt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [autoLocation, setAutoLocation] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();

  // Get location on mount if auto-detect is enabled
  useEffect(() => {
    if (autoLocation) {
      getLocation();
    }
  }, [autoLocation]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location unavailable",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
        toast({
          title: "Location detected",
          description: "Your location has been saved",
        });
      },
      (error) => {
        setLocationLoading(false);
        toast({
          title: "Location error",
          description: "Unable to get your location",
          variant: "destructive",
        });
      }
    );
  };

  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Voice input unavailable",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "hi-IN"; // Changed to Hindi (India) for better local language support

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setText((prev) => prev + " " + transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Something went wrong with voice recognition",
          variant: "destructive",
        });
      };
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Please add food details",
        description: "Describe the food you want to donate",
        variant: "destructive",
      });
      return;
    }
    onSubmit({ text: text.trim(), location: autoLocation ? location : null, cookedAt: cookedAt || null });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-16 px-4"
      id="donate"
    >
      <div className="container max-w-2xl mx-auto">
        <motion.div
          className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50"
          whileHover={{ boxShadow: "0 12px 40px -12px hsl(215 25% 17% / 0.15)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Share Your Surplus
            </h2>
            <p className="text-muted-foreground">
              Describe the food you'd like to donate
            </p>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="e.g. 10 rotis, 2kg rice, dal for 5 people, prepared 2 hours ago..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[140px] resize-none text-base rounded-xl border-border/50 focus:border-primary/50 transition-colors pr-14"
              />
              <span className="absolute bottom-3 left-3 text-xs text-muted-foreground">
                💡 Type in any language
              </span>

              {/* Voice Input Button */}
              <motion.div
                className="absolute top-3 right-3"
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  variant="voice"
                  size="icon"
                  onClick={toggleVoiceInput}
                  className={isListening ? "animate-pulse-soft bg-primary text-primary-foreground" : ""}
                >
                  <AnimatePresence mode="wait">
                    {isListening ? (
                      <motion.div
                        key="mic-on"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Mic className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mic-off"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <MicOff className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>

            {/* Cooked At Input */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="cooked-at" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  When was this prepared?
                </Label>
                <input
                  id="cooked-at"
                  type="datetime-local"
                  value={cookedAt}
                  onChange={(e) => setCookedAt(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium"
                />
              </div>
            </div>

            {/* Location Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${location ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {locationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <Label htmlFor="auto-location" className="text-sm font-medium">
                    Auto-detect location
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {location ? "Location detected" : "Enable to find nearby NGOs"}
                  </p>
                </div>
              </div>
              <Switch
                id="auto-location"
                checked={autoLocation}
                onCheckedChange={setAutoLocation}
              />
            </div>

            {/* Submit Button */}
            <Button
              variant="hero"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading || !text.trim()}
              className="w-full bg-orange-400 hover:bg-orange-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin " />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Donation
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default DonorInputCard;
