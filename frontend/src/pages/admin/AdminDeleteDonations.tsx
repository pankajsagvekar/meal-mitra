import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Donation {
    id: number;
    food: string;
    quantity: string;
    location: string;
    status: string;
    user_id: number;
}

const AdminDeleteDonations = () => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDonations = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/admin/donations");
            setDonations(res.data);
        } catch (error) {
            console.error("Failed to fetch donations:", error);
            toast.error("Failed to load donations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this donation? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/donations/${id}`);
            toast.success("Donation deleted successfully");
            fetchDonations();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete donation");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Manage Donations</h1>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Admin Only
                </Badge>
            </div>

            <Card className="border-red-100">
                <CardHeader className="bg-red-50/50 border-b border-red-100">
                    <CardTitle className="text-red-900">Danger Zone: Delete Donations</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Food Item</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Donor ID</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.map((donation) => (
                                    <TableRow key={donation.id} className="hover:bg-red-50/30">
                                        <TableCell className="font-mono text-xs">{donation.id}</TableCell>
                                        <TableCell className="font-medium capitalize">{donation.food}</TableCell>
                                        <TableCell>{donation.quantity}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{donation.status}</Badge>
                                        </TableCell>
                                        <TableCell>{donation.user_id}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(donation.id)}
                                                className="text-red-600 border-red-200 hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {donations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No donations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDeleteDonations;
