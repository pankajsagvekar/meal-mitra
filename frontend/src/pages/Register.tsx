
import RegisterForm from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-orange-600 px-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <CardTitle className="text-3xl text-center font-bold">Create Account</CardTitle>
                    <CardDescription className="text-center text-base">
                        Sign up to start donating food
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/" className="text-primary hover:underline font-semibold">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
