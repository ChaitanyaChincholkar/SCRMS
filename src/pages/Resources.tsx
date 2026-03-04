import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Users, Monitor, Beaker, Presentation, Dumbbell, BookOpen, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

const typeIcons: Record<string, any> = {
  lab: Beaker, projector: Monitor, seminar_hall: Presentation,
  sports_equipment: Dumbbell, study_room: BookOpen,
};

const typeLabels: Record<string, string> = {
  lab: "Lab", projector: "Projector", seminar_hall: "Seminar Hall",
  sports_equipment: "Sports Equipment", study_room: "Study Room",
};

const Resources = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [bookingResource, setBookingResource] = useState<Tables<"resources"> | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: resources } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("*").eq("is_available", true);
      return data ?? [];
    },
  });

  const filtered = resources?.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.location?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleBook = async () => {
    if (!bookingResource || !user || !bookingDate || !startTime || !endTime) return;
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      resource_id: bookingResource.id,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      purpose,
    });
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking submitted!", description: "Your booking is pending approval." });
      setDialogOpen(false);
      setBookingDate(""); setStartTime(""); setEndTime(""); setPurpose("");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and book campus resources</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered?.map((resource, i) => {
          const Icon = typeIcons[resource.type] || BookOpen;
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
            >
              <Card className="glass-card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[11px]">{typeLabels[resource.type]}</Badge>
                  </div>
                  <h3 className="font-heading font-bold text-base mb-1">{resource.name}</h3>
                  {resource.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    {resource.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{resource.location}</span>
                    )}
                    {resource.capacity && resource.capacity > 0 && (
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{resource.capacity}</span>
                    )}
                  </div>
                  <Dialog open={dialogOpen && bookingResource?.id === resource.id} onOpenChange={(open) => { setDialogOpen(open); if (open) setBookingResource(resource); }}>
                    <DialogTrigger asChild>
                      <Button className="w-full gradient-bg border-0 font-semibold" size="sm">
                        <Calendar className="w-4 h-4 mr-2" /> Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-heading">Book {resource.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Date</Label>
                          <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Start Time</Label>
                            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">End Time</Label>
                            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-11" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Purpose</Label>
                          <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Describe the purpose..." />
                        </div>
                        <Button onClick={handleBook} className="w-full gradient-bg border-0 font-semibold h-11">Submit Booking</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No resources found. Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;
