import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Calendar, CheckCircle, HandHeart, Info, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Donation {
    id: number;
    user_id: number;
    food: string;
    quantity: string;
    status: string;
    location: string;
    raw_text: string;
    price: number;
}

const ClaimFood = () => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await api.get("/donations");
            setDonations(response.data);
        } catch (error) {
            console.error("Failed to fetch donations:", error);
            toast.error("Failed to load available donations");
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (id: number) => {
        try {
            await api.post(`/donations/${id}/claim`);
            toast.success("Food donation claimed successfully!");
            // Update local state
            setDonations(donations.map(d => d.id === id ? { ...d, status: "claimed" } : d));
        } catch (error) {
            console.error("Claiming failed:", error);
            toast.error("Failed to claim donation");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-500">Loading available food...</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <HandHeart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Available Food for Claim</h1>
                    <p className="text-gray-500 text-sm">Help reduce waste by claiming excess food for those in need.</p>
                </div>
            </div>

            {donations.length === 0 ? (
                <Card className="text-center py-12 border-dashed">
                    <CardContent>
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900">No active donations</h2>
                        <p className="text-gray-500">Check back later for new food donations available in your area.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donations.map((donation) => (
                        <Card key={donation.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge
                                        variant={donation.status.toLowerCase() === "available" ? "default" : "secondary"}
                                        className={donation.status.toLowerCase() === "available" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                                    >
                                        {donation.status}
                                    </Badge>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Today
                                    </span>
                                </div>
                                <CardTitle className="text-xl mt-2 group-hover:text-orange-600 transition-colors">
                                    {donation.food}
                                </CardTitle>
                                <CardDescription className="font-semibold text-orange-600">
                                    {donation.quantity}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Package className="h-4 w-4" />
                                        <span>User ID: <strong>{donation.user_id}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>{donation.location}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {donation.status.toLowerCase() === "available" ? (
                                        <Button
                                            onClick={() => handleClaim(donation.id)}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-100"
                                        >
                                            <HandHeart className="h-4 w-4 mr-2" />
                                            Claim this Food
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full bg-gray-100 text-gray-400">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Already Claimed
                                        </Button>
                                    )}
                                </div>

                                <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-center">
                                    <Info className="h-3 w-3" /> Please coordinate pickup promptly after claiming.
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClaimFood;
