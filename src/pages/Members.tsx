import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Filter
} from "lucide-react";

// Supabase member table: public.members

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  join_date: string;
  expiry_date: string;
  payment_status: string;
};

function mapDbMember(db: any): Member {
  return {
    id: db.id,
    name: db.first_name + ' ' + db.last_name,
    email: db.email,
    phone: db.phone,
    plan: db.plan || '',
    status: db.status,
    join_date: db.created_at,
    expiry_date: db.expiry_date || '',
    payment_status: db.payment_status || '',
  };
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch members from Supabase
  useEffect(() => {
    setLoading(true);
    supabase
      .from("members")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setMembers((data || []).map(mapDbMember));
        setLoading(false);
      });
  }, []);

  // Filtered members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // CRUD operations
  const addMember = async (newMember: Omit<Member, "id">) => {
    setLoading(true);
    // Map UI fields to DB fields
    const dbMember = {
      first_name: newMember.name.split(' ')[0],
      last_name: newMember.name.split(' ').slice(1).join(' '),
      email: newMember.email,
      phone: newMember.phone,
      plan: newMember.plan,
      status: newMember.status,
      created_at: newMember.join_date,
      expiry_date: newMember.expiry_date,
      payment_status: newMember.payment_status,
    };
    const { data, error } = await supabase.from("members").insert([dbMember]).select();
    if (error) setError(error.message);
    if (data) setMembers(prev => [...prev, ...data.map(mapDbMember)]);
    setLoading(false);
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    setLoading(true);
    // Map UI fields to DB fields
    const dbUpdates: any = {};
    if (updates.name) {
      dbUpdates.first_name = updates.name.split(' ')[0];
      dbUpdates.last_name = updates.name.split(' ').slice(1).join(' ');
    }
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.plan) dbUpdates.plan = updates.plan;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.join_date) dbUpdates.created_at = updates.join_date;
    if (updates.expiry_date) dbUpdates.expiry_date = updates.expiry_date;
    if (updates.payment_status) dbUpdates.payment_status = updates.payment_status;
    const { data, error } = await supabase.from("members").update(dbUpdates).eq("id", id).select();
    if (error) setError(error.message);
    if (data) setMembers(prev => prev.map(m => m.id === id ? mapDbMember(data[0]) : m));
    setLoading(false);
  };

  const deleteMember = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setError(error.message);
    setMembers(prev => prev.filter(m => m.id !== id));
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default" className="bg-success">Active</Badge>;
      case "Expiring":
        return <Badge variant="default" className="bg-warning">Expiring</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="outline" className="text-success border-success">Paid</Badge>;
      case "Due":
        return <Badge variant="outline" className="text-warning border-warning">Due</Badge>;
      case "Overdue":
        return <Badge variant="outline" className="text-destructive border-destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">Manage your gym members and their memberships.</p>
        </div>
        {/* Add New Member button (example, should open a form/modal) */}
        <Button className="bg-gradient-primary" onClick={() => {/* open add member modal */}}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Active", "Expiring", "Expired"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{member.plan} Plan</p>
                    <p className="text-xs text-muted-foreground">Expires: {member.expiry_date}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(member.status)}
                    {getPaymentBadge(member.payment_status)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateMember(member.id, {/* open edit modal */})}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => deleteMember(member.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && <p className="text-center py-8">Loading members...</p>}
      {error && <p className="text-center py-8 text-destructive">{error}</p>}
      {!loading && filteredMembers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No members found matching your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}