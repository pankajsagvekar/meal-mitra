import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Building2, CheckCircle, Mail, MapPin, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NGO {
    id: number;
    name: string;
    email: string;
    status: string;
    location: string;
}

const VerifyNgo = () => {
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNgos();
    }, []);

    const fetchNgos = async () => {
        try {
            const response = await api.get("/admin/ngos");
            setNgos(response.data);
        } catch (error) {
            console.error("Failed to fetch NGOs:", error);
            toast.error("Failed to load NGOs");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number) => {
        try {
            await api.post(`/admin/ngos/${id}/verify`);
            toast.success("NGO verified successfully!");
            // Update local state to reflect verification
            setNgos(ngos.map(ngo => ngo.id === id ? { ...ngo, status: "verified" } : ngo));
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error("Failed to verify NGO");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading NGOs...</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">NGO Verification</h1>
                    <p className="text-gray-500 text-sm">Review and verify non-profit organizations joining the platform.</p>
                </div>
            </div>

            {ngos.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900">No NGOs found</h2>
                        <p className="text-gray-500">There are no NGOs pending verification at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ngos.map((ngo) => (
                        <Card key={ngo.id} className="overflow-hidden border-t-4 border-t-primary/20 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-gray-100 rounded-lg mb-2">
                                        <Building2 className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <Badge variant={ngo.status === "verified" ? "default" : "secondary"} className="capitalize">
                                        {ngo.status === "verified" ? (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Verified
                                            </span>
                                        ) : (
                                            ngo.status
                                        )}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">{ngo.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {ngo.location}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    {ngo.email}
                                </div>

                                {ngo.status !== "verified" && (
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={() => handleVerify(ngo.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Verify NGO
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VerifyNgo;
