import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { Building2, FileText, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "sonner";

interface NgoProfileData {
    name: string;
    email: string;
    ngo_type: string;
    id_proof: string;
    address_proof: string;
    registration_status: string;
    certificate_id?: string;
}

const NgoProfile = () => {
    const [ngo, setNgo] = useState<NgoProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/ngo/profile");
            setNgo(res.data);
        } catch (error) {
            console.error("Failed to fetch NGO profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await api.put("/ngo/profile", data);
            setNgo(res.data);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Update failed:", error);
            toast.error(error.response?.data?.detail || "Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!ngo) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Helmet>
                <title>NGO Profile | Meal-Mitra</title>
            </Helmet>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">NGO Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                            <Building2 className="w-12 h-12 text-orange-600" />
                        </div>
                        <CardTitle className="text-xl">{ngo.name}</CardTitle>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${ngo.registration_status === "Applied"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : "bg-green-50 text-green-600 border-green-100"
                                }`}>
                                {ngo.registration_status}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Shield className="w-4 h-4" />
                            <span>Type: {ngo.ngo_type}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>Cert ID: {ngo.certificate_id || "Pending"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">NGO Name</Label>
                                    <Input id="name" name="name" defaultValue={ngo.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" defaultValue={ngo.email} type="email" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ngo_type">Organization Type</Label>
                                <Input id="ngo_type" name="ngo_type" defaultValue={ngo.ngo_type} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id_proof">ID Proof Link/ID</Label>
                                    <Input id="id_proof" name="id_proof" defaultValue={ngo.id_proof} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address_proof">Address Proof Link</Label>
                                    <Input id="address_proof" name="address_proof" defaultValue={ngo.address_proof} required />
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-end">
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 gap-2" disabled={isSaving}>
                                    {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NgoProfile;
