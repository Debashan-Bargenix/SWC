import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Select } from "@/components/ui/select";

// Example fitness classes, ideally fetched from DB
const FITNESS_CLASSES = [
  "Yoga",
  "Pilates",
  "HIIT",
  "Strength",
  "Cardio",
  "Zumba",
  "CrossFit",
];

export default function CreateMembershipPlan() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [durationType, setDurationType] = useState("month");
  const [durationValue, setDurationValue] = useState(1);
  const [endDate, setEndDate] = useState<string>("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate end date based on duration
  const handleDurationChange = (value: number, type: string) => {
    setDurationValue(value);
    setDurationType(type);
    const start = new Date();
    let end = new Date(start);
    if (type === "day") end.setDate(start.getDate() + value);
    if (type === "week") end.setDate(start.getDate() + value * 7);
    if (type === "month") end.setMonth(start.getMonth() + value);
    setEndDate(end.toISOString().slice(0, 10));
  };

  const handleClassSelect = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validate
    if (!name || !price || selectedClasses.length === 0) {
      setError("Please fill all required fields and select at least one class.");
      setLoading(false);
      return;
    }
    // Convert duration to months for DB
    let duration_months = durationValue;
    if (durationType === "day") duration_months = Math.ceil(durationValue / 30);
    if (durationType === "week") duration_months = Math.ceil(durationValue * 7 / 30);
    // Insert into Supabase
    const { error } = await supabase.from("membership_plans").insert([
      {
        name,
        duration_months,
        price: Number(price),
        description,
        features: selectedClasses,
      },
    ]);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setTimeout(() => navigate("/memberships"), 1200);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Membership Plan</CardTitle>
          <p className="text-muted-foreground">Set up a new gym membership plan with all details.</p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Plan Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gold, Silver, Premium" required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Duration *</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={durationValue}
                    onChange={e => handleDurationChange(Number(e.target.value), durationType)}
                    className="w-20"
                  />
                  <Select value={durationType} onValueChange={type => handleDurationChange(durationValue, type)}>
                    <option value="day">Day(s)</option>
                    <option value="week">Week(s)</option>
                    <option value="month">Month(s)</option>
                  </Select>
                </div>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">End Date</label>
                <Input value={endDate} readOnly />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Fitness Classes *</label>
              <div className="flex flex-wrap gap-2">
                {FITNESS_CLASSES.map(cls => (
                  <Badge
                    key={cls}
                    variant={selectedClasses.includes(cls) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleClassSelect(cls)}
                  >
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Price *</label>
              <Input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 499" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the plan, benefits, etc." />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            {success && <p className="text-success text-sm">Plan created! Redirecting...</p>}
            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Plan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
