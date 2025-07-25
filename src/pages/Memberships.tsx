import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";

interface MembershipPlan {
  id: number
  name: string
  price: number
  duration: string
  features: string[]
  memberCount: number
  isActive: boolean
}

// Mock membership plans data
const mockPlans = [
  {
    id: 1,
    name: "Basic Plan",
    price: 49,
    duration: "1 month",
    features: ["Gym Access", "Locker Room", "Basic Equipment"],
    memberCount: 234,
    isActive: true
  },
  {
    id: 2,
    name: "Premium Plan", 
    price: 79,
    duration: "1 month",
    features: ["All Basic Features", "Group Classes", "Personal Training", "Nutrition Guidance"],
    memberCount: 156,
    isActive: true
  },
  {
    id: 3,
    name: "Annual Plan",
    price: 599,
    duration: "12 months",
    features: ["All Premium Features", "Massage Therapy", "Diet Planning", "Priority Booking"],
    memberCount: 89,
    isActive: true
  },
  {
    id: 4,
    name: "Student Plan",
    price: 39,
    duration: "1 month", 
    features: ["Gym Access", "Locker Room", "Study Area"],
    memberCount: 67,
    isActive: true
  }
];

export default function Memberships() {
  const { toast } = useToast();
  const [plans, setPlans] = useState(mockPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    features: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
    
    if (editingPlan) {
      // Update existing plan
      setPlans(prev => prev.map(plan => 
        plan.id === editingPlan.id 
          ? {
              ...plan,
              name: formData.name,
              price: parseFloat(formData.price),
              duration: formData.duration,
              features: featuresArray
            }
          : plan
      ));
      toast({
        title: "Plan Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Create new plan
      const newPlan = {
        id: Math.max(...plans.map(p => p.id)) + 1,
        name: formData.name,
        price: parseFloat(formData.price),
        duration: formData.duration,
        features: featuresArray,
        memberCount: 0,
        isActive: true
      };
      setPlans(prev => [...prev, newPlan]);
      toast({
        title: "Plan Created",
        description: `${formData.name} has been created successfully.`,
      });
    }

    // Reset form
    setFormData({ name: "", price: "", duration: "", features: "" });
    setEditingPlan(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration,
      features: plan.features.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (planId: number) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId));
    toast({
      title: "Plan Deleted",
      description: "The membership plan has been deleted.",
    });
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", duration: "", features: "" });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membership Plans</h2>
          <p className="text-muted-foreground">Create and manage your gym membership plans.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Membership Plan" : "Create New Membership Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Premium Plan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="49.99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="1 month"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleInputChange("features", e.target.value)}
                  placeholder="Gym Access, Group Classes, Personal Training"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-accent">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.duration}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {plan.memberCount} members
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  ${(plan.price * plan.memberCount).toLocaleString()}/mo
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDelete(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No membership plans yet</h3>
              <p className="text-muted-foreground mb-4">Create your first membership plan to get started.</p>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}