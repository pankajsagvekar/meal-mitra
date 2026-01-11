import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { CheckCircle, FileText, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NGO {
    id: number;
    name: string;
    email: string;
    ngo_type: string;
    registration_status: string;
    id_proof: string;
    address_proof: string;
    address?: string;
    phone_number?: string;
}

const VerifyNgo = () => {
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNgos = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/admin/ngos");
            setNgos(res.data);
        } catch (error) {
            console.error("Failed to fetch NGOs:", error);
            toast.error("Failed to load NGOs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNgos();
    }, []);

    const verifyNgo = async (ngoId: number, action: 'approve' | 'reject') => {
        const confirmMsg = action === 'approve' ? "Are you sure you want to approve this NGO?" : "Are you sure you want to reject this NGO?";
        if (!confirm(confirmMsg)) return;

        try {
            await api.post(`/admin/ngos/${ngoId}/verify`, null, {
                params: { action }
            });
            toast.success(`NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            fetchNgos();
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error(`Failed to ${action} NGO`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">NGO Verification</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Registered NGOs</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Proofs</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ngos.map((ngo) => (
                                    <TableRow key={ngo.id}>
                                        <TableCell className="font-medium">{ngo.name}</TableCell>
                                        <TableCell>{ngo.email}</TableCell>
                                        <TableCell>{ngo.ngo_type}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">{ngo.address ?? "-"}</TableCell>
                                        <TableCell>{ngo.phone_number ?? "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                ngo.registration_status === "Approved" ? "default" :
                                                    ngo.registration_status === "Rejected" ? "destructive" : "outline"
                                            }>
                                                {ngo.registration_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {ngo.id_proof && (
                                                    <a href={ngo.id_proof} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                        <FileText className="w-4 h-4" /> ID
                                                    </a>
                                                )}
                                                {ngo.address_proof && (
                                                    <a href={ngo.address_proof} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                        <FileText className="w-4 h-4" /> Address
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {ngo.registration_status === "Applied" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => verifyNgo(ngo.id, 'approve')}
                                                        className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => verifyNgo(ngo.id, 'reject')}
                                                        className="h-8 px-2"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
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

export default VerifyNgo;
