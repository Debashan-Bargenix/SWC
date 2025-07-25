import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Plus,
  Bell,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [membersResult, paymentsResult, membershipsResult] = await Promise.all([
        supabase.from('members').select('status'),
        supabase.from('payments').select('amount, payment_date').gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
        supabase.from('member_memberships').select('status, end_date').gte('end_date', new Date().toISOString().split('T')[0]).lte('end_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      ]);

      const totalMembers = membersResult.data?.length || 0;
      const activeMembers = membersResult.data?.filter(m => m.status === 'active').length || 0;
      const monthlyRevenue = paymentsResult.data?.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0) || 0;
      const expiringMemberships = membershipsResult.data?.length || 0;

      return {
        totalMembers,
        activeMembers,
        monthlyRevenue,
        expiringMemberships
      };
    }
  });

  // Fetch recent members
  const { data: recentMembers } = useQuery({
    queryKey: ['recent-members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('members')
        .select(`
          id, first_name, last_name, status, created_at,
          member_memberships(membership_plans(name))
        `)
        .order('created_at', { ascending: false })
        .limit(4);
      
      return data?.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        plan: member.member_memberships?.[0]?.membership_plans?.name || 'No Plan',
        status: member.status === 'active' ? 'Active' : 'Inactive'
      })) || [];
    }
  });

  // Fetch upcoming payments (reminders)
  const { data: upcomingPayments } = useQuery({
    queryKey: ['upcoming-payments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reminders')
        .select(`
          id, reminder_date,
          members(first_name, last_name),
          member_memberships(membership_plans(price))
        `)
        .eq('type', 'payment_due')
        .eq('status', 'pending')
        .order('reminder_date', { ascending: true })
        .limit(3);
      
      return data?.map(reminder => ({
        id: reminder.id,
        member: `${reminder.members?.first_name} ${reminder.members?.last_name}`,
        amount: reminder.member_memberships?.membership_plans?.price || 0,
        dueDate: reminder.reminder_date
      })) || [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your gym overview.</p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => navigate('/add-member')}>
          <Plus className="w-4 h-4 mr-2" />
          Quick Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeMembers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-success">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMembers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Recently added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiringMemberships || 0}</div>
            <p className="text-xs text-warning">
              Memberships expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers?.length ? (
                recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.plan}</p>
                    </div>
                    <Badge 
                      variant={member.status === "Active" ? "default" : "destructive"}
                    >
                      {member.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent members</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payment Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments?.length ? (
                upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{payment.member}</p>
                      <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                    </div>
                    <Badge variant="outline">
                      ${payment.amount}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming reminders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Add Member</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Create Plan</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Record Payment</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Schedule</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}