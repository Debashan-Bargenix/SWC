import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  // Example settings state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Simulate save (replace with actual API call)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <p className="text-muted-foreground">Manage your account and app preferences.</p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <Input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <Input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone</label>
              <Input
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="123-456-7890"
              />
            </div>
            <Separator />
            <div>
              <label className="block font-medium mb-1">Change Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New Password"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            {success && <p className="text-success text-sm">Settings saved!</p>}
            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
