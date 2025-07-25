import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Calendar, Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

// Mock reminders data
const mockReminders = [
  {
    id: 1,
    type: "membership_expiry",
    member: "John Smith",
    message: "Premium membership expires in 3 days",
    dueDate: "2024-01-25",
    priority: "high",
    status: "pending"
  },
  {
    id: 2,
    type: "payment_due", 
    member: "Sarah Johnson",
    message: "Monthly payment due in 5 days",
    dueDate: "2024-01-27",
    priority: "medium",
    status: "pending"
  },
  {
    id: 3,
    type: "membership_expiry",
    member: "Mike Wilson",
    message: "Basic membership expires in 7 days",
    dueDate: "2024-01-29",
    priority: "medium",
    status: "pending"
  },
  {
    id: 4,
    type: "payment_overdue",
    member: "Emily Davis",
    message: "Payment overdue by 2 days",
    dueDate: "2024-01-20",
    priority: "high",
    status: "pending"
  },
  {
    id: 5,
    type: "follow_up",
    member: "Alex Thompson",
    message: "Follow up on membership renewal",
    dueDate: "2024-01-24",
    priority: "low",
    status: "completed"
  }
];

export default function Reminders() {
  const [reminders, setReminders] = useState(mockReminders);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("pending");

  const filteredReminders = reminders.filter(reminder => {
    const matchesType = filterType === "All" || reminder.type === filterType;
    const matchesStatus = filterStatus === "all" || reminder.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const markAsCompleted = (id: number) => {
    setReminders(prev => prev.map(reminder =>
      reminder.id === id ? { ...reminder, status: "completed" } : reminder
    ));
  };

  const markAsPending = (id: number) => {
    setReminders(prev => prev.map(reminder =>
      reminder.id === id ? { ...reminder, status: "pending" } : reminder
    ));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-warning">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "membership_expiry":
        return <Calendar className="w-5 h-5 text-warning" />;
      case "payment_due":
        return <Clock className="w-5 h-5 text-accent" />;
      case "payment_overdue":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "follow_up":
        return <Users className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "membership_expiry":
        return "Membership Expiry";
      case "payment_due":
        return "Payment Due";
      case "payment_overdue":
        return "Payment Overdue";
      case "follow_up":
        return "Follow Up";
      default:
        return type;
    }
  };

  const pendingCount = reminders.filter(r => r.status === "pending").length;
  const highPriorityCount = reminders.filter(r => r.priority === "high" && r.status === "pending").length;
  const completedCount = reminders.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reminders & Alerts</h2>
          <p className="text-muted-foreground">Stay on top of important member activities and deadlines.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Require your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highPriorityCount}</div>
            <p className="text-xs text-destructive">Urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedCount}</div>
            <p className="text-xs text-success">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <span className="text-sm font-medium my-auto">Type:</span>
              {["All", "membership_expiry", "payment_due", "payment_overdue", "follow_up"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type === "All" ? "All" : getTypeLabel(type)}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <span className="text-sm font-medium my-auto">Status:</span>
              {["pending", "completed", "all"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.map((reminder) => (
          <Card key={reminder.id} className={`hover:shadow-md transition-shadow ${
            reminder.priority === "high" && reminder.status === "pending" 
              ? "border-destructive" 
              : ""
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(reminder.type)}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {reminder.member.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-semibold">{reminder.member}</h3>
                    <p className="text-sm text-muted-foreground">{reminder.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Due: {reminder.dueDate}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{getTypeLabel(reminder.type)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {getPriorityBadge(reminder.priority)}
                  
                  <div className="flex gap-2">
                    {reminder.status === "pending" ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsCompleted(reminder.id)}
                        className="text-success hover:bg-success hover:text-success-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Mark Complete
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsPending(reminder.id)}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Mark Pending
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReminders.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reminders found</h3>
              <p className="text-muted-foreground">No reminders match your current filters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}