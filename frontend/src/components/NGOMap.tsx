import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom NGO marker icon
const ngoIcon = new L.DivIcon({
  className: "custom-ngo-marker",
  html: `<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface NGO {
  id: string;
  name: string;
  distance: string;
  lat: number;
  lng: number;
  capacity: string;
}

interface NGOMapProps {
  userLocation: { lat: number; lng: number } | null;
  isVisible: boolean;
}

// Component to recenter map when location changes
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const NGOMap = ({ userLocation, isVisible }: NGOMapProps) => {
  const { toast } = useToast();
  const [notifiedNGOs, setNotifiedNGOs] = useState<Set<string>>(new Set());
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  // Mock NGO data - in production this would come from API
  const [ngos] = useState<NGO[]>([
    { id: "1", name: "Akshaya Patra Foundation", distance: "1.2 km", lat: 28.6149, lng: 77.2090, capacity: "High" },
    { id: "2", name: "Robin Hood Army", distance: "2.5 km", lat: 28.6229, lng: 77.2195, capacity: "Medium" },
    { id: "3", name: "Feeding India", distance: "3.1 km", lat: 28.6049, lng: 77.1995, capacity: "High" },
    { id: "4", name: "Annakshetra Foundation", distance: "4.0 km", lat: 28.6349, lng: 77.2290, capacity: "Low" },
  ]);

  const handleNotifyNGO = async (ngo: NGO) => {
    setNotifyingId(ngo.id);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setNotifiedNGOs((prev) => new Set([...prev, ngo.id]));
    setNotifyingId(null);
    
    toast({
      title: "NGO Notified!",
      description: `${ngo.name} has been alerted about your donation`,
    });
  };

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [28.6139, 77.2090]; // Default to Delhi

  if (!isVisible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 px-4"
    >
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4"
          >
            <Navigation className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Nearby NGO Partners
          </h2>
          <p className="text-muted-foreground">
            Select an NGO to notify about your donation
          </p>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl overflow-hidden shadow-card border border-border/50"
        >
          <div className="h-[400px] relative">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              className="h-full w-full z-0"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenter center={defaultCenter} />
              
              {/* User location marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Your Location</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* NGO markers */}
              {ngos.map((ngo) => (
                <Marker key={ngo.id} position={[ngo.lat, ngo.lng]} icon={ngoIcon}>
                  <Popup>
                    <div className="p-2 min-w-[180px]">
                      <p className="font-semibold text-foreground">{ngo.name}</p>
                      <p className="text-sm text-muted-foreground">{ngo.distance} away</p>
                      <p className="text-xs text-muted-foreground mb-2">Capacity: {ngo.capacity}</p>
                      <Button
                        size="sm"
                        variant={notifiedNGOs.has(ngo.id) ? "success" : "default"}
                        onClick={() => handleNotifyNGO(ngo)}
                        disabled={notifiedNGOs.has(ngo.id) || notifyingId === ngo.id}
                        className="w-full"
                      >
                        {notifyingId === ngo.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : notifiedNGOs.has(ngo.id) ? (
                          "Notified ✓"
                        ) : (
                          <>
                            <Bell className="w-4 h-4" />
                            Notify NGO
                          </>
                        )}
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* NGO List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid gap-3 mt-6"
        >
          {ngos.map((ngo, index) => (
            <motion.div
              key={ngo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{ngo.name}</p>
                  <p className="text-sm text-muted-foreground">{ngo.distance} away</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={notifiedNGOs.has(ngo.id) ? "success" : "default"}
                onClick={() => handleNotifyNGO(ngo)}
                disabled={notifiedNGOs.has(ngo.id) || notifyingId === ngo.id}
              >
                {notifyingId === ngo.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : notifiedNGOs.has(ngo.id) ? (
                  "Notified ✓"
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Notify
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default NGOMap;
