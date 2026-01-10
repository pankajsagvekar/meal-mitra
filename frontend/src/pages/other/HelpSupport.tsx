import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Users, Utensils } from "lucide-react";

const HelpSupport = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 shadow-lg mb-4">
          <Utensils className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-gray-600 mt-2">
          Need help with Meal-Mitra? Reach out to our development team.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Development Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p><strong>Project:</strong> Meal-Mitra</p>
            <p><strong>Team:</strong> Full-Stack Development Team</p>
            <p><strong>Purpose:</strong> Food Donation & Waste Reduction Platform</p>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>support@mealmitra.com</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>+91 98765 43210</span>
            </div>

            <p className="text-sm text-gray-500">
              Available: Mon – Fri (10:00 AM – 6:00 PM)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Meal-Mitra. All rights reserved.
      </div>
    </div>
  );
};

export default HelpSupport;
