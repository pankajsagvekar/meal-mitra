import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { ArrowLeft, Building2, FileText, Lock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OrgRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new URLSearchParams();
        const data = new FormData(e.currentTarget);

        formData.append("business_name", data.get("business_name") as string);
        formData.append("email", data.get("email") as string);
        formData.append("password", data.get("password") as string);
        formData.append("role", data.get("role") as string);
        formData.append("fssai_license", data.get("fssai_license") as string);
        formData.append("address", data.get("address") as string);
        formData.append("phone_number", data.get("phone_number") as string);

        try {
            const res = await api.post("/register/organization", formData);
            toast.success(res.data.message);
            // After register, redirect to organization dashboard
            navigate("/organisation/dashboard");
        } catch (error: any) {
            console.error("Organization Registration failed:", error);
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
                    <CardTitle className="text-2xl font-bold">Organization Registration</CardTitle>
                    <CardDescription>
                        Register your Business, Mess, or Canteen to help reduce food waste
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="business_name">Business Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="business_name" name="business_name" placeholder="Grand Hotel" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="email" name="email" type="email" placeholder="contact@org.com" className="pl-10" required />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Organization Type</Label>
                                <Select name="role" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Restaurant">Restaurant</SelectItem>
                                        <SelectItem value="Mess">Mess</SelectItem>
                                        <SelectItem value="Canteen">Canteen</SelectItem>
                                        <SelectItem value="Hotel">Hotel</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fssai_license">FSSAI License No.</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="fssai_license" name="fssai_license" placeholder="FSSAI ID" className="pl-10" required />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="phone_number" name="phone_number" placeholder="+123456789" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input id="address" name="address" placeholder="Address" className="pl-10" required />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register as Organization"}
                        </Button>
                        <div className="text-sm text-center text-gray-600">
                            Already have an account?{" "}
                            <button onClick={() => navigate("/")} className="text-orange-600 font-semibold hover:underline">
                                Login here
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default OrgRegister;
