
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Username</label>
                            <div className="p-2 bg-muted rounded-md mt-1">
                                {/* Access user info from context or API if proper profile state management is added */}
                                Loading...
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Profile editing features coming soon.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
