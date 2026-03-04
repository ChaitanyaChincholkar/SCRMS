import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const statusColor: Record<string, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const AdminComplaints = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const { data: complaints } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("*, resources(name), profiles!complaints_user_id_fkey(full_name, email)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("complaints").update({
        status: (statuses[id] || "in_progress") as any,
        admin_response: responses[id] || "",
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      toast({ title: "Complaint updated" });
    },
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">Manage Complaints</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and respond to complaints</p>
      </motion.div>

      {complaints && complaints.length > 0 ? (
        <div className="space-y-3">
          {complaints.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{c.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {c.profiles?.full_name || c.profiles?.email}
                        {c.resources?.name && ` · ${c.resources.name}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className={`text-[11px] ${statusColor[c.status]}`}>{c.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={statuses[c.id] || c.status} onValueChange={(v) => setStatuses({ ...statuses, [c.id]: v })}>
                      <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Admin response..."
                      value={responses[c.id] ?? c.admin_response ?? ""}
                      onChange={(e) => setResponses({ ...responses, [c.id]: e.target.value })}
                      rows={2}
                      className="flex-1 text-sm"
                    />
                    <Button size="sm" className="gradient-bg border-0" onClick={() => updateMutation.mutate(c.id)}>Update</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No complaints to review.</p>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
