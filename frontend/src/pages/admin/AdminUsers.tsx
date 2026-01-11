import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    address?: string;
    phone_number?: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const promoteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to promote this user to Admin?")) return;
        try {
            await api.post(`/admin/promote/${userId}`);
            toast.success("User promoted successfully");
            fetchUsers();
        } catch (error) {
            console.error("Promotion failed:", error);
            toast.error("Failed to promote user");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">{user.address ?? "-"}</TableCell>
                                        <TableCell>{user.phone_number ?? "-"}</TableCell>
                                        <TableCell>
                                            {user.is_admin ? (
                                                <Badge className="bg-primary hover:bg-primary/90">Admin</Badge>
                                            ) : (
                                                <Badge variant="outline">User</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {!user.is_admin && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => promoteUser(user.id)}
                                                >
                                                    <ShieldAlert className="w-4 h-4 mr-1" />
                                                    Promote
                                                </Button>
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

export default AdminUsers;
