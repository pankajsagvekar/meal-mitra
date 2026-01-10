import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { ArrowLeft, Building2, FileText, Lock, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NgoRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await api.post("/ngo/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success(res.data.message);
            navigate("/ngo/login");
        } catch (error: any) {
            console.error("NGO Registration failed:", error);
            toast.error(error.response?.data?.detail || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50/50">
            <Link to="/" className="mb-8 self-start ml-4 md:ml-0">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Button>
            </Link>

            <Card className="w-full max-w-lg shadow-xl border-orange-100">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">NGO Registration</CardTitle>
                    <CardDescription>
                        Join our network of NGO partners to help reduce food waste
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">NGO Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="name" name="name" placeholder="Hope Foundation" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="email" name="email" type="email" placeholder="contact@ngo.org" className="pl-10" required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ngo_type">NGO Type</Label>
                            <Select name="ngo_type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food Bank">Food Bank</SelectItem>
                                    <SelectItem value="Shelter">Shelter</SelectItem>
                                    <SelectItem value="Community Kitchen">Community Kitchen</SelectItem>
                                    <SelectItem value="Charity Organic">Charity Organization</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="id_proof">ID Proof URL/Number</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="id_proof" name="id_proof" placeholder="Registration ID" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address_proof">Address Proof URL</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="address_proof" name="address_proof" placeholder="Address Proof Link" className="pl-10" required />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register as NGO"}
                        </Button>
                        <div className="text-sm text-center text-gray-600">
                            Already have an NGO account?{" "}
                            <Link to="/ngo/login" className="text-orange-600 font-semibold hover:underline">
                                Login here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default NgoRegister;
