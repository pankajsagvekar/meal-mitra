import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Organization {
    id: number;
    username: string;
    email: string;
    role: string;
    verification_status: string;
    fssai_license: string;
    document_proof?: string;
}

const VerifyOrganization = () => {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrgs = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/admin/organizations");
            setOrgs(res.data);
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
            toast.error("Failed to load organizations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    const verifyOrg = async (userId: number, action: 'approve' | 'reject') => {
        const confirmMsg = action === 'approve' ? "Are you sure you want to approve this organization?" : "Are you sure you want to reject this organization?";
        if (!confirm(confirmMsg)) return;

        try {
            await api.post(`/admin/organizations/${userId}/verify`, null, {
                params: { action }
            });
            toast.success(`Organization ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            fetchOrgs();
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error(`Failed to ${action} organization`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Organization Verification</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Registered Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>FSSAI License</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orgs.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-medium">{org.username}</TableCell>
                                        <TableCell>{org.role}</TableCell>
                                        <TableCell>{org.fssai_license}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                org.verification_status === "Approved" ? "default" :
                                                    org.verification_status === "Rejected" ? "destructive" : "outline"
                                            }>
                                                {org.verification_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {org.verification_status === "Applied" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => verifyOrg(org.id, 'approve')}
                                                        className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => verifyOrg(org.id, 'reject')}
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

export default VerifyOrganization;
