import { useState } from "react";
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

// Mock data - in real app this would come from your database
const mockMembers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    plan: "Premium",
    status: "Active",
    joinDate: "2024-01-15",
    expiryDate: "2024-07-15",
    paymentStatus: "Paid"
  },
  {
    id: 2,
    name: "Sarah Johnson", 
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    plan: "Basic",
    status: "Active",
    joinDate: "2024-01-14",
    expiryDate: "2024-07-14",
    paymentStatus: "Paid"
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@email.com", 
    phone: "(555) 345-6789",
    plan: "Premium",
    status: "Expiring",
    joinDate: "2023-12-15",
    expiryDate: "2024-01-25",
    paymentStatus: "Due"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "(555) 456-7890", 
    plan: "Basic",
    status: "Active",
    joinDate: "2024-01-13",
    expiryDate: "2024-07-13",
    paymentStatus: "Paid"
  },
  {
    id: 5,
    name: "Alex Thompson",
    email: "alex.t@email.com",
    phone: "(555) 567-8901",
    plan: "Premium", 
    status: "Active",
    joinDate: "2024-01-10",
    expiryDate: "2024-07-10",
    paymentStatus: "Paid"
  }
];

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
        <Button className="bg-gradient-primary">
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
                    <p className="text-xs text-muted-foreground">Expires: {member.expiryDate}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(member.status)}
                    {getPaymentBadge(member.paymentStatus)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
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