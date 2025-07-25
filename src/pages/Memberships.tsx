import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";

// Supabase membership_plans table: public.membership_plans

type MembershipPlan = {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
  memberCount: number;
  isActive: boolean;
};

function mapDbPlan(db: any): MembershipPlan {
  return {
    id: db.id,
    name: db.name,
    price: db.price,
    duration_months: db.duration_months,
    features: Array.isArray(db.features) ? db.features : (db.features ? db.features.split(',').map((f: string) => f.trim()) : []),
    memberCount: db.member_count || 0,
    isActive: db.is_active ?? true,
  };
}

export default function Memberships() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch plans from Supabase
  useEffect(() => {
    setLoading(true);
    supabase
      .from("membership_plans")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setPlans((data || []).map(mapDbPlan));
        setLoading(false);
      });
  }, []);

  // Delete plan
  const deletePlan = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("membership_plans").delete().eq("id", id);
    if (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to delete the plan.",
        variant: "destructive"
      });
    } else {
      setPlans(prev => prev.filter(p => p.id !== id));
      toast({ title: "Plan Deleted", description: "The membership plan has been deleted." });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membership Plans</h2>
          <p className="text-muted-foreground">Create and manage your gym membership plans.</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => navigate('/create-membership-plan')}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
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
                  /{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
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
                <Button variant="outline" size="sm" onClick={() => navigate(`/create-membership-plan?id=${plan.id}`)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => deletePlan(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && <p className="text-center py-8">Loading plans...</p>}
      {error && <p className="text-center py-8 text-destructive">{error}</p>}
      {!loading && plans.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No membership plans yet</h3>
              <p className="text-muted-foreground mb-4">Create your first membership plan to get started.</p>
              <Button className="bg-gradient-primary" onClick={() => navigate('/create-membership-plan')}>
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