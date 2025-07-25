import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

type MembershipPlan = {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
};

export default function AddMember() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    membershipPlan: "",
    startDate: "",
    notes: ""
  });

  // Fetch membership plans on component mount
  useEffect(() => {
    const fetchMembershipPlans = async () => {
      setPlansLoading(true);
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load membership plans.",
          variant: "destructive"
        });
      } else if (data) {
        setMembershipPlans(data);
      }
      setPlansLoading(false);
    };

    fetchMembershipPlans();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.membershipPlan) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Save member to database
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            emergency_contact_name: formData.emergencyContact,
            emergency_contact_phone: formData.emergencyPhone,
            notes: formData.notes,
            status: "active"
          }
        ])
        .select()
        .single();

      if (memberError) {
        toast({
          title: "Error",
          description: "Failed to add member. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Create membership for the member
      const startDate = formData.startDate || new Date().toISOString().split('T')[0];
      const selectedPlan = membershipPlans.find(plan => plan.id === formData.membershipPlan);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (selectedPlan?.duration_months || 1));

      const { error: membershipError } = await supabase
        .from("member_memberships")
        .insert([
          {
            member_id: memberData.id,
            membership_plan_id: formData.membershipPlan,
            start_date: startDate,
            end_date: endDate.toISOString().split('T')[0],
            is_active: true
          }
        ]);

      if (membershipError) {
        // Member was created but membership assignment failed
        toast({
          title: "Warning",
          description: "Member added but membership assignment failed. Please assign manually.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Member Added Successfully",
          description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
        });
      }

      // Reset form and navigate back
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        membershipPlan: "",
        startDate: "",
        notes: ""
      });
      
      navigate("/members");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = membershipPlans.find(plan => plan.id === formData.membershipPlan);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/members")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Members
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Member</h2>
          <p className="text-muted-foreground">Create a new gym membership account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact & Membership */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Membership Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="membershipPlan">Membership Plan *</Label>
                  <Select value={formData.membershipPlan} onValueChange={(value) => handleInputChange("membershipPlan", value)} disabled={plansLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={plansLoading ? "Loading plans..." : "Select a membership plan"} />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price}/{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlan && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">{selectedPlan.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Price: ${selectedPlan.price} per {selectedPlan.duration_months} month{selectedPlan.duration_months > 1 ? 's' : ''}
                    </p>
                    {selectedPlan.features.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Features:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {selectedPlan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes or comments"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/members")} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-primary" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Member"}
          </Button>
        </div>
      </form>
    </div>
  );
}