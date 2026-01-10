import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { ArrowLeft, MapPin, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

interface Donation {
    id: number;
    user_id: number;
    raw_text: string;
    food: string;
    quantity: string;
    location: string;
    safe_until?: string;
    lat?: string;
    lng?: string;
}

const AdminDonationDetail = () => {
    const { donationId } = useParams();
    const [donation, setDonation] = useState<Donation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (donationId) {
            fetchDonation(parseInt(donationId));
        }
    }, [donationId]);

    const fetchDonation = async (id: number) => {
        setIsLoading(true);
        try {
            // Since no single fetch endpoint exists, we fetch all and find one.
            const res = await api.get("/admin/donations");
            const allDonations: Donation[] = res.data;
            const found = allDonations.find((d) => d.id === id);

            if (found) {
                setDonation(found);
            } else {
                toast.error("Donation not found");
            }
        } catch (error) {
            console.error("Failed to fetch donation:", error);
            toast.error("Failed to load donation details");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    }

    if (!donation) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900">Donation Not Found</h2>
                <Link to="/admin/donations" className="text-primary hover:underline mt-2 block">
                    Back to List
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Link to="/admin/donations" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Donations
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">Donation #{donation.id}</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500">Food Item</label>
                            <div className="flex items-center gap-2 text-lg font-medium capitalize">
                                <Package className="w-5 h-5 text-primary" />
                                {donation.food}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500">Quantity</label>
                            <div className="text-lg">{donation.quantity}</div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500">Location</label>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {donation.location}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500">User ID</label>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {donation.user_id}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Original Message</label>
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 italic">
                            "{donation.raw_text}"
                        </div>
                    </div>

                    {donation.lat && donation.lng && (
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Coordinates</label>
                            <div className="text-sm font-mono text-gray-600">
                                {donation.lat}, {donation.lng}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDonationDetail;
