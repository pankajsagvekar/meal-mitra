import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Donation {
    id: number;
    user_id: number;
    raw_text: string;
    food: string;
    quantity: string;
    location: string;
    status?: string;
    safe_until?: string;
    cooked_at?: string;
    price?: number;
    is_ngo_only?: boolean;
}

const AdminDonations = () => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

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

    const deleteDonation = async (id: number) => {
        if (!confirm("Are you sure you want to delete this donation?")) return;
        try {
            await api.delete(`/admin/donations/${id}`);
            toast.success("Donation deleted");
            fetchDonations();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete donation");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Donations</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Food</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Safe Until</TableHead>
                                    <TableHead>Cooked At</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>NGO Only</TableHead>
                                    <TableHead>Raw Text</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.map((donation) => (
                                    <TableRow key={donation.id}>
                                        <TableCell>{donation.id}</TableCell>
                                        <TableCell className="font-medium capitalize">{donation.food}</TableCell>
                                        <TableCell>{donation.quantity}</TableCell>
                                        <TableCell>{donation.location}</TableCell>
                                        <TableCell>{donation.user_id}</TableCell>
                                        <TableCell>{donation.status}</TableCell>
                                        <TableCell>{donation.safe_until ?? "-"}</TableCell>
                                        <TableCell>{donation.cooked_at ?? "-"}</TableCell>
                                        <TableCell>{donation.price ?? 0}</TableCell>
                                        <TableCell>{donation.is_ngo_only ? "Yes" : "No"}</TableCell>
                                        <TableCell>{donation.raw_text}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <Link to={`/admin/donations/${donation.id}`}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-600"
                                                onClick={() => deleteDonation(donation.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDonations;
