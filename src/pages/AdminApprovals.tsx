import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";

const AdminApprovals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, resources(name, type), profiles!bookings_user_id_fkey(full_name, email)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("bookings").update({ status, admin_notes: notes[id] || "" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Booking updated" });
    },
  });

  const statusColor: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-muted text-muted-foreground border-border",
  };

  const pending = bookings?.filter((b) => b.status === "pending") ?? [];
  const others = bookings?.filter((b) => b.status !== "pending") ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">Booking Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage booking requests</p>
      </motion.div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-heading font-bold flex items-center gap-2 text-warning uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Pending ({pending.length})
          </h2>
          {pending.map((b: any, i: number) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="glass-card border-warning/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{b.resources?.name}</p>
                      <p className="text-xs text-muted-foreground">By: {b.profiles?.full_name || b.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">{b.booking_date} · {b.start_time} - {b.end_time}</p>
                      {b.purpose && <p className="text-xs text-muted-foreground mt-1">Purpose: {b.purpose}</p>}
                    </div>
                    <Badge variant="outline" className={`text-[11px] ${statusColor[b.status]}`}>{b.status}</Badge>
                  </div>
                  <Textarea
                    placeholder="Admin notes (optional)..."
                    value={notes[b.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [b.id]: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-bg border-0" onClick={() => updateMutation.mutate({ id: b.id, status: "approved" })}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateMutation.mutate({ id: b.id, status: "rejected" })}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-muted-foreground">History</h2>
          {others.map((b: any) => (
            <Card key={b.id} className="glass-card">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{b.resources?.name}</p>
                  <p className="text-xs text-muted-foreground">{b.profiles?.full_name} · {b.booking_date}</p>
                </div>
                <Badge variant="outline" className={`text-[11px] ${statusColor[b.status]}`}>{b.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bookings?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No bookings to review.</p>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
